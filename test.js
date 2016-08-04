const electra = require('./electra_ir');
const irsend = require('./irsend');

const state = {
  power: true,
  temp: 20,
  mode: electra.MODES.cold,
  fan: electra.FAN.high,
  swingh: true,
  swingv: false,
  timerOn: null,
  timerOff: null
};

const irOpts = {
  durationOne: 1690,
  durationZero: 560,
  durationSeparator: 560,
  intro: [9000, 4500]
};

electra.build(state)
  .then(message => irsend(message, irOpts));
