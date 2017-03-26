Plot2D = (function() {
  "use strict";

  function Plot2D(selStr, options) {
    let obj = {}
    let sel = d3.select(selStr)
    let width = +sel.attr("width")
    let height = +sel.attr("height")

    options = options || {}
    options.color = options.color || "#f00";
    options.color2 = options.color2 || d3.color(options.color)

    /* draw midpoint line */
    {
      let midPath = d3.path()
      midPath.moveTo(0, height / 2)
      midPath.lineTo(width, height / 2)
      sel.append("path")
        .attr("d", midPath)
        .attr("stroke", "#888")
    }

    /* how to place points */
    let maxData = 20
    let pad = 10
    function posX(i) {
      return pad + (width - pad*2) * i / (maxData - 1)
    }
    function posY(d) {
      return pad + (height - pad*2) * (1 - d) / 2
    }

    /* drawing data points */
    let dataPts = []
    let dataGroup = sel.append("g")
    let dataLine = sel.append("path")
        .attr("fill", "none")
        .attr("stroke", options.color2)
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

    /* recieving data */
    return function(val) {
      dataPts.push(val)
      if (dataPts.length > maxData)
        dataPts.shift()
      drawData()
    }
  }

  return Plot2D
})()
