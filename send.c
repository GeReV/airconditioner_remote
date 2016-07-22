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

#define LED 18

#define DEFAULT_CLOCK_FREQ = 192e5 // PWM clock is 19.2MHz by default

unsigned long sigTime = 0; //use in mark & space functions to keep track of time

void setup(int khz) {
  wiringPiSetup();

  pwmSetMode(PWM_MODE_MS);
  pwmSetClock(DEFAULT_CLOCK_FREQ / khz);
  pwmSetRange(2); // 50% duty cycle.

  pinMode(LED, OUTPUT);
  digitalWrite(LED, LOW);
}

void mark(unsigned int mLen) { //uses sigTime as end parameter
  sigTime += mLen; //mark ends at new sigTime

  unsigned long now = micros();
  unsigned long dur = sigTime - now; //allows for rolling time adjustment due to code execution delays

  if (dur == 0) return;

  digitalWrite(LED, HIGH);
  while ((micros() - now) < dur);
  digitalWrite(LED, LOW);
}

void space(unsigned int sLen) { //uses sigTime as end parameter
  sigTime += sLen; //space ends at new sigTime

  unsigned long now = micros();
  unsigned long dur = sigTime - now; //allows for rolling time adjustment due to code execution delays

  if (dur == 0) return;

  while ((micros() - now) < dur); //just wait here until time is up
}


void runSequence(int *numbers, int count) {
  sigTime = micros(); //keeps rolling track of signal time to avoid impact of loop & code execution delays

  for (int i = 0; i < count; i++) {
    if (i & 1) {
      space(numbers[i]);
    } else {
      mark(numbers[i]);
    }
  }
  digitalWrite(LED, LOW);
}


int main (int argc, char *argv[])
{
  int count = argc - 1;
  if (count <= 0) {
    printf("No numbers provided.\n");
    return 1;
  }

  int khz = 38000;

  int *numbers = (int*)malloc(count * sizeof(int));

  for (int i = 1; i < argc; i++) {
    numbers[i - 1] = atoi(argv[i]);
  }

  printf("setup\n");
  setup(khz);

  printf("run\n");
  runSequence(numbers, count);

  printf("end\n");

  free(numbers);

  return 0;
}
