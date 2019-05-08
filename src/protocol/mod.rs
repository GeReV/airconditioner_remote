use std::time::Duration;

pub mod electra;

pub trait Protocol {
    fn duration_one(&self) -> Duration;
    fn duration_zero(&self) -> Duration;
    fn duration_separator(&self) -> Duration;

    fn message_intro(&self) -> Vec<Duration>;

    fn build_payload(&self) -> Vec<u8>;

    fn build_message(&self) -> Vec<Duration> {
        let buffer = self.build_payload();
        let mut message_payload = Vec::with_capacity(buffer.len() * 16);

        for mut byte in buffer {
            for _ in 0..8 {
                message_payload.push(self.duration_separator());

                message_payload.push(
                    if (byte & 1) == 1 { 
                        self.duration_one() 
                    } else {
                        self.duration_zero()
                    }
                );

                byte >>= 1;
            }
        }

        let mut message = self.message_intro();

        message.append(&mut message_payload);
        message.push(self.duration_separator());

        return message;
    }
}