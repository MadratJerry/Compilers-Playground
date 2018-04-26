import Token from './token'

class RETokenizer {
  text: string
  tokens: Array<Token> = []
  constructor(text: string) {
    this.text = text
  }
}
