export interface Exercise {
  id: string;
  name: string;
  hindiTip?: string;
  equipmentTier: 'no_equipment' | 'resistance_bands' | 'home_dumbbells';
  isApartmentFloorSafe: boolean; // Zero jumping, no thuds
  targetMuscles: ('chest' | 'back' | 'shoulders' | 'biceps' | 'triceps' | 'quads' | 'hamstrings' | 'calves' | 'core')[];
  sets: number;
  reps: string;
  tempo: string; // e.g. "3-1-1" (3s eccentric down, 1s hold, 1s up)
  restSeconds: number;
  videoGuideUrl?: string;
  description: string;
}

export interface WorkoutRoutine {
  id: string;
  title: string;
  subtitle: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  durationMins: number;
  equipmentRequired: 'Zero Gear (Living Room)' | 'Resistance Bands (~₹399)' | 'Dumbbells / Full Gym';
  isZeroNoiseFloorSafe: boolean;
  calorieBurnEst: number;
  exercises: Exercise[];
}

export const WORKOUT_ROUTINES: WorkoutRoutine[] = [
  {
    id: 'zero-noise-upper',
    title: 'Desi Living Room Upper Body Builder',
    subtitle: 'Zero jumping, slow 3-sec eccentric tempo for deep muscle fiber recruitment',
    level: 'Intermediate',
    durationMins: 28,
    equipmentRequired: 'Zero Gear (Living Room)',
    isZeroNoiseFloorSafe: true,
    calorieBurnEst: 210,
    exercises: [
      {
        id: 'decline-feet-elevated-pushups',
        name: 'Feet-Elevated Bed / Sofa Push-ups',
        hindiTip: 'सोफे पर पैर रखकर 3 सेकंड धीरे-धीरे नीचे आएं',
        equipmentTier: 'no_equipment',
        isApartmentFloorSafe: true,
        targetMuscles: ['chest', 'shoulders', 'triceps'],
        sets: 4,
        reps: '12-15 reps',
        tempo: '3-0-1 (3s down, explode up)',
        restSeconds: 60,
        description: 'Elevate your feet on a bed or sofa to load upper chest and anterior deltoids without any weights.',
      },
      {
        id: 'doorframe-inverted-rows',
        name: 'Doorframe Isometric Lat Rows',
        hindiTip: 'दरवाजे के चौखट को पकड़कर पीछे झुकें',
        equipmentTier: 'no_equipment',
        isApartmentFloorSafe: true,
        targetMuscles: ['back', 'biceps'],
        sets: 4,
        reps: '10-12 reps per arm',
        tempo: '2-2-1 (2s squeeze at top)',
        restSeconds: 60,
        description: 'Grip a sturdy doorframe or dining table edge to pull your torso, hitting lats and rhomboids.',
      },
      {
        id: 'chair-tricep-dips',
        name: 'Single Dining Chair Tricep Dips',
        hindiTip: 'कुर्सी के सहारे कोहनी 90 डिग्री मोड़ें',
        equipmentTier: 'no_equipment',
        isApartmentFloorSafe: true,
        targetMuscles: ['triceps', 'shoulders'],
        sets: 3,
        reps: '15 reps',
        tempo: '2-1-1',
        restSeconds: 45,
        description: 'Hands on chair edge, extend legs forward, dip hips vertically with zero noise.',
      },
      {
        id: 'towel-bicep-isometrics',
        name: 'Heavy Towel Leg-Resisted Bicep Curls',
        hindiTip: 'तौलिये को पैर के नीचे फंसाकर पूरे जोर से खींचे',
        equipmentTier: 'no_equipment',
        isApartmentFloorSafe: true,
        targetMuscles: ['biceps'],
        sets: 3,
        reps: '10 reps (5s squeeze)',
        tempo: 'Isometric hold',
        restSeconds: 45,
        description: 'Loop a bath towel under your foot. Pull hard against your own leg resistance for intense peak contraction.',
      },
    ],
  },
  {
    id: 'zero-noise-lower-core',
    title: 'Apartment Quiet Legs & Steel Core',
    subtitle: 'High time-under-tension quad & glute burns with zero floor vibrations',
    level: 'Beginner',
    durationMins: 25,
    equipmentRequired: 'Zero Gear (Living Room)',
    isZeroNoiseFloorSafe: true,
    calorieBurnEst: 230,
    exercises: [
      {
        id: 'tempo-bulgarian-split-squats',
        name: 'Sofa Bulgarian Split Squats',
        hindiTip: 'एक पैर पीछे सोफे पर, 3 सेकंड नीचे',
        equipmentTier: 'no_equipment',
        isApartmentFloorSafe: true,
        targetMuscles: ['quads', 'hamstrings'],
        sets: 3,
        reps: '10 reps/leg',
        tempo: '3-1-1',
        restSeconds: 60,
        description: 'Isolates each leg with massive quad and glute activation. Completely static with no jumping.',
      },
      {
        id: 'wall-sit-prayer-hold',
        name: 'Deep 90-Degree Wall Sit Namaste Hold',
        hindiTip: 'दीवार से सटकर 90 डिग्री पर बैठें',
        equipmentTier: 'no_equipment',
        isApartmentFloorSafe: true,
        targetMuscles: ['quads', 'calves'],
        sets: 3,
        reps: '45-60 seconds',
        tempo: 'Static hold',
        restSeconds: 45,
        description: 'Back flat against wall, knees at 90 degrees. Intense quad pump with 100% zero noise.',
      },
      {
        id: 'glute-single-leg-bridge',
        name: 'Floor Mat Single-Leg Glute Bridges',
        hindiTip: 'जमीन पर लेटकर एक पैर से कूल्हे ऊपर उठाएं',
        equipmentTier: 'no_equipment',
        isApartmentFloorSafe: true,
        targetMuscles: ['hamstrings'],
        sets: 3,
        reps: '12 reps/leg',
        tempo: '2-2-1',
        restSeconds: 45,
        description: 'Lying on your back, drive heel into floor to lift hips. Deep hamstring and posterior chain activation.',
      },
      {
        id: 'plank-to-hollow-hold',
        name: 'Low Plank to Desi Kumbhak Core Hold',
        hindiTip: 'कोहनी पर प्लैंक, पेट अंदर खींचें',
        equipmentTier: 'no_equipment',
        isApartmentFloorSafe: true,
        targetMuscles: ['core'],
        sets: 3,
        reps: '45 seconds',
        tempo: 'Static hold',
        restSeconds: 45,
        description: 'Elbow plank with posterior pelvic tilt for deep transverse abdominis engagement.',
      },
    ],
  },
  {
    id: 'resistance-band-hypertrophy',
    title: 'Budget Resistance Band (~₹399) Full Body',
    subtitle: 'Variable linear resistance targeting all major muscle groups at home',
    level: 'Intermediate',
    durationMins: 32,
    equipmentRequired: 'Resistance Bands (~₹399)',
    isZeroNoiseFloorSafe: true,
    calorieBurnEst: 260,
    exercises: [
      {
        id: 'banded-chest-press',
        name: 'Standing Banded Chest Press',
        hindiTip: 'बैंड को पीठ के पीछे फंसाकर आगे धकेलें',
        equipmentTier: 'resistance_bands',
        isApartmentFloorSafe: true,
        targetMuscles: ['chest', 'triceps'],
        sets: 4,
        reps: '15 reps',
        tempo: '2-1-1',
        restSeconds: 45,
        description: 'Wrap loop band across shoulder blades, press both handles forward to peak contraction.',
      },
      {
        id: 'banded-seated-rows',
        name: 'Seated Foot-Anchored Band Rows',
        hindiTip: 'पैर में बैंड फंसाकर दोनों हाथों से खींचे',
        equipmentTier: 'resistance_bands',
        isApartmentFloorSafe: true,
        targetMuscles: ['back', 'biceps'],
        sets: 4,
        reps: '15 reps',
        tempo: '2-2-1',
        restSeconds: 45,
        description: 'Sit with legs extended, loop band under soles, row elbows tightly along ribcage.',
      },
      {
        id: 'banded-lateral-deltoid-raises',
        name: 'Under-Foot Band Lateral Raises',
        hindiTip: 'बैंड पर खड़े होकर दोनों हाथ कंधे तक उठाएं',
        equipmentTier: 'resistance_bands',
        isApartmentFloorSafe: true,
        targetMuscles: ['shoulders'],
        sets: 3,
        reps: '15-20 reps',
        tempo: '2-1-1',
        restSeconds: 45,
        description: 'Stand on band with one foot, raise arms out sideways to shoulder height for lateral deltoid caps.',
      },
    ],
  },
];
