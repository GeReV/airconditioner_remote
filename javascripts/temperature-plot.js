!(function(d3) {
  'use strict';
  
  d3.json('/temperature', function(error, data) {
  
    var duration = 60 * 60 * 1000,
        now = Date.now(),
        offset = 2500;
  
    var margin = {top: 6, right: 0, bottom: 20, left: 40},
        width = 450 - margin.right,
        height = 120 - margin.top - margin.bottom;
    
    var x = d3.time.scale()
        .domain([now - duration - offset, now - offset])
        .range([0, width]);
    
    var y = d3.scale.linear()
        .domain([10, 35])
        .range([height, 0]);
    
    var line = d3.svg.line()
        .interpolate("basis")
        .x(function(d, i) { return x(d.d); })
        .y(function(d, i) { return y(d.t); });
    
    var svg = d3.select(document.querySelector('.temperature-plot')).append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .style("margin-left", -margin.left + "px")
      .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    
    svg.append("defs").append("clipPath")
        .attr("id", "clip")
      .append("rect")
        .attr("width", width)
        .attr("height", height);
    
    var xaxis = svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(x.axis = d3.svg.axis().scale(x).tickFormat(d3.time.format('%H:%M')).orient("bottom"));
        
    var yaxis = svg.append("g")
        .attr("class", "y axis")
        .call(d3.svg.axis().scale(y).ticks(5).tickFormat(function(d) { return d + '\u00B0' + 'C'; }).orient("left"));
    
    var path = svg.append("g")
        .attr("clip-path", "url(#clip)")
      .append("path")
        .data([data])
        .attr("class", "line");
    
    tick();
    
    function tick() {
      d3.json('/temperature/' + now, function(error, d) {
        
        if (d.length) {
          data = data.concat(d);
          
          for (var i=0, l=data.length; i<l && data[i].d < (now - duration); i++) {
            data.shift();
          }
        }
    
        // update the domains
        now = Date.now();
        x.domain([now - duration - offset, now - offset]);
      
        // push the accumulated count onto the back, and reset the count
        // data.push(Math.min(30, count));
      
        // redraw the line
        svg.select(".line")
            .attr("d", line)
            .attr("transform", null);
      
        // slide the x-axis left
        xaxis.transition()
            .duration(offset)
            .ease("linear")
            .call(x.axis);
      
        // slide the line left
        path
            .data([ data ])
            .transition()
            .duration(offset)
            .ease("linear")
            .attr("transform", "translate(" + x(now - duration - offset) + ")")
            .each("end", tick);
    
      });
    }
  
  });
  
})(d3);
