export const intersection = <T>(a: Set<T>, b: Set<T>): Set<T> => new Set([...a].filter(v => b.has(v)))

export const difference = <T>(a: Set<T>, b: Set<T>): Set<T> =>
  new Set([...a].concat([...b]).filter(v => !a.has(v) || !b.has(v)))
