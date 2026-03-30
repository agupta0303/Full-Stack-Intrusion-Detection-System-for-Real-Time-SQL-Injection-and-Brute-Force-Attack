const axios = require("axios");

const URL = "http://localhost:3000/api/auth/login";

const TOTAL_ATTEMPTS = 6;
const DELAY_MS = 300; 

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function testBruteForce() {
  console.log("\n--- Brute Force Test Started ---\n");

  let success = 0;
  let invalid = 0;
  let blocked = 0;

  for (let i = 1; i <= TOTAL_ATTEMPTS; i++) {
    const start = Date.now();

    try {
      const res = await axios.post(URL, {
        username: "testuser",
        password: "wrongpassword"
      });

      const time = Date.now() - start;
      console.log(`Attempt ${i}: SUCCESS (${time} ms)`);

      success++;
    } catch (err) {
      const time = Date.now() - start;
      const status = err.response?.status;
      const message = err.response?.data?.message || err.message;

      if (status === 401) {
        console.log(`Attempt ${i}: INVALID (${time} ms) → ${message}`);
        invalid++;
      } else if (status === 429) {
        console.log(`Attempt ${i}: BLOCKED (${time} ms) → ${message}`);
        blocked++;
      } else {
        console.log(`Attempt ${i}: ERROR (${time} ms) → ${message}`);
      }
    }

    await sleep(DELAY_MS); 
  }

  console.log("\n--- Test Summary ---");
  console.log(`Total Attempts : ${TOTAL_ATTEMPTS}`);
  console.log(`Success        : ${success}`);
  console.log(`Invalid        : ${invalid}`);
  console.log(`Blocked        : ${blocked}`);
  console.log("\nVerification complete.\n");
}

async function run() {
  await testBruteForce();
}

run();

module.exports = testBruteForce;