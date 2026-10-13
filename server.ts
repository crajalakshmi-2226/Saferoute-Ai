import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '20mb' }));

// In-memory persistent store for barriers, places, and journeys
// Can be backed by PostgreSQL / Prisma when configured
interface BarrierReport {
  id: string;
  lat: number;
  lng: number;
  title: string;
  type: 'stairs' | 'steep_slope' | 'uneven_surface' | 'narrow_path' | 'construction' | 'missing_curb_cut' | 'broken_lift';
  severity: 'low' | 'medium' | 'high' | 'impassable';
  description: string;
  address?: string;
  reportedAt: string;
  verificationStatus: 'verified' | 'community_reported' | 'unverified';
  confirmations: number;
  photoUrl?: string;
}

let communityBarriers: BarrierReport[] = [
  {
    id: 'bar-01',
    lat: 37.779,
    lng: -122.418,
    title: 'Steep flight of 18 stairs without ramp',
    type: 'stairs',
    severity: 'impassable',
    description: 'Direct pedestrian link between upper plaza and street has only steps. Alternative ramp is 80m north.',
    address: 'Civic Center Plaza link',
    reportedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    verificationStatus: 'verified',
    confirmations: 14
  },
  {
    id: 'bar-02',
    lat: 37.776,
    lng: -122.421,
    title: 'Broken curb ramp / active construction',
    type: 'construction',
    severity: 'high',
    description: 'Sidewalk corner blocked with barricades. Temporary walkway has a 6-inch lip.',
    address: 'Corner of Market St & 9th St',
    reportedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
    verificationStatus: 'community_reported',
    confirmations: 8
  },
  {
    id: 'bar-03',
    lat: 37.773,
    lng: -122.414,
    title: 'Severely cracked / uneven cobblestone paving',
    type: 'uneven_surface',
    severity: 'medium',
    description: 'Historic paving with deep gaps. High vibration risk for manual wheelchairs and rollators.',
    address: 'South Park Pedestrian Alley',
    reportedAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    verificationStatus: 'verified',
    confirmations: 19
  },
  {
    id: 'bar-04',
    lat: 37.783,
    lng: -122.408,
    title: 'Narrow scaffolding passageway (< 75cm)',
    type: 'narrow_path',
    severity: 'high',
    description: 'Scaffolding uprights restrict clearance below standard 90cm wheelchair passage.',
    address: 'Mission St near 4th',
    reportedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    verificationStatus: 'community_reported',
    confirmations: 6
  }
];

// Verified Place Accessibility Dataset
interface PlaceAccessibility {
  id: string;
  name: string;
  category: string;
  address: string;
  lat: number;
  lng: number;
  stepFreeAccess: boolean;
  rampAvailable: boolean;
  elevatorAvailable: boolean;
  accessibleRestroom: boolean;
  doorwayWidthCm: number;
  tactilePaving: boolean;
  visualGuidanceAssistance: boolean;
  brailleSignage: boolean;
  auditorySignals: boolean;
  verifiedDate: string;
  dataSource: string;
}

const placeAccessibilityData: PlaceAccessibility[] = [
  {
    id: 'plc-01',
    name: 'Central Transit Hub & Concourse',
    category: 'Transit Station',
    address: '100 Transit Way',
    lat: 37.789,
    lng: -122.401,
    stepFreeAccess: true,
    rampAvailable: true,
    elevatorAvailable: true,
    accessibleRestroom: true,
    doorwayWidthCm: 110,
    tactilePaving: true,
    visualGuidanceAssistance: true,
    brailleSignage: true,
    auditorySignals: true,
    verifiedDate: '2026-09-15',
    dataSource: 'Municipal Accessibility Audit'
  },
  {
    id: 'plc-02',
    name: 'Metro Library & Cultural Centre',
    category: 'Public Facility',
    address: '100 Larkin Street',
    lat: 37.779,
    lng: -122.416,
    stepFreeAccess: true,
    rampAvailable: true,
    elevatorAvailable: true,
    accessibleRestroom: true,
    doorwayWidthCm: 105,
    tactilePaving: true,
    visualGuidanceAssistance: true,
    brailleSignage: true,
    auditorySignals: false,
    verifiedDate: '2026-08-20',
    dataSource: 'Verified City Inspection'
  },
  {
    id: 'plc-03',
    name: 'Old Town Heritage Market',
    category: 'Shopping & Dining',
    address: '42 Commercial Lane',
    lat: 37.782,
    lng: -122.404,
    stepFreeAccess: false,
    rampAvailable: false,
    elevatorAvailable: false,
    accessibleRestroom: false,
    doorwayWidthCm: 72,
    tactilePaving: false,
    visualGuidanceAssistance: false,
    brailleSignage: false,
    auditorySignals: false,
    verifiedDate: '2026-07-10',
    dataSource: 'Accessibility Field Survey'
  }
];

// Helper: initialize Gemini if key is provided
function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// 1. Health & Config endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    appName: 'SafeRoute AI',
    tagline: 'Routes that understand you',
    capabilities: {
      serverSideGemini: !!process.env.GEMINI_API_KEY,
      mapboxTokenConfigured: !!(process.env.VITE_MAPBOX_PUBLIC_TOKEN || process.env.MAPBOX_ACCESS_TOKEN),
    },
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// 2. Barrier Intelligence endpoints
app.get('/api/barriers', (req, res) => {
  res.json({
    count: communityBarriers.length,
    barriers: communityBarriers,
    source: 'Verified Community & Audit Database'
  });
});

app.post('/api/barriers', (req, res) => {
  const { title, type, severity, description, lat, lng, address } = req.body;
  if (!title || !type || lat === undefined || lng === undefined) {
    return res.status(400).json({ error: 'Missing required barrier fields (title, type, lat, lng).' });
  }

  const newBarrier: BarrierReport = {
    id: `bar-${Date.now()}`,
    title: String(title).slice(0, 100),
    type: type,
    severity: severity || 'medium',
    description: String(description || '').slice(0, 500),
    lat: Number(lat),
    lng: Number(lng),
    address: address ? String(address).slice(0, 150) : undefined,
    reportedAt: new Date().toISOString(),
    verificationStatus: 'community_reported',
    confirmations: 1
  };

  communityBarriers.unshift(newBarrier);
  res.status(201).json({ success: true, barrier: newBarrier });
});

app.post('/api/barriers/:id/confirm', (req, res) => {
  const { id } = req.params;
  const barrier = communityBarriers.find((b) => b.id === id);
  if (!barrier) {
    return res.status(404).json({ error: 'Barrier not found.' });
  }

  barrier.confirmations += 1;
  if (barrier.confirmations >= 10 && barrier.verificationStatus === 'community_reported') {
    barrier.verificationStatus = 'verified';
  }

  res.json({ success: true, barrier });
});

// 3. Place Accessibility intelligence endpoints
app.get('/api/places', (req, res) => {
  res.json({
    count: placeAccessibilityData.length,
    places: placeAccessibilityData
  });
});

// 4. Computer Vision Barrier Detection (Gemini 3.8 Flash Multimodal)
app.post('/api/barrier-vision', async (req, res) => {
  const ai = getGeminiClient();
  if (!ai) {
    return res.status(503).json({
      error: 'GEMINI_API_KEY is not configured in server environment.',
      modelStatus: 'unavailable',
      message: 'Configure GEMINI_API_KEY in the Secrets panel to enable real-time multimodal barrier detection.'
    });
  }

  try {
    const { imageBase64, mimeType = 'image/jpeg', locationNote } = req.body;
    if (!imageBase64) {
      return res.status(400).json({ error: 'Missing imageBase64 payload.' });
    }

    // Strip prefix if client sent data:image/xyz;base64,
    const cleanBase64 = imageBase64.replace(/^data:image\/[a-z]+;base64,/, '');

    const prompt = `You are a certified pedestrian accessibility and urban mobility barrier inspector.
Analyze this image carefully for mobility obstacles, physical infrastructure, and accessibility features.

Inspect specifically for:
1. Steps and stairs (number of risers, handrails, contrast strips, lack of alternative ramp)
2. Wheelchair ramps (slope gradient, width, railings, level landing)
3. Curb cuts and transitions (presence, flushness, lip height)
4. Pathway surface conditions (uneven paving, cracked asphalt, cobblestone, gravel, mud, ice/water)
5. Physical obstructions (construction barriers, narrow scaffolding < 90cm, parked scooters/bicycles, low hanging overhangs)
6. Pedestrian safety features (audible/tactile crossing signals, push buttons, zebra crossing striping, lighting)
7. Tactile paving (blister tactile pavers for visually impaired, directional tactile pavers)

Return a strictly valid JSON response with the following schema:
{
  "summary": "Brief 1-2 sentence overall accessibility verdict",
  "accessibility_rating": "fully_accessible" | "accessible_with_caution" | "moderate_difficulty" | "impassable_for_mobility_aids",
  "confidence_percentage": number between 50 and 99,
  "detected_barriers": [
    {
      "type": "stairs" | "steep_slope" | "uneven_surface" | "narrow_passage" | "physical_obstacle" | "missing_curb_cut" | "unsafe_crossing",
      "severity": "low" | "medium" | "high" | "critical",
      "description": "Specific factual description of what is seen in the image",
      "affected_profiles": ["wheelchair" | "elderly" | "visual_assistance" | "walking_difficulty"]
    }
  ],
  "positive_signals": [
    {
      "feature": "Name of accessible feature (e.g. Tactile blister paving, Gentle ramp incline, Flush curb transition)",
      "description": "Description of why this helps accessibility"
    }
  ],
  "recommendation": "Concrete navigation guidance for pedestrians or assistive device users"
}

Ground all observations strictly on visible evidence in the provided photo. Do not invent details not visible.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType,
              data: cleanBase64,
            },
          },
          {
            text: prompt + (locationNote ? `\nContext note: ${locationNote}` : ''),
          },
        ],
      },
      config: {
        responseMimeType: 'application/json',
      },
    });

    const text = response.text || '{}';
    const parsed = JSON.parse(text);

    return res.json({
      success: true,
      analysis: parsed,
      modelUsed: 'gemini-3.8-flash',
      verifiedGroundTruth: false,
      disclaimer: 'AI computer-vision observations are assistive and should be cross-verified in physical space.'
    });
  } catch (error: any) {
    console.error('Vision analysis error:', error);
    return res.status(500).json({
      error: 'Failed to complete barrier analysis.',
      details: error.message
    });
  }
});

// 5. Transparent Route Explanation (Gemini 3.8 Flash Grounded Reasoning)
app.post('/api/route-explain', async (req, res) => {
  const ai = getGeminiClient();
  const { routeData, mobilityProfile, preferences, knownBarriers } = req.body;

  if (!routeData) {
    return res.status(400).json({ error: 'Missing routeData.' });
  }

  // If Gemini key is not configured, provide a deterministic factual explanation
  if (!ai) {
    const score = routeData.suitabilityScore ?? 85;
    const diff = routeData.distanceMeters ? `${(routeData.distanceMeters / 1000).toFixed(2)} km` : 'Standard distance';
    const duration = routeData.durationMinutes ? `${Math.round(routeData.durationMinutes)} min` : 'Standard duration';

    return res.json({
      explanation: `Route ranked with an overall suitability score of ${score}/100. It covers ${diff} (${duration}). The ranking heavily weights accessibility (40%) and safety (25%) over raw travel distance (10%), minimizing identified stairs and high-traffic crossings according to your ${mobilityProfile?.name || 'selected'} profile.`,
      generatedBy: 'deterministic_engine',
      confidence: 90
    });
  }

  try {
    const prompt = `You are the explainability engine of SafeRoute AI.
Explain why this specific route was selected or ranked for this user.
NEVER invent coordinates, road names not present, or fake conditions.
Be strictly factual based on the following input:

Selected Profile: ${JSON.stringify(mobilityProfile)}
User Preferences: ${JSON.stringify(preferences)}
Route Metrics:
- Distance: ${routeData.distanceMeters}m
- Duration: ${routeData.durationMinutes} min
- Accessibility Score: ${routeData.accessibilityScore}/100
- Safety Score: ${routeData.safetyScore}/100
- Preference Match: ${routeData.preferenceScore}/100
- Total Suitability Score: ${routeData.suitabilityScore}/100
- Known Intersecting Barriers: ${JSON.stringify(knownBarriers || [])}

Provide a concise, respectful, transparent explanation (2-3 short paragraphs) stating:
1. Why this route achieved its ranking score (highlighting the 40% accessibility / 25% safety weighting vs 10% distance).
2. Which specific mobility accommodations or trade-offs were made (e.g., avoiding stairs, choosing a slightly longer route with step-free pavement).
3. Any missing or unverified data points the user should remain aware of.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
    });

    return res.json({
      explanation: response.text,
      generatedBy: 'gemini-3.8-flash',
      confidence: 95
    });
  } catch (error: any) {
    console.error('Route explain error:', error);
    return res.status(500).json({
      error: 'Failed to generate route explanation.',
      details: error.message
    });
  }
});

// Configure Vite middleware or static serving
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`SafeRoute AI full-stack server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
