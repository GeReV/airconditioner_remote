const yup = require('yup');
const wpi = require('wiring-pi');
const exec = require('child_process').exec;

const outputPin = 0;

const optsSchema = yup.object()
  .shape({
    intro: yup.array()
      .of(yup.number().integer()),
    durationOne: yup.number()
      .integer()
      .required(),
    durationZero: yup.number()
      .integer()
      .required(),
    durationSeparator: yup.number()
      .integer()
      .required()
  });

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

function build(buffer, opts) {
  const bufferBitCount = buffer.length * 8;
  const messageLength = bufferBitCount * 2;
  const message = new Array(messageLength);

  buffer.forEach((byte, i) => {
    for (let bit = 0; bit < 8; bit++) {
      const index = i * 16 + bit * 2;

      message[index] = opts.durationSeparator; // Convert to nanoseconds.

      message[index + 1] = (byte & 1) ? opts.durationOne : opts.durationZero;

      byte >>>= 1;
    }
  });

  const intro = (opts.intro || []);
  return intro.concat(message).concat([opts.durationSeparator]);
}

function nanoseconds(hrtime) {
  return hrtime[0] * 1e9 + hrtime[1];
}

function bitbang(timing) {
  const l = timing.length;

  let lastTick = nanoseconds(process.hrtime());
  let state = false;
  let dt = 0;
  let i = 0;

  function tick() {
    if (i >= l) {
      return;
    }

    if (dt >= timing[i]) {
      console.log(dt);
      i++;
      dt = 0;
    }

    const odd = (i & 1) === 1;

    if (odd && state) {
      // Turn off.
      state = false;

      wpi.digitalWrite(outputPin, 0);
    } else if (!odd && !state) {
      // Turn on.
      state = true;

      wpi.digitalWrite(outputPin, 1);
    }

    const currentTick = nanoseconds(process.hrtime());

    dt += (currentTick - lastTick);
    lastTick = currentTick;

    process.nextTick(tick);
  }

  wpi.pinMode(outputPin, wpi.OUTPUT);

  process.nextTick(tick);
}

function send(timing) {
  console.log(`Sending...`);
  console.log(timing.join(' '));
  exec(`./send ${timing.join(' ')}`, (error, stdout, stderr) => {
    console.log(stdout);
    if (error) {
      console.error(stderr);
    }
  });
}

module.exports = function(buffer, opts) {
  const reversed = buffer.map(reverseBits);

  return optsSchema.validate(opts)
    .then(opts => build(buffer, opts))
    .then(send);
};
