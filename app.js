
/**
 * Module dependencies.
 */

var express = require('express'),
    engines = require('consolidate'),
    http = require('http'),
    path = require('path'),
    CronJob = require('cron').CronJob,
    Temperature = require('./temperature');

var electra = require('./electra_ir');
var irsend = require('./irsend');

var app = express();

var state = {
  power: false,
  temp: 25,
  mode: electra.MODES.cold,
  fan: electra.FAN.low,
  swingh: true,
  swingv: true,
  timerOn: null,
  timerOff: null
};

var timers = {
    timerOn: null,
    timerOff: null
};

var setState = function(command) {
  var power = /^power-(on|off)$/i,
      temp = /^temp-(\d{2})$/i,
      mode = /^mode-(cold|hot|fan|dehydrate)$/i,
      fan = /^fan-(small|medium|large)$/i;

  if (power.test(command)) {
    state.on = power.exec(command)[1] === 'on';
  }

  if (temp.test(command)) {
    state.temp = parseInt(temp.exec(command)[1], 10);
  }

  if (mode.test(command)) {
    state.mode = mode.exec(command)[1];
  }

  if (fan.test(command)) {
    state.fan = fan.exec(command)[1];
  }
};

const irOpts = {
  durationOne: 1690,
  durationZero: 560,
  durationSeparator: 560,
  intro: [9000, 4500]
};

const sendCommand = (command, cb) => {
    setState(command);

    electra.build(state)
      .catch(err => console.error(err))
      .then(message => irsend(message, irOpts));
};

var capitalize = function (s) {
    return s.slice(0, 1).toUpperCase() + s.slice(1);
};

app.engine('haml', engines.haml);

app.set('view engine', 'haml');

// all environments
app.set('port', process.env.PORT || 3000);
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

var auth = express.basicAuth('amir', 'coolmedown');

app.use(auth);

// development only
if ('development' === app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', auth, function(req, res) {
  res.render('index', { title: 'Air Condition Remote', temperature: Temperature.available });
});

app.get('/remote', auth, function(req, res) {
  res.json(state);
});

app.post('/remote/timer/:state/clear', auth, function (req, res) {
    var attr;

    attr = 'timer' + capitalize(req.params.state);

    if (/^(on|off)$/.test(req.params.state) && timers[attr] !== null) {
        timers[attr].stop();
        timers[attr] = state[attr] = null;
    }

    res.json(state);
});

app.post('/remote/timer/:state', auth, function (req, res) {
    var duration,
        stateAttr,
        date = new Date();

    duration = parseInt(req.body.time, 10);

    date = new Date(date.getTime() + (duration * 60 * 1000));

    stateAttr = 'timer' + capitalize(req.params.state);

    if (/^(on|off)$/.test(req.params.state) && duration > 0) {

        if (timers[stateAttr]) {
          timers[stateAttr].stop();
        }

        timers[stateAttr] = new CronJob(date, function () {
            sendCommand('power-' + req.params.state);

            this.stop();
          }, function () {
            timers[stateAttr] = state[stateAttr] = null;
          }, true);

        state[stateAttr] = date;
    }

    res.json(state);
});

app.post('/remote/:command', auth, function(req, res) {
  console.log('Sending "' + req.params.command + '" to air conditioner.');

  sendCommand(req.params.command, function () {
      res.json(state);
  });
});

Temperature.init(app, auth);

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
