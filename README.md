# Air Conditioner Remote

A Rust-based web interface for controlling an air conditioner via Raspberry Pi by [Amir Grozki](https://github.com/GeReV).

My current setup uses a binary protocol for an Electra airconditioner, which isn't compatible with LIRC. It is not strictly suitable for any other model, but can be adapted.

The protocol was identified and reversed using online material and [AnalysIR protocol analysis tool](https://www.analysir.com/).

## Credits

Initially based on [Open Source Universal Remote](http://opensourceuniversalremote.com) by [Alex Bain](http://alexba.in).

## Raspberry Pi Setup

Follow these links to setup the Raspberry Pi PWM:

1. https://librpip.frasersdev.net/peripheral-config/pwm0and1
1. https://docs.golemparts.com/rppal/0.11.2/rppal/pwm/#using-pwm-without-superuser-privileges-sudo