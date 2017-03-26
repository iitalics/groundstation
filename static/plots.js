(function () {
  "use strict";

  function Plot3D(selStr, keys) {
    let obj = {}
    let sel = d3.select(selStr)
    let width = +sel.attr("width")
    let height = +sel.attr("height")

    const scale = width * 0.2
    const origX = width / 2
    const origY = height / 2

    let proj2 = function() {
      return [ [1,0], [0,-1], [-.57, .62] ]
    }
    let proj3_angle_y = 0;
    let proj3 = function() {
      let C = Math.cos(proj3_angle_y);
      let S = Math.sin(proj3_angle_y);
      return [
        [C,0,-S],
        [0,1,0],
        [S,0,C] ]
    }

    function p2d(vec) {
      let p3 = proj3()
      let x3 = vec[0] * p3[0][0] + vec[1] * p3[1][0] + vec[2] * p3[2][0]
      let y3 = vec[0] * p3[0][1] + vec[1] * p3[1][1] + vec[2] * p3[2][1]
      let z3 = vec[0] * p3[0][2] + vec[1] * p3[1][2] + vec[2] * p3[2][2]
      let p2 = proj2()
      let x = origX + scale * (x3 * p2[0][0] + y3 * p2[1][0] + z3 * p2[2][0])
      let y = origY + scale * (x3 * p2[0][1] + y3 * p2[1][1] + z3 * p2[2][1])
      return [x,y]
    }

    let bg;

    function resetAxis () {
      if (bg) {
        bg.remove();
      }
      bg = sel.append("g");

      let faces = [
        [ [-1,-1,-1], [1,-1,-1], [1,-1,1], [-1,-1,1] ],
        [ [-1,-1,-1], [1,-1,-1], [1,1,-1], [-1,1,-1] ],
        [ [-1,-1,-1], [-1,1,-1], [-1,1,1], [-1,-1,1] ],
        [ [-1,1,-1], [1,1,-1], [1,1,1], [-1,1,1] ],
        [ [1,-1,-1], [1,1,-1], [1,1,1], [1,-1,1] ],
      ]

      let path = d3.path();
      for (let face of faces) {
        let r = p2d(face[0])
        path.moveTo(r[0], r[1])
        for (let i = 1; i <= face.length; i++) {
          r = p2d(face[i % face.length])
          path.lineTo(r[0], r[1])
        }
      }

      bg.append("path")
        .attr("d", path)
        .attr("fill", "none")
        .attr("stroke", "#555")
        .attr("stroke-width", 2)
    }

    resetAxis()

    let start = new Date;
    setInterval(function () {
      let ang = (new Date() - start) / 1000
      proj3_angle_y = ang;
      resetAxis()
    }, 100);

    obj.data = function(key, val) {
    }

    return obj
  }

  window.addEventListener("load", function () {
    let example = Plot3D("#display3d", ["x","y","z"]);
    let start = new Date;
    setInterval(function () {
      let now = new Date;
      let dt = (now - start) / 1000;
      example.data("x", Math.sin(dt));
      example.data("y", Math.cos(dt * 2));
      example.data("z", Math.cos(dt * 1.5 + 2));
    }, 500);
  }, false);

})();
