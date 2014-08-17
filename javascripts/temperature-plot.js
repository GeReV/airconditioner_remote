!(function($, d3) {
  'use strict';
  
  d3.json('/temperature', function(error, data) {
    
    if (error) {
      return;
    }
    
    var container = $('.temperature-plot');
  
    var duration = 60 * 60 * 1000,
        now = Date.now(),
        offset = 2500,
        degrees = function(s) {
          return s + '\u00B0' + 'C';
        };
  
    var margin = {top: 6, right: 90, bottom: 20, left: 40},
        width = container.width() - margin.right - margin.left,
        height = 120 - margin.top - margin.bottom;
    
    var x = d3.time.scale()
        .domain([now - duration - offset, now - offset])
        .range([0, width]);
    
    var y = d3.scale.linear()
        .domain([20, 30])
        .range([height, 0]);
    
    var line = d3.svg.line()
        .interpolate("basis")
        .x(function(d, i) { return x(d.d); })
        .y(function(d, i) { return y(d.t); });
    
    var svg = d3.select(container.get(0)).append("svg")
        .attr("width", width + margin.right + margin.left)
        .attr("height", height + margin.top + margin.bottom)
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
        .call(x.axis = d3.svg.axis().scale(x).ticks(6).tickFormat(d3.time.format('%H:%M')).orient("bottom"));
        
    var yaxis = svg.append("g")
        .attr("class", "y axis")
        .call(y.axis = d3.svg.axis().scale(y).ticks(5).tickFormat(function(d) { return degrees(d); }).orient("left"));
    
    var path = svg.append("g")
        .attr("clip-path", "url(#clip)")
      .append("path")
        .data([data])
        .attr("class", "line");
        
    var format = d3.format('.1f'),
        spacer = margin.top,
        ticker = svg.append("g")
          .attr("transform", "translate(" + (width + spacer) + ", " + margin.top + ")")
        .append("text")
          .attr('class', 'temperature')
          .attr('y', height / 2)
          .attr('dy', '0.35em')
          .datum(data[data.length - 1])
          .text(function(d) { return degrees(format(d.t)); });
    
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
        
        var latest = data[data.length - 1],
            previous = ticker.datum();
        
        ticker
          .datum(latest)
          .transition()
          .duration(1000)
            .tween('text', function(d) {
              var i = d3.interpolateNumber(previous.t, d.t);
              
              return function(t) {
                this.textContent = degrees(format(i(t)));
              };
            });
        
        x.domain([
            now - duration - offset, 
            now - offset
          ]);
          
        y.domain([
            Math.min(20, d3.min(data, function(d) { return d.t; })),
            Math.max(30, d3.max(data, function(d) { return d.t; }))
          ])
          .nice();
      
        // redraw the line
        svg.select(".line")
            .attr("d", line)
            .attr("transform", null);
      
        // slide the line left
        path
            .data([ data ])
            .transition()
            .duration(offset)
            .ease("linear")
            .attr("transform", "translate(" + x(now - duration - offset) + ")")
            .each("end", tick);
            
        // slide the x-axis left
        xaxis.transition()
            .duration(offset)
            .ease("linear")
            .call(x.axis);
            
        yaxis.transition()
            .duration(offset)
            .ease("linear")
            .call(y.axis);
    
      });
    }
  
  });
  
})(window.jQuery, window.d3);
