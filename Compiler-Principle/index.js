import * as monaco from 'monaco-editor'

self.MonacoEnvironment = {
  getWorkerUrl: function(moduleId, label) {
    if (label === 'json') {
      return './json.worker.bundle.js'
    }
    if (label === 'css') {
      return './css.worker.bundle.js'
    }
    if (label === 'html') {
      return './html.worker.bundle.js'
    }
    if (label === 'typescript' || label === 'javascript') {
      return './ts.worker.bundle.js'
    }
    return './editor.worker.bundle.js'
  },
}

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
