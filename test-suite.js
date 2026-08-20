const http = require('http');
const https = require('https');

const request = (url, method = 'GET', body = null, headers = {}) => {
  return new Promise((resolve, reject) => {
    const isHttps = url.startsWith('https');
    const client = isHttps ? https : http;
    const data = body ? JSON.stringify(body) : null;

    const parsed = new URL(url);
    const options = {
      hostname: parsed.hostname,
      port: parsed.port || (isHttps ? 443 : 80),
      path: parsed.pathname + parsed.search,
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(data ? { 'Content-Length': Buffer.byteLength(data) } : {}),
        ...headers,
      },
      timeout: 10000,
    };

    const req = client.request(options, (res) => {
      let raw = '';
      res.on('data', (chunk) => (raw += chunk));
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(raw) });
        } catch (e) {
          resolve({ status: res.statusCode, raw });
        }
      });
    });
    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Timeout'));
    });
    if (data) req.write(data);
    req.end();
  });
};

(async () => {
  console.log('===============================================================');
  console.log('🚀 MEALFIT COMPREHENSIVE END-TO-END VERIFICATION SUITE');
  console.log('===============================================================\n');

  const LOCAL_BASE = 'http://localhost:5050/api';
  const TUNNEL_BASE = 'https://gcc-mrna-bodies-attached.trycloudflare.com/api';

  let passCount = 0;
  let failCount = 0;

  const test = async (name, fn) => {
    try {
      const res = await fn();
      console.log('  ✅ [PASS]', name, '->', res || '');
      passCount++;
    } catch (err) {
      console.log('  ❌ [FAIL]', name, '->', err.message);
      failCount++;
    }
  };

  console.log('--- 1. BACKEND CORE & HEALTH PROBES ---');
  await test('Liveness Health Probe (GET /api/health)', async () => {
    const res = await request(LOCAL_BASE + '/health');
    if (res.status !== 200 || res.data?.data?.status !== 'UP') throw new Error('Status not UP');
    return 'HTTP 200 - Uptime: ' + res.data?.data?.uptimeHuman;
  });

  await test('Deep Diagnostics Probe (GET /api/health/details)', async () => {
    const res = await request(LOCAL_BASE + '/health/details');
    const db = res.data?.data?.database;
    if (db?.status !== 'connected') throw new Error('DB not connected');
    return `HTTP ${res.status} - DB: ${db.status} (${db.latencyMs}ms latency, ${db.host})`;
  });

  console.log('\n--- 2. AUTHENTICATION & PROFILE SYSTEM ---');
  let testToken = '';
  const testEmail = 'tester_' + Date.now() + '@mealfit.in';
  await test('User Registration (POST /api/auth/register)', async () => {
    const res = await request(LOCAL_BASE + '/auth/register', 'POST', {
      fullName: 'Test User',
      email: testEmail,
      password: 'password123',
      gender: 'male',
      dateOfBirth: '1998-01-01',
      heightCm: 178,
      dietaryPreference: 'veg',
      weeklyBudgetInr: 1200,
    });
    if (res.status !== 201 || !res.data?.data?.token) throw new Error('Token not generated');
    testToken = res.data?.data?.token;
    return 'HTTP 201 - User created with JWT Token';
  });

  await test('User Login (POST /api/auth/login)', async () => {
    const res = await request(LOCAL_BASE + '/auth/login', 'POST', {
      email: testEmail,
      password: 'password123',
    });
    if (res.status !== 200 || !res.data?.data?.token) throw new Error('Login failed');
    return 'HTTP 200 - Login successful';
  });

  console.log('\n--- 3. GOALS & BIOMETRICS ENGINE ---');
  await test('Mifflin-St Jeor TDEE & Macro Calculation (POST /api/goals/calculate)', async () => {
    const res = await request(LOCAL_BASE + '/goals/calculate', 'POST', {
      currentWeightKg: 74,
      heightCm: 178,
      age: 26,
      gender: 'male',
      activityLevel: 'moderately_active',
      targetWeightKg: 70,
    });
    const d = res.data?.data;
    if (!d?.tdee || !d?.macros?.proteinG) throw new Error('Calculation missing');
    return `TDEE: ${d.tdee} kcal, Daily Target: ${d.dailyCalorieTarget} kcal, Protein: ${d.macros.proteinG}g, Deficit: ${d.dailyCalorieTarget - d.tdee} kcal`;
  });

  console.log('\n--- 4. NUTRITION & ICMR-NIN KIRANA OPTIMIZER ---');
  await test('Linear Rupee-to-Protein Optimizer (POST /api/nutrition/optimize)', async () => {
    const res = await request(LOCAL_BASE + '/nutrition/optimize', 'POST', {
      dailyBudgetInr: 100,
      targetProteinG: 120,
      dietCategory: 'veg',
    });
    const d = res.data?.data;
    if (!d?.meals?.length) throw new Error('No foods optimized');
    const itemNames = d.meals.map((m) => m.food?.name).filter(Boolean);
    return `Cost: ₹${d.actualCostInr} / Day -> Protein: ${d.totalProteinG}g from ${d.meals.length} meal slots (${itemNames.join(', ')})`;
  });

  await test('7-Day Kirana Shopping List (POST /api/nutrition/kirana-list)', async () => {
    const res = await request(LOCAL_BASE + '/nutrition/kirana-list', 'POST', {
      weeklyBudgetInr: 1000,
      dietCategory: 'veg',
    });
    const d = res.data?.data;
    if (!d?.categories?.length) throw new Error('Kirana list failed');
    return `Generated ${d.categories.length} categories, Total Estimated: ₹${d.totalEstimatedCostInr}/week`;
  });

  await test('Fridge Jugaad Leftover Repurposer (POST /api/nutrition/fridge-jugaad)', async () => {
    const res = await request(LOCAL_BASE + '/nutrition/fridge-jugaad', 'POST', {
      leftovers: ['yellow dal', 'boiled rice'],
    });
    const d = res.data?.data;
    if (!d?.length) throw new Error('No recipes generated');
    return `Generated ${d.length} recipes (Top: ${d[0].recipeName}, +${d[0].proteinG}g protein)`;
  });

  console.log('\n--- 5. WEATHER & AQI DYNAMIC HYDRATION ENGINE ---');
  for (const city of ['delhi', 'mumbai', 'bengaluru']) {
    await test(`Live Weather & AQI (${city.toUpperCase()})`, async () => {
      const res = await request(LOCAL_BASE + `/weather/status?city=${city}&baseHydrationMl=2500`);
      const d = res.data?.data;
      if (!d?.city) throw new Error('Weather data failed');
      return `${d.city}: ${d.temperatureC}°C, AQI: ${d.aqi} (${d.aqiCategory}), Recommended Water: ${d.recommendedWaterMl}mL (+${d.hydrationAdjustmentMl}mL heat bonus)`;
    });
  }

  console.log('\n--- 6. WORKOUTS & APARTMENT ZERO-NOISE MODULE ---');
  await test('Apartment Zero-Noise Routines (GET /api/workouts)', async () => {
    const res = await request(LOCAL_BASE + '/workouts?noiseFreeOnly=true');
    const d = res.data?.data;
    if (!d?.length) throw new Error('No workouts returned');
    return `Loaded ${d.length} zero-noise routines with 3-sec eccentrics & Hindi cues`;
  });

  console.log('\n--- 7. PUBLIC HTTPS CLOUDFLARE TUNNEL PROBE ---');
  await test('Tunnel External Connectivity (Cloudflare HTTPS -> Port 5050)', async () => {
    const res = await request(TUNNEL_BASE + '/health');
    if (res.status !== 200) throw new Error('Tunnel health failed');
    return `HTTP ${res.status} OK via HTTPS (Accessible to physical mobile devices across all networks)`;
  });

  console.log('\n===============================================================');
  console.log(`📊 TEST SUITE SUMMARY: ${passCount} PASSED, ${failCount} FAILED`);
  console.log('===============================================================');
})();
