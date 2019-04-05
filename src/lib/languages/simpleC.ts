import { IMonarchLanguage } from '../tokenizer/monarchTypes'

// prettier-ignore
const simpleC : IMonarchLanguage = {
  expressions: {
    keywords: ['abstract',
      'bool', 'break', 'case', 'catch', 'char', 'class',
      'const', 'continue', 'default', 'do', 'double', 'else',
      'enum', 'false', 'final', 'float', 'for', 'goto',
      'if', 'int', 'long', 'namespace', 'new', 'operator',
      'return', 'short', 'signed', 'sizeof', 'static', 'struct', 'switch',
      'template', 'this', 'true', 'typedef', 'unsigned', 'void', 'while'
    ],
    operators: [
      '=', '>', '<', '!', '~', '?', ':',
      '==', '<=', '>=', '!=', '&&', '||', '++', '--',
      '+', '-', '*', '/', '&', '|', '^', '%', '<<',
      '>>', '>>>', '+=', '-=', '*=', '/=', '&=', '|=',
      '^=', '%=', '<<=', '>>=', '>>>='
    ],
  },
  tokenizer: {
    root: [
      [/[a-zA-Z_]\w*/, {
        cases: {
          '@keywords': { token: 'keyword.$&' },
          '@default': 'identifier'
        }
      }],
      [/(`)(.*)(`)/, ['string','string', 'string']],
      [/[ \t\r\n]+/, 'whitespace'],
      [/\/\/.*\n/, 'comment'],
      [/\/\*[.\S\W]*\*\//, 'comment'],
    ],
  },
}

export default simpleC
