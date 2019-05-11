extern crate time;


use std::time::Duration;

use crate::protocol::Protocol;

const HEADER: u8 = 0xc3;

#[derive(Copy, Clone)]
pub enum FanStrength {
    Low = 0x3,
    Medium = 0x2,
    High = 0x1,
    Auto = 0x5,
}

#[derive(Copy, Clone)]
pub enum Mode {
    Hot = 0x4,
    Cold = 0x1,
    Fan = 0x6,
    Dehydrate = 0x2,
    Unknown = 0x0,
}

pub struct Electra {
    pub power: bool,
    pub mode: Mode,
    pub fan: FanStrength,
    pub temp: u8,
    pub swing_h: bool,
    pub swing_v: bool,
}

fn checksum(bytes: [u8; 12]) -> u8 {
    let crc = bytes
        .to_vec()
        .into_iter()
        .fold(0u16, |a, b| a + (b as u16));

    return (crc % (2u16 << 8)) as u8;
}

impl Protocol for Electra {
    fn duration_one(&self) -> Duration {
        Duration::from_micros(1690)
    }
    fn duration_zero(&self) -> Duration {
        Duration::from_micros(560)
    }
    fn duration_separator(&self) -> Duration {
        Duration::from_micros(560)
    }
    fn message_intro(&self) -> Vec<Duration> {
        vec![9000, 4500].into_iter().map(|us| Duration::from_micros(us)).collect()
    }

    fn build_payload(&self) -> Vec<u8> {
        let power = if self.power { 0x20 } else { 0x00 };
        let temperature = (self.temp - 8) & 0x1f;
        let swing_v = if self.swing_v { 0x0 } else { 0x7 };
        let swing_h = if self.swing_h { 0x0 } else { 0x7 };
        let fan = self.fan as u8;
        let mode = self.mode as u8;

        let now = time::now();

        let payload: [u8; 12] = [
            HEADER,
            temperature << 3 | swing_v,
            swing_h << 5 | (now.tm_hour as u8),
            now.tm_min as u8,
            fan << 5,
            0x00,
            mode << 5,
            0x00,
            0x00,
            power,
            0x00,
            0x00, // TODO: Should be button pressed. Can't determine if relevant.
        ];

        let checksum_byte = checksum(payload);

        let mut result = payload.to_vec();

        result.push(checksum_byte);

        return result;
    }
}