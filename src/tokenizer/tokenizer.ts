import Token from './token'

class Tokenizer {
  text: string
  tokens: Array<Token> = []
  constructor(text: string) {
    this.text = text
  }

  char() {}

  next() {}
}

export default Tokenizer
