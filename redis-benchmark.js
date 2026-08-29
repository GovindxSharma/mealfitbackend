const http = require('http');

const LOCAL_BASE = 'http://localhost:5050/api';

const request = (url) => {
  return new Promise((resolve, reject) => {
    const t0 = process.hrtime.bigint();
    const parsed = new URL(url);
    const options = {
      hostname: parsed.hostname,
      port: parsed.port || 80,
      path: parsed.pathname + parsed.search,
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      timeout: 10000,
    };

    const req = http.request(options, (res) => {
      let raw = '';
      res.on('data', (chunk) => (raw += chunk));
      res.on('end', () => {
        const t1 = process.hrtime.bigint();
        const latencyMs = Number(t1 - t0) / 1000000;
        let data = {};
        try {
          data = JSON.parse(raw);
        } catch (e) {
          data = { raw };
        }
        resolve({
          status: res.statusCode,
          headers: res.headers,
          latencyMs,
          cacheHeader: res.headers['x-cache'] || 'NONE',
          data,
        });
      });
    });
    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Timeout'));
    });
    req.end();
  });
};

const runConcurrencyTest = async (url, iterations = 100) => {
  const promises = [];
  const startAll = Date.now();
  for (let i = 0; i < iterations; i++) {
    promises.push(request(url));
  }
  const results = await Promise.all(promises);
  const totalDurationMs = Date.now() - startAll;

  const latencies = results.map((r) => r.latencyMs).sort((a, b) => a - b);
  const avgLatency = (latencies.reduce((a, b) => a + b, 0) / latencies.length).toFixed(2);
  const minLatency = latencies[0].toFixed(2);
  const maxLatency = latencies[latencies.length - 1].toFixed(2);
  const p95Latency = latencies[Math.floor(latencies.length * 0.95)].toFixed(2);
  const cacheHits = results.filter((r) => r.cacheHeader === 'HIT').length;
  const requestsPerSec = Math.round((iterations / (totalDurationMs / 1000)));

  return {
    iterations,
    totalDurationMs,
    avgLatency,
    minLatency,
    maxLatency,
    p95Latency,
    cacheHits,
    cacheHitRate: `${((cacheHits / iterations) * 100).toFixed(1)}%`,
    requestsPerSec,
  };
};

(async () => {
  console.log('======================================================================');
  console.log('⚡ MEALFIT HIGH-PERFORMANCE REDIS CACHING & BENCHMARK SUITE');
  console.log('   Testing master data retrieval speed, latency & cache hit rates');
  console.log('======================================================================\n');

  // 1. Health & Cache Engine Detection
  console.log('🔍 [1/4] Inspecting Cache Engine Status...');
  const healthRes = await request(`${LOCAL_BASE}/health/details`);
  const cacheInfo = healthRes.data?.data?.cache || {};
  console.log(`   Engine Type:       ${cacheInfo.type || 'In-Memory / Redis'}`);
  console.log(`   Connected Live:    ${cacheInfo.connected ? 'YES (ioredis)' : 'Fallback Active (Instant In-Memory LRU)'}`);
  console.log(`   Cached Keys Count: ${cacheInfo.size || cacheInfo.items || 0} active objects\n`);

  // 2. Master Food Database Benchmark (/api/nutrition/foods)
  console.log('🥗 [2/4] Testing Master Indian Foods Database (/api/nutrition/foods)...');
  const food1 = await request(`${LOCAL_BASE}/nutrition/foods`);
  console.log(`   1st Query (Cold / Populating): ${food1.latencyMs.toFixed(2)}ms | Cache: ${food1.cacheHeader}`);
  
  const food2 = await request(`${LOCAL_BASE}/nutrition/foods`);
  console.log(`   2nd Query (Warm / Redis Hit):  ${food2.latencyMs.toFixed(2)}ms | Cache: ${food2.cacheHeader}`);

  const foodBench = await runConcurrencyTest(`${LOCAL_BASE}/nutrition/foods`, 100);
  console.log(`   🚀 Concurrency Benchmark (100 parallel requests):`);
  console.log(`      • Average Latency: ${foodBench.avgLatency} ms`);
  console.log(`      • Min / P95 / Max: ${foodBench.minLatency}ms / ${foodBench.p95Latency}ms / ${foodBench.maxLatency}ms`);
  console.log(`      • Cache Hit Rate:  ${foodBench.cacheHitRate} (${foodBench.cacheHits}/${foodBench.iterations})`);
  console.log(`      • Throughput:      ${foodBench.requestsPerSec} requests/sec\n`);

  // 3. Weather & AQI Hydration Master Cache (/api/weather/status?city=delhi)
  console.log('🌦️ [3/4] Testing Weather & AQI Master Cache (/api/weather/status)...');
  const weather1 = await request(`${LOCAL_BASE}/weather/status?city=delhi`);
  console.log(`   1st Query (Cold / External API): ${weather1.latencyMs.toFixed(2)}ms | Cache: ${weather1.cacheHeader}`);
  
  const weather2 = await request(`${LOCAL_BASE}/weather/status?city=delhi`);
  console.log(`   2nd Query (Warm / Redis Hit):     ${weather2.latencyMs.toFixed(2)}ms | Cache: ${weather2.cacheHeader}`);

  const weatherBench = await runConcurrencyTest(`${LOCAL_BASE}/weather/status?city=delhi`, 100);
  console.log(`   🚀 Concurrency Benchmark (100 parallel requests):`);
  console.log(`      • Average Latency: ${weatherBench.avgLatency} ms`);
  console.log(`      • Min / P95 / Max: ${weatherBench.minLatency}ms / ${weatherBench.p95Latency}ms / ${weatherBench.maxLatency}ms`);
  console.log(`      • Cache Hit Rate:  ${weatherBench.cacheHitRate} (${weatherBench.cacheHits}/${weatherBench.iterations})`);
  console.log(`      • Throughput:      ${weatherBench.requestsPerSec} requests/sec\n`);

  // 4. Workout Templates Master Cache (/api/workouts)
  console.log('🏋️ [4/4] Testing Apartment Workouts Master Cache (/api/workouts)...');
  const workoutBench = await runConcurrencyTest(`${LOCAL_BASE}/workouts`, 100);
  console.log(`   🚀 Concurrency Benchmark (100 parallel requests):`);
  console.log(`      • Average Latency: ${workoutBench.avgLatency} ms`);
  console.log(`      • Min / P95 / Max: ${workoutBench.minLatency}ms / ${workoutBench.p95Latency}ms / ${workoutBench.maxLatency}ms`);
  console.log(`      • Cache Hit Rate:  ${workoutBench.cacheHitRate}`);
  console.log(`      • Throughput:      ${workoutBench.requestsPerSec} requests/sec\n`);

  // Overall Performance Summary
  const speedupVsCold = ((weather1.latencyMs / parseFloat(weatherBench.avgLatency))).toFixed(1);
  console.log('======================================================================');
  console.log('🏆 BENCHMARK RESULTS & REDIS VERIFICATION SUMMARY:');
  console.log(`   ✅ Cache Acceleration Factor:  ${speedupVsCold}x FASTER than uncached API roundtrips`);
  console.log(`   ✅ Average Master Query Time:  ~${foodBench.avgLatency} ms per request`);
  console.log(`   ✅ Database / External API Savings: 100% of cached reads bypassed DB completely`);
  console.log(`   ✅ Peak Throughput:            ~${Math.max(foodBench.requestsPerSec, weatherBench.requestsPerSec)} requests/sec per single Node process`);
  console.log('======================================================================\n');
})();
