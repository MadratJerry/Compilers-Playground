~(function() {
  /**
   * Generate a query selector string for an Element
   * @param {Element} element The element
   * @returns {String}
   */
  function generateSelector(element) {
    return `${element.localName}${element.id && '#' + element.id}${['', ...element.classList].join('.')}`
  }

  /**
   * Add event delegate
   * @param {String} type Event type
   * @param {String} selector Query selector
   * @param {Function} listener Listener function
   */
  function addEventDelegate(type, selector, listener) {
    this.addEventListener(type, e => {
      // Bind every target selected
      e.currentTarget.querySelectorAll(selector).forEach(item => {
        // Make the event object in callback return the correct currentTarget
        const proxy = new Proxy(e, {
          get(target, p, receiver) {
            if (p === 'currentTarget') return item
            else return target[p]
          },
        })

        // Determien if dispatch on specified element
        item === e.target
          ? listener(proxy)
          : item
              .querySelectorAll(generateSelector(e.target))
              .forEach(item => (item === e.target ? listener(proxy) : null))
      })
    })
  }

  EventTarget.prototype.addEventDelegate = addEventDelegate
})()
