#![feature(proc_macro_hygiene, decl_macro)]

#[macro_use] extern crate rocket;

mod protocol;

use std::path::{ Path };

use rocket::response::NamedFile;
use rocket_contrib::serve::{ StaticFiles };

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
    rocket::ignite()
        .mount("/", routes![index])
        .mount("/public", StaticFiles::from("/static"))
        .launch();
}