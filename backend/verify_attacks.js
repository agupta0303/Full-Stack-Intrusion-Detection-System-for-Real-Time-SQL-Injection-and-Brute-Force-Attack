const axios = require('axios');

async function testSQLi() {
    console.log("\n--- Testing SQL Injection Coverage (ML Isolation) ---");

    try {
        const res = await axios.post('http://localhost:3000/api/attack/sql', { input: "admin' OR 1=1--" });
        console.log("SQLi Test 1 (Known) Result:", res.data);
    } catch (err) {
        console.log("SQLi Test 1 (Known) Result: BLOCKED -", err.response?.data || err.message);
    }

    try {
        const res = await axios.post('http://localhost:3000/api/attack/sql', { input: "xyz' UNION SELECT NULL, NULL /* random_evasion_char_*&^( */" });
        console.log("SQLi Test 2 (Unknown/Anomalous) Result:", res.data);
    } catch (err) {
        console.log("SQLi Test 2 (Unknown/Anomalous) Result: BLOCKED -", err.response?.data || err.message);
    }
}

async function testBruteForce() {
    console.log("\n--- Testing Brute Force Coverage (ML Isolation) ---");

    for (let i = 1; i <= 4; i++) {
        try {
            const res = await axios.post('http://localhost:3000/api/auth/login', { username: 'testuser', password: '123' });
            console.log(`Brute Force Login attempt ${i}: SUCCESS`);
        } catch (err) {
            console.log(`Brute Force Login attempt ${i} Result: ${err.response?.status} -`, err.response?.data?.message || err.message);
        }
    }
}

async function run() {
    await testSQLi();
    await testBruteForce();
    console.log("\nVerification complete.");
}

run();
