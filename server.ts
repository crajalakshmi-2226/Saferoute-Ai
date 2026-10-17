import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import {
  VERIFIED_LEGAL_DATABASE,
  OFFICIAL_LEGAL_SOURCES,
  findMatchingLegalProvision,
} from './src/data/legalKnowledgeBase';
import {
  VERIFIED_HELP_PLACES,
  getDistanceMeters,
} from './src/data/nearbyHelpData';

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

// 6. AI Legal Rights Assistant (Gemini 3.8 Flash + Verified Legal Knowledge Base)
app.post('/api/legal-assist', async (req, res) => {
  const { message, language = 'en', history = [] } = req.body;

  if (!message || typeof message !== 'string') {
    return res.status(400).json({ error: 'Missing or invalid user message.' });
  }

  const ai = getGeminiClient();
  const matchedDbEntry = findMatchingLegalProvision(message);

  // If Gemini key is not configured, return deterministic verified legal response
  if (!ai) {
    if (matchedDbEntry) {
      return res.json({
        success: true,
        generatedBy: 'deterministic_legal_engine',
        response_text: language === 'ta'
          ? `உங்கள் கேள்விக்கான சரிபார்க்கப்பட்ட சட்ட வழிகாட்டல்:\n\nசட்டம்: ${matchedDbEntry.actNameTamil}\nபிரிவு: ${matchedDbEntry.section}\n\n${matchedDbEntry.summaryTamil}\n\nஅதிகாரப்பூர்வ துறை: ${matchedDbEntry.authorityTamil}\n\nஅடுத்த கட்ட நடைமுறை: ${matchedDbEntry.procedureSummaryTamil}`
          : `Verified legal information regarding your query:\n\nAct: ${matchedDbEntry.actName}\nProvision: ${matchedDbEntry.section}\n\n${matchedDbEntry.summaryEnglish}\n\nReceiving Authority: ${matchedDbEntry.authority}\n\nNext Step: ${matchedDbEntry.procedureSummary}`,
        tamil_summary: matchedDbEntry.summaryTamil,
        english_summary: matchedDbEntry.summaryEnglish,
        identified_category: matchedDbEntry.category,
        follow_up_question: language === 'ta'
          ? 'சம்பவம் நிகழ்ந்த இடம், தேதி அல்லது பேருந்து எண் போன்ற கூடுதல் விவரங்கள் உள்ளனவா?'
          : 'Could you share the location, date, or vehicle registration number if available?',
        legal_provisions: [
          {
            actName: matchedDbEntry.actName,
            actNameTamil: matchedDbEntry.actNameTamil,
            section: matchedDbEntry.section,
            title: matchedDbEntry.title,
            summaryEnglish: matchedDbEntry.summaryEnglish,
            summaryTamil: matchedDbEntry.summaryTamil,
            verifiedStatus: matchedDbEntry.verifiedStatus,
            officialUrl: matchedDbEntry.officialUrl,
            penaltyOrRemedy: matchedDbEntry.penaltyOrRemedy,
            penaltyOrRemedyTamil: matchedDbEntry.penaltyOrRemedyTamil
          }
        ],
        receiving_authority: matchedDbEntry.authority,
        authorityTamil: matchedDbEntry.authorityTamil,
        practical_next_steps: [
          'Move to a safe, well-lit public area or nearest assistance booth.',
          matchedDbEntry.procedureSummary,
          'Keep any photos, tickets, or witness details ready for documentation.',
          'Consider generating an official complaint draft using the button below.'
        ],
        practical_next_steps_tamil: [
          'உடனடியாக வெளிச்சமுள்ள பாதுகாப்பான பகுதிக்கு செல்லுங்கள்.',
          matchedDbEntry.procedureSummaryTamil,
          'பேருந்து டிக்கெட், புகைப்படங்கள் அல்லது நேரடி சாட்சிகளை ஆவணப்படுத்துங்கள்.',
          'கீழே உள்ள பொத்தானைப் பயன்படுத்தி முறைப்படி புகார் மனுவைத் தயாரிக்கலாம்.'
        ],
        nearby_help_type: matchedDbEntry.category.includes('Women') ? 'women_police' : 'police',
        can_draft_complaint: true,
        disclaimer: 'This information is for guidance and awareness only. It does not substitute formal legal advice from a licensed advocate or police officer.'
      });
    }

    return res.json({
      success: true,
      generatedBy: 'deterministic_legal_engine',
      response_text: language === 'ta'
        ? 'நான் உங்கள் கேள்வியை ஆராய்ந்தேன். துல்லியமான சட்டப் பிரிவை உடனடியாக உறுதிப்படுத்த முடியவில்லை. அருகிலுள்ள காவல் உதவி மையம் (112), மகளிர் உதவி எண் (1091) அல்லது மாவட்ட சட்டப் பணிகள் ஆணைக்குழுவை (DLSA) தொடர்பு கொள்ளலாம்.'
        : 'I could not verify the exact applicable section. Here is the closest relevant official guidance: for immediate concerns, please contact national emergency services at 112, women helpline at 1091, or the District Legal Services Authority (DLSA).',
      tamil_summary: 'துல்லியமான சட்டப் பிரிவை உறுதிப்படுத்த முடியவில்லை. பொது பாதுகாப்பு நெறிமுறைகளைப் பின்பற்றவும்.',
      english_summary: 'Exact legal section could not be verified automatically. Follow standard civic reporting and safety protocols.',
      identified_category: 'Other incident',
      follow_up_question: language === 'ta' ? 'நடந்த சம்பவம் குறித்து இன்னும் சில தகவல்களைத் தர முடியுமா?' : 'Could you provide a few more details about what occurred?',
      legal_provisions: [],
      receiving_authority: 'Local Police Station / District Legal Services Authority',
      authorityTamil: 'உள்ளூர் காவல் நிலையம் / மாவட்ட சட்டப் பணிகள் ஆணைக்குழு',
      practical_next_steps: ['Move to safety', 'Call 112 if in danger', 'Consult District Legal Services Authority (DLSA)'],
      practical_next_steps_tamil: ['பாதுகாப்பான இடத்திற்கு செல்லவும்', 'ஆபத்து என்றால் 112-ஐ அழைக்கவும்'],
      nearby_help_type: 'police',
      can_draft_complaint: true,
      disclaimer: 'Informational assistance only.'
    });
  }

  // Gemini 3.8 Flash Powered Analysis
  try {
    const verifiedKnowledgeContext = JSON.stringify(VERIFIED_LEGAL_DATABASE.slice(0, 10));

    const prompt = `You are the certified Legal Rights, Personal Safety, and Official Procedure Assistant of SafeRoute AI.
You assist citizens in understanding applicable Indian Central Laws, Tamil Nadu State Laws, Rules, and official complaint procedures.

USER MESSAGE: "${message}"
REQUESTED LANGUAGE: "${language === 'ta' ? 'Tamil (தமிழ்) and English' : 'English and Tamil'}"
RECENT HISTORY: ${JSON.stringify(history.slice(-4))}

CURATED VERIFIED LEGAL DATABASE REFERENCE:
${verifiedKnowledgeContext}

OFFICIAL AUTHORITATIVE SOURCE URLS:
- India Code: https://www.indiacode.nic.in/
- Tamil Nadu Government: https://www.tn.gov.in/
- Tamil Nadu Police: https://eservices.tnpolice.gov.in/
- Central Pollution Control Board: https://cpcb.nic.in/
- National Commission for Women: https://www.ncw.gov.in/
- National Cyber Crime Reporting Portal: https://cybercrime.gov.in/
- National Consumer Helpline: https://consumerhelpline.gov.in/

STRICT RULES:
1. Understand the user's description. Support both colloquial Tamil, English, and Tanglish naturally.
2. Ask a brief follow-up question when important facts (date, exact location, vehicle number, persons involved) are missing.
3. Identify the possible incident category without declaring anyone guilty.
4. If the exact applicable section cannot be verified, state verbatim: "I could not verify the exact applicable section. Here is the closest relevant official guidance."
5. Never invent legal sections, police powers, complaint portals, or penalties.
6. Clearly distinguish between:
   - Confirmed legal information
   - Potentially relevant provisions
   - General practical guidance
   - Information that requires professional verification by an advocate or police officer.
7. Suggest the suitable complaint category and the appropriate official authority (e.g. Station House Officer, RTO, AWPS, District Collector, Consumer Commission).
8. Provide practical immediate next steps and safety advice.
9. Offer to create a complaint draft.

Respond strictly in valid JSON with this schema:
{
  "response_text": "Direct user response in conversational ${language === 'ta' ? 'Tamil' : 'English'}",
  "tamil_summary": "Simple, clear Tamil summary preserving exact official Act and Section names",
  "english_summary": "Clear, concise English legal summary",
  "identified_category": "One of: Harassment or intimidation | Theft | Physical assault or violence | Sexual harassment | Public noise complaint | Road damage or dangerous obstruction | Accessibility barrier | Transport-related complaint | Consumer complaint | Cybercrime | Public-service complaint | Other incident",
  "follow_up_question": "Brief follow-up question if essential facts are missing, or null",
  "legal_provisions": [
    {
      "actName": "Official Act or Rule name",
      "actNameTamil": "Official Act name in Tamil",
      "section": "Exact section or rule (e.g. Rule 231-A TN MVR / Section 4 TN PHW Act / Section 303(2) BNS 2023)",
      "title": "Short title of provision",
      "titleTamil": "Short title in Tamil",
      "summaryEnglish": "Factual explanation of what the law states",
      "summaryTamil": "எளிய தமிழ் விளக்கம்",
      "verifiedStatus": "verified" | "potential" | "unverified",
      "officialUrl": "Valid official URL from list above"
    }
  ],
  "receiving_authority": "Exact official receiving authority name",
  "authorityTamil": "அதிகாரப்பூர்வ துறை/அதிகாரி பெயர்",
  "practical_next_steps": ["step 1", "step 2", "step 3"],
  "practical_next_steps_tamil": ["படி 1", "படி 2", "படி 3"],
  "nearby_help_type": "police" | "women_police" | "hospital" | "legal_aid" | "pharmacy" | "civic_office",
  "can_draft_complaint": true,
  "disclaimer": "This information is provided for citizen guidance and awareness. It does not constitute formal legal counsel. Verification by a licensed advocate or police officer is recommended."
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json({
      success: true,
      generatedBy: 'gemini-3.8-flash',
      ...parsed
    });
  } catch (error: any) {
    console.error('Legal assist error:', error);
    // Fallback gracefully to verified knowledge base
    if (matchedDbEntry) {
      return res.json({
        success: true,
        generatedBy: 'fallback_verified_engine',
        response_text: language === 'ta' ? matchedDbEntry.summaryTamil : matchedDbEntry.summaryEnglish,
        tamil_summary: matchedDbEntry.summaryTamil,
        english_summary: matchedDbEntry.summaryEnglish,
        identified_category: matchedDbEntry.category,
        legal_provisions: [matchedDbEntry],
        receiving_authority: matchedDbEntry.authority,
        authorityTamil: matchedDbEntry.authorityTamil,
        practical_next_steps: [matchedDbEntry.procedureSummary],
        practical_next_steps_tamil: [matchedDbEntry.procedureSummaryTamil],
        nearby_help_type: 'police',
        can_draft_complaint: true,
        disclaimer: 'Assistive guidance based on official statutes.'
      });
    }

    return res.status(500).json({
      error: 'Failed to process legal inquiry.',
      details: error.message
    });
  }
});

// 7. AI-Assisted Complaint Generator (Structured, Editable, Grounded)
app.post('/api/generate-complaint', async (req, res) => {
  const {
    category,
    description,
    incidentDate,
    location,
    desiredAssistance,
    language = 'en',
    evidenceList = []
  } = req.body;

  if (!description) {
    return res.status(400).json({ error: 'Missing incident description.' });
  }

  const ai = getGeminiClient();
  const matchedEntry = findMatchingLegalProvision(description + ' ' + (category || ''));

  const prompt = `You are an expert citizen legal draft generator for SafeRoute AI.
Generate a structured, formal, and editable complaint draft based ONLY on the user's provided facts.

DO NOT invent witness names, accused identities, injuries, dates, or events not present in the user text.
Clearly distinguish between user-provided facts and standard legal draft formatting.

USER PROVIDED DETAILS:
- Category: ${category || 'Incident'}
- What Happened: "${description}"
- Date & Time: ${incidentDate || 'Not specified by user'}
- Location: ${location || 'Not specified by user'}
- Desired Assistance: ${desiredAssistance || 'Appropriate official action and investigation'}
- Evidence Available: ${JSON.stringify(evidenceList)}
- Preferred Language: ${language}

MATCHED STATUTORY PROVISION:
${matchedEntry ? JSON.stringify(matchedEntry) : 'General official representation'}

OFFICIAL PORTALS:
- Tamil Nadu Police Citizen Services: https://eservices.tnpolice.gov.in/
- National Cyber Crime Portal: https://cybercrime.gov.in/
- National Consumer Helpline: https://consumerhelpline.gov.in/
- Greater Chennai Corporation Civic Portal: https://chennaicorporation.gov.in/

Output strictly valid JSON with this schema:
{
  "subject": "Formal, concise subject line",
  "addressedTo": "Designation of Appropriate Officer (e.g., Station House Officer / Regional Transport Officer / District Consumer Commission / Cyber Crime Wing)",
  "addressedToTamil": "அதிகாரியின் பதவிப் பெயர்",
  "incidentDetails": {
    "date": "${incidentDate || 'As mentioned in complaint'}",
    "location": "${location || 'As mentioned in complaint'}",
    "category": "${category || 'General Incident'}"
  },
  "chronologicalFacts": [
    "Fact 1 strictly extracted from user text",
    "Fact 2 strictly extracted from user text"
  ],
  "availableEvidence": [
    "Evidence item 1 from list"
  ],
  "applicableLegalProvisions": [
    "Act and section if verified, or statement 'Subject to preliminary police inquiry'"
  ],
  "requestedAction": "Clear prayer/request for relief (e.g., Registration of FIR, inspection, refund)",
  "officialPortalUrl": "Valid portal URL from list above",
  "fullFormattedDraft": "Complete, formal complaint letter formatted ready to be copied and printed",
  "fullFormattedDraftTamil": "முழுமையான முறையான தமிழ் புகார் மனு"
}`;

  if (!ai) {
    const authority = matchedEntry?.authority || 'The Station House Officer / Concerned Municipal Officer';
    const act = matchedEntry?.actName || 'Applicable Provisions of Law';
    const sec = matchedEntry?.section || 'Relevant Section';
    const draftText = `To,\n${authority}\n\nSubject: Formal Complaint regarding ${category || 'Incident'} at ${location || 'the mentioned location'}\n\nRespected Sir/Madam,\n\nI am writing to formally bring to your attention an incident that occurred on ${incidentDate || 'the specified date'} at ${location || 'the specified location'}.\n\nStatement of Facts (As provided by complainant):\n${description}\n\nAvailable Evidence:\n${evidenceList.length > 0 ? evidenceList.map((e: any) => `- ${e.name || e}`).join('\n') : '- Photographs / Video recordings preserved by complainant.'}\n\nRelevant Applicable Legal Provision:\n${act} (${sec})\n\nPrayer / Relief Sought:\n${desiredAssistance || 'Kindly register this complaint, conduct an urgent inquiry, and initiate appropriate official action under the law.'}\n\nYours faithfully,\n[Complainant Name]\n[Contact Information]`;

    return res.json({
      success: true,
      generatedBy: 'deterministic_draft_engine',
      draft: {
        subject: `Complaint regarding ${category || 'Incident'} at ${location || 'Tamil Nadu'}`,
        addressedTo: authority,
        addressedToTamil: matchedEntry?.authorityTamil || 'காவல் நிலைய பொறுப்பு அதிகாரி',
        incidentDetails: { date: incidentDate, location, category },
        chronologicalFacts: [description],
        availableEvidence: evidenceList.map((e: any) => e.name || String(e)),
        applicableLegalProvisions: [matchedEntry ? `${matchedEntry.actName} (${matchedEntry.section})` : 'Applicable Rules & Regulations'],
        requestedAction: desiredAssistance || 'Registration of complaint and necessary official inquiry.',
        officialPortalUrl: matchedEntry?.officialUrl || 'https://eservices.tnpolice.gov.in/',
        fullFormattedDraft: draftText,
        fullFormattedDraftTamil: `பெறுநர்:\n${matchedEntry?.authorityTamil || 'காவல் நிலைய பொறுப்பு அதிகாரி'}\n\nபொருள்: ${category || 'சம்பவம்'} தொடர்பான புகார் மனு.\n\nமதிப்பிற்குரிய ஐயா / அம்மா,\n\n${incidentDate || 'குறிப்பிட்ட நாளில்'} ${location || 'குறிப்பிட்ட இடத்தில்'} நடந்த சம்பவம் குறித்து இந்த மனுவை சமர்ப்பிக்கிறேன்.\n\nநிகழ்ந்த விவரம்:\n${description}\n\nசட்டப் பிரிவு: ${matchedEntry ? matchedEntry.actNameTamil + ' (' + matchedEntry.section + ')' : 'பொருந்தக்கூடிய சட்டப் பிரிவுகள்'}\n\nகோரிக்கை:\n${desiredAssistance || 'இந்த மனுவை ஏற்று உரிய சட்டப்பூர்வ நடவடிக்கை எடுக்குமாறு பணிவுடன் கேட்டுக்கொள்கிறேன்.'}\n\nஇங்ஙனம்,\n[மனுதாரர் பெயர்]`
      }
    });
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json({
      success: true,
      generatedBy: 'gemini-3.8-flash',
      draft: parsed
    });
  } catch (error: any) {
    console.error('Complaint generation error:', error);
    return res.status(500).json({
      error: 'Failed to generate complaint draft.',
      details: error.message
    });
  }
});

// 8. Nearby Help & Emergency Services Directory Endpoint
app.get('/api/nearby-help', (req, res) => {
  const { lat, lng, category, maxDistanceMeters, search } = req.query;

  let results = [...VERIFIED_HELP_PLACES];

  // Category filter
  if (category && typeof category === 'string' && category !== 'all') {
    results = results.filter((p) => p.category === category);
  }

  // Text search
  if (search && typeof search === 'string') {
    const s = search.toLowerCase();
    results = results.filter(
      (p) =>
        p.name.toLowerCase().includes(s) ||
        p.nameTamil.toLowerCase().includes(s) ||
        p.address.toLowerCase().includes(s) ||
        p.servicesAvailable.some((serv) => serv.toLowerCase().includes(s))
    );
  }

  // Distance computation
  const userLat = lat ? parseFloat(String(lat)) : undefined;
  const userLng = lng ? parseFloat(String(lng)) : undefined;

  let mapped = results.map((place) => {
    let distanceMeters: number | undefined;
    if (userLat !== undefined && userLng !== undefined && !isNaN(userLat) && !isNaN(userLng)) {
      distanceMeters = getDistanceMeters(userLat, userLng, place.lat, place.lng);
    }
    return {
      ...place,
      distanceMeters
    };
  });

  if (userLat !== undefined && userLng !== undefined) {
    mapped.sort((a, b) => (a.distanceMeters || 0) - (b.distanceMeters || 0));

    if (maxDistanceMeters) {
      const maxDist = parseFloat(String(maxDistanceMeters));
      if (!isNaN(maxDist)) {
        mapped = mapped.filter((p) => p.distanceMeters !== undefined && p.distanceMeters <= maxDist);
      }
    }
  }

  res.json({
    count: mapped.length,
    places: mapped,
    userLocationProvided: !!(userLat !== undefined && userLng !== undefined)
  });
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
