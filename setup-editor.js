import { EditorState, basicSetup } from '@codemirror/basic-setup'
import { EditorView, keymap } from '@codemirror/view'
import { defaultTabBinding } from '@codemirror/commands'
import { json } from '@codemirror/lang-json'

const setupEditor = () => {
  const requestBody = document.querySelector('[data-json]')
  const responseBody = document.querySelector('[data-response-body]')

  const basicExtensions = [
    basicSetup,
    keymap.of([defaultTabBinding]),
    json(),
    EditorState.tabSize.of(2)
  ]

  const requestEditor = new EditorView({
    state: EditorState.create({
      doc: '{\n\t\n}',
      extensions: basicExtensions
    }),
    parent: requestBody
  })

  const responseEditor = new EditorView({
    state: EditorState.create({
      doc: '{}',
      extensions: [...basicExtensions, EditorView.editable.of(false)]
    }),
    parent: responseBody
  })

  return { requestEditor, responseEditor }
}

export default setupEditor
