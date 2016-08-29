const yup = require('yup');
const SerialPort = require('serialport');

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

      message[index] = opts.durationSeparator;

      message[index + 1] = (byte & 1) ? opts.durationOne : opts.durationZero;

      byte >>>= 1;
    }
  });

  const intro = (opts.intro || []);
  return intro.concat(message).concat([opts.durationSeparator]);
}

function send(timing) {
  return new Promise((resolve, reject) => {
    console.log(`Sending...`);

    const port = new SerialPort('/dev/ttyACM0', {
      baudRate: 9600
    });

    port.on('error', reject);

    port.on('open', () => {
      console.log('Open.');

      port.write(timing.join(' '), err => {
        if (err) {
          reject(err);
        }

        console.log('Sent.');

        port.close(err => {
          if (err) {
            reject(err);
          }

          console.log('Closed.');

          resolve();
        });
      });
    });

  });
}

module.exports = function(buffer, opts) {
  const reversed = buffer.map(reverseBits);

  return optsSchema.validate(opts)
    .then(opts => build(buffer, opts))
    .then(send);
};
