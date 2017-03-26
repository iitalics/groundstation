sink = (function() {
  "use strict";

  /* split one sink into multiple */
  function Split(...args) {
    let sinks = []
    function getSinks(sink) {
      if (Array.isArray(sink))
        sink.forEach(getSinks)
      else
        sinks.push(sink)
    }
    getSinks(args)
    return function(val) {
      sinks.forEach(s => s(val))
    }
  }

  /* only forward objects with the given key, forwarding the corresponding value */
  function Key(key, sink) {
    return function(obj) {
      if (Object.keys(obj).includes(key))
        sink(obj[key])
    }
  }

  /* forward every N keys as a single object, either as an array (if
     an integer argument is given) or as an object (if a list of keys
     is given). */
  function Sequence(keys, sink) {
    if (typeof keys === "number") {
      let vals = []
      return function(val) {
        vals.push(val)
        if (vals.length === keys) {
          sink(vals)
          vals = []
        }
      }
    }
    else {
      let i = 0
      let obj = {}
      return function(val) {
        obj[keys[i++]] = val
        if (i >= keys.length) {
          sink(obj)
          obj = {}
          i = 0
        }
      }
    }
  }

  return { Split, Key, Sequence }
})()
