// // Autobattler matchmaking for 8 players with POV-equal rule-based rounds
// // Rounds 1,2,4 are random distinct matchings; rounds 3,5,6,7 are derived by mapping rules

// function shuffle(array) {
//   for (let i = array.length - 1; i > 0; i--) {
//     const j = Math.floor(Math.random() * (i + 1));
//     [array[i], array[j]] = [array[j], array[i]];
//   }
//   return array;
// }

// function makeRandomMatching(players, forbiddenPairs = new Set()) {
//   // players: array of IDs, forbiddenPairs: Set of "A|B" strings
//   const maxTries = 1000;
//   for (let t = 0; t < maxTries; t++) {
//     const pool = shuffle([...players]);
//     const pairs = [];
//     let ok = true;
//     while (pool.length) {
//       const a = pool.shift();
//       const b = pool.shift();
//       const key = a < b ? `${a}|${b}` : `${b}|${a}`;
//       if (forbiddenPairs.has(key)) { ok = false; break; }
//       pairs.push([a, b]);
//     }
//     if (ok) return pairs;
//   }
//   throw new Error('Failed to generate random matching');
// }

// function buildOppMap(pairs) {
//   const m = {};
//   pairs.forEach(([a, b]) => { m[a] = b; m[b] = a; });
//   return m;
// }

// function deriveMatching(sourcePairs, mapPairs) {
//   // for each [x,y] in sourcePairs, new pair is [x, mapPairs[y]]
//   return sourcePairs.map(([x, y]) => {
//     const z = mapPairs[y];
//     if (z === x) throw new Error('Derived self-match');
//     return x < z ? [x, z] : [z, x];
//   });
// }

// function matchingKey([a, b]) {
//   return a < b ? `${a}|${b}` : `${b}|${a}`;
// }

// function isPerfectMatching(pairs, players) {
//   if (pairs.length !== players.length / 2) return false;
//   const seen = new Set();
//   for (const [a, b] of pairs) {
//     if (seen.has(a) || seen.has(b)) return false;
//     seen.add(a); seen.add(b);
//   }
//   return seen.size === players.length;
// }

// function generateSchedule(players) {
//   const allForbidden = new Set();
//   let r1, r2, r3, r4, r5, r6, r7;

//   while (true) {
//     // Round 1 random
//     r1 = makeRandomMatching(players);
//     r1.forEach(p => allForbidden.add(matchingKey(p)));

//     // Round 2 random, avoid R1 pairs
//     r2 = makeRandomMatching(players, new Set(r1.map(matchingKey)));
//     r2.forEach(p => allForbidden.add(matchingKey(p)));

//     // Round 4 random, avoid R1 and R2
//     const forb12 = new Set([...r1, ...r2].map(matchingKey));
//     r4 = makeRandomMatching(players, forb12);
//     r4.forEach(p => allForbidden.add(matchingKey(p)));

//     // Build maps
//     const m1 = buildOppMap(r1);
//     const m2 = buildOppMap(r2);
//     const m4 = buildOppMap(r4);

//     try {
//       // Derived rounds
//       r3 = deriveMatching(r1, m2);
//       r5 = deriveMatching(r1, m4);
//       r6 = deriveMatching(r2, m4);
//       r7 = deriveMatching(r3, m4);
//     } catch (e) {
//       // invalid (self-match), retry
//       continue;
//     }

//     // Check all rounds are valid and no forbidden pairs
//     const rounds = [r1, r2, r3, r4, r5, r6, r7];
//     const allKeys = new Set();
//     let valid = true;
//     for (const r of rounds) {
//       if (!isPerfectMatching(r, players)) { valid = false; break; }
//       for (const p of r) {
//         const k = matchingKey(p);
//         if (allKeys.has(k)) { valid = false; break; }
//         allKeys.add(k);
//       }
//       if (!valid) break;
//     }
//     if (valid) return rounds;
//   }
// }

// function printSchedule(schedule) {
//   schedule.forEach((pairs, i) => {
//     console.log(`Round ${i + 1}:`);
//     pairs.forEach(([a, b]) => console.log(`  ${a} vs ${b}`));
//   });
// }

// // Example usage
// const players = ['P1','P2','P3','P4','P5','P6','P7','P8'];
// const schedule = generateSchedule(players);
// printSchedule(schedule);
