export interface Equal<T> {
  euqals(value: T): boolean
}

export class EqualSet<T extends Equal<T>> extends Set<T> implements Equal<EqualSet<T>> {
  public has(value: T): boolean {
    for (const e of this) if (e.euqals(value)) return true
    return false
  }

  public add(value: T): this {
    if (!this.has(value)) super.add(value)
    return this
  }

  public euqals(value: EqualSet<T>): boolean {
    if (value.size === this.size) {
      for (const i of this) if (!value.has(i)) return false
      return true
    } else return false
  }
}
