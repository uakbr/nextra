import { collectCatchAll } from '../src/setup-page'
import { describe, it, expect } from 'vitest'

describe('collectCatchAll', () => {
  it('should collect', () => {
    const meta = {
      kind: 'Meta' as const,
      locale: 'en-US',
      data: {
        '/': {
          configs: 'configs',
          'custom-rules': 'custom-rules',
          'getting-started': 'getting-started',
          '/getting-started': {
            'parser-options': 'parser-options',
            parser: 'parser',
            '/third-level': {
              foo: 'bar'
            }
          },
          index: 'index'
        }
      }
    }
    const parent = {
      kind: 'Folder' as const,
      name: 'nested',
      route: '/remote/nested',
      children: [
        meta,
        { kind: 'Meta', locale: 'es-ES', data: {} },
        { kind: 'Meta', locale: 'ru', data: {} }
      ]
    }
    collectCatchAll(parent, meta)
    expect(parent).toMatchInlineSnapshot(`
      {
        "children": [
          {
            "data": {
              "configs": "configs",
              "custom-rules": "custom-rules",
              "getting-started": "getting-started",
              "index": "index",
            },
            "kind": "Meta",
            "locale": "en-US",
          },
          {
            "data": {},
            "kind": "Meta",
            "locale": "es-ES",
          },
          {
            "data": {},
            "kind": "Meta",
            "locale": "ru",
          },
          {
            "kind": "MdxPage",
            "locale": "en-US",
            "name": "configs",
            "route": "/remote/nested/configs",
          },
          {
            "kind": "MdxPage",
            "locale": "en-US",
            "name": "custom-rules",
            "route": "/remote/nested/custom-rules",
          },
          {
            "kind": "MdxPage",
            "locale": "en-US",
            "name": "getting-started",
            "route": "/remote/nested/getting-started",
          },
          {
            "children": [
              {
                "data": {
                  "parser": "parser",
                  "parser-options": "parser-options",
                },
                "kind": "Meta",
                "locale": "en-US",
              },
              {
                "kind": "MdxPage",
                "locale": "en-US",
                "name": "parser-options",
                "route": "/remote/nested/getting-started/parser-options",
              },
              {
                "kind": "MdxPage",
                "locale": "en-US",
                "name": "parser",
                "route": "/remote/nested/getting-started/parser",
              },
              {
                "children": [
                  {
                    "data": {
                      "foo": "bar",
                    },
                    "kind": "Meta",
                    "locale": "en-US",
                  },
                  {
                    "kind": "MdxPage",
                    "locale": "en-US",
                    "name": "bar",
                    "route": "/remote/nested/getting-started/third-level/bar",
                  },
                ],
                "kind": "Folder",
                "name": "third-level",
                "route": "/remote/nested/getting-started/third-level",
              },
            ],
            "kind": "Folder",
            "name": "getting-started",
            "route": "/remote/nested/getting-started",
          },
          {
            "kind": "MdxPage",
            "locale": "en-US",
            "name": "index",
            "route": "/remote/nested",
          },
        ],
        "kind": "Folder",
        "name": "nested",
        "route": "/remote/nested",
      }
    `)
  })
})
