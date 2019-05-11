#![feature(proc_macro_hygiene, decl_macro)]

#[macro_use] 
extern crate rocket;

#[macro_use(block)]
extern crate nb;
extern crate embedded_hal as hal;

mod protocol;
mod irsend;

use std::error::Error;
use std::path::{ Path };

use rocket::response::NamedFile;
use rocket_contrib::serve::{ StaticFiles };

use protocol::electra::*;
use protocol::Protocol;

#[get("/")]
fn index() -> Option<NamedFile> {
    // let message = Electra {
    //     power: true,
    //     mode: Mode::Cold,
    //     fan: FanStrength::Low,
    //     temp: 22,
    //     swing_h: false,
    //     swing_v: false,
    // };

    return NamedFile::open(Path::new("src/static/index.html")).ok();
}

fn main() {
    // rocket::ignite()
    //     .mount("/", routes![index])
    //     .mount("/public", StaticFiles::from("/static"))
    //     .launch();

    let message = Electra {
        power: true,
        mode: Mode::Cold,
        fan: FanStrength::Low,
        temp: 22,
        swing_h: false,
        swing_v: false,
    };

    match irsend::send(&message.build_message()) {
        Err(e) => println!("Error sending IR message: {:?}", e),
        _ => println!("Sent."),
    }
}