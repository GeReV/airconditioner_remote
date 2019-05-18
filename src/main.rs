#![feature(proc_macro_hygiene, decl_macro)]

extern crate glob;

extern crate regex;

#[macro_use]
extern crate serde;

#[macro_use]
extern crate rocket;
#[macro_use]
extern crate rocket_contrib;

#[macro_use(block)]
extern crate nb;
extern crate embedded_hal as hal;

mod irsend;
mod protocol;
mod temperature;

use std::path::Path;

use std::sync::RwLock;

use rocket::http::Status;
use rocket::response::status::Custom;
use rocket::response::NamedFile;
use rocket::State;
use rocket_contrib::json::{Json, JsonValue};
use rocket_contrib::serve::StaticFiles;

use protocol::electra::*;
use protocol::Protocol;

type ElectraState = RwLock<Electra>;

fn internal_error<E: ToString>(e: E) -> Custom<JsonValue> {
    Custom(
        Status::InternalServerError,
        json!({
            "status": "error",
            "reason": e.to_string()
        }),
    )
}

#[get("/")]
fn index() -> Option<NamedFile> {
    return NamedFile::open(Path::new("src/web/index.html")).ok();
}

#[get("/", format = "json")]
fn get(state: State<ElectraState>) -> Json<Electra> {
    let data = state.read().unwrap();

    Json(*data)
}

#[post("/", format = "json", data = "<message>")]
fn update(message: Json<Electra>, state: State<ElectraState>) -> Result<Status, Custom<JsonValue>> {
    let ir_message = message.0.build_message();

    // Update state.
    let mut writable_state = state.write().unwrap();
    *writable_state = message.0;

    if let Err(e) = irsend::send(&ir_message) {
        return Err(internal_error(e));
    }

    Ok(Status::NoContent)
}

#[get("/temperature")]
fn temperature() -> Result<JsonValue, Custom<JsonValue>> {
    use temperature;

    temperature::read_u32()
        .map(|t| json!({ "temperature": t }))
        .map_err(|e| internal_error(e))
}

#[catch(404)]
fn not_found() -> JsonValue {
    json!({
        "status": "error",
        "reason": "Resource was not found."
    })
}

fn rocket() -> rocket::Rocket {
    rocket::ignite()
        .mount("/", routes![index, temperature])
        .mount("/remote", routes![get, update])
        .register(catchers![not_found])
        .manage(RwLock::new(Electra::new()))
}

fn main() {
    rocket().launch();
}
