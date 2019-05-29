import React from 'react'
import { CheckResult, production } from '@/lib/grammar'
import { set } from './NonTerminalsTable'

const Sanity: React.FC<{ checks: CheckResult }> = ({ checks }) => {
  return (
    <ul>
      {checks.unreachable.size ? (
        <li>
          The grammar has unreachable nonterminals:
          <i>
            <strong>{set(checks.unreachable)}</strong>
          </i>
          .
        </li>
      ) : (
        <li>All nonterminals are reachable.</li>
      )}
      {checks.unrealizable.size ? (
        <li>
          The grammar has unrealizable nonterminals:
          <i>
            <strong> {set(checks.unrealizable)} </strong>
          </i>
          .
        </li>
      ) : (
        <li>All nonterminals are realizable.</li>
      )}
      {checks.cycle.length ? (
        <li>
          The grammar is cyclic:
          <i>
            <strong> {checks.cycle.join(' -> ')} </strong>
          </i>
          is a cycle.
        </li>
      ) : (
        <li>The grammar contains no cycles.</li>
      )}
      {checks.nullAmbiguity.length ? (
        <li>
          contains a null ambiguity:
          <i>
            <strong> {production(checks.nullAmbiguity[0])} </strong>
          </i>
          and
          <i>
            <strong> {production(checks.nullAmbiguity[1])} </strong>
          </i>
          are ambiguously nullable.
        </li>
      ) : (
        <li>The grammar is null unambiguous. </li>
      )}
    </ul>
  )
}

export default Sanity
