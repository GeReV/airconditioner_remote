use std::time::{Duration};

use hal::prelude::*;

use rppal::hal::Timer;
use rppal::pwm::{Channel, Pwm, Polarity, Error};

const EPSILON: Duration = Duration::from_micros(4);

fn sleep(delay: Duration) {
    let mut timer = Timer::new();

    timer.start(delay - EPSILON);

    block!(timer.wait()).unwrap();
}

fn space(pwm: &Pwm, delay: Duration) -> Result<(), Error> {
	pwm.disable()?;

    if delay.as_micros() > 0 {
        sleep(delay);
    }

    Ok(())
}

fn mark(pwm: &Pwm, delay: Duration) -> Result<(), Error> {	
    pwm.enable()?;

    if delay.as_micros() > 0 {
        sleep(delay);
    }

    Ok(())
}

// Adapted from: https://github.com/z3t0/Arduino-IRremote/blob/master/irSend.cpp
pub fn send(buffer: &Vec<Duration>) -> Result<(), Error> {
    let pwm = Pwm::with_frequency(Channel::Pwm0, 38_000.0, 0.5, Polarity::Normal, false)?;

    for (i, &delay) in buffer.iter().enumerate() {
        if i & 1 == 1 {
            space(&pwm, delay)?;
        } else {
            mark(&pwm, delay)?;
        }
    }

    pwm.disable()?;

    Ok(())
}