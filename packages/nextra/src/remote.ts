import { compileMdx } from './compile'
import { LoaderOptions } from './types'

export const buildDynamicMDX = async (
  content: string,
  loaderOptions: Pick<
    LoaderOptions,
    'latex' | 'codeHighlight' | 'defaultShowCopyCode'
  >
) => {
  const { result, headings, frontMatter, title } = await compileMdx(
    content,
    loaderOptions
  )

  return {
    __nextra_dynamic_mdx: result,
    __nextra_dynamic_opts: JSON.stringify({
      headings,
      frontMatter,
      title: frontMatter.title || title
    })
  }
}

export const buildDynamicMeta = async () => {
  const resolvePageMap = (globalThis as any).__nextra_resolvePageMap
  if (resolvePageMap) {
    return {
      __nextra_pageMap: await resolvePageMap()
    }
  }
  return {}
}
