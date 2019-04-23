import { Symbol } from '@/lib/grammar'
import { Token } from '@/lib/tokenizer'

export class ASTNode implements IASTNode<ASTNode> {
  constructor(public symbol: Symbol | Token, public parent?: ASTNode, public children?: Array<ASTNode>) {}
}

export interface IASTNode<T> {
  symbol: Symbol | Token
  parent?: T
  children?: Array<T>
}
