import * as Types from '../types'

class Token implements Types.Token {
  type: string
  value: string
  start: number
  end: number
  loc: Types.SourceLocation
  constructor(value: string, loc: Types.SourceLocation, type?: string) {
    this.value = value
    this.loc = loc
    this.type = type ? type : ''
  }
}

export default Token
