import * as monaco from 'monaco-editor'

monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
  noSemanticValidation: true,
  noSyntaxValidation: true,
})

export default monaco
