require.config({ paths: { vs: '../node_modules/monaco-editor/min/vs' } })

require(['vs/editor/editor.main'], function() {
  const editor = monaco.editor.create(document.getElementById('editor'), {
    value: `#include <stdio.h>
  int main() {
  int a = 1;
  return 0;
}`,
    language: 'c',
  })

  const output = monaco.editor.create(document.getElementById('result'), {
    value: `#include <stdio.h>
  int main() {
  int a = 1;
  return 0;
}`,
    language: 'c',
  })

  editor.getModel().onDidChangeContent(function() {
    output.setValue(editor.getModel().getValue())
  })
})
