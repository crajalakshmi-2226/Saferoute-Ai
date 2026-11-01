// Comprehensive Statutory Legal Action Provisions for Tamil Nadu & Indian Law
// Specific legal sections, citizen rights, penalties, and official escalation hierarchy

export interface LegalActionDetail {
  categoryKey: string;
  categoryName: string;
  categoryNameTamil: string;
  statutoryAct: string;
  statutoryActTamil: string;
  applicableSections: string[];
  applicableSectionsTamil: string[];
  legalProvisionsSummary: string;
  legalProvisionsSummaryTamil: string;
  citizenRights: string[];
  citizenRightsTamil: string[];
  penaltyUnderLaw: string;
  penaltyUnderLawTamil: string;
  sattaPadiNadavadaikai: string[]; // Legal procedure steps in Tanglish/Tamil
  procedureStepsEnglish: string[];
  primaryAuthority: string;
  primaryAuthorityTamil: string;
  escalationLevel2: string;
  escalationLevel2Tamil: string;
  emergencyHotline: string;
  officialPortalId: string;
  officialPortalUrl: string;
}

export const LEGAL_ACTION_PROVISIONS: Record<string, LegalActionDetail> = {
  harassment: {
    categoryKey: 'harassment',
    categoryName: 'Women Safety, Harassment & Eve-Teasing',
    categoryNameTamil: 'மகளிர் பாதுகாப்பு, துன்புறுத்தல் மற்றும் கேலி செய்தல்',
    statutoryAct: 'BNS 2023 / Tamil Nadu Prohibition of Harassment of Women Act, 1998',
    statutoryActTamil: 'பாரதிய நியாய சன்ஹிதா (BNS 2023) / தமிழ்நாடு பெண்கள் துன்புறுத்தல் தடுப்புச் சட்டம் 1998',
    applicableSections: [
      'Section 4, TN Prohibition of Harassment of Women Act 1998',
      'Section 74 BNS 2023 (Assault/criminal force with intent to outrage modesty)',
      'Section 75 BNS 2023 (Sexual harassment & unwelcome physical contact)',
      'Section 78 BNS 2023 (Stalking in physical or online space)',
      'Section 173(1) BNSS 2023 (Mandatory Zero FIR irrespective of jurisdiction)'
    ],
    applicableSectionsTamil: [
      'பிரிவு 4, தமிழ்நாடு பெண்கள் துன்புறுத்தல் தடுப்புச் சட்டம் 1998',
      'பிரிவு 74 BNS 2023 (பெண்களின் கண்ணியத்திற்கு பங்கம் விளைவித்தல்)',
      'பிரிவு 75 BNS 2023 (பாலியல் துன்புறுத்தல் மற்றும் விரும்பத்தகாத செய்கைகள்)',
      'பிரிவு 78 BNS 2023 (பின்தொடர்ந்து தொல்லை கொடுத்தல் / ஸ்டாக்கிங்)',
      'பிரிவு 173(1) BNSS 2023 (எல்லை பாராமல் எந்த காவல் நிலையத்திலும் ஜீரோ எப்.ஐ.ஆர் பதிவு செய்யும் உரிமை)'
    ],
    legalProvisionsSummary:
      'Any harassment of women in public places, buses, bus stops, or educational corridors is a non-bailable cognizable offence. All Women Police Stations (AWPS) have dedicated jurisdiction to record FIRs immediately without sending the complainant to other stations.',
    legalProvisionsSummaryTamil:
      'பொது இடங்கள், பேருந்து, பேருந்து நிறுத்தம் மற்றும் சாலைகளில் பெண்களை துன்புறுத்துவது அல்லது கேலி செய்வது ஜாமீனில் வெளிவர முடியாத குற்றமாகும். அனைத்து மகளிர் காவல் நிலையங்கள் (AWPS) உடனடியாக வழக்குப்பதிவு (FIR) செய்ய சட்டப்பூர்வ கடமை கொண்டுள்ளன.',
    citizenRights: [
      'Right to Zero FIR: Any police station must register FIR without rejecting on jurisdictional grounds.',
      'Right to Lady Police Officer: Statement must be recorded exclusively by a woman police officer.',
      'Identity Protection: Complainant identity and location are kept strictly confidential under Section 72 BNS.',
      'Immediate Pink Patrol Intervention: Direct dispatch of mobile women safety patrol.'
    ],
    citizenRightsTamil: [
      'ஜீரோ எப்.ஐ.ஆர் (Zero FIR) உரிமை: எல்லை காரணம் காட்டி புகாரை மறுக்க முடியாது.',
      'பெண் காவலர் முன் வாக்குமூலம் அளிக்கும் உரிமை: பெண் அதிகாரி மட்டுமே விசாரணை செய்ய வேண்டும்.',
      'பெயர் மற்றும் முகவரி ரகசிய பாதுகாப்பு (Section 72 BNS).',
      'பிங்க் பேட்ரோல் (Pink Patrol) உடனடி மீட்பு ரோந்து வாகனம் வரவழைக்கும் உரிமை.'
    ],
    penaltyUnderLaw:
      'Rigorous Imprisonment up to 3 years and minimum fine of ₹10,000 under TN PHW Act; up to 5 years imprisonment under BNS Section 74/75.',
    penaltyUnderLawTamil:
      'தமிழ்நாடு பெண்கள் துன்புறுத்தல் தடுப்புச் சட்டத்தின் கீழ் 3 ஆண்டுகள் வரை கடுங்காவல் சிறை மற்றும் ₹10,000 அபராதம்; BNS கீழ் 5 ஆண்டுகள் வரை சிறை தண்டனை.',
    sattaPadiNadavadaikai: [
      '1. அவசர உதவிக்கு உடனடியாக 1091 (மகளிர் உதவி எண்) அல்லது 112-ஐ அழைக்கவும்.',
      '2. அருகிலுள்ள அனைத்து மகளிர் காவல் நிலையத்திற்கு (AWPS) சென்று எழுத்துப்பூர்வ புகார் அளிக்கவும்.',
      '3. சம்பவ இடம் தெரியாவிட்டாலும் அருகிலுள்ள எந்த காவல் நிலையத்திலும் ஜீரோ FIR பதியக் கோரலாம்.',
      '4. TN Police e-Services இணையதளத்தில் (eservices.tnpolice.gov.in) ஆன்லைன் புகார் பதிவு செய்யவும்.'
    ],
    procedureStepsEnglish: [
      '1. Dial 1091 (Women Helpline) or 112 immediately for instant SOS dispatch.',
      '2. Visit the nearest All Women Police Station (AWPS) to submit a formal signed complaint.',
      '3. Insist on a free copy of the First Information Report (FIR) under Section 173(2) BNSS.',
      '4. File an online petition on TN Police Citizen Portal (eservices.tnpolice.gov.in).'
    ],
    primaryAuthority: 'Inspector of Police, All Women Police Station (AWPS)',
    primaryAuthorityTamil: 'காவல் ஆய்வாளர், அனைத்து மகளிர் காவல் நிலையம் (AWPS)',
    escalationLevel2: 'Deputy Commissioner of Police (DCP - Crime Against Women)',
    escalationLevel2Tamil: 'துணை காவல் ஆணையர் (பெண்களுக்கு எதிரான குற்றத் தடுப்புப் பிரிவு)',
    emergencyHotline: '1091 / 112 / 181',
    officialPortalId: 'tn_police',
    officialPortalUrl: 'https://eservices.tnpolice.gov.in/'
  },

  road_damage: {
    categoryKey: 'road_damage',
    categoryName: 'Road Damage, Dangerous Potholes & Missing Covers',
    categoryNameTamil: 'சாலை பள்ளங்கள், ஆபத்தான சேதங்கள் மற்றும் திறந்த பள்ளங்கள்',
    statutoryAct: 'Motor Vehicles (Amendment) Act, 2019 / Chennai City Municipal Corporation Act',
    statutoryActTamil: 'மோட்டார் வாகன (திருத்தச்) சட்டம் 2019 / சென்னை மாநகராட்சி சட்டம்',
    applicableSections: [
      'Section 198A, Motor Vehicles Act 2019 (Failure of designated authority/contractor to comply with standards)',
      'Section 133, Code of Criminal Procedure / BNSS (Urgent removal of public nuisance causing bodily hazard)',
      'Section 203, Chennai City Municipal Corporation Act (Maintenance of public streets in safe condition)'
    ],
    applicableSectionsTamil: [
      'பிரிவு 198A, மோட்டார் வாகன சட்டம் 2019 (சாலை தரக் கட்டுப்பாடு தவறிய ஒப்பந்ததாரர்/அதிகாரி மீது நடவடிக்கை)',
      'பிரிவு 133 CrPC / BNSS (பொதுமக்களுக்கு ஆபத்து விளைவிக்கும் சாலை இடையூறுகளை உடனடியாக அகற்றும் அதிகாரம்)',
      'பிரிவு 203, சென்னை மாநகராட்சி சட்டம் (பொது சாலைகளை பாதுகாப்பாக பராமரிக்கும் சட்டப்பூர்வ கடமை)'
    ],
    legalProvisionsSummary:
      'Under Section 198A MV Act, designated road contractors, consultants, and concessionaires are criminally and financially liable if road defects cause injury, accidents, or death.',
    legalProvisionsSummaryTamil:
      'மோட்டார் வாகன சட்டம் பிரிவு 198A-ன் படி, சாலையை சரியாக பராமரிக்காமல் விபத்து அல்லது காயம் ஏற்பட்டால் சம்பந்தப்பட்ட ஒப்பந்ததாரர் மற்றும் பொதுப்பணித்துறை அதிகாரி மீது சட்டப்பூர்வ வழக்கு பதியப்படலாம்.',
    citizenRights: [
      'Right to Safe Public Thoroughfare under Article 21 (Right to Life).',
      'Right to compensation under Motor Accidents Claims Tribunal (MACT) for pothole-induced vehicle damage or bodily harm.',
      'Right to 48-hour emergency barricading and repair notice.'
    ],
    citizenRightsTamil: [
      'அரசியலமைப்பு பிரிவு 21-ன் படி பாதுகாப்பான சாலையில் பயணிக்கும் அடிப்படை மனித உரிமை.',
      'பள்ளங்களால் விபத்து அல்லது காயம் ஏற்பட்டால் உரிய இழப்பீடு கோரும் உரிமை.',
      '48 மணி நேரத்திற்குள் ஆபத்தான பள்ளங்களை மூடி எச்சரிக்கை பலகை வைக்கும் உரிமை.'
    ],
    penaltyUnderLaw:
      'Fine up to ₹1,00,000 on contractor/authority under Section 198A MV Act; administrative recovery of repair costs.',
    penaltyUnderLawTamil:
      'பிரிவு 198A-ன் கீழ் ஒப்பந்ததாரர் அல்லது பொறுப்பு அதிகாரிக்கு ₹1,00,000 வரை அபராதம்; இழப்பீட்டு நடவடிக்கை.',
    sattaPadiNadavadaikai: [
      '1. பள்ளத்தின் புகைப்படம் மற்றும் சரியான GPS இருப்பிடத்தை குறித்துக் கொள்ளவும்.',
      '2. சென்னை மாநகராட்சி 1913 உதவி எண்ணிற்கு உடனடியாக தகவல் தெரிவிக்கவும்.',
      '3. விபத்து நடந்தால் உள்ளூர் போக்குவரத்து காவல் நிலையத்தில் முறைப்படி புகார் (CSR/FIR) பதியவும்.',
      '4. CM Helpline (1100) அல்லது GCC போர்ட்டலில் உத்தியோகபூர்வ புகார் மனு சமர்ப்பிக்கவும்.'
    ],
    procedureStepsEnglish: [
      '1. Take high-resolution geotagged photographs of the road cavity and surrounding hazard.',
      '2. Log an urgent civic ticket with Greater Chennai Corporation (Dial 1913) or Highways Department.',
      '3. If accident/injury occurred, lodge an immediate police report (CSR) citing Section 198A MV Act.',
      '4. Escalate to Chief Minister Special Cell Helpline (Dial 1100) with ticket number.'
    ],
    primaryAuthority: 'Executive Engineer / Ward Assistant Engineer, GCC / State Highways',
    primaryAuthorityTamil: 'செயற்பொறியாளர் / உதவிப் பொறியாளர், மாநகராட்சி / நெடுஞ்சாலைத் துறை',
    escalationLevel2: 'Regional Deputy Commissioner / District Collector',
    escalationLevel2Tamil: 'மண்டல துணை ஆணையர் / மாவட்ட ஆட்சியர்',
    emergencyHotline: '1913 / 1100',
    officialPortalId: 'gcc_municipal',
    officialPortalUrl: 'https://chennaicorporation.gov.in/gcc/citizen-details/'
  },

  speed_breaker: {
    categoryKey: 'speed_breaker',
    categoryName: 'Illegal / Dangerous Speed Breakers',
    categoryNameTamil: 'விதிமீறிய / ஆபத்தான வேகத்தடைகள்',
    statutoryAct: 'Indian Road Congress Standards (IRC:99-1988) / Madras High Court Writ Directives',
    statutoryActTamil: 'இந்திய சாலை காங்கிரஸ் விதிமுறைகள் (IRC:99-1988) / சென்னை உயர்நீதிமன்ற தீர்ப்புகள்',
    applicableSections: [
      'IRC:99-1988 Guidelines for Speed Breaker Geometry (3.7m width, 10cm parabolic height, reflective painting)',
      'Section 268 & 283 BNS 2023 (Danger or obstruction in public way)',
      'Madras High Court Directives in WP No. 22629/2016 (Removal of all unscientific hump speed breakers)'
    ],
    applicableSectionsTamil: [
      'IRC:99-1988 வழிகாட்டுதல்: உயரம் 10 செ.மீ மட்டுமே இருக்க வேண்டும்; அகலம் 3.7 மீட்டர் பரவளைய வடிவம் (Parabolic).',
      'பிரிவு 268 & 283 BNS 2023 (பொது பாதையில் ஆபத்தை விளைவிக்கும் தடை அமைத்தல்)',
      'சென்னை உயர்நீதிமன்ற ஆணை: அறிவியல் பூர்வமற்ற அனைத்து முரட்டு வேகத்தடைகளையும் அகற்ற உத்தரவு.'
    ],
    legalProvisionsSummary:
      'Speed breakers cannot be installed arbitrarily by local residents or without highway engineer certification. Unmarked, jagged, or excessively high speed breakers violate IRC standards and must be redesigned or demolished.',
    legalProvisionsSummaryTamil:
      'அனுமதி இல்லாமல் முரட்டுத்தனமாக அமைக்கப்படும் வேகத்தடைகள் சட்டவிரோதமானவை. எச்சரிக்கை பலகை மற்றும் வெள்ளை நிற பிரதிபலிப்பு கோடுகள் இல்லாமல் இருக்கும் வேகத்தடைகளை அகற்ற மாநகராட்சி மற்றும் நெடுஞ்சாலை துறைக்கு உத்தரவு உள்ளது.',
    citizenRights: [
      'Right to demand removal or standard retrofitting under IRC:99-1988.',
      'Right to claim road injury damages if an unscientific hump causes two-wheeler fall or spinal injury.',
      'Right to demand advance warning signs 40m prior to the bump.'
    ],
    citizenRightsTamil: [
      'விதிமீறிய வேகத்தடையை இடிக்க அல்லது திருத்தக் கோரும் சட்டப்பூர்வ உரிமை.',
      'எச்சரிக்கை பலகை இல்லாத வேகத்தடையால் விபத்து ஏற்பட்டால் நஷ்டஈடு கோரும் உரிமை.',
      'வேகத்தடைக்கு 40 மீட்டருக்கு முன்பே எச்சரிக்கை பலகை வைக்கக் கோரும் உரிமை.'
    ],
    penaltyUnderLaw:
      'Demolition of unauthorized structure at builder expense; penal inquiry under Section 283 BNS.',
    penaltyUnderLawTamil:
      'சட்டவிரோத வேகத்தடையை இடித்து அப்புறப்படுத்துதல்; BNS பிரிவு 283-ன் கீழ் அபராதம் மற்றும் சட்ட நடவடிக்கை.',
    sattaPadiNadavadaikai: [
      '1. வேகத்தடையின் உயரம் மற்றும் எச்சரிக்கை பலகை இல்லாததை படம் எடுக்கவும்.',
      '2. தமிழ்நாடு நெடுஞ்சாலைத் துறை அல்லது மாநகராட்சி வார்டு பொறியாளரிடம் மனு சமர்ப்பிக்கவும்.',
      '3. IRC:99-1988 மற்றும் உயர்நீதிமன்ற தீர்ப்பை சுட்டிக்காட்டி மனு எழுதவும்.',
      '4. முதல்வர் தனிப்பிரிவு இணையதளத்தில் (cmhelpline.tnega.org) பதிவு செய்யவும்.'
    ],
    procedureStepsEnglish: [
      '1. Measure or photograph the excessive height and absence of retroreflective paint markings.',
      '2. File a formal written complaint to the Divisional Engineer (Highways) or Corporation Zonal Officer.',
      '3. Cite IRC:99-1988 guidelines and Madras High Court directives demanding immediate leveling.',
      '4. Escalate via CM Helpline portal (cmhelpline.tnega.org).'
    ],
    primaryAuthority: 'Divisional Engineer, Tamil Nadu State Highways / Corporation Road Wing',
    primaryAuthorityTamil: 'கோட்டப் பொறியாளர், தமிழ்நாடு நெடுஞ்சாலைத் துறை / மாநகராட்சி சாலை பிரிவு',
    escalationLevel2: 'District Road Safety Committee / District Collector',
    escalationLevel2Tamil: 'மாவட்ட சாலைப் பாதுகாப்பு குழு / மாவட்ட ஆட்சியர்',
    emergencyHotline: '1100 / 1913',
    officialPortalId: 'tn_highways',
    officialPortalUrl: 'https://tnhighways.tn.gov.in/'
  },

  accessibility_barrier: {
    categoryKey: 'accessibility_barrier',
    categoryName: 'Accessibility Barriers & RPwD Violations',
    categoryNameTamil: 'மாற்றுத்திறனாளிகள் உரிமை மீறல் & அணுகல் தடைகள்',
    statutoryAct: 'Rights of Persons with Disabilities (RPwD) Act, 2016',
    statutoryActTamil: 'மாற்றுத்திறனாளிகள் உரிமைகள் சட்டம் 2016',
    applicableSections: [
      'Section 40, RPwD Act 2016 (Mandatory accessibility standards in physical environment and transport)',
      'Section 44, RPwD Act 2016 (Mandatory compliance for public transport and stations)',
      'Section 45, RPwD Act 2016 (Time limit for making existing infrastructure accessible)',
      'Section 89 & 92, RPwD Act 2016 (Penalties up to ₹5,00,000 and imprisonment for violation/discrimination)'
    ],
    applicableSectionsTamil: [
      'பிரிவு 40, RPwD சட்டம் 2016 (அனைத்து அரசு மற்றும் பொது கட்டிடங்களில் சாய்வுதளம், லிப்ட் கட்டாயம்)',
      'பிரிவு 44, RPwD சட்டம் 2016 (பேருந்து நிலையங்கள், ரயில் நிலையங்கள் சக்கர நாற்காலிக்கு உகந்ததாக இருக்க வேண்டும்)',
      'பிரிவு 45, RPwD சட்டம் 2016 (பழைய கட்டிடங்களையும் குறிப்பிட்ட காலத்திற்குள் அணுகக்கூடியதாக மாற்ற வேண்டும்)',
      'பிரிவு 89 & 92, RPwD சட்டம் 2016 (அணுகல் தடையை சரிசெய்யாவிடில் ₹5 லட்சம் வரை அபராதம் மற்றும் 5 ஆண்டுகள் வரை சிறை)'
    ],
    legalProvisionsSummary:
      'All government buildings, metro stations, bus depots, and public pathways must provide step-free ramp access, tactile tiles for the visually impaired, and accessible toilets. Denying access constitutes an actionable statutory offence.',
    legalProvisionsSummaryTamil:
      'அனைத்து பொது இடங்கள், அரசு அலுவலகங்கள், பேருந்து மற்றும் ரயில் நிலையங்களில் சக்கர நாற்காலி சாய்வுதளம் (Ramp) மற்றும் பார்வை குறைபாடுள்ளோருக்கான தொடு உணர் வழிகாட்டிகள் கட்டாயம் அமைக்கப்பட வேண்டும்.',
    citizenRights: [
      'Right to barrier-free public access without discrimination.',
      'Right to file direct petition before the State Commissioner for Persons with Disabilities.',
      'Right to demand alternative accessible transit arrangement or on-ground assistance.'
    ],
    citizenRightsTamil: [
      'தடைகளற்ற சம உரிமை மற்றும் பாகுபாடற்ற அணுகல் உரிமை.',
      'மாநில மாற்றுத்திறனாளிகள் ஆணையரிடம் நேரடியாக புகார் மனு சமர்ப்பிக்கும் உரிமை.',
      'மாற்று வசதி அல்லது உடனடி மனித உதவி கோரும் சட்டப்பூர்வ உரிமை.'
    ],
    penaltyUnderLaw:
      'First offence: Fine up to ₹10,000; subsequent offences: Fine of ₹50,000 to ₹5,00,000 and disciplinary action.',
    penaltyUnderLawTamil:
      'முதல் தவறுக்கு ₹10,000 வரை அபராதம்; தொடர் குற்றங்களுக்கு ₹50,000 முதல் ₹5,00,000 வரை அபராதம் மற்றும் துறை ரீதியான ஒழுங்கு நடவடிக்கை.',
    sattaPadiNadavadaikai: [
      '1. அணுகல் தடை உள்ள இடம் மற்றும் சாய்வுதளம் இல்லாததை புகைப்படம் எடுக்கவும்.',
      '2. மத்திய அரசின் சுகம்ய பாரத் ஆப் (Sugamya Bharat) அல்லது இணையதளத்தில் பதிவேற்றவும்.',
      '3. தமிழ்நாடு மாநில மாற்றுத்திறனாளிகள் நல ஆணையருக்கு புகார் மனு அனுப்பவும்.',
      '4. உடனடியாக உள்ளூர் நிலைய மேலாளரிடம் மாற்று சாய்வுதளம் கேட்கவும்.'
    ],
    procedureStepsEnglish: [
      '1. Document the inaccessible curb, broken ramp, or missing elevator with photos.',
      '2. Upload directly to the Sugamya Bharat Grievance App (accessibleindia.gov.in).',
      '3. File a statutory complaint with the Tamil Nadu State Commissioner for Persons with Disabilities.',
      '4. Request an immediate on-site inspection and remedial order under Section 75 RPwD Act.'
    ],
    primaryAuthority: 'State Commissioner for Persons with Disabilities, Tamil Nadu',
    primaryAuthorityTamil: 'மாநில மாற்றுத்திறனாளிகள் ஆணையர், தமிழ்நாடு அரசு',
    escalationLevel2: 'Chief Commissioner for Persons with Disabilities (New Delhi)',
    escalationLevel2Tamil: 'மத்திய தலைமை மாற்றுத்திறனாளிகள் ஆணையர் (புது தில்லி)',
    emergencyHotline: '1800-425-0111 / 112',
    officialPortalId: 'sugamya_bharat',
    officialPortalUrl: 'https://accessibleindia.gov.in/'
  },

  consumer_fare: {
    categoryKey: 'consumer_fare',
    categoryName: 'Transit Fare Overcharging & Meter Refusal',
    categoryNameTamil: 'அதிக கட்டணம் வசூலித்தல் மற்றும் மீட்டர் போட மறுத்தல்',
    statutoryAct: 'Motor Vehicles Act, 1988 / Consumer Protection Act, 2019 / Rule 231-A TN Motor Vehicles Rules',
    statutoryActTamil: 'மோட்டார் வாகன சட்டம் / நுகர்வோர் பாதுகாப்பு சட்டம் 2019 / தமிழ்நாடு மோட்டார் வாகன விதி 231-A',
    applicableSections: [
      'Rule 231-A, Tamil Nadu Motor Vehicles Rules 1989 (Strict ban on auto-rickshaw fare refusal or meter tampering)',
      'Section 177 & 178 MV Act 1988 (Penalties for refusal to ply or overcharging)',
      'Section 2(47), Consumer Protection Act 2019 (Unfair trade practice)'
    ],
    applicableSectionsTamil: [
      'விதி 231-A, தமிழ்நாடு மோட்டார் வாகன விதிகள் 1989 (மீட்டர் கட்டணம் தவிர கூடுதல் கட்டணம் வசூலிக்க தடை)',
      'பிரிவு 177 & 178, மோட்டார் வாகன சட்டம் (சவாரிக்கு வர மறுத்தல் அல்லது அதிக கட்டணம் வசூலித்தலுக்கு அபராதம்)',
      'நுகர்வோர் பாதுகாப்பு சட்டம் 2019 (நியாயமற்ற வர்த்தக நடைமுறைக்கு எதிரான நடவடிக்கை)'
    ],
    legalProvisionsSummary:
      'Public auto-rickshaws, cabs, and buses cannot arbitrarily refuse passengers or charge fares in excess of state-notified tariffs. Traffic police and RTOs are mandated to issue challans and permit suspension notices for repeated violations.',
    legalProvisionsSummaryTamil:
      'ஆட்டோக்கள் மற்றும் வாடகை வாகனங்கள் அரசு நிர்ணயித்த கட்டணத்தை விட கூடுதல் கட்டணம் வசூலிக்கவோ, சவாரிக்கு வர மறுக்கவோ சட்டப்படி உரிமை இல்லை. வட்டார போக்குவரத்து அலுவலகம் (RTO) மூலம் அனுமதி சீட்டு ரத்து செய்யப்படலாம்.',
    citizenRights: [
      'Right to demand travel strictly by official digital meter.',
      'Right to receive authorized ticket/receipt.',
      'Right to file RTO complaint with vehicle registration number.'
    ],
    citizenRightsTamil: [
      'அரசு மீட்டர் கட்டணத்தில் மட்டுமே பயணிக்கக் கோரும் உரிமை.',
      'முறையான டிக்கெட் அல்லது ரசீது பெறும் உரிமை.',
      'வாகன எண்ணை குறித்து வட்டார போக்குவரத்து அலுவலகத்தில் (RTO) புகார் அளிக்கும் உரிமை.'
    ],
    penaltyUnderLaw:
      'Vehicle permit suspension for 7 to 30 days; compound fine of ₹500 to ₹2,000 per violation.',
    penaltyUnderLawTamil:
      'வாகன பெர்மிட் 7 முதல் 30 நாட்கள் வரை தற்காலிக ரத்து; ₹500 முதல் ₹2,000 வரை உடனடி அபராதம்.',
    sattaPadiNadavadaikai: [
      '1. ஆட்டோ / வாகனத்தின் பதிவு எண்ணை (TN-XX-XXXX) குறித்துக் கொள்ளவும்.',
      '2. அருகிலுள்ள போக்குவரத்து காவலரிடம் அல்லது டிராபிக் உதவி மையம் (103) தெரிவிக்கவும்.',
      '3. TN Police Citizen Portal அல்லது RTO அலுவலகத்தில் புகார் மனு தாக்கல் செய்யவும்.',
      '4. நுகர்வோர் உதவி மைய போர்ட்டலில் (consumerhelpline.gov.in) ஆன்லைன் புகார் பதிவு செய்யவும்.'
    ],
    procedureStepsEnglish: [
      '1. Note vehicle registration number, date, time, and exact route segment.',
      '2. Dial 103 (Chennai Traffic Police Helpline) or report to on-duty traffic warden.',
      '3. Submit vehicle details to the Regional Transport Office (RTO) jurisdiction.',
      '4. Log a consumer grievance on National Consumer Helpline (1915 / consumerhelpline.gov.in).'
    ],
    primaryAuthority: 'Regional Transport Officer (RTO) / Traffic Police Enforcement Wing',
    primaryAuthorityTamil: 'வட்டாரப் போக்குவரத்து அலுவலர் (RTO) / போக்குவரத்து காவல் பிரிவு',
    escalationLevel2: 'Joint Transport Commissioner (Enforcement)',
    escalationLevel2Tamil: 'இணை போக்குவரத்து ஆணையர் (அமலாக்கம்)',
    emergencyHotline: '103 / 1915',
    officialPortalId: 'tn_police',
    officialPortalUrl: 'https://consumerhelpline.gov.in/'
  },

  cybercrime: {
    categoryKey: 'cybercrime',
    categoryName: 'Online Stalking, Impersonation & Digital Fraud',
    categoryNameTamil: 'ஆன்லைன் பின்தொடர்தல், போலி கணக்கு & டிஜிட்டல் மோசடி',
    statutoryAct: 'Information Technology Act, 2000 / Bharatiya Nyaya Sanhita 2023',
    statutoryActTamil: 'தகவல் தொழில்நுட்ப சட்டம் 2000 / பாரதிய நியாய சன்ஹிதா 2023',
    applicableSections: [
      'Section 66E, IT Act 2000 (Violation of bodily privacy / capturing non-consensual images)',
      'Section 67 & 67A, IT Act 2000 (Transmitting sexually explicit material electronically)',
      'Section 78 BNS 2023 (Cyber stalking and continuous monitoring)',
      'Section 318(4) BNS 2023 (Cheating by impersonation or financial cyber fraud)'
    ],
    applicableSectionsTamil: [
      'பிரிவு 66E, IT சட்டம் 2000 (தனியுரிமை மீறல் மற்றும் அனுமதியின்றி படம் எடுத்தல்/பகிர்வது)',
      'பிரிவு 67 & 67A, IT சட்டம் 2000 (ஆபாச குறுஞ்செய்தி மற்றும் புகைப்படங்கள் அனுப்புதல்)',
      'பிரிவு 78 BNS 2023 (ஆன்லைன் மூலம் பின்தொடர்ந்து மிரட்டுதல் / சைபர் ஸ்டாக்கிங்)',
      'பிரிவு 318(4) BNS 2023 (ஆன்லைன் ஆள்மாறாட்டம் மற்றும் நிதி மோசடி)'
    ],
    legalProvisionsSummary:
      'Digital stalking, non-consensual image distribution, and threatening messages on WhatsApp, Instagram, or SMS are cognizable offences. Digital evidence (screenshots, URLs, sender phone numbers) is legally admissible under Section 65B of Indian Evidence Act / Section 61 BSA 2023.',
    legalProvisionsSummaryTamil:
      'வாட்ஸ்அப், இன்ஸ்டாகிராம் மற்றும் குறுஞ்செய்திகளில் அச்சுறுத்துவது அல்லது பெண்களை இழிவுபடுத்துவது கடும் குற்றமாகும். ஸ்கிரீன்ஷாட்கள் மற்றும் போன் எண்கள் நீதிமன்றத்தில் செல்லுபடியாகும் சட்டப்பூர்வ சாட்சிகளாகும்.',
    citizenRights: [
      'Right to immediate takedown of non-consensual content within 24 hours under IT Rules 2021.',
      'Right to register anonymous complaint on National Cyber Crime Portal.',
      'Right to free legal aid from DLSA for cyber harassment victims.'
    ],
    citizenRightsTamil: [
      '24 மணி நேரத்திற்குள் ஆபாச அல்லது அவதூறு பதிவுகளை நீக்கக் கோரும் உரிமை (IT Rules 2021).',
      'தேசிய சைபர் கிரைம் போர்ட்டலில் ரகசியமாக புகார் அளிக்கும் உரிமை.',
      'பாதிக்கப்பட்ட பெண்களுக்கு மாவட்ட சட்டப் பணிகள் ஆணைக்குழு மூலம் இலவச சட்ட உதவி பெறும் உரிமை.'
    ],
    penaltyUnderLaw:
      'Imprisonment up to 3 to 7 years and fine up to ₹10,00,000 under Sections 66E and 67A IT Act.',
    penaltyUnderLawTamil:
      '3 முதல் 7 ஆண்டுகள் வரை சிறை தண்டனை மற்றும் ₹10 லட்சம் வரை அபராதம் (IT சட்டம் பிரிவு 66E & 67A).',
    sattaPadiNadavadaikai: [
      '1. அச்சுறுத்தும் செய்திகள், போன் எண்கள் மற்றும் மெசேஜ் ஸ்கிரீன்ஷாட்களை சேமித்து வைக்கவும்.',
      '2. தேசிய சைபர் உதவி எண் 1930-ஐ உடனடியாக அழைக்கவும்.',
      '3. cybercrime.gov.in இணையதளத்தில் ஆன்லைன் மூலமாக புகார் பதிவு செய்யவும்.',
      '4. சென்னை / மாவட்ட சைபர் கிரைம் காவல் பிரிவில் எழுத்துப்பூர்வ புகார் அளிக்கவும்.'
    ],
    procedureStepsEnglish: [
      '1. Take timestamped screenshots of messages, profile handles, and mobile numbers without deleting threads.',
      '2. Call 1930 (National Cyber Crime Helpline) for immediate financial or harassment incident logging.',
      '3. Submit formal complaint on National Cyber Crime Portal (cybercrime.gov.in).',
      '4. File an FIR with the City Cyber Crime Police Station.'
    ],
    primaryAuthority: 'Inspector of Police, Cyber Crime Police Station',
    primaryAuthorityTamil: 'காவல் ஆய்வாளர், சைபர் கிரைம் காவல் நிலையம்',
    escalationLevel2: 'Superintendent of Police (Cyber Crime Division)',
    escalationLevel2Tamil: 'காவல் கண்காணிப்பாளர் (சைபர் கிரைம் பிரிவு)',
    emergencyHotline: '1930 / 112',
    officialPortalId: 'cyber_crime',
    officialPortalUrl: 'https://cybercrime.gov.in/'
  }
};

export function getLegalActionForCategory(category: string): LegalActionDetail {
  const cat = (category || '').toLowerCase();
  if (cat.includes('harass') || cat.includes('women') || cat.includes('sexual') || cat.includes('eve') || cat.includes('assault')) {
    return LEGAL_ACTION_PROVISIONS.harassment;
  }
  if (cat.includes('pothole') || cat.includes('road') || cat.includes('damage') || cat.includes('obstruction') || cat.includes('footpath')) {
    return LEGAL_ACTION_PROVISIONS.road_damage;
  }
  if (cat.includes('speed') || cat.includes('breaker') || cat.includes('bump')) {
    return LEGAL_ACTION_PROVISIONS.speed_breaker;
  }
  if (cat.includes('access') || cat.includes('barrier') || cat.includes('ramp') || cat.includes('wheelchair') || cat.includes('disab')) {
    return LEGAL_ACTION_PROVISIONS.accessibility_barrier;
  }
  if (cat.includes('auto') || cat.includes('meter') || cat.includes('fare') || cat.includes('overcharg') || cat.includes('transport') || cat.includes('consumer')) {
    return LEGAL_ACTION_PROVISIONS.consumer_fare;
  }
  if (cat.includes('cyber') || cat.includes('stalk') || cat.includes('online') || cat.includes('fraud') || cat.includes('message')) {
    return LEGAL_ACTION_PROVISIONS.cybercrime;
  }
  return LEGAL_ACTION_PROVISIONS.harassment;
}
