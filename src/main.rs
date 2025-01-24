extern crate glob;

extern crate regex;

extern crate serde;

#[macro_use]
extern crate rocket;

#[macro_use(block)]
extern crate nb;
extern crate embedded_hal as hal;

mod irsend;
mod protocol;
mod temperature;

use std::sync::RwLock;

use rocket::http::Status;
use rocket::response::status::Custom;
use rocket::serde::json::{json, Json, Value};
use rocket::State;

use protocol::electra::*;
use protocol::Protocol;

type ElectraState = RwLock<Electra>;

fn internal_error<E: ToString>(e: E) -> Custom<Value> {
    Custom(
        Status::InternalServerError,
        json!({
            "status": "error",
            "reason": e.to_string()
        }),
    )
}

#[get("/", format = "json")]
fn get(state: &State<ElectraState>) -> Json<Electra> {
    let data = state.read().unwrap();

    Json(*data)
}

#[post("/", format = "json", data = "<message>")]
fn update(message: Json<Electra>, state: &State<ElectraState>) -> Result<Status, Custom<Value>> {
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
fn get_temperature() -> Result<Value, Custom<Value>> {
    use temperature;

    temperature::read_u32()
        .map(|t| json!({ "temperature": t }))
        .map_err(|e| internal_error(e))
}

#[catch(404)]
fn not_found() -> Value {
    json!({
        "status": "error",
        "reason": "Resource was not found."
    })
}

#[launch]
fn rocket() -> _ {
    rocket::build()
        .mount("/", routes![get_temperature])
        .mount("/remote", routes![get, update])
        .register("/", catchers![not_found])
        .manage(RwLock::new(Electra::new()))
}
