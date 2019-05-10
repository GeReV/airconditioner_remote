use std::time::{Duration, Instant};

use rppal::pwm::{Channel, Pwm, Polarity, Error};

const epsilon: Duration = Duration::from_micros(4);

fn sleep(delay: Duration) {
    let now = Instant::now();

    while now.elapsed() < delay - epsilon {};
}

fn space(delay: Duration) -> Result<(), Error> {
	// pwm.disable()?;

    if delay.as_micros() > 0 {
        sleep(delay);
    }

    Ok(())
}

fn mark(delay: Duration) -> Result<(), Error> {	
    // pwm.enable()?;

    if delay.as_micros() > 0 {
        sleep(delay);
    }

    Ok(())
}

pub fn send(buffer: &Vec<Duration>) -> Result<(), Error> {
    // let pwm = Pwm::with_frequency(Channel::Pwm0, 38_000.0, 0.5, Polarity::Normal, false)?;

    let mut results = Vec::new();

    for (i, &delay) in buffer.iter().enumerate() {
        let now = Instant::now();

        if i & 1 == 1 {
            space(delay)?;
        } else {
            mark(delay)?;
        }

        results.push((delay, now.elapsed()));
    }

    println!("{:?}", results);

    let diffs: Vec<Duration> = results.into_iter().map(|(a, b)| {
        if a > b {
            a - b
        } else {
            b - a
        }
    }).collect();

    println!();
    println!("{:?}", diffs);
    println!();    
    println!("max: {:?}", diffs.into_iter().max());

    // pwm.disable()?;

    Ok(())
}