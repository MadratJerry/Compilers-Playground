import * as Grammar from '@/lib/grammar/grammarTypes'

export default class ASTNode {
  constructor(public readonly symbol: Grammar.Symbol, public parent?: ASTNode, public children?: Array<ASTNode>) {}
}
