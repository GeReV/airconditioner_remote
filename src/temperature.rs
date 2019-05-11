use std::path::{ Path, PathBuf };
use std::fs::File;
use std::io;
use std::io::prelude::*;

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

pub fn read() -> io::Result<f32> {
    let contents = open()?;

    let regex = Regex::new(r"t=([0-9]+)").unwrap();

    let caps = regex.captures(&contents).unwrap();

    let temp_str: &str = caps.get(1).unwrap().as_str();

    let temp = temp_str.parse::<f32>().unwrap();

    Ok(temp / 1000.0)
}