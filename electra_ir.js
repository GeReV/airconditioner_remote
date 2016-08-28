const yup = require('yup');
const keyMirror = require('keymirror');

const MODES = keyMirror({
  hot: null,
  cold: null,
  fan: null,
  dehydrate: null,
  unknown: null
});

const FAN = keyMirror({
  low: null,
  medium: null,
  high: null,
  auto: null
});

const optsSchema = yup.object()
  .shape({
    power: yup.boolean()
      .required(),
    mode: yup.mixed()
      .oneOf(Object.keys(MODES))
      .required(),
    fan: yup.mixed()
      .oneOf(Object.keys(FAN))
      .required(),
    temp: yup.number()
      .integer()
      .min(16)
      .max(32)
      .required(),
    swingh: yup.boolean()
      .required(),
    swingv: yup.boolean()
      .required(),
  });

const fanValues = {
  [FAN.low]: 0x3,
  [FAN.medium]: 0x2,
  [FAN.high]: 0x1,
  [FAN.auto]: 0x5
};

const modeValues = {
  [MODES.hot]: 0x4,
  [MODES.cold]: 0x1,
  [MODES.fan]: 0x6,
  [MODES.dehydrate]: 0x2,
  [MODES.unknown]: 0x0
};

const HEAD = 0xc3;

function reverseBits(byte) {
  let b = 0;
  let shift = 0;

  while (shift < 8){
    b <<= 1;
    b |= (byte & 1);
    byte >>>= 1;

    shift++;
  }

  return b;
}

function checksum(array) {
  return array.reduce((sum, val) => sum + val, 0) % (2 << 8);
}

function reverse(n) {
  let result = 0;
  while (n) {
    result |= n & 1;
    result <<= 1;
    n >>>= 1;
  }
  return result;
}

function build(opts){
  return optsSchema.validate(opts)
    .then(opts => {
      const message = new Uint8Array(13);

      const temp = (opts.temp - 8) & 0x1f;
      const swingv = opts.swingv ? 0x0 : 0x7;
      const swingh = opts.swingh ? 0x0 : 0x7;
      const now = new Date();

      message[0] = HEAD;
      message[1] = temp << 3 | swingv;
      message[2] = swingh << 5 | now.getHours();
      message[3] = now.getMinutes();
      message[4] = fanValues[opts.fan] << 5;
      message[5] = 0x00;
      message[6] = modeValues[opts.mode] << 5;
      message[7] = 0x00;
      message[8] = 0x00;
      message[9] = opts.power ? 0x20 : 0x00;
      message[10] = 0x00;
      message[11] = 0x0; // TODO: Should be button pressed. Can't determine if relevant.
      message[12] = checksum(message.slice(0, -1));

      return message;
    });
}

module.exports = {
  build,
  MODES,
  FAN
};
