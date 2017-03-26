(function () {
  "use strict";

  window.addEventListener("load", function () {
    let debug = true

    let output = sink.Sequence(
      ["x", "y", "z"],
      sink.Split([
        Plot3D("#xyz3d", { color: "#909" }),

        sink.Key("x", Plot2D("#x2d", { color: "#f00" })),
        sink.Key("y", Plot2D("#y2d", { color: "#00f" })),
        sink.Key("z", Plot2D("#z2d", { color: "#fc0" })),

        function(obj) {
          if (debug)
            console.log(obj)
        },
      ]))

    let start = new Date()
    setInterval(function () {
      let now = new Date()
      let dt = (now - start) / 1000
      output(Math.sin(dt))
      output(Math.cos(dt * 2))
      output(Math.cos(dt * 1.5 + 2))
    }, 200)
  }, false)

})();
