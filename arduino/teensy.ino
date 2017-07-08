// For a Teensy 3.2, use pin 5 for PWM.
#include <IRremote.h>

IRsend irsend;

int khz = 38; // 38kHz carrier frequency

void setup()
{
  Serial.begin(9600);
}

unsigned int buffer[300];

void loop() {
  int count = -1;
  
  while (Serial.available()) {
    int n = Serial.parseInt();

    count++;
    
    buffer[count] = n;
  }

  if (count > 0) {
    for (int j=0; j<2; j++) {
      irsend.sendRaw(buffer, count + 1, khz);
      
      delay(2000);
    }
  }
}
