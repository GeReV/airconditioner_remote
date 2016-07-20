/*
 * blink.c:
 *	Standard "blink" program in wiringPi. Blinks an LED connected
 *	to the first GPIO pin.
 *
 * Copyright (c) 2012-2013 Gordon Henderson. <projects@drogon.net>
 ***********************************************************************
 * This file is part of wiringPi:
 *	https://projects.drogon.net/raspberry-pi/wiringpi/
 *
 *    wiringPi is free software: you can redistribute it and/or modify
 *    it under the terms of the GNU Lesser General Public License as published by
 *    the Free Software Foundation, either version 3 of the License, or
 *    (at your option) any later version.
 *
 *    wiringPi is distributed in the hope that it will be useful,
 *    but WITHOUT ANY WARRANTY; without even the implied warranty of
 *    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *    GNU Lesser General Public License for more details.
 *
 *    You should have received a copy of the GNU Lesser General Public License
 *    along with wiringPi.  If not, see <http://www.gnu.org/licenses/>.
 ***********************************************************************
 */

#include <stdio.h>
#include <stdlib.h>
#include <wiringPi.h>

#define LED 17

#define DUTY_CYCLE 56  //in percent (10->50), usually 33 or 50
//TIP for true 50% use a value of 56, because of rounding errors
//TIP for true 40% use a value of 48, because of rounding errors
//TIP for true 33% use a value of 40, because of rounding errors

unsigned long sigTime = 0; //use in mark & space functions to keep track of time


void setup() {
  wiringPiSetupSys();
  pinMode(LED, OUTPUT);
  digitalWrite(LED, LOW);
}

void mark(unsigned int mLen, int high, int low) { //uses sigTime as end parameter
  sigTime += mLen; //mark ends at new sigTime

  unsigned long now = micros();
  unsigned long dur = sigTime - now; //allows for rolling time adjustment due to code execution delays

  if (dur == 0) return;

  while ((micros() - now) < dur) {
    // Modulate the signal.
    digitalWrite(LED, HIGH);
    delayMicroseconds(high - 5);
    digitalWrite(LED, LOW);
    delayMicroseconds(low - 6);
  }
}

void space(unsigned int sLen) { //uses sigTime as end parameter
  sigTime += sLen; //space ends at new sigTime

  unsigned long now = micros();
  unsigned long dur = sigTime - now; //allows for rolling time adjustment due to code execution delays

  if (dur == 0) return;

  while ((micros() - now) < dur); //just wait here until time is up
}


void runSequence(int *numbers, int high, int low) {
  sigTime = micros(); //keeps rolling track of signal time to avoid impact of loop & code execution delays

  int count = sizeof(numbers) / sizeof(numbers[0]);

  for (int i = 0; i < count; i++) {
    if (i & 1) {
      mark(numbers[i], high, low); //also move pointer to next position
    } else {
      space(numbers[i], high, low); //pointer will be moved by for loop
    }
  }
}


int main (int argc, char *argv[])
{
  int count = argc - 1;
  if (count <= 0) {
    printf("No numbers provided.\n");
    return 1;
  }

  int khz = 38000;

  int period = (1000000 + khz / 2) / khz;
  int high = period * DUTY_CYCLE / 100;
  int low = period - high;

  int *numbers = (int*)malloc(count * sizeof(int));

  for (int i = 1; i < argc; i++) {
    numbers[i - 1] = atoi(argv[i]);
  }

  setup();
  runSequence(numbers, high, low);

  free(numbers);

  return 0;
}
