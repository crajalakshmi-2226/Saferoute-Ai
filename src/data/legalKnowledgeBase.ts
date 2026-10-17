// Curated, maintained legal knowledge base for SafeRoute AI
// Covers Indian Central Laws, Tamil Nadu State Laws, Rules, Notifications & Official Procedures

export interface LegalProvision {
  actName: string;
  actNameTamil: string;
  section: string;
  title: string;
  titleTamil: string;
  category: string;
  verifiedStatus: 'verified' | 'potential' | 'unverified';
  summaryEnglish: string;
  summaryTamil: string;
  officialUrl: string;
  authority: string;
  authorityTamil: string;
  procedureSummary: string;
  procedureSummaryTamil: string;
  penaltyOrRemedy: string;
  penaltyOrRemedyTamil: string;
  applicabilityNote: string;
}

export const OFFICIAL_LEGAL_SOURCES = {
  INDIA_CODE: 'https://www.indiacode.nic.in/',
  TN_GOV: 'https://www.tn.gov.in/',
  TN_POLICE_ESERVICES: 'https://eservices.tnpolice.gov.in/',
  CPCB: 'https://cpcb.nic.in/',
  NCW: 'https://www.ncw.gov.in/',
  CYBERCRIME: 'https://cybercrime.gov.in/',
  CONSUMER_HELPLINE: 'https://consumerhelpline.gov.in/',
  RPWD_CHIEF_COMMISSIONER: 'http://www.ccdisabilities.nic.in/',
  UGC_ANTIRAGGING: 'https://www.antiragging.in/',
};

export const VERIFIED_LEGAL_DATABASE: LegalProvision[] = [
  // 1. Bus Loud Music / Sound Producing Instruments
  {
    actName: 'Tamil Nadu Motor Vehicles Rules, 1989 & Central Motor Vehicles Rules, 1989',
    actNameTamil: 'தமிழ்நாடு மோட்டார் வாகன விதிகள், 1989 & மத்திய மோட்டார் வாகன விதிகள், 1989',
    section: 'Rule 231-A & Rule 232 (TN MVR) / Section 190(2) MV Act 1988',
    title: 'Prohibition of Loud Audio Systems / Noise Producing Instruments in Public Transport',
    titleTamil: 'பொது பேருந்துகளில் காதை பிளக்கும் அதிக சத்தத்துடன் இசை/ஒலிபெருக்கி ஒலிப்பதை தடை செய்யும் விதி',
    category: 'Public noise complaint / Transport',
    verifiedStatus: 'verified',
    summaryEnglish: 'Stage carriages and public buses in Tamil Nadu are strictly regulated regarding sound-producing instruments. Playing music beyond permitted decibel limits or without prescribed fitting permits causes severe annoyance and distraction to drivers and passengers.',
    summaryTamil: 'தமிழ்நாட்டில் பொது பேருந்துகளில் அதிக சத்தத்துடன் ஆடியோ சிஸ்டம் அல்லது மியூசிக் அமைப்புகளை இயக்குவது தமிழ்நாடு மோட்டார் வாகன விதிகளின் கீழ் தடை செய்யப்பட்டுள்ளது. இது ஓட்டுனரின் கவனத்தை சிதறடித்து பயணிகளுக்கு தொந்தரவு ஏற்படுத்துகிறது.',
    officialUrl: OFFICIAL_LEGAL_SOURCES.TN_GOV,
    authority: 'Regional Transport Officer (RTO) / Traffic Police / State Transport Undertaking (TNSTC / MTC)',
    authorityTamil: 'வட்டாரப் போக்குவரத்து அலுவலர் (RTO) / போக்குவரத்து காவல்துறை / தமிழ்நாடு அரசு போக்குவரத்துக் கழகம் (TNSTC/MTC)',
    procedureSummary: 'Note the bus registration number, route number, time, and depot. Report to the Transport Department helpline, RTO, or traffic police control room.',
    procedureSummaryTamil: 'பேருந்து எண், வழித்தட எண், நேரம் ஆகியவற்றை குறித்துக்கொண்டு அருகிலுள்ள போக்குவரத்து காவல் அல்லது RTO-விடம் புகார் அளிக்கலாம்.',
    penaltyOrRemedy: 'Fine under Section 177 / 190(2) Motor Vehicles Act, and seizure of unauthorized amplified sound equipment.',
    penaltyOrRemedyTamil: 'மோட்டார் வாகன சட்டத்தின் கீழ் அபராதம் மற்றும் அங்கீகரிக்கப்படாத ஒலி பெருக்கி சாதனங்கள் பறிமுதல் செய்யப்படும்.',
    applicabilityNote: 'Applicable to all stage carriages, private omni buses, and contract carriages operating within Tamil Nadu.'
  },

  // 2. Harassment of Women in Public Transport / Public Spaces
  {
    actName: 'Tamil Nadu Prohibition of Harassment of Woman Act, 1998 & Bharatiya Nyaya Sanhita, 2023',
    actNameTamil: 'தமிழ்நாடு பெண்கள் துன்புறுத்தல் தடுப்புச் சட்டம், 1998 & பாரதிய நியாய சன்ஹிதா, 2023',
    section: 'Section 4 (TN PHW Act 1998) / Sections 74, 75, 78, 79 (BNS 2023)',
    title: 'Harassment of Women in Public Places, Buses and Educational Institutions',
    titleTamil: 'பொது இடங்கள், பேருந்துகள் மற்றும் கல்வி நிலையங்களில் பெண்களுக்கு எதிரான துன்புறுத்தல்',
    category: 'Harassment or intimidation / Sexual harassment',
    verifiedStatus: 'verified',
    summaryEnglish: 'Prohibits any act of harassment against women in public places, buses, stations, colleges, or workplaces. Offenses under Section 4 of TN PHW Act are cognizable, non-bailable, and punishable with rigorous imprisonment.',
    summaryTamil: 'பேருந்து, ரயில் நிலையம், கல்வி நிலையம் அல்லது எந்தவொரு பொது இடத்திலும் பெண்களுக்கு துன்புறுத்தல், கேலி செய்தல் அல்லது அச்சுறுத்துதல் செய்வது பிணையில் வெளிவர முடியாத கடுமையான குற்றமாகும்.',
    officialUrl: OFFICIAL_LEGAL_SOURCES.TN_POLICE_ESERVICES,
    authority: 'All-Women Police Station (AWPS) / Local Police / Women Helpline 1091 or 181',
    authorityTamil: 'அனைத்து மகளிர் காவல் நிலையம் (AWPS) / மகளிர் உதவி எண் 1091 / 181 / காவல் உதவி எண் 112',
    procedureSummary: 'Dial 112 / 1091 immediately. An FIR can be lodged at the nearest police station or All-Women Police Station (AWPS). Zero FIR applies if outside jurisdiction.',
    procedureSummaryTamil: 'உடனடியாக 112 அல்லது 1091-ஐ அழைக்கவும். அருகிலுள்ள அனைத்து மகளிர் காவல் நிலையத்தில் புகார் அளிக்கலாம்.',
    penaltyOrRemedy: 'Imprisonment up to 3 years and fine under Section 4 of TN PHW Act 1998; additional penalties under BNS 2023.',
    penaltyOrRemedyTamil: '3 ஆண்டுகள் வரை சிறைத்தண்டனை மற்றும் அபராதம்.',
    applicabilityNote: 'Applies to verbal abuse, stalking, physical touch, lewd gestures, or intimidation against any female in public or private conveyance.'
  },

  // 3. Stolen Bag / Theft at Bus Stand or Railway Station
  {
    actName: 'Bharatiya Nyaya Sanhita, 2023 (formerly Indian Penal Code)',
    actNameTamil: 'பாரதிய நியாய சன்ஹிதா, 2023 (முந்தைய இந்திய தண்டனைச் சட்டம்)',
    section: 'Section 303(2) (BNS 2023) / Section 379 IPC',
    title: 'Theft of Personal Property in Public Transit / Bus Stand',
    titleTamil: 'பேருந்து நிலையம் அல்லது பொதுப் போக்குவரத்தில் உடைமைகள் திருடப்படுதல்',
    category: 'Theft',
    verifiedStatus: 'verified',
    summaryEnglish: 'Theft in a public dwelling, conveyance, or building. TN Police allows immediate registration of Lost / Stolen Document or Mobile Phone via the official TN Police Citizen Portal or Mobile App.',
    summaryTamil: 'பேருந்து நிலையம், ரயில் நிலையம் போன்ற இடங்களில் பை, செல்போன் அல்லது உடைமைகள் திருடு போனால் உடனடியாக அருகிலுள்ள காவல் நிலையத்தில் எஃப்.ஐ.ஆர் பதிவு செய்யப்பட வேண்டும்.',
    officialUrl: OFFICIAL_LEGAL_SOURCES.TN_POLICE_ESERVICES,
    authority: 'Local Police Station / Railway Protection Force (RPF) / Government Railway Police (GRP) / Dial 112',
    authorityTamil: 'உள்ளூர் காவல் நிலையம் / தமிழ்நாடு ரயில்வே காவல் / உதவி எண் 112',
    procedureSummary: 'File an immediate complaint or Zero FIR at the nearest police station. For lost mobile phones, submit a request on CEIR (ceir.gov.in) and TN Police e-Services.',
    procedureSummaryTamil: 'அருகிலுள்ள காவல் நிலையத்தில் ஜீரோ எஃப்.ஐ.ஆர் (Zero FIR) பதிவு செய்யவும். மொபைல் போன் என்றால் CEIR இணையதளத்திலும் பதிவு செய்யலாம்.',
    penaltyOrRemedy: 'Investigation, recovery of stolen articles, and prosecution under BNS Section 303(2).',
    penaltyOrRemedyTamil: 'பொருட்கள் மீட்பு மற்றும் குற்றவாளிக்கு 3 ஆண்டுகள் வரை சிறைத்தண்டனை அல்லது அபராதம்.',
    applicabilityNote: 'Covers any dishonest taking of movable property out of the possession of any person without consent.'
  },

  // 4. Blocked Wheelchair Ramp / Inaccessible Public Facility
  {
    actName: 'Rights of Persons with Disabilities Act, 2016 (RPwD Act)',
    actNameTamil: 'மாற்றுத்திறனாளிகள் உரிமைகள் சட்டம், 2016',
    section: 'Sections 44, 45, 46 & Section 89/92 (RPwD Act 2016)',
    title: 'Mandatory Accessibility of Transport, Built Environment and Ramps',
    titleTamil: 'பொதுக் கட்டடங்கள், பேருந்துகள் மற்றும் சாய்வுதளங்களில் (Ramps) தடையற்ற அணுகல் உரிமை',
    category: 'Accessibility barrier / Transport-related complaint',
    verifiedStatus: 'verified',
    summaryEnglish: 'No establishment shall be granted permission to construct without adherence to harmonized accessibility standards. Blocking wheelchair ramps or denying accessible boarding violates Sections 44 & 45.',
    summaryTamil: 'பொதுக் கட்டடங்கள், பேருந்து நிலையங்கள், மருத்துவமனைகளில் சாய்வுதளங்களை அடைப்பது அல்லது தடையற்ற பாதையை மறுப்பது மாற்றுத்திறனாளிகள் உரிமைகள் சட்டத்தின் கீழ் சட்டவிரோதமாகும்.',
    officialUrl: OFFICIAL_LEGAL_SOURCES.RPWD_CHIEF_COMMISSIONER,
    authority: 'State Commissioner for Persons with Disabilities, Tamil Nadu / Municipal Corporation / District Collector',
    authorityTamil: 'தமிழ்நாடு மாற்றுத்திறனாளிகள் நல ஆணையர் / மாவட்ட ஆட்சியர் / மாநகராட்சி ஆணையர்',
    procedureSummary: 'Document the blocked ramp or obstacle with timestamped photos. Submit a formal grievance to the State Commissioner for Persons with Disabilities or District Welfare Officer.',
    procedureSummaryTamil: 'தடையை புகைப்படம் எடுத்து மாற்றுத்திறனாளிகள் நலத்துறை ஆணையர் அல்லது மாவட்ட ஆட்சியரிடம் புகார் அளிக்கலாம்.',
    penaltyOrRemedy: 'Fines up to Rs. 50,000 for first violation, up to Rs. 5,00,000 for subsequent offenses (Section 89), and punitive action under Section 92.',
    penaltyOrRemedyTamil: 'ரூ. 50,000 வரை முதல்முறை அபராதம், மீண்டும் மீறினால் ரூ. 5 லட்சம் வரை அபராதம்.',
    applicabilityNote: 'Applies to all government and private establishments providing public utilities, transport, education, or healthcare.'
  },

  // 5. Threatening / Criminal Intimidation
  {
    actName: 'Bharatiya Nyaya Sanhita, 2023',
    actNameTamil: 'பாரதிய நியாய சன்ஹிதா, 2023',
    section: 'Section 351(2) & 351(3) (BNS 2023) / Section 503 & 506 IPC',
    title: 'Criminal Intimidation and Verbal Threats of Harm',
    titleTamil: 'உயிருக்கு அல்லது உடைமைக்கு அச்சுறுத்தல் விடுத்தல் (மிரட்டல்)',
    category: 'Harassment or intimidation / Physical assault or violence',
    verifiedStatus: 'verified',
    summaryEnglish: 'Whoever threatens another with injury to their person, reputation, or property with intent to cause alarm or compel them to act against their will commits criminal intimidation.',
    summaryTamil: 'ஒருவரை அச்சுறுத்துவது அல்லது உயிருக்கு தீங்கு விளைவிப்பதாக மிரட்டுவது பாரதிய நியாய சன்ஹிதா சட்டப்படி கிரிமினல் மிரட்டல் குற்றமாகும்.',
    officialUrl: OFFICIAL_LEGAL_SOURCES.TN_POLICE_ESERVICES,
    authority: 'Local Police Station / Dial 112 / Tamil Nadu Police e-Services',
    authorityTamil: 'உள்ளூர் காவல் நிலையம் / அவசர எண் 112',
    procedureSummary: 'If facing immediate danger, move to safety and call 112. File a police complaint detailing the threats, date, time, and witnesses.',
    procedureSummaryTamil: 'உடனடி ஆபத்து இருந்தால் 112-ஐ அழைக்கவும். அச்சுறுத்தல் குறித்து காவல் நிலையத்தில் புகார் பதிவு செய்யவும்.',
    penaltyOrRemedy: 'Imprisonment up to 2 years (or up to 7 years if the threat is of death or grievous hurt).',
    penaltyOrRemedyTamil: '2 ஆண்டுகள் வரை சிறை (மரண அச்சுறுத்தல் எனில் 7 ஆண்டுகள் வரை சிறை).',
    applicabilityNote: 'Covers in-person, telephonic, or electronic threats causing genuine alarm.'
  },

  // 6. Refusal to Return Money / Defective Goods / Consumer Disregard
  {
    actName: 'Consumer Protection Act, 2019',
    actNameTamil: 'நுகர்வோர் பாதுகாப்புச் சட்டம், 2019',
    section: 'Sections 2(7), 35, 38 & Section 84 (CPA 2019)',
    title: 'Unfair Trade Practices, Deficiency of Service and Refund Refusal',
    titleTamil: 'பணத்தைத் திரும்பத் தர மறுத்தல், குறைபாடுள்ள சேவை மற்றும் நியாயமற்ற வர்த்தக நடைமுறை',
    category: 'Consumer complaint',
    verifiedStatus: 'verified',
    summaryEnglish: 'Refusal to refund money for deficient services or defective products constitutes an unfair trade practice under Section 2(47). Consumers can file online via e-Daakhil without hiring an advocate.',
    summaryTamil: 'விற்பனையாளர் குறைபாடுள்ள பொருளை மாற்றித் தரவோ அல்லது பணத்தைத் திரும்பத் தரவோ மறுத்தால், அது நுகர்வோர் பாதுகாப்புச் சட்டத்தின் கீழ் அநீதியாகும்.',
    officialUrl: OFFICIAL_LEGAL_SOURCES.CONSUMER_HELPLINE,
    authority: 'National Consumer Helpline (NCH - Toll-free 1915) / District Consumer Disputes Redressal Commission (DCDRC)',
    authorityTamil: 'தேசிய நுகர்வோர் உதவி மையம் (எண் 1915) / மாவட்ட நுகர்வோர் குறைதீர் ஆணையம்',
    procedureSummary: '1. Send a written notice with invoice copy. 2. Register a complaint on consumerhelpline.gov.in (NCH 1915). 3. If unresolved, file an e-Daakhil petition.',
    procedureSummaryTamil: 'பில் நகலுடன் விற்பனையாளருக்கு அறிவிப்பு அனுப்பவும், பின்னர் 1915 உதவி மையத்தில் அல்லது e-Daakhil மூலம் வழக்கு தொடரலாம்.',
    penaltyOrRemedy: 'Full refund with interest, replacement of goods, compensation for mental harassment, and litigation costs.',
    penaltyOrRemedyTamil: 'முழுத் தொகை வட்டியுடன் திரும்பப் பெறுதல் மற்றும் இழப்பீட்டுத் தொகை.',
    applicabilityNote: 'Applies to any transaction of goods or services, online or offline, by a consumer against a seller or service provider.'
  },

  // 7. Dangerous Road Condition / Deep Pothole / Unsafe Obstruction
  {
    actName: 'Bharatiya Nyaya Sanhita, 2023 & Tamil Nadu Urban Local Bodies Act, 1998',
    actNameTamil: 'பாரதிய நியாய சன்ஹிதா, 2023 & தமிழ்நாடு நகர்ப்புற உள்ளாட்சி அமைப்புகள் சட்டம்',
    section: 'Section 285 & 288 (BNS 2023) / Section 283 IPC',
    title: 'Danger, Obstruction or Injury in Public Way or Street',
    titleTamil: 'பொது சாலையில் ஆபத்தான பள்ளங்கள், அடைப்புகள் அல்லது விபத்து ஏற்படுத்தும் தடைகள்',
    category: 'Road damage or dangerous obstruction / Public-service complaint',
    verifiedStatus: 'verified',
    summaryEnglish: 'Leaving dangerous trenches, unbarricaded construction debris, or unlit excavations on a public pathway violates duty of care and constitutes an obstruction to public way.',
    summaryTamil: 'பொதுச் சாலையில் எச்சரிக்கை பலகையின்றி ஆபத்தான பள்ளங்கள் தோண்டுவது அல்லது கட்டுமானக் கழிவுகளைக் குவித்து பாதையை அடைப்பது சட்டத்திற்குப் புறம்பானது.',
    officialUrl: OFFICIAL_LEGAL_SOURCES.TN_GOV,
    authority: 'City Municipal Corporation (e.g. Greater Chennai Corporation 1913) / Highways Department / District Collectorate',
    authorityTamil: 'மாநகராட்சி ஆணையர் (சென்னை 1913) / நெடுஞ்சாலைத் துறை / மாவட்ட ஆட்சியர்',
    procedureSummary: 'Take photos of the location and geo-tag it. File a civic complaint through the Namma Chennai / Urban Civic Portal or call 1913.',
    procedureSummaryTamil: 'இடத்தை புகைப்படம் எடுத்து உள்ளூர் மாநகராட்சி செயலி (Namma Chennai) அல்லது 1913 எண்ணில் புகார் தெரிவிக்கலாம்.',
    penaltyOrRemedy: 'Civic authorities are bound to barricade and rectify; liable for negligence and compensation in case of injury.',
    penaltyOrRemedyTamil: 'அதிகாரிகள் உடனடியாக சரிசெய்ய வேண்டும்; காயம் ஏற்பட்டால் இழப்பீடு கோரலாம்.',
    applicabilityNote: 'Applies to municipal streets, state highways, footpaths, and public thoroughfares.'
  },

  // 8. Cyber Harassment / Sharing Private Photos / Non-Consensual Imagery
  {
    actName: 'Information Technology Act, 2000 & Bharatiya Nyaya Sanhita, 2023',
    actNameTamil: 'தகவல் தொழில்நுட்பச் சட்டம், 2000 & பாரதிய நியாய சன்ஹிதா, 2023',
    section: 'Sections 66E, 67, 67A (IT Act) / Sections 77, 351 (BNS 2023)',
    title: 'Violation of Privacy, Non-Consensual Image Sharing & Cyber Blackmail',
    titleTamil: 'அனுமதியின்றி தனிப்பட்ட புகைப்படங்களை பகிர்தல், இணைய மிரட்டல் மற்றும் அந்தரங்க மீறல்',
    category: 'Cybercrime / Sexual harassment',
    verifiedStatus: 'verified',
    summaryEnglish: 'Transmitting or capturing sexually explicit or private images without consent violates Section 66E & 67A of IT Act. Victims can report anonymously to cybercrime.gov.in or helpline 1930.',
    summaryTamil: 'ஒருவரின் அனுமதியின்றி அவரது தனிப்பட்ட புகைப்படங்கள் அல்லது வீடியோக்களை இணையத்தில் பகிர்வது அல்லது மிரட்டுவது 5 ஆண்டுகள் வரை சிறைத்தண்டனைக்குரிய கடுமையான சைபர் குற்றமாகும்.',
    officialUrl: OFFICIAL_LEGAL_SOURCES.CYBERCRIME,
    authority: 'National Cyber Crime Reporting Portal (cybercrime.gov.in) / Cyber Crime Police Wing / Helpline 1930',
    authorityTamil: 'தேசிய சைபர் குற்றப் புகார் இணையதளம் (cybercrime.gov.in) / சைபர் கிரைம் உதவி எண் 1930',
    procedureSummary: '1. Preserve digital screenshots, URLs, and phone numbers without altering them. 2. Dial 1930 immediately or file a report at cybercrime.gov.in. 3. Request platform takedown under StopNCII.',
    procedureSummaryTamil: 'ஸ்கிரீன்ஷாட்கள் மற்றும் இணைப்புகளை பாதுகாக்கவும். 1930 என்ற அவசர எண்ணை அழைக்கவும் அல்லது cybercrime.gov.in-ல் புகார் அளிக்கவும்.',
    penaltyOrRemedy: 'Imprisonment up to 3 to 5 years and fine up to Rs. 10 Lakhs; mandatory digital content takedown.',
    penaltyOrRemedyTamil: '3 முதல் 5 ஆண்டுகள் சிறைத்தண்டனை மற்றும் ரூ. 10 லட்சம் வரை அபராதம்.',
    applicabilityNote: 'Applies to WhatsApp, Telegram, Instagram, websites, cloud drives, and electronic communications.'
  },

  // 9. College Harassment / Ragging
  {
    actName: 'Tamil Nadu Prohibition of Ragging Act, 1997 & UGC Regulations, 2009',
    actNameTamil: 'தமிழ்நாடு ராகிங் தடைச் சட்டம், 1997 & பல்கலைக்கழக மானியக் குழு விதிகள்',
    section: 'Sections 4 & 5 (TN Prohibition of Ragging Act 1997)',
    title: 'Prohibition of Ragging in Higher Educational Institutions and Hostels',
    titleTamil: 'கல்லூரிகள் மற்றும் விடுதிகளில் மாணவர்களை ராகிங் (துன்புறுத்துதல்) செய்வதை தடை செய்தல்',
    category: 'Harassment or intimidation / Other incident',
    verifiedStatus: 'verified',
    summaryEnglish: 'Ragging within or outside any educational institution in Tamil Nadu is strictly prohibited. Section 4 mandates rigorous imprisonment. Head of institution must immediately suspend and register police FIR.',
    summaryTamil: 'கல்லூரி வளாகத்திற்கு உள்ளேயோ அல்லது வெளியேயோ ராகிங் செய்வது தமிழக சட்டப்படி தடை செய்யப்பட்டுள்ளது. புகார் வந்தால் கல்லூரி முதல்வர் உடனடியாக போலீசில் புகார் அளிக்க வேண்டும்.',
    officialUrl: OFFICIAL_LEGAL_SOURCES.UGC_ANTIRAGGING,
    authority: 'National Anti-Ragging Helpline (Toll-Free 1800-180-5522) / Head of Institution / Local Police',
    authorityTamil: 'தேசிய ராகிங் எதிர்ப்பு உதவி எண் (1800-180-5522) / கல்லூரி முதல்வர் / உள்ளூர் காவல் நிலையம்',
    procedureSummary: 'Submit an online complaint at antiragging.in or call 1800-180-5522. Institution must act within 24 hours under UGC regulations.',
    procedureSummaryTamil: '1800-180-5522 எண்ணில் அழைக்கலாம் அல்லது antiragging.in தளத்தில் ரகசியமாக புகார் பதிவு செய்யலாம்.',
    penaltyOrRemedy: 'Rigorous imprisonment up to 2 years and fine up to Rs. 10,000, plus mandatory expulsion and debarment from admission to any other institution.',
    penaltyOrRemedyTamil: '2 ஆண்டுகள் வரை சிறை, ரூ. 10,000 அபராதம் மற்றும் கல்லூரியிலிருந்து நிரந்தர நீக்கம்.',
    applicabilityNote: 'Covers physical abuse, mental humiliation, coerced tasks, and financial extortion in colleges, universities, and polytechnics.'
  },

  // 10. Workplace Harassment / POSH
  {
    actName: 'Sexual Harassment of Women at Workplace (Prevention, Prohibition and Redressal) Act, 2013 (POSH)',
    actNameTamil: 'பணியிடத்தில் பெண்களுக்கு எதிரான பாலியல் துன்புறுத்தல் தடுப்புச் சட்டம், 2013',
    section: 'Sections 4, 9, 11 & Section 13 (POSH Act 2013)',
    title: 'Workplace Sexual Harassment Redressal via Internal Committee (IC)',
    titleTamil: 'பணியிடத்தில் பெண்களுக்கு எதிரான துன்புறுத்தல்கள் மற்றும் உள் புகார்க் குழு (Internal Committee)',
    category: 'Sexual harassment / Harassment or intimidation',
    verifiedStatus: 'verified',
    summaryEnglish: 'Every organization with 10+ employees must establish an Internal Committee (IC). Women can submit a complaint within 3 months. For organizations with under 10 employees, the Local Committee (LC) at District Collectorate has jurisdiction.',
    summaryTamil: '10-க்கும் மேற்பட்ட பணியாளர்கள் கொண்ட ஒவ்வொரு நிறுவனத்திலும் உள் புகார்க் குழு (Internal Committee) இருக்க வேண்டும். பாதிக்கப்பட்ட பெண் 3 மாதங்களுக்குள் புகார் அளிக்கலாம்.',
    officialUrl: OFFICIAL_LEGAL_SOURCES.NCW,
    authority: 'Internal Committee (IC) / Local Committee (LC) at District Collectorate / SHe-Box (shebox.nic.in)',
    authorityTamil: 'உள் புகார்க் குழு (IC) / மாவட்ட ஆட்சியரக உள்ளூர் குழு / SHe-Box போர்டல்',
    procedureSummary: 'Submit a written complaint to the IC presiding officer or via Ministry SHe-Box portal. An inquiry must be completed within 90 days.',
    procedureSummaryTamil: 'நிறுவனத்தின் IC தலைவரிடம் அல்லது shebox.nic.in தளத்தில் எழுத்துப்பூர்வமாக புகார் அளிக்கலாம். 90 நாட்களுக்குள் விசாரணை முடிக்கப்பட வேண்டும்.',
    penaltyOrRemedy: 'Disciplinary termination of the offender, deduction from salary, and legal FIR under criminal provisions.',
    penaltyOrRemedyTamil: 'பணியிலிருந்து நீக்கம், சம்பளப் பிடித்தம் மற்றும் குற்றவியல் நடவடிக்கை.',
    applicabilityNote: 'Covers permanent, temporary, contractual, intern, and visitor staff across private and public sectors.'
  }
];

// Helper to find best verified legal provision matching a user query
export function findMatchingLegalProvision(queryText: string): LegalProvision | null {
  const q = queryText.toLowerCase();

  // 1. Bus music / loud sound
  if (q.includes('bus') && (q.includes('music') || q.includes('sound') || q.includes('loud') || q.includes('satham') || q.includes('paatu') || q.includes('noise'))) {
    return VERIFIED_LEGAL_DATABASE[0];
  }
  // 2. Harassment of woman / bus / public
  if ((q.includes('harass') || q.includes('thunburutthal') || q.includes('tease') || q.includes('touch') || q.includes('follow') || q.includes('eve')) && (q.includes('woman') || q.includes('girl') || q.includes('bus') || q.includes('road') || q.includes('station'))) {
    return VERIFIED_LEGAL_DATABASE[1];
  }
  // 3. Stolen bag / theft
  if (q.includes('steal') || q.includes('stole') || q.includes('theft') || q.includes('bag') || q.includes('phone') || q.includes('thirudu') || q.includes('lost') || q.includes('snatch')) {
    return VERIFIED_LEGAL_DATABASE[2];
  }
  // 4. Wheelchair ramp / accessibility
  if (q.includes('ramp') || q.includes('wheelchair') || q.includes('access') || q.includes('disabled') || q.includes('handicap') || q.includes('block') || q.includes('lift')) {
    return VERIFIED_LEGAL_DATABASE[3];
  }
  // 5. Threat / intimidation
  if (q.includes('threat') || q.includes('kill') || q.includes('hurt') || q.includes('mirattal') || q.includes('intimidat') || q.includes('warn')) {
    return VERIFIED_LEGAL_DATABASE[4];
  }
  // 6. Consumer / shop money refund
  if (q.includes('money') || q.includes('refund') || q.includes('shop') || q.includes('product') || q.includes('panam') || q.includes('seller') || q.includes('defective') || q.includes('bill')) {
    return VERIFIED_LEGAL_DATABASE[5];
  }
  // 7. Road damage / pothole
  if (q.includes('road') || q.includes('pothole') || q.includes('ditch') || q.includes('obstruction') || q.includes('pallam') || q.includes('gutter') || q.includes('accident')) {
    return VERIFIED_LEGAL_DATABASE[6];
  }
  // 8. Cyber / photos / blackmail
  if (q.includes('photo') || q.includes('video') || q.includes('share') || q.includes('online') || q.includes('social') || q.includes('whatsapp') || q.includes('blackmail') || q.includes('cyber')) {
    return VERIFIED_LEGAL_DATABASE[7];
  }
  // 9. College / Ragging
  if (q.includes('college') || q.includes('ragging') || q.includes('hostel') || q.includes('student') || q.includes('seniors') || q.includes('campus')) {
    return VERIFIED_LEGAL_DATABASE[8];
  }
  // 10. Workplace / POSH
  if (q.includes('work') || q.includes('office') || q.includes('boss') || q.includes('colleague') || q.includes('manager') || q.includes('posh')) {
    return VERIFIED_LEGAL_DATABASE[9];
  }

  return null;
}
