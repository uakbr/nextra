/*
 * ⚠️ Attention!
 * This file should be never used directly, only in loader.ts
 */

import { FC } from 'react'
import get from 'lodash.get'
import { NEXTRA_INTERNAL } from './constants'
import {
  DynamicMetaDescriptor,
  Folder,
  NextraInternalGlobal,
  PageOpts,
  ThemeConfig,
  MetaJsonFile
} from './types'
import { normalizePageRoute } from './utils'

/**
 * Calculate a 32 bit FNV-1a hash
 * Found here: https://gist.github.com/vaiorabbit/5657561
 * Ref.: http://isthe.com/chongo/tech/comp/fnv/
 *
 * @param {string} str the input value
 * @param {number} [seed] optionally pass the hash of the previous chunk
 * @returns {string}
 */
function hashFnv32a(str: string, seed = 0x811c9dc5): string {
  let hval = seed

  for (let i = 0; i < str.length; i++) {
    hval ^= str.charCodeAt(i)
    hval += (hval << 1) + (hval << 4) + (hval << 7) + (hval << 8) + (hval << 24)
  }

  // Convert to 8 digit hex string
  return ('0000000' + (hval >>> 0).toString(16)).substring(-8)
}

export function collectCatchAll(
  parent: Folder<any>,
  meta: Omit<MetaJsonFile, 'data'> & { data: Record<string, any> }
) {
  for (const [dir, value] of Object.entries(meta.data)) {
    const isFolder = dir.startsWith('/')
    if (!isFolder) {
      addPageToPageMap(parent, value, meta.locale)
      continue
    }
    const isCurrentFolder = dir === '/'

    const filesOnly = Object.fromEntries(
      Object.entries(value).filter(([k]) => !k.startsWith('/'))
    )

    if (isCurrentFolder) {
      meta.data = filesOnly
      collectCatchAll(parent, {
        kind: 'Meta',
        data: value,
        locale: meta.locale
      })
    } else {
      const newParent: Folder = {
        kind: 'Folder',
        name: dir.replace(/(^\/)|(\/)$/g, ''),
        route: `${parent.route}${dir}`,
        children: [
          {
            kind: 'Meta',
            locale: meta.locale,
            // @ts-expect-error todo: fix Type '{ [k: string]: unknown; }' is not assignable to type '{ [fileName: string]: Meta; }'
            data: filesOnly
          }
        ]
      }

      parent.children.push(newParent)
      collectCatchAll(newParent, {
        kind: 'Meta',
        data: value,
        locale: meta.locale
      })
    }
  }
}

function addPageToPageMap(parent: any, key: string, locale = '') {
  parent.children.push({
    kind: 'MdxPage',
    locale,
    name: key.split('/').pop(),
    route: normalizePageRoute(parent.route, key)
  })
}

export function setupNextraPage({
  pageNextRoute,
  pageOpts,
  nextraLayout,
  themeConfig,
  Content,
  hot,
  dynamicMetaItems
}: {
  pageNextRoute: string
  pageOpts: PageOpts
  nextraLayout: FC
  themeConfig: ThemeConfig
  Content: FC
  hot: __WebpackModuleApi.Hot
  dynamicMetaItems: DynamicMetaDescriptor[]
}) {
  if (typeof window === 'undefined') {
    globalThis.__nextra_resolvePageMap = async () => {
      const clonedPageMap = JSON.parse(JSON.stringify(pageOpts.pageMap))

      await Promise.all(
        dynamicMetaItems.map(
          async ({ metaFilePath, metaObjectKeyPath, metaParentKeyPath }) => {
            const mod = await import(metaFilePath)
            const meta = get(clonedPageMap, metaObjectKeyPath)
            meta.data = await mod.default()

            const parent = get(
              clonedPageMap,
              metaParentKeyPath.replace(/\.children$/, '')
            )
            const metaKeys = Object.keys(meta.data)
            const isCatchAllMeta = metaKeys.some(key => key.includes('/'))
            if (isCatchAllMeta) {
              // meta for catch-all route [...slug].mdx
              collectCatchAll(parent, meta)
            } else {
              for (const key of metaKeys) {
                addPageToPageMap(parent, key, meta.locale)
              }
            }
          }
        )
      )
      return clonedPageMap
    }
  }

  // Make sure the same component is always returned so Next.js will render the
  // stable layout. We then put the actual content into a global store and use
  // the route to identify it.
  const __nextra_internal__ = ((globalThis as NextraInternalGlobal)[
    NEXTRA_INTERNAL
  ] ||= Object.create(null))

  __nextra_internal__.pageMap = pageOpts.pageMap
  __nextra_internal__.route = pageOpts.route
  __nextra_internal__.context ||= Object.create(null)
  __nextra_internal__.refreshListeners ||= Object.create(null)
  __nextra_internal__.Layout = nextraLayout
  __nextra_internal__.context[pageNextRoute] = {
    Content,
    pageOpts,
    themeConfig
  }

  if (process.env.NODE_ENV !== 'production' && hot) {
    const checksum = hashFnv32a(JSON.stringify(pageOpts))
    hot.data ||= Object.create(null)
    if (hot.data.prevPageOptsChecksum !== checksum) {
      const listeners =
        __nextra_internal__.refreshListeners[pageNextRoute] || []
      for (const listener of listeners) {
        listener()
      }
    }
    hot.dispose(data => {
      data.prevPageOptsChecksum = checksum
    })
  }
}
