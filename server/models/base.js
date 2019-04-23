const observe = (target, callback, $base = []) => {
  for (const key in target) {
    const k = Array.isArray(key) ? key[0] : key
    if (target[key] && typeof target[key] === 'object' && !target[key].$isProxy) {
      const isInternal = k.substring(0, 1) === '$'
      const isAllowed = !('$observableKeys' in target) || ('$observableKeys' in target && target.$observableKeys.indexOf(k) !== -1)
      if (!isInternal && isAllowed) {
        target[key] = observe(target[key], callback, [...$base, key])
      }
    }
  }
  const privateProperties = ['$observableKeys']
  return new Proxy(target, {
    get (target, key) {
      if (key === '$isProxy') {
        return true
      } else if (key && privateProperties.indexOf(key) === -1) {
        return target[key]
      } else {
        return []
      }
    },
    set (target, key, value) {
      const k = Array.isArray(key) ? key[0] : key
      if (value && typeof value === 'object' && !value.$isProxy) {
        const isInternal = k.substring(0, 1) === '$'
        let isAllowed = false
        isAllowed = !('$observableKeys' in target) || ('$observableKeys' in target && target.$observableKeys.indexOf(k) !== -1)
        if (!isInternal && isAllowed) {
          value = observe(value, callback, [...$base, key])
        }
      }
      const t = [...$base, key]
      callback(t, target[key] = value)
      return true
    }
  })
}

export default class Base {
  constructor ({
    id = null
  } = {
    ...arguments
  }) {
    this.$observableKeys = []
    if (id) {
      this.id = id
    }
    this.$log = []
    this.$changes = []
    if (arguments.length) {
      for (let key in arguments[0]) {
        this[key] = arguments[0][key]
      }
    }
  }
  trackChanges (user) {
    let userProperty = {
      user: {
        id: user.id,
        email: user.email
      }
    }
    let t = this
    let proxy = observe(this, function (key, val) {
      let isLoggable = true
      if (Array.isArray(key) && key.length > 1 && isNaN(parseInt(key[1]))) {
        isLoggable = false
      }
      if (isLoggable) {
        t.$log.push({
          ...userProperty,
          key,
          val,
          timestamp: +new Date(),
          message: `SET ${key} = ${JSON.stringify(val)}`
        })
      }
    })
    return proxy
  }
}
