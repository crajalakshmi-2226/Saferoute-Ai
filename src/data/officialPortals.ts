export interface OfficialGrievancePortal {
  id: string;
  name: string;
  nameTamil: string;
  department: string;
  departmentTamil: string;
  scope: string;
  scopeTamil: string;
  portalUrl: string;
  badge: string;
  badgeColor: string;
  tollFree?: string;
  iconType: 'building' | 'highway' | 'accessibility' | 'shield' | 'landmark' | 'central';
}

export const OFFICIAL_GRIEVANCE_PORTALS: OfficialGrievancePortal[] = [
  {
    id: 'gcc_municipal',
    name: 'Greater Chennai Corporation / Municipal Administration',
    nameTamil: 'பெருநகர சென்னை மாநகராட்சி / நகராட்சி நிர்வாகம் (GCC 1913)',
    department: 'Department of Municipal Administration & Water Supply',
    departmentTamil: 'நகராட்சி நிர்வாகம் மற்றும் குடிநீர் வழங்கல் துறை',
    scope: 'Potholes, broken sidewalks, missing wheelchair ramps, illegal pavement encroachments, damaged streetlights, road obstructions in urban limits.',
    scopeTamil: 'குண்டும் குழியுமான சாலைகள், நடைபாதை சேதம், சாய்வுதளம் இல்லாமை, நடைபாதை ஆக்கிரமிப்புகள், தெருவிளக்கு பழுது, நகர சாலைப் பிரச்சனைகள்.',
    portalUrl: 'https://chennaicorporation.gov.in/gcc/citizen-portal/',
    badge: 'City Roads & Footpaths',
    badgeColor: 'bg-blue-900/60 text-blue-300 border-blue-500/40',
    tollFree: '1913',
    iconType: 'building',
  },
  {
    id: 'sugamya_bharat',
    name: 'Sugamya Bharat / DEPwD Accessible India Portal',
    nameTamil: 'சுகம்யா பாரத் / மாற்றுத்திறனாளிகள் அதிகாரமளித்தல் துறை (DEPwD)',
    department: 'Ministry of Social Justice & Empowerment (DEPwD)',
    departmentTamil: 'சமூக நீதி மற்றும் அதிகாரமளித்தல் அமைச்சகம்',
    scope: 'Non-compliance with Rights of Persons with Disabilities (RPwD) Act 2016, lack of wheelchair ramps, inaccessible pedestrian bridges, transit barriers.',
    scopeTamil: 'மாற்றுத்திறனாளிகள் உரிமைச் சட்டம் 2016 மீறல்கள், சக்கர நாற்காலி சாய்வுதளம் இல்லாமை, மாற்றுத்திறனாளி அணுகல்தன்மை தடைகள்.',
    portalUrl: 'https://accessibleindia.gov.in/',
    badge: 'RPwD Accessibility',
    badgeColor: 'bg-emerald-900/60 text-emerald-300 border-emerald-500/40',
    tollFree: '1800-11-2001',
    iconType: 'accessibility',
  },
  {
    id: 'cm_helpline',
    name: "CM's Special Cell / Mudhalvar Mugavari (TN 1100)",
    nameTamil: 'முதல்வரின் தனிப்பிரிவு / முதல்வர் முகவரி (ஹெல்ப்லைன் 1100)',
    department: 'Chief Minister Grievance Redressal / TNeGA',
    departmentTamil: 'தமிழ்நாடு அரசு முதல்வரின் சிறப்பு குறைதீர்ப்பு முகவரி',
    scope: 'Direct escalation to the District Collector and concerned state departments with time-bound tracking.',
    scopeTamil: 'மாவட்ட ஆட்சியர் மற்றும் அனைத்து தமிழக அரசு துறைகளுக்கும் நேரடியாகச் சென்று தீர்வு காணும் நேரடி முதல்வரின் சிறப்புப் பிரிவு.',
    portalUrl: 'https://cmhelpline.tnega.org/',
    badge: 'Direct CM Escalation',
    badgeColor: 'bg-purple-900/60 text-purple-300 border-purple-500/40',
    tollFree: '1100',
    iconType: 'landmark',
  },
  {
    id: 'state_highways',
    name: 'TN State Highways & Public Works Department (PWD)',
    nameTamil: 'தமிழ்நாடு மாநில நெடுஞ்சாலை மற்றும் பொதுப்பணித்துறை (Highways/PWD)',
    department: 'Highways and Minor Ports Department, Govt of Tamil Nadu',
    departmentTamil: 'நெடுஞ்சாலைகள் மற்றும் சிறு துறைமுகங்கள் துறை',
    scope: 'State highways, major district roads, river bridges, flyovers, hazardous unauthorized speed breakers, divider damage.',
    scopeTamil: 'மாநில நெடுஞ்சாலைகள், மாவட்ட முக்கிய சாலைகள், ஆற்றுப் பாலங்கள், மேம்பாலங்கள், ஆபத்தான அங்கீகரிக்கப்படாத வேகத்தடைகள்.',
    portalUrl: 'https://www.tnhighways.gov.in/',
    badge: 'State Highways & Flyovers',
    badgeColor: 'bg-amber-900/60 text-amber-300 border-amber-500/40',
    tollFree: '1800-425-4560',
    iconType: 'highway',
  },
  {
    id: 'nhai_morth',
    name: 'National Highways Authority of India (NHAI / MoRTH)',
    nameTamil: 'தேசிய நெடுஞ்சாலைகள் ஆணையம் (NHAI - Toll Free 1033)',
    department: 'Ministry of Road Transport and Highways (MoRTH)',
    departmentTamil: 'மத்திய சாலைப் போக்குவரத்து மற்றும் நெடுஞ்சாலை அமைச்சகம்',
    scope: 'National highway corridors, expressways, bypasses, flyover expansion joints, highway speed breaker violations.',
    scopeTamil: 'தேசிய நெடுஞ்சாலைகள், விரைவுச் சாலைகள், பைபாஸ், தேசிய மேம்பால குறைபாடுகள், நெடுஞ்சாலை வேகத்தடை விதிமீறல்கள்.',
    portalUrl: 'https://nhai.gov.in/',
    badge: 'National Highways',
    badgeColor: 'bg-cyan-900/60 text-cyan-300 border-cyan-500/40',
    tollFree: '1033',
    iconType: 'highway',
  },
  {
    id: 'tn_police',
    name: 'Tamil Nadu Police Online Grievance (e-Services)',
    nameTamil: 'தமிழ்நாடு காவல்துறை ஆன்லைன் புகார் தளம் (e-Services)',
    department: 'Tamil Nadu Police Department',
    departmentTamil: 'தமிழ்நாடு காவல்துறை தலைமையகம்',
    scope: 'Dangerous illegal barricades, traffic violations, harassment, safety hazards, unlawful road blockades.',
    scopeTamil: 'ஆபத்தான சட்டவிரோத தடுப்புகள், போக்குவரத்து விதிமீறல்கள், தொல்லைகள், பொதுமக்களுக்கு அச்சுறுத்தல் தரும் சம்பவங்கள்.',
    portalUrl: 'https://eservices.tnpolice.gov.in/',
    badge: 'Police & Public Safety',
    badgeColor: 'bg-rose-900/60 text-rose-300 border-rose-500/40',
    tollFree: '100 / 112',
    iconType: 'shield',
  },
  {
    id: 'cpgrams_central',
    name: 'CPGRAMS - Central Government Public Grievance Portal',
    nameTamil: 'மத்திய அரசு பொது குறைதீர்ப்பு தளம் (CPGRAMS)',
    department: 'Department of Administrative Reforms and Public Grievances (DARPG)',
    departmentTamil: 'மத்திய நிர்வாக சீர்திருத்தங்கள் மற்றும் குறைதீர்ப்பு துறை',
    scope: 'Indian Railways, Metro Rail infrastructure, central government departments, national highway concessions.',
    scopeTamil: 'ரயில்வே நிலைய அணுகல்தன்மை, மெட்ரோ ரயில் குறைபாடுகள், மத்திய அரசு சாலை மற்றும் கட்டமைப்பு புகார்கள்.',
    portalUrl: 'https://pgportal.gov.in/',
    badge: 'Central Govt & Railways',
    badgeColor: 'bg-slate-800 text-slate-300 border-slate-600',
    tollFree: '1800-11-0031',
    iconType: 'central',
  },
];
