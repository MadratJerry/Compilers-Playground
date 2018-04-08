/**
 * Token
 * @class Token
 */
class Token {
  /**
   * Creates an instance of Token.
   * @param {String} token
   * @param {Number} row
   * @param {Number} column
   * @memberof Token
   */
  constructor(token, row, column) {
    this.token = token
    this.row = row
    this.column = column
  }
}

export default Token
