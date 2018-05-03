export default function ParseDecorator(
  before: (propertyName: string, self: any) => void,
  after: (propertyName: string, self: any) => void,
  mute: boolean = false,
) {
  return function(target: any, propertyName: string, descriptor: TypedPropertyDescriptor<Function>) {
    let method = descriptor.value
    descriptor.value = function() {
      if (!mute) {
        console.group()
        before(propertyName, this)
      }
      const result = method.apply(this, arguments)
      if (!mute) {
        after(propertyName, this)
        console.groupEnd()
      }
      return result
    }
  }
}
