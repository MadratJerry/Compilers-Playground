export class Token {
  public readonly offset: number
  public readonly token: string
  public readonly type: string

  constructor(offset: number, token: string, type: string) {
    this.offset = offset | 0
    this.token = token
    this.type = type
  }

  public toString(): string {
    return `(${this.offset},${this.token},${this.type})`
  }
}
