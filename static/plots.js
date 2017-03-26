(function () {
  "use strict";

  function Plot3D(selStr, options) {
    let sel = d3.select(selStr)
    let width = +sel.attr("width")
    let height = +sel.attr("height")

    options = options || {}
    options.color = options.color || "#00f"

    /* isometric projection data */
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

      let color = d3.interpolateRgb("rgba(255,255,255,0)", options.color)
      upd = upd.merge(ent)
        .attr("cx", function (d,i) { return p2d(d)[0] })
        .attr("cy", function (d,i) { return p2d(d)[1] })
        .attr("fill", function (d,i) { return color(i/maxData) })
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

    /* recieving data points */
    return function(key, val) {
      dataPts.push([val.x, val.y, val.z])
      if (dataPts.length > maxData)
        dataPts.shift()
      drawData()
    }
  }


  function Plot2D(selStr, options) {
    let obj = {}
    let sel = d3.select(selStr)
    let width = +sel.attr("width")
    let height = +sel.attr("height")

    options = options || {}
    options.color = options.color || "#f00";
    options.color2 = options.color2 || d3.color(options.color)
    options.key = options.key || "val";

    {
      let midPath = d3.path()
      midPath.moveTo(0, height / 2)
      midPath.lineTo(width, height / 2)
      sel.append("path")
        .attr("d", midPath)
        .attr("stroke", "#888")
    }

    let dataPts = []
    let maxData = 20
    let dataGroup = sel.append("g")
    let dataLine = sel.append("path")
        .attr("fill", "none")
        .attr("stroke", options.color2)

    let pad = 10;
    function posX(i) {
      return pad + (width - pad*2) * i / (maxData - 1)
    }
    function posY(d) {
      return pad + (height - pad*2) * (1 - d) / 2
    }

    function drawData() {
      let upd = dataGroup.selectAll(".dp").data(dataPts)

      let ent = upd.enter()
        .append("circle")
          .classed("dp", true)
          .attr("fill", options.color)
        .attr("r", 3)
      upd = upd.merge(ent)
        .attr("cx", function(d,i) { return posX(i) })
        .attr("cy", function(d,i) { return posY(d) })

      let path = d3.path()
      for (let i = 0; i < dataPts.length; i++) {
        if (i === 0)
          path.moveTo(posX(i), posY(dataPts[i]))
        else
          path.lineTo(posX(i), posY(dataPts[i]))
      }
      dataLine.attr("d", path)
    }

    obj.data = function(key, val) {
      if (key === targKey) {
        dataPts.push(val)
        if (dataPts.length > maxData)
          dataPts.shift()
        drawData()
      }
    }
    return obj
  }


  /**** sink combinators ****/

  function Split(...args) {
    let sinks = []
    function getSinks(sink) {
      if (Array.isArray(sink))
        sink.forEach(getSinks)
      else
        sinks.push(sink)
    }
    getSinks(args)
    return function(key, val) {
      sinks.map(s => s(key, val))
    }
  }

  function Filter(filt, sink) {
    let pred
    if (filt instanceof Function)
      pred = filt
    else if (Array.isArray(filt))
      pred = (k => filt.includes(k))
    else
      pred = (k => (k == filt))

    return function(key, val) {
      if (pred(key))
        sink(key, val)
    }
  }

  function Group(keys, newKey, sink) {
    let incoming = {}
    return function(key, val) {
      if (keys.includes(key)) {
        incoming[key] = val
        if (Object.keys(incoming).length === keys.length) {
          sink(newKey, incoming)
          incoming = {}
        }
      }
    }
  }


  /**** main ****/

  window.addEventListener("load", function () {
    let plot3d = Plot3D("#xyz3d", { key: "pos", color: "#909" })
    let plotX = Plot2D("#x2d", { key: "x", color: "#f00" })
    let plotY = Plot2D("#y2d", { key: "y", color: "#00f" })
    let plotZ = Plot2D("#z2d", { key: "z", color: "#fc0" })

    let sink = Split(
      Filter("x", plotX),
      Filter("y", plotY),
      Filter("z", plotZ,
      Group(["x", "y", "z"], "pos", plot3d)
    )

    let start = new Date
    setInterval(function () {
      let now = new Date
      let dt = (now - start) / 1000
      sink.data("x", Math.sin(dt))
      sink.data("y", Math.cos(dt * 2))
      sink.data("z", Math.cos(dt * 1.5 + 2))
    }, 200)
  }, false)

})();
