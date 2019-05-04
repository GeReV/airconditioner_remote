use rppal::pwm::{Channel, Pwm, Polarity};

let pwm = Pwm::with_frequency(Channel::Pwm0, 38_000, 0.5, Polarity::Normal, false)?;

pub fn irsend()