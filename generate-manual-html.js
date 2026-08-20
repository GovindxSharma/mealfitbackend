const fs = require('fs');
const path = require('path');

const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>MealFit India - Product Manual & Role Specification</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800;900&display=swap');
    
    @page {
      margin: 20mm;
      size: A4;
    }

    body {
      font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
      color: #0F172A;
      background: #FFFFFF;
      line-height: 1.6;
      margin: 0;
      padding: 24px;
    }

    .header-banner {
      background: linear-gradient(135deg, #070B12 0%, #121B2C 100%);
      color: #FFFFFF;
      padding: 32px;
      border-radius: 16px;
      margin-bottom: 28px;
    }

    .header-badge {
      display: inline-block;
      background: rgba(0, 229, 153, 0.15);
      color: #00E599;
      font-size: 11px;
      font-weight: 800;
      padding: 4px 10px;
      border-radius: 20px;
      margin-bottom: 12px;
      letter-spacing: 0.5px;
    }

    h1 {
      font-size: 28px;
      font-weight: 900;
      margin: 0 0 8px 0;
      color: #FFFFFF;
      letter-spacing: -0.5px;
    }

    .header-sub {
      color: #94A3B8;
      font-size: 13px;
      margin: 0;
    }

    h2 {
      font-size: 18px;
      font-weight: 800;
      color: #0F172A;
      border-bottom: 2px solid #E2E8F0;
      padding-bottom: 6px;
      margin-top: 28px;
      margin-bottom: 14px;
    }

    h3 {
      font-size: 14px;
      font-weight: 700;
      color: #1E293B;
      margin-top: 18px;
      margin-bottom: 8px;
    }

    p, li {
      font-size: 12.5px;
      color: #334155;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      margin: 16px 0;
      font-size: 12px;
    }

    th, td {
      border: 1px solid #E2E8F0;
      padding: 10px 12px;
      text-align: left;
    }

    th {
      background: #F8FAFC;
      font-weight: 800;
      color: #0F172A;
    }

    .role-badge {
      font-weight: 700;
      padding: 3px 8px;
      border-radius: 6px;
      display: inline-block;
      font-size: 11px;
    }

    .role-guest { background: #F1F5F9; color: #475569; }
    .role-user { background: #ECFDF5; color: #059669; }
    .role-coach { background: #EFF6FF; color: #2563EB; }
    .role-admin { background: #FAF5FF; color: #7C3AED; }

    .feature-card {
      background: #F8FAFC;
      border: 1px solid #E2E8F0;
      border-radius: 12px;
      padding: 14px 18px;
      margin-bottom: 12px;
    }

    .feature-title {
      font-weight: 800;
      font-size: 13px;
      color: #0F172A;
      margin-bottom: 4px;
    }

    .highlight-pill {
      background: #FEF3C7;
      color: #92400E;
      font-weight: 700;
      padding: 2px 6px;
      border-radius: 4px;
      font-size: 11px;
    }

    .footer-note {
      text-align: center;
      margin-top: 36px;
      font-size: 11px;
      color: #94A3B8;
      border-top: 1px solid #E2E8F0;
      padding-top: 16px;
    }
  </style>
</head>
<body>

  <div class="header-banner">
    <div class="header-badge">OFFICIAL SYSTEM SPECIFICATION & PRODUCT MANUAL</div>
    <h1>MealFit India Product Manual</h1>
    <p class="header-sub">Role Hierarchy, Functional UI Blueprints, and End-to-End Workflow Architecture</p>
  </div>

  <h2>1. User Roles, Permissions & Value Propositions</h2>
  <table>
    <thead>
      <tr>
        <th>Role</th>
        <th>Entry Path</th>
        <th>Key Functions & Actions</th>
        <th>Direct Benefits</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><span class="role-badge role-guest">Guest User</span></td>
        <td>App Launch &rarr; "Explore as Guest"</td>
        <td>Browse sample ₹60-₹150 meal plans, explore apartment workouts, test Street Food & Chai Sugar Decoders.</td>
        <td>100% free nutrition exploration with zero mandatory paywalls or sign-ups.</td>
      </tr>
      <tr>
        <td><span class="role-badge role-user">Active Member</span></td>
        <td>Onboarding &rarr; Home Dashboard</td>
        <td>Interactive 1-tap meal and workout logging, 4 Goal modes (Fat Loss, Muscle, Recomp, Low GI), 1-click WhatsApp Kirana shopping list exporter.</td>
        <td>Save ₹3,400+/month on grocery shopping while hitting protein targets sustainably.</td>
      </tr>
      <tr>
        <td><span class="role-badge role-coach">AI Personal Trainer</span></td>
        <td>Home Coach Banner &rarr; Goal Consultation</td>
        <td>Mifflin-St Jeor TDEE calculations, realistic 0.5 kg/week timeline calibration, dynamic macro and workout scaling.</td>
        <td>Prevents metabolic slowdowns and enforces realistic progress timelines.</td>
      </tr>
      <tr>
        <td><span class="role-badge role-admin">Super Admin (Owner)</span></td>
        <td>Settings &rarr; Master PIN <code>778899</code></td>
        <td>Live analytics (1,428 users, 892 daily active, ₹4.8L community savings), ICMR food database manager, emergency broadcast toggles.</td>
        <td>Complete business & data ownership without touching source code.</td>
      </tr>
    </tbody>
  </table>

  <h2>2. Screen-by-Screen UI Component Breakdown</h2>

  <div class="feature-card">
    <div class="feature-title">Tab 1: Home Dashboard (Daily Progress & Quick Logger)</div>
    <p>• <strong>Energy Balance Card:</strong> Real-time circular macro progress bars (Protein, Carbs, Fats) updating synchronously with user logs.<br>
    • <strong>AI Coach Banner:</strong> Live contextual diagnostic message stating exact protein needed and timeline.<br>
    • <strong>Quick Volumetric Logger:</strong> Steppers for standard Katoris (150ml), Phulkas (80 kcal), and Desi Ghee (+45 kcal/roti).<br>
    • <strong>Dynamic Weather Engine:</strong> City temperature and AQI feed adding +400mL to +800mL heatwave bonus.</p>
  </div>

  <div class="feature-card">
    <div class="feature-title">Tab 2: ₹ Meals (ICMR-NIN Budget Linear Optimizer)</div>
    <p>• <strong>4-Slot Meal Schedule:</strong> Breakfast, Lunch, Snack, Dinner with <span class="highlight-pill">Mark Eaten</span> interactive checkboxes.<br>
    • <strong>Daily Budget Stepper:</strong> ₹60, ₹90, ₹120, ₹160/day selectors that dynamically recalibrate food quantities.<br>
    • <strong>WhatsApp Kirana Exporter:</strong> Formats a categorized grocery shopping list for 1-tap sharing.<br>
    • <strong>Fridge Jugaad Mode:</strong> High-protein recipes to repurpose leftover dal and rice.</p>
  </div>

  <div class="feature-card">
    <div class="feature-title">Tab 3: Workout (Apartment Zero-Noise Routines)</div>
    <p>• <strong>Apartment Protocol:</strong> 3-second slow eccentric tempos replacing jumping impact for neighbor peace.<br>
    • <strong>Interactive Rest Timer:</strong> Countdown clock (45s, 60s, 90s presets) with start/pause controls.<br>
    • <strong>Exercise Cards:</strong> Sets, reps, muscle focus, Hindi coaching cues, and <span class="highlight-pill">Mark Done</span> checkboxes.</p>
  </div>

  <div class="feature-card">
    <div class="feature-title">Tab 4: Smart Swaps (Food Intelligence & Cheat Offset)</div>
    <p>• <strong>Protein Swapper:</strong> Side-by-side comparisons (Paneer to Soya: save ₹37.5/meal; Whey to Sattu: save ₹114/day).<br>
    • <strong>Street Food Cheat Decoder:</strong> Damage breakdown for Samosa, Bhature, Gulab Jamun with instant same-day recovery plans.<br>
    • <strong>Chai & Sugar Decoder:</strong> Calculates annual liquid sugar load and Stevia swap calorie savings.</p>
  </div>

  <div class="feature-card">
    <div class="feature-title">Tab 5: Analytics & Kirana Wallet Tracker</div>
    <p>• <strong>Kirana Wallet Savings:</strong> Tracks monthly ₹ saved by home cooking vs dining out and gym supplements.<br>
    • <strong>Weight Moving Average:</strong> 6-week trend graph smoothing daily water weight and sodium fluctuations.<br>
    • <strong>7-Day Habit Streak:</strong> Daily completion dots and monthly PDF summary generator.</p>
  </div>

  <h2>3. Step-by-Step User Journey Guide</h2>
  <ol>
    <li><strong>Setup (Step 1):</strong> Enter height, weight, age, and equipment. Select primary goal (Fat Loss, Muscle Gain, Recomp, Low GI).</li>
    <li><strong>Daily Execution (Step 2):</strong> Eat meals as scheduled &rarr; tap "Mark Eaten" &rarr; Home dashboard updates immediately.</li>
    <li><strong>Workout (Step 3):</strong> Complete 3-sec tempo movements in living room &rarr; tap "Mark Done" &rarr; burn calories logged.</li>
    <li><strong>Cheat Recovery (Step 4):</strong> If eating street food, check Smart Swaps &rarr; apply same-day offset (e.g. reduce 1 Phulka at dinner).</li>
  </ol>

  <div class="footer-note">
    MealFit India &copy; 2026 • Verified Production Build • Document Reference: MF-DOC-2026-V2.4
  </div>

</body>
</html>
`;

const targetPath = path.join('/Users/govind/Desktop/Mealfit /docs', 'MealFit_Product_Manual_Printable.html');
fs.writeFileSync(targetPath, htmlContent, 'utf-8');
console.log('✅ Generated printable HTML manual at:', targetPath);
