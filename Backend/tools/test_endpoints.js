// Simple endpoint tester for the JobJourney backend
// Run: node tools/test_endpoints.js

async function run() {
  const base = 'http://localhost:4000/v1';
  try {
    console.log('GET /health');
    let r = await fetch(base + '/health');
    console.log('status', r.status);
    console.log(await r.text());

    const email = `test.user+${Date.now()}@example.com`;
    const registerBody = {
      firstName: 'Test', lastName: 'User', email, password: 'StrongPass123!',
      phone: '+1234567890', location: 'Test City', targetRoles: ['Backend Engineer'],
      seniorityLevel: 'junior', preferredLocations: ['Remote']
    };

    console.log('\nPOST /auth/register');
    r = await fetch(base + '/auth/register', { method: 'POST', headers: {'content-type':'application/json'}, body: JSON.stringify(registerBody) });
    console.log('status', r.status);
    console.log(await r.text());

    console.log('\nPOST /auth/login');
    r = await fetch(base + '/auth/login', { method: 'POST', headers: {'content-type':'application/json'}, body: JSON.stringify({ email, password: 'StrongPass123!' }) });
    console.log('status', r.status);
    const loginJson = await r.json().catch(() => null);
    console.log('body', loginJson);

    if (loginJson && loginJson.accessToken) {
      const token = loginJson.accessToken;
      console.log('\nGET /me (auth)');
      r = await fetch(base + '/me', { headers: { Authorization: `Bearer ${token}` } });
      console.log('status', r.status);
      console.log(await r.text());

      console.log('\nGET /me/profile (auth)');
      r = await fetch(base + '/me/profile', { headers: { Authorization: `Bearer ${token}` } });
      console.log('status', r.status);
      console.log(await r.text());
    } else {
      console.log('Login failed, skipping auth checks');
    }
  } catch (err) {
    console.error('Error during tests', err);
  }
}

run();
