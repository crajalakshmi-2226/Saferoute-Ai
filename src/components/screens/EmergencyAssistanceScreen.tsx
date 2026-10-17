import React from 'react';
import {
  PhoneCall,
  ShieldAlert,
  AlertTriangle,
  HeartPulse,
  Users,
  Compass,
  ArrowRight,
  Info,
  ShieldCheck,
  Building2,
  ExternalLink
} from 'lucide-react';
import { TRANSLATIONS, Language } from '../../utils/translations';

interface Props {
  language: Language;
  onNavigateToScreen: (screenId: string) => void;
}

export const EmergencyAssistanceScreen: React.FC<Props> = ({
  language,
  onNavigateToScreen,
}) => {
  const t = TRANSLATIONS[language];

  const emergencyContacts = [
    {
      number: '112',
      title: t.nationalEmergency,
      desc: t.emergency112Desc,
      color: 'bg-rose-600 hover:bg-rose-500 text-white',
      border: 'border-rose-500/50 shadow-rose-900/40',
      badge: 'All-India National SOS',
      isPrimary: true,
    },
    {
      number: '1091',
      title: t.womenHelpline,
      desc: t.womenHelplineDesc,
      color: 'bg-purple-600 hover:bg-purple-500 text-white',
      border: 'border-purple-500/40',
      badge: 'Women Safety & SOS',
      altNumber: '181',
    },
    {
      number: '1930',
      title: t.cybercrimeHelpline,
      desc: t.cybercrimeDesc,
      color: 'bg-blue-600 hover:bg-blue-500 text-white',
      border: 'border-blue-500/40',
      badge: 'Financial Fraud & Online Harassment',
    },
    {
      number: '108',
      title: t.ambulanceHelpline,
      desc: language === 'ta' ? 'அரசு ஆம்புலன்ஸ் மற்றும் உடனடி அவசர மருத்துவ சிகிச்சை.' : 'Emergency medical ambulance & trauma dispatch.',
      color: 'bg-emerald-600 hover:bg-emerald-500 text-white',
      border: 'border-emerald-500/40',
      badge: 'Medical Emergency',
    },
    {
      number: '1098',
      title: t.childlineHelpline,
      desc: language === 'ta' ? 'குழந்தைகள் பாதுகாப்பு மற்றும் உதவிக்கான 24 மணி நேர சேவை.' : '24/7 emergency assistance for children in distress.',
      color: 'bg-amber-600 hover:bg-amber-500 text-white',
      border: 'border-amber-500/40',
      badge: 'Child Safety',
    },
    {
      number: '1512',
      title: language === 'ta' ? 'ரயில்வே காவல் உதவி எண் (GRP)' : 'Railway Protection Helpline (GRP / RPF)',
      desc: language === 'ta' ? 'ரயில் மற்றும் ரயில் நிலையங்களில் நடக்கும் சம்பவங்களுக்கு.' : 'Transit emergencies on trains and railway station platforms.',
      color: 'bg-slate-800 hover:bg-slate-700 text-slate-100',
      border: 'border-slate-700',
      badge: 'Railway Transit',
    },
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-24">
      {/* Hero Warning Card */}
      <div className="rounded-3xl bg-rose-950/40 border border-rose-500/50 p-5 sm:p-6 shadow-xl relative overflow-hidden">
        <div className="flex items-center gap-3 mb-2">
          <div className="h-10 w-10 rounded-2xl bg-rose-600 text-white flex items-center justify-center shadow-lg animate-pulse">
            <PhoneCall className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-white">
              {t.emergencyTitle}
            </h1>
            <p className="text-xs text-rose-200">
              {t.emergencySubtitle}
            </p>
          </div>
        </div>

        {/* 112 Primary Button */}
        <div className="mt-5">
          <a
            href="tel:112"
            className="w-full flex items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-extrabold text-base sm:text-lg py-4 px-6 shadow-xl shadow-rose-950/60 transition cursor-pointer active:scale-95 border border-rose-400/40"
          >
            <PhoneCall className="w-6 h-6 animate-bounce" />
            <span>{t.call112}</span>
          </a>
        </div>
      </div>

      {/* Immediate Safety Instructions */}
      <div className="rounded-3xl bg-slate-900 border border-slate-800 p-5 space-y-3">
        <h2 className="text-sm font-bold text-white flex items-center gap-2 uppercase tracking-wide">
          <ShieldAlert className="w-4 h-4 text-amber-400" />
          {t.safetyProtocolsTitle}
        </h2>
        <div className="space-y-2 text-xs text-slate-300">
          <p className="bg-slate-950 p-3 rounded-xl border border-slate-800/80">
            {t.protocol1}
          </p>
          <p className="bg-slate-950 p-3 rounded-xl border border-slate-800/80">
            {t.protocol2}
          </p>
          <p className="bg-slate-950 p-3 rounded-xl border border-slate-800/80">
            {t.protocol3}
          </p>
        </div>
      </div>

      {/* Grid of Dedicated Emergency Numbers */}
      <div className="space-y-3">
        <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wide">
          {language === 'ta' ? 'அத்தியாவசிய அவசர தொலைபேசி எண்கள்' : 'Official Emergency Helplines'}
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {emergencyContacts.map((c, idx) => (
            <div
              key={idx}
              className={`rounded-2xl bg-slate-900 border ${c.border} p-4 flex flex-col justify-between shadow-md space-y-3`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-950 px-2 py-0.5 rounded-full border border-slate-800">
                    {c.badge}
                  </span>
                  <span className="text-lg font-extrabold text-white font-mono">
                    {c.number}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-white">{c.title}</h3>
                <p className="text-xs text-slate-400 mt-1">{c.desc}</p>
              </div>

              <div className="pt-2 border-t border-slate-800/80 flex items-center gap-2">
                <a
                  href={`tel:${c.number}`}
                  className={`flex-1 flex items-center justify-center gap-2 rounded-xl py-2 px-3 text-xs font-bold transition cursor-pointer active:scale-95 shadow-sm ${c.color}`}
                >
                  <PhoneCall className="w-3.5 h-3.5" />
                  <span>Call {c.number}</span>
                </a>

                {c.altNumber && (
                  <a
                    href={`tel:${c.altNumber}`}
                    className="rounded-xl py-2 px-3 text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition cursor-pointer"
                    title={`Alternative Helpline: ${c.altNumber}`}
                  >
                    <span>Alt: {c.altNumber}</span>
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Navigation to Nearby Help */}
      <div className="rounded-3xl bg-slate-900 border border-slate-800 p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white">
              {language === 'ta' ? 'அருகிலுள்ள அவசர நிலையங்கள் தேவைப்படுகிறதா?' : 'Need Physical Help Stations Nearby?'}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              {language === 'ta'
                ? 'அருகிலுள்ள அனைத்து மகளிர் காவல் நிலையம் அல்லது அரசு மருத்துவமனைக்குச் செல்லுங்கள்.'
                : 'Locate the closest verified Police Station, AWPS, or Government Hospital.'}
            </p>
          </div>
          <button
            onClick={() => onNavigateToScreen('nearby_help')}
            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition cursor-pointer shrink-0 shadow-md"
          >
            <span>{t.findNearbyHelp}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
