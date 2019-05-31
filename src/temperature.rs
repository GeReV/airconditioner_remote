use std::fs::File;
use std::io;
use std::io::prelude::*;
use std::path::Path;

use glob::*;
use regex::Regex;

const BASEPATH: &str = "/sys/bus/w1/devices/28*/w1_slave";

fn open() -> io::Result<String> {
    let paths = glob(BASEPATH).unwrap();

    let p = paths.last().unwrap().unwrap();

    let mut file = File::open(&Path::new(&p))?;

    let mut contents = String::new();

    file.read_to_string(&mut contents)?;

    Ok(contents)
}

pub fn read_str() -> io::Result<String> {
    let contents = open()?;

    let regex = Regex::new(r"t=([0-9]+)").unwrap();

    let caps = regex.captures(&contents).unwrap();

    Ok(String::from(caps.get(1).unwrap().as_str()))
}

pub fn read_f32() -> io::Result<f32> {
    let temp = read_str()?.parse::<f32>().unwrap();

    Ok(temp / 1000.0)
}

pub fn read_u32() -> io::Result<u32> {
    let temp = read_str()?.parse::<u32>().unwrap();

    Ok(temp)
}
