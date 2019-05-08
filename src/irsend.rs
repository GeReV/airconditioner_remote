use std::time::{Duration, Instant};

use rppal::pwm::{Channel, Pwm, Polarity, Error};

fn sleep(delay: Duration) {
    let now = Instant::now();

    while now.elapsed() < delay {};
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