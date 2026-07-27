import type { Preferences } from './types';

export function calculateCompatibility(prefA?: Preferences, prefB?: Preferences): number {
  if (!prefA || !prefB) return 0;
  let score = 0;
  let maxScore = 0;

  // 1. Sleep Schedule (Weight: 20)
  maxScore += 20;
  if (prefA.sleepSchedule === prefB.sleepSchedule) {
    score += 20;
  } else if (
    prefA.sleepSchedule === 'flexible' ||
    prefB.sleepSchedule === 'flexible'
  ) {
    score += 12;
  }

  // 2. Cleanliness (Weight: 25)
  maxScore += 25;
  if (prefA.cleanliness === prefB.cleanliness) {
    score += 25;
  } else if (
    (prefA.cleanliness === 'meticulous' && prefB.cleanliness === 'relaxed') ||
    (prefA.cleanliness === 'relaxed' && prefB.cleanliness === 'meticulous')
  ) {
    score += 5; // low compatibility when extremes collide
  } else {
    score += 15; // moderate matching one level apart
  }

  // 3. Smoking Policy (Weight: 25)
  maxScore += 25;
  if (prefA.smoking === prefB.smoking) {
    score += 25;
  } else if (
    (prefA.smoking === 'no' && prefB.smoking === 'outside-only') ||
    (prefA.smoking === 'outside-only' && prefB.smoking === 'no')
  ) {
    score += 15;
  } else {
    score += 0; // complete clash (smoker in-room vs non-smoker)
  }

  // 4. Pet Policy (Weight: 15)
  maxScore += 15;
  if (prefA.pets === prefB.pets) {
    score += 15;
  } else if (
    (prefA.pets === 'likes-but-no-own' && prefB.pets === 'yes') ||
    (prefA.pets === 'yes' && prefB.pets === 'likes-but-no-own')
  ) {
    score += 12;
  } else if (
    (prefA.pets === 'no' && prefB.pets === 'likes-but-no-own') ||
    (prefA.pets === 'likes-but-no-own' && prefB.pets === 'no')
  ) {
    score += 10;
  } else {
    score += 0;
  }

  // 5. Guest Tolerance (Weight: 15)
  maxScore += 15;
  if (prefA.guestTolerance === prefB.guestTolerance) {
    score += 15;
  } else if (
    prefA.guestTolerance === 'anytime' ||
    prefB.guestTolerance === 'anytime'
  ) {
    score += 10;
  } else {
    score += 5;
  }

  return Math.round((score / maxScore) * 100);
}
