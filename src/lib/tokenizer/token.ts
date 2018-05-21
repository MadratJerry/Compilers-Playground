import * as Types from '@/lib/types'

class Token implements Types.Token {
  type: string
  value: string
  start: number
  end: number
  loc: Types.SourceLocation
  constructor(value: string, start: number, end: number, type?: string) {
    this.start = start
    this.end = end
    this.value = value
    this.type = type ? type : ''
  }
}

export default Token
