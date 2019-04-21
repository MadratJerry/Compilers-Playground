import * as Grammar from '@/lib/grammar/grammarTypes'

export class ASTNode {
  constructor(public readonly symbol: Grammar.Symbol, public parent?: ASTNode, public children?: Array<ASTNode>) {}
}
