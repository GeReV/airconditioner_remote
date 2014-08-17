!(function() {
  'use strict';
  
  var path    = require('path'),
      fs      = require('fs'),
      glob    = require('glob'),
      moment  = require('moment');
      
  var basePath = '/sys/bus/w1/devices';
  
  var file = glob.sync(path.join(basePath, '28*', 'w1_slave'))[0];
  
  var application, authentication;
  
  var available = !!(file),
      temperatures = [];
  
  function read()  {
    var contents = fs.readFileSync(file, {
            encoding: 'utf8'
        }),
        lines = contents.split(/\r?\n/);

    if (lines.length < 2) {
        setTimeout(read, 200);
        return;
    }

    if (lines[0].slice(-3).toUpperCase() != 'YES') {
        setTimeout(read, 200);
        return;
    }

    var temperature = lines[1].match(/t=([0-9]+)$/)[1];
   
    temperature = +(temperature) / 1000;
    
    var now = moment();
    
    while (temperatures.length && now.diff(temperatures[0].d, 'hours', true) > 1) {
      // Throw away samples from more than 1 hour ago.
      temperatures.shift();
    }

    temperatures.push({
        d: now, 
        t: temperature
      });
    
    setTimeout(read, 5000);
  }
  
  function init(app, auth) {
    application = app;
    authentication = auth;
    
    if (!available) {
      return;
    }
    
    app.get('/temperature', auth, function(req, res) {
      res.json(temperatures.map(function(v) {
        return { 
          d: +v.d,
          t: v.t
        };
      }));
    });
    
    app.get('/temperature/:timestamp', auth, function(req, res) {
      var result = [],
          timestamp = +req.params.timestamp;
      
      for (var i = temperatures.length - 1; i >= 0 && timestamp <= +(temperatures[i].d); i--) {
        result.unshift(temperatures[i]);
      }
      
      res.json(result.map(function(v) {
        return {
          d: +v.d,
          t: v.t
        };
      }));
    });
    
    read();
  }
  
  module.exports = {
    init: init,
    available: available
  };
})();
