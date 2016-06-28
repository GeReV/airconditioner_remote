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

#define LED 0

#define Duty_Cycle 56  //in percent (10->50), usually 33 or 50
//TIP for true 50% use a value of 56, because of rounding errors
//TIP for true 40% use a value of 48, because of rounding errors
//TIP for true 33% use a value of 40, because of rounding errors

#define Carrier_Frequency 40000   //usually one of 38000, 40000, 36000, 56000, 33000, 30000


#define PERIOD    ((1000000 + Carrier_Frequency / 2) / Carrier_Frequency)
#define HIGHTIME  (PERIOD * Duty_Cycle / 100)
#define LOWTIME   (PERIOD - HIGHTIME)

unsigned long sigTime = 0; //use in mark & space functions to keep track of time


void setup() {
  wiringPiSetup();
  pinMode(LED, OUTPUT);
  digitalWrite(LED, LOW);
}

void mark(unsigned int mLen) { //uses sigTime as end parameter
  sigTime += mLen; //mark ends at new sigTime
  unsigned long now = micros();
  unsigned long dur = sigTime - now; //allows for rolling time adjustment due to code execution delays
  if (dur == 0) return;
  while ((micros() - now) < dur) { //just wait here until time is up
    digitalWrite(LED, HIGH);
    delayMicroseconds(HIGHTIME - 5);
    digitalWrite(LED, LOW);
    delayMicroseconds(LOWTIME - 6);
  }
}

void space(unsigned int sLen) { //uses sigTime as end parameter
  sigTime += sLen; //space ends at new sigTime
  unsigned long now = micros();
  unsigned long dur = sigTime - now; //allows for rolling time adjustment due to code execution delays
  if (dur == 0) return;
  while ((micros() - now) < dur) ; //just wait here until time is up
}


void runSequence(int *numbers) {
  sigTime = micros(); //keeps rolling track of signal time to avoid impact of loop & code execution delays

  int count = sizeof(numbers) / sizeof(numbers[0]);
  for (int i = 0; i < count; i++) {
    mark(numbers[i++]); //also move pointer to next position

    if (i < count) {
      space(numbers[i]); //pointer will be moved by for loop
    }
  }
}


int main (int argc, char *argv[])
{
  int count = argc - 1;
  int *numbers = (int*)malloc(count * sizeof(int));

  for (int i = 1; i < argc; i++) {
    numbers[i - 1] = atoi(argv[i]);
  }

  setup();
  runSequence(numbers);

  free(numbers);

  return 0;
}

