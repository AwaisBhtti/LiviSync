import type { Preferences } from './types';

export function calculateCompatibility(prefA?: Preferences, prefB?: Preferences, budgetA?: number, budgetB?: number): number {
  if (!prefA || !prefB) return 0;
  let score = 0;
  let maxScore = 0;

  // 0. Budget (Weight: 20)
  if (budgetA !== undefined && budgetB !== undefined && budgetA > 0 && budgetB > 0) {
    maxScore += 20;
    const diff = Math.abs(budgetA - budgetB);
    if (diff <= 5000) {
      score += 20;
    } else if (diff <= 10000) {
      score += 15;
    } else if (diff <= 20000) {
      score += 10;
    } else if (diff <= 30000) {
      score += 5;
    } else {
      score += 0;
    }
  }

  // 1. Cleanliness (Weight: 20)
  maxScore += 20;
  if (prefA.cleanliness === prefB.cleanliness) {
    score += 20;
  } else if (
    (prefA.cleanliness === 'meticulous' && prefB.cleanliness === 'relaxed') ||
    (prefA.cleanliness === 'relaxed' && prefB.cleanliness === 'meticulous')
  ) {
    score += 4; // low compatibility when extremes collide
  } else {
    score += 12; // moderate matching one level apart
  }

  // 2. Smoking Policy (Weight: 20)
  maxScore += 20;
  if (prefA.smoking === prefB.smoking) {
    score += 20;
  } else if (
    (prefA.smoking === 'no' && prefB.smoking === 'outside-only') ||
    (prefA.smoking === 'outside-only' && prefB.smoking === 'no')
  ) {
    score += 12;
  } else {
    score += 0; // complete clash (smoker in-room vs non-smoker)
  }

  // 3. Sleep Schedule (Weight: 15)
  maxScore += 15;
  if (prefA.sleepSchedule === prefB.sleepSchedule) {
    score += 15;
  } else if (
    prefA.sleepSchedule === 'flexible' ||
    prefB.sleepSchedule === 'flexible'
  ) {
    score += 10;
  } else {
    score += 4;
  }

  // 4. Noise Tolerance (Weight: 15)
  maxScore += 15;
  const noiseA = prefA.noiseTolerance || 'moderate';
  const noiseB = prefB.noiseTolerance || 'moderate';
  if (noiseA === noiseB) {
    score += 15;
  } else if (
    noiseA === 'moderate' ||
    noiseB === 'moderate'
  ) {
    score += 10;
  } else {
    score += 4; // clash between silent and lively
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
    score += 4;
  }

  // 6. Pet Policy (Weight: 15)
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

  return Math.round((score / maxScore) * 100);
}
