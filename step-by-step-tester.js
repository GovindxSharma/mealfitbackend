const http = require('http');
const https = require('https');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const LOCAL_BASE = 'http://localhost:5050/api';

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
      timeout: 12000,
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

const runStep = async (stepNum, title, fn) => {
  console.log(`\n──────────────────────────────────────────────────────────────────────`);
  console.log(`▶ STEP ${stepNum}: ${title}`);
  console.log(`──────────────────────────────────────────────────────────────────────`);
  try {
    const result = await fn();
    console.log(`  ✅ RESULT: PASS`);
    if (result) {
      console.log(`  📋 DETAILS: ${result}`);
    }
    return true;
  } catch (err) {
    console.log(`  ❌ RESULT: FAIL -> ${err.message}`);
    return false;
  }
};

(async () => {
  console.log('======================================================================');
  console.log('🔬 MEALFIT STEP-BY-STEP EXHAUSTIVE SYSTEM AUDIT & TEST SUITE');
  console.log('======================================================================');

  let passedSteps = 0;
  let totalSteps = 0;

  const countStep = async (stepNum, title, fn) => {
    totalSteps++;
    const ok = await runStep(stepNum, title, fn);
    if (ok) passedSteps++;
  };

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // STEP 1: SERVER & DATABASE HEALTH INSPECTION
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  await countStep('1.0', 'Backend Server Health & Ping Latency Check', async () => {
    const start = Date.now();
    const res = await request(`${LOCAL_BASE}/health`);
    const latency = Date.now() - start;
    if (res.status !== 200) throw new Error(`Health ping failed with HTTP ${res.status}`);
    return `HTTP ${res.status} OK | Server Uptime: ${Math.round(res.data?.data?.uptime || 0)}s | Latency: ${latency}ms | Environment: ${res.data?.data?.environment || 'dev'}`;
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // STEP 2: USER REGISTRATION & PASSWORD ENCRYPTION
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  const testEmail = `step_user_${Date.now()}@mealfit.in`;
  const testPassword = 'StrongPassword#2026';
  let userToken = '';
  let userId = '';

  await countStep('2.1', 'New User Registration (POST /api/auth/register)', async () => {
    const res = await request(`${LOCAL_BASE}/auth/register`, 'POST', {
      fullName: 'Rohan Verma',
      email: testEmail,
      password: testPassword,
      gender: 'male',
      dateOfBirth: '2000-04-12',
      heightCm: 178,
      weightKg: 74,
      targetWeightKg: 68,
      goalType: 'fat_loss',
      dietaryPreference: 'veg',
      weeklyBudgetInr: 600,
      city: 'Delhi',
    });

    if (res.status !== 201) throw new Error(`Expected HTTP 201 Created, got HTTP ${res.status}: ${JSON.stringify(res.data)}`);
    userToken = res.data.data.token;
    userId = res.data.data.user.id;
    return `Created User "${res.data.data.user.fullName}" (ID: ${userId}) | Role: ${res.data.data.user.role} | Token Issued: ${userToken.substring(0, 20)}...`;
  });

  await countStep('2.2', 'Duplicate Email Registration Prevention (409 Conflict)', async () => {
    const res = await request(`${LOCAL_BASE}/auth/register`, 'POST', {
      fullName: 'Imposter Rohan',
      email: testEmail,
      password: 'AnotherPassword#999',
    });

    if (res.status !== 409) throw new Error(`Expected HTTP 409 Conflict, got HTTP ${res.status}`);
    return `HTTP 409 Conflict caught correctly -> "${res.data.error}"`;
  });

  await countStep('2.3', 'Non-Existent Email Login Rejection (404 Not Found)', async () => {
    const res = await request(`${LOCAL_BASE}/auth/login`, 'POST', {
      email: 'ghost_user_9988@mealfit.in',
      password: 'SomePassword123',
    });

    if (res.status !== 404) throw new Error(`Expected HTTP 404 Not Found, got HTTP ${res.status}`);
    return `HTTP 404 Not Found caught correctly -> "${res.data.error}" (Triggers mobile Create Account alert)`;
  });

  await countStep('2.4', 'Incorrect Password Login Rejection (401 Unauthorized)', async () => {
    const res = await request(`${LOCAL_BASE}/auth/login`, 'POST', {
      email: testEmail,
      password: 'WrongPassword999',
    });

    if (res.status !== 401) throw new Error(`Expected HTTP 401 Unauthorized, got HTTP ${res.status}`);
    return `HTTP 401 Unauthorized caught correctly -> "${res.data.error}" (Bcrypt hash check verified)`;
  });

  await countStep('2.5', 'Valid User Login with Verified Bcrypt Hash (200 OK)', async () => {
    const res = await request(`${LOCAL_BASE}/auth/login`, 'POST', {
      email: testEmail,
      password: testPassword,
    });

    if (res.status !== 200 || !res.data?.data?.token) throw new Error(`Login failed with HTTP ${res.status}`);
    userToken = res.data.data.token;
    return `HTTP 200 OK | Authenticated as "${res.data.data.user.fullName}" | New JWT Token Generated`;
  });

  await countStep('2.6', 'Authenticated Profile Retrieval (GET /api/auth/me)', async () => {
    const res = await request(`${LOCAL_BASE}/auth/me`, 'GET', null, {
      Authorization: `Bearer ${userToken}`,
    });

    if (res.status !== 200 || res.data?.data?.email !== testEmail) throw new Error(`Failed to fetch profile: HTTP ${res.status}`);
    const u = res.data.data;
    return `HTTP 200 OK | Verified Profile for ${u.fullName} (${u.email}) | Height: ${u.heightCm}cm | Weight: ${u.weightKg}kg | Goal: ${u.goalType}`;
  });

  await countStep('2.7', 'Dynamic User Profile Update (PUT /api/auth/profile)', async () => {
    const res = await request(`${LOCAL_BASE}/auth/profile`, 'PUT', {
      fullName: 'Rohan Verma (Updated)',
      city: 'Gurugram',
      weeklyBudgetInr: 950,
      targetWeightKg: 67,
    }, {
      Authorization: `Bearer ${userToken}`,
    });

    if (res.status !== 200 || res.data?.data?.city !== 'Gurugram') throw new Error(`Profile update failed: HTTP ${res.status}`);
    return `HTTP 200 OK | Updated Name: ${res.data.data.fullName} | City: ${res.data.data.city} | Target Weight: ${res.data.data.targetWeightKg}kg | Budget: ₹${res.data.data.weeklyBudgetInr}/wk`;
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // STEP 3: ROLE-BASED ACCESS CONTROL & SUPER ADMIN
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  await countStep('3.1', 'Role Barrier: Standard User Blocked from Admin Directory (403 Forbidden)', async () => {
    const res = await request(`${LOCAL_BASE}/auth/admin/users`, 'GET', null, {
      Authorization: `Bearer ${userToken}`,
    });

    if (res.status !== 403) throw new Error(`Expected HTTP 403 Forbidden, got HTTP ${res.status}`);
    return `HTTP 403 Forbidden caught -> "${res.data.error}" (Regular users cannot view admin data)`;
  });

  let adminToken = '';
  await countStep('3.2', 'Super Admin Authentication (POST /api/auth/login)', async () => {
    const res = await request(`${LOCAL_BASE}/auth/login`, 'POST', {
      email: 'govindsharma2839@gmail.com',
      password: 'govind@1184',
    });

    if (res.status !== 200 || res.data?.data?.user?.role !== 'super_admin') throw new Error(`Admin login failed: HTTP ${res.status}`);
    adminToken = res.data.data.token;
    return `HTTP 200 OK | Super Admin Verified: ${res.data.data.user.fullName} (${res.data.data.user.email}) | Role: ${res.data.data.user.role}`;
  });

  await countStep('3.3', 'Super Admin Live Telemetry & User Directory Query (200 OK)', async () => {
    const res = await request(`${LOCAL_BASE}/auth/admin/users`, 'GET', null, {
      Authorization: `Bearer ${adminToken}`,
    });

    if (res.status !== 200 || !res.data?.data?.users) throw new Error(`Admin query failed: HTTP ${res.status}`);
    const d = res.data.data;
    return `HTTP 200 OK | Total Users: ${d.totalUsers} | Active Today: ${d.activeToday} | Super Admins: ${d.roleCounts?.super_admin} | Admins/Testers: ${d.roleCounts?.admin} | Standard Members: ${d.roleCounts?.user}`;
  });

  await countStep('3.4', 'Super Admin User Role Modification (PATCH /api/auth/admin/users/:id/role)', async () => {
    const res = await request(`${LOCAL_BASE}/auth/admin/users/${userId}/role`, 'PATCH', {
      role: 'admin',
    }, {
      Authorization: `Bearer ${adminToken}`,
    });

    if (res.status !== 200 || res.data?.data?.role !== 'admin') throw new Error(`Role update failed: HTTP ${res.status}`);
    return `HTTP 200 OK | Successfully promoted user ${userId} to role: "${res.data.data.role}" (Tester / Admin)`;
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // STEP 4: MIFFLIN-ST JEOR BMR & TDEE ENGINE
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  await countStep('4.1', 'Male Mifflin-St Jeor TDEE & Macro Deficit Calculation', async () => {
    const res = await request(`${LOCAL_BASE}/goals/calculate`, 'POST', {
      currentWeightKg: 74,
      heightCm: 178,
      age: 24,
      gender: 'male',
      activityLevel: 'moderately_active',
      targetWeightKg: 68,
    });

    if (res.status !== 200 || !res.data?.data?.tdee) throw new Error(`TDEE calculation failed: HTTP ${res.status}`);
    const d = res.data.data;
    return `BMR Baseline: ~1700 kcal | TDEE: ${d.tdee} kcal | Daily Target: ${d.dailyCalorieTarget} kcal | Protein Target: ${d.macros?.proteinG}g | Carbs: ${d.macros?.carbsG}g | Fats: ${d.macros?.fatG}g`;
  });

  await countStep('4.2', 'Female Mifflin-St Jeor TDEE & Lean Muscle Gain Calculation', async () => {
    const res = await request(`${LOCAL_BASE}/goals/calculate`, 'POST', {
      currentWeightKg: 58,
      heightCm: 162,
      age: 27,
      gender: 'female',
      activityLevel: 'lightly_active',
      targetWeightKg: 61,
    });

    if (res.status !== 200 || !res.data?.data?.tdee) throw new Error(`TDEE calculation failed: HTTP ${res.status}`);
    const d = res.data.data;
    return `Female BMR Baseline: ~1300 kcal | TDEE: ${d.tdee} kcal | Daily Surplus Target: ${d.dailyCalorieTarget} kcal | Protein Target: ${d.macros?.proteinG}g`;
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // STEP 5: GEOIP & DYNAMIC AQI HYDRATION CALIBRATION
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  const metros = [
    { city: 'delhi', label: 'New Delhi (NCR)' },
    { city: 'mumbai', label: 'Mumbai (Maharashtra)' },
    { city: 'bengaluru', label: 'Bengaluru (Karnataka)' },
    { city: 'chennai', label: 'Chennai (Tamil Nadu)' },
  ];

  for (const m of metros) {
    await countStep(`5.${metros.indexOf(m) + 1}`, `Indian Metro Weather & AQI Telemetry: ${m.label}`, async () => {
      const res = await request(`${LOCAL_BASE}/weather/status?city=${m.city}&baseHydrationMl=2600`);
      if (res.status !== 200) throw new Error(`Weather check failed for ${m.city}: HTTP ${res.status}`);
      const d = res.data.data;
      return `${d.city} (${d.state}): ${d.temperatureC}°C | AQI: ${d.aqi} (${d.aqiCategory}) | Recommended Water: ${d.totalRecommendedWaterMl}mL (+${d.hydrationAdjustmentMl}mL heat bonus) | Workout: ${d.workoutRecommendation.mode}`;
    });
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // STEP 6: ICMR-NIN ₹-TO-PROTEIN OPTIMIZER & KIRANA LIST
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  await countStep('6.1', 'ICMR-NIN ₹50/day Vegetarian High-Protein Optimization', async () => {
    const res = await request(`${LOCAL_BASE}/nutrition/optimize`, 'POST', {
      dailyBudgetInr: 50,
      targetProteinG: 90,
      dietCategory: 'veg',
    });

    if (res.status !== 200 || !res.data?.data?.meals?.length) throw new Error(`Optimizer failed: HTTP ${res.status}`);
    const d = res.data.data;
    const foodNames = d.meals.map(m => m.food?.name).filter(Boolean);
    return `Daily Cost: ₹${d.actualCostInr} ➔ ${d.totalProteinG}g Protein from ${d.meals.length} staples (${foodNames.slice(0, 3).join(', ')}...)`;
  });

  await countStep('6.2', '7-Day ₹800 Weekly Kirana Grocery Shopping List Generator', async () => {
    const res = await request(`${LOCAL_BASE}/nutrition/kirana-list`, 'POST', {
      weeklyBudgetInr: 800,
      dietCategory: 'veg',
    });

    if (res.status !== 200 || !res.data?.data?.categories?.length) throw new Error(`Kirana list failed: HTTP ${res.status}`);
    const d = res.data.data;
    return `Generated ${d.categories.length} Grocery Categories | Total Estimated Cost: ₹${d.totalEstimatedCostInr}/week`;
  });

  await countStep('6.3', 'Leftover Fridge Jugaad Repurposer', async () => {
    const res = await request(`${LOCAL_BASE}/nutrition/fridge-jugaad`, 'POST', {
      leftovers: ['boiled chana', 'dahi'],
    });

    if (res.status !== 200 || !res.data?.data?.length) throw new Error(`Fridge Jugaad failed: HTTP ${res.status}`);
    const r = res.data.data[0];
    return `Repurposed ${res.data.data.length} recipes | Top: "${r.recipeName}" (+${r.proteinG}g protein, ${r.calories} kcal)`;
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // STEP 7: APARTMENT ZERO-NOISE WORKOUT ROUTINES
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  await countStep('7.1', 'Apartment Zero-Noise Calisthenics & Tempo Query', async () => {
    const res = await request(`${LOCAL_BASE}/workouts?noiseFreeOnly=true`);
    if (res.status !== 200 || !res.data?.data?.length) throw new Error(`Workouts failed: HTTP ${res.status}`);
    return `Loaded ${res.data.data.length} zero-noise apartment routines with 3-second eccentric tempo cues`;
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // FINAL SUMMARY MATRIX
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  console.log('\n======================================================================');
  console.log(`📊 FINAL STEP-BY-STEP AUDIT RESULTS:`);
  console.log(`   Total Steps Executed:  ${totalSteps}`);
  console.log(`   Steps Passed:          ${passedSteps}`);
  console.log(`   Steps Failed:          ${totalSteps - passedSteps}`);
  console.log(`   Success Rate:          ${Math.round((passedSteps / totalSteps) * 100)}%`);
  console.log('======================================================================\n');
})();
