import { remove } from 'unist-util-remove'

export function remarkRemoveImports() {
  return (tree: any) => remove(tree, 'mdxjsEsm')
}
