(function () {
  "use strict";

  function Plot3D(selStr, keys) {
    let obj = {}
    let sel = d3.select(selStr)
    let width = +sel.attr("width")
    let height = +sel.attr("height")

    /* 3d projection */
    const scale = width * 0.2
    const origX = width / 2
    const origY = height / 2
    let proj3AngleY = -Math.PI / 4
    let proj3 = function() {
      let yc = Math.cos(proj3AngleY)
      let ys = Math.sin(proj3AngleY)
      return [
        [yc, 0, -ys],
        [0,  1,  0],
        [ys, 0,  yc] ]
    }

    /* convert 3d point to 2d point */
    function p2d(vec) {
      let p3 = proj3()
      let x3 = vec[0] * p3[0][0] + vec[1] * p3[1][0] + vec[2] * p3[2][0]
      let y3 = vec[0] * p3[0][1] + vec[1] * p3[1][1] + vec[2] * p3[2][1]
      let z3 = vec[0] * p3[0][2] + vec[1] * p3[1][2] + vec[2] * p3[2][2]
      let t = scale * 5 / (4 - z3);
      let x = origX + x3 * t;
      let y = origY - y3 * t;
      return [x,y]
    }

    /* draw the axis */
    let axis = sel.append("g")
    axis.append("path")
        .attr("fill", "none")
        .attr("stroke", "#555")
        .attr("stroke-width", 2)
    function redrawAxis () {

      let faces = [
        [ [-1,-1,-1], [1,-1,-1], [1,-1,1], [-1,-1,1] ],
        [ [-1,-1,-1], [1,-1,-1], [1,1,-1], [-1,1,-1] ],
        [ [-1,-1,-1], [-1,1,-1], [-1,1,1], [-1,-1,1] ],
      ]

      let path = d3.path()
      for (let face of faces) {
        let r = p2d(face[0])
        path.moveTo(r[0], r[1])
        for (let i = 1; i <= face.length; i++) {
          r = p2d(face[i % face.length])
          path.lineTo(r[0], r[1])
        }
      }

      axis.select("path").attr("d", path)
    }
    redrawAxis()

    /* drawing data points */
    let dataPts = []
    let dataGroup = sel.append("g")
    let maxData = 12
    function drawData() {
      let upd = dataGroup.selectAll(".dp")
          .data(dataPts)

      let ent = upd.enter()
          .append("circle")
          .classed("dp", true)
          .attr("r", 6)
          .attr("fill", "none")

      let color = d3.interpolateRgb("rgba(255,255,255,0)", "blue")
      upd = upd.merge(ent)
        .attr("cx", function (d,i) { return p2d(d)[0] })
        .attr("cy", function (d,i) { return p2d(d)[1] })
        .attr("fill", function (d,i) { return color(i/maxData) })
    }

    /* waiting for & recieving data points */
    function recieveDataPoint(o) {
      dataPts.push([o.x, o.y, o.z])
      if (dataPts.length > maxData)
        dataPts.shift()
      drawData()
    }
    let incomingData = {}
    obj.data = function(key, val) {
      if (key === "x") incomingData.x = val
      if (key === "y") incomingData.y = val
      if (key === "z") incomingData.z = val

      let curKeys = Object.keys(incomingData)
      if (curKeys.includes("x")
          && curKeys.includes("y")
          && curKeys.includes("z")) {
        recieveDataPoint(incomingData)
        incomingData = {}
      }
    }

    /* allow dragging the axis */
    let drag = null
    sel.on("mousedown", function() {
      drag = {
        rot: proj3AngleY,
        x: d3.mouse(sel.node())[0],
      }
    })

    d3.select("body").on("mouseup", function() { drag = null })
    d3.select("body").on("mousemove", function() {
      if (drag) {
        let dx = d3.mouse(sel.node())[0] - drag.x
        proj3AngleY = drag.rot + dx * 0.01
        redrawAxis()
        drawData()
      }
    })

    return obj
  }

  window.addEventListener("load", function () {
    let example = Plot3D("#display3d", ["x","y","z"])
    let start = new Date
    setInterval(function () {
      let now = new Date
      let dt = (now - start) / 1000
      example.data("x", Math.sin(dt))
      example.data("y", Math.cos(dt * 2))
      example.data("z", Math.cos(dt * 1.5 + 2))
    }, 100)
  }, false)

})();
