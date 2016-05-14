const electra = require('./electra_ir');
const irsend = require('./irsend');

const state = {
  power: true,
  temp: 23,
  mode: electra.MODES.cold,
  fan: electra.FAN.low,
  swingh: true,
  swingv: true,
  timerOn: null,
  timerOff: null
};

const irOpts = {
  durationOne: 1700,
  durationZero: 450,
  durationSeparator: 400,
  intro: [9000, 4500]
};

electra.build(state)
  .then(message => irsend(message, irOpts));
