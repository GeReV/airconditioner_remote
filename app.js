
/**
 * Module dependencies.
 */

const express = require('express'),
      engines = require('consolidate'),
      http = require('http'),
      path = require('path'),
      low = require('lowdb'),
      CronJob = require('cron').CronJob,
      Temperature = require('./temperature');

const electra = require('./electra_ir');
const irsend = require('./irsend');

const app = express();

const db = low('state.json', { storage: require('lowdb/lib/file-async') })
  .defaults({
    state: {
      power: false,
      temp: 25,
      mode: electra.MODES.cold,
      fan: electra.FAN.low,
      swingh: true,
      swingv: true,
      timerOn: null,
      timerOff: null
    }
  });

const getState = () => db.get('state').value();

var timers = {
    timerOn: null,
    timerOff: null
};

var power = /^power-(on|off)$/i,
    temp = /^temp-(\d{2})$/i,
    mode = /^mode-(cold|hot|fan|dehydrate)$/i,
    fan = /^fan-(small|medium|large)$/i;

const setState = command => {
  const state = db.get('state')
    .value();

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

  db.set('state', state).value();
};

const irOpts = {
  durationOne: 1690,
  durationZero: 560,
  durationSeparator: 560,
  intro: [9000, 4500]
};

const sendCommand = (command, cb) => {
    setState(command);

    electra.build(getState())
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
  res.json(getState());
});

app.post('/remote/timer/:state/clear', auth, function (req, res) {
    var attr;

    attr = 'timer' + capitalize(req.params.state);

    if (/^(on|off)$/.test(req.params.state) && timers[attr] !== null) {
        timers[attr].stop();
        timers[attr] = null;

        db.set(`state.${attr}`, null).value();
    }

    res.json(getState());
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
            timers[stateAttr] = null;

            db.set(`state.${stateAttr}`, null).value();
          }, true);

        db.set(`state.${stateAttr}`, date).value();
    }

    res.json(getState());
});

app.post('/remote/:command', auth, (req, res) => {
  console.log(`Sending ${req.params.command} to air conditioner.`);

  sendCommand(req.params.command, () => {
      res.json(getState());
  });
});

Temperature.init(app, auth);

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
