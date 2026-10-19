import React, { useState, useRef, useEffect } from 'react';
import {
  Scale,
  Send,
  Sparkles,
  ExternalLink,
  ShieldAlert,
  AlertTriangle,
  FileText,
  CheckCircle2,
  HelpCircle,
  Building,
  ArrowRight,
  RefreshCw,
  Info,
  ChevronDown,
  Volume2
} from 'lucide-react';
import { TRANSLATIONS, Language } from '../../utils/translations';
import { LegalProvision, findMatchingLegalProvision, VERIFIED_LEGAL_DATABASE } from '../../data/legalKnowledgeBase';

interface Props {
  language: Language;
  onOpenReportWithIncident?: (initialDescription: string, category?: string) => void;
  onOpenNearbyHelp?: (category?: string) => void;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  identifiedCategory?: string;
  followUpQuestion?: string | null;
  tamilSummary?: string;
  englishSummary?: string;
  legalProvisions?: LegalProvision[];
  receivingAuthority?: string;
  authorityTamil?: string;
  practicalNextSteps?: string[];
  practicalNextStepsTamil?: string[];
  nearbyHelpType?: string;
  canDraftComplaint?: boolean;
}

export const LegalAssistantScreen: React.FC<Props> = ({
  language,
  onOpenReportWithIncident,
  onOpenNearbyHelp,
}) => {
  const t = TRANSLATIONS[language];
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: 'msg-welcome',
      sender: 'assistant',
      text: language === 'ta'
        ? 'வணக்கம்! நான் SafeRoute AI சட்ட உரிமைகள் மற்றும் பாதுகாப்பு வழிகாட்டி. பேருந்து தகராறு, அதிக ஒலி, பெண்களுக்கு எதிரான துன்புறுத்தல், திருட்டு, அல்லது தடையற்ற பாதை மறுப்பு போன்ற எந்தவொரு பிரச்சனைக்கும் இந்திய மற்றும் தமிழ்நாடு சட்டங்களின் கீழ் சரிபார்க்கப்பட்ட தகவல்களை வழங்குகிறேன். என்ன நடந்தது என்று உங்கள் சொந்த வார்த்தைகளில் கூறுங்கள்.'
        : 'Welcome! I am the SafeRoute AI Legal Rights & Safety Assistant. Describe what happened in plain language—such as loud music on a bus, harassment, stolen property, ramp obstruction, or consumer disputes—to receive verified legal guidance under Indian Central & Tamil Nadu laws.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const sampleQuestions = [
    { text: t.sampleBusMusic, category: 'Public noise complaint / Transport' },
    { text: t.sampleHarassment, category: 'Harassment or intimidation / Sexual harassment' },
    { text: t.sampleTheft, category: 'Theft' },
    { text: t.sampleRamp, category: 'Accessibility barrier' },
    { text: t.sampleRefund, category: 'Consumer complaint' },
    { text: t.sampleCyber, category: 'Cybercrime' },
    { text: t.sampleRoad, category: 'Road damage or dangerous obstruction' },
    { text: t.sampleCollege, category: 'Harassment or intimidation' },
  ];

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text || isLoading) return;

    setErrorMsg(null);
    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputText('');
    setIsLoading(true);

    try {
      const historyContext = messages.map((m) => ({
        role: m.sender === 'user' ? 'user' : 'model',
        text: m.text,
      }));

      const res = await fetch('/api/legal-assist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          language,
          history: historyContext,
        }),
      });

      if (!res.ok) {
        throw new Error(`Server returned HTTP ${res.status}`);
      }

      const data = await res.json();
      const assistantMsg: ChatMessage = {
        id: `asst-${Date.now()}`,
        sender: 'assistant',
        text: data.response_text || data.english_summary || 'Analysis complete.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        identifiedCategory: data.identified_category,
        followUpQuestion: data.follow_up_question,
        tamilSummary: data.tamil_summary,
        englishSummary: data.english_summary,
        legalProvisions: data.legal_provisions || [],
        receivingAuthority: data.receiving_authority,
        authorityTamil: data.authorityTamil,
        practicalNextSteps: data.practical_next_steps || [],
        practicalNextStepsTamil: data.practical_next_steps_tamil || [],
        nearbyHelpType: data.nearby_help_type,
        canDraftComplaint: data.can_draft_complaint !== false,
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      console.warn('Backend /api/legal-assist unavailable, activating local legal engine:', err);
      // Fallback to verified legal database so user always gets accurate legal guidance
      const matched = findMatchingLegalProvision(text);
      if (matched) {
        const fallbackMsg: ChatMessage = {
          id: `asst-${Date.now()}`,
          sender: 'assistant',
          text: language === 'ta'
            ? `உங்கள் கேள்விக்கான சரிபார்க்கப்பட்ட சட்ட வழிகாட்டல்:\n\nசட்டம்: ${matched.actNameTamil}\nபிரிவு: ${matched.section}\n\n${matched.summaryTamil}\n\nஅதிகாரப்பூர்வ துறை: ${matched.authorityTamil}\n\nஅடுத்த கட்ட நடைமுறை: ${matched.procedureSummaryTamil}`
            : `Verified legal information regarding your query:\n\nAct: ${matched.actName}\nProvision: ${matched.section}\n\n${matched.summaryEnglish}\n\nReceiving Authority: ${matched.authority}\n\nNext Step: ${matched.procedureSummary}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          identifiedCategory: matched.category,
          tamilSummary: matched.summaryTamil,
          englishSummary: matched.summaryEnglish,
          legalProvisions: [matched],
          receivingAuthority: matched.authority,
          authorityTamil: matched.authorityTamil,
          practicalNextSteps: [matched.procedureSummary, 'Keep any photos, tickets, or witness details ready for documentation.', 'Draft an official complaint using the button below.'],
          practicalNextStepsTamil: [matched.procedureSummaryTamil, 'ஆவணங்கள், புகைப்படங்கள் அல்லது ரசீதுகளை தயாராக வைக்கவும்.', 'முறைப்படி புகார் மனு தயாரிக்க கீழே உள்ள பொத்தானைப் பயன்படுத்தவும்.'],
          nearbyHelpType: matched.category.toLowerCase().includes('women') ? 'women_police' : 'police',
          canDraftComplaint: true,
        };
        setMessages((prev) => [...prev, fallbackMsg]);
      } else {
        const generalMsg: ChatMessage = {
          id: `asst-${Date.now()}`,
          sender: 'assistant',
          text: language === 'ta'
            ? 'உங்கள் கேள்வியை நான் ஆராய்ந்தேன். உங்கள் பாதுகாப்பு மற்றும் உரிமைகளுக்காக, அவசர உதவிக்கு காவல் துறை எண் 112, பெண்கள் உதவி எண் 1091, அல்லது மாவட்ட சட்டப் பணிகள் ஆணைக்குழுவை (DLSA) அணுகலாம்.'
            : 'For your safety, legal rights, and official grievance redressal, you can seek direct assistance from your local police station (Dial 112), Women Helpline (1091), or the District Legal Services Authority (DLSA).',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          identifiedCategory: 'Citizen Safety & Legal Rights',
          tamilSummary: 'காவல் உதவி மையம் (112) மற்றும் இலவச சட்ட உதவி மையத்தை (DLSA) அணுகவும்.',
          englishSummary: 'Reach out to local police authorities or free legal aid services.',
          legalProvisions: [VERIFIED_LEGAL_DATABASE[0]],
          receivingAuthority: 'Local Police Station / District Legal Services Authority',
          authorityTamil: 'உள்ளூர் காவல் நிலையம் / மாவட்ட சட்டப் பணிகள் ஆணைக்குழு',
          practicalNextSteps: ['Move to a safe public area', 'Call 112 if facing immediate danger', 'File an official grievance with the appropriate authority'],
          practicalNextStepsTamil: ['பாதுகாப்பான வெளிச்சமுள்ள இடத்திற்கு செல்லவும்', 'உடனடி ஆபத்து என்றால் 112-ஐ அழைக்கவும்'],
          nearbyHelpType: 'police',
          canDraftComplaint: true,
        };
        setMessages((prev) => [...prev, generalMsg]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] max-w-4xl mx-auto pb-4">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 mb-3 shrink-0 shadow-md">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-base font-extrabold text-white flex items-center gap-2">
                {t.legalAssistantTitle}
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                  Verified Statutes
                </span>
              </h1>
              <p className="text-xs text-slate-400">
                {t.legalAssistantSubtitle}
              </p>
            </div>
          </div>
        </div>

        {/* Disclaimer Notice */}
        <div className="mt-2.5 flex items-start gap-2 bg-slate-950/60 border border-slate-800/80 rounded-xl p-2.5 text-[11px] text-slate-400">
          <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
          <span>{t.legalDisclaimer}</span>
        </div>
      </div>

      {/* Chat Messages Area */}
      <div className="flex-1 overflow-y-auto space-y-4 px-1 pr-2">
        {messages.map((msg) => {
          const isUser = msg.sender === 'user';
          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[92%] sm:max-w-[85%] rounded-2xl p-4 shadow-sm ${
                  isUser
                    ? 'bg-blue-600 text-white rounded-br-sm'
                    : 'bg-slate-900 border border-slate-800 text-slate-100 rounded-bl-sm'
                }`}
              >
                {/* Header label for assistant */}
                {!isUser && (
                  <div className="flex items-center justify-between gap-2 mb-2 pb-2 border-b border-slate-800">
                    <span className="text-[11px] font-bold text-blue-400 flex items-center gap-1.5 uppercase tracking-wide">
                      <Scale className="w-3.5 h-3.5" /> SafeRoute Legal Guide
                    </span>
                    {msg.identifiedCategory && (
                      <span className="text-[10px] font-medium text-amber-300 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full">
                        {msg.identifiedCategory}
                      </span>
                    )}
                  </div>
                )}

                {/* Primary Response Text */}
                <div className="text-xs sm:text-sm whitespace-pre-line leading-relaxed">
                  {msg.text}
                </div>

                {/* Follow up question callout */}
                {msg.followUpQuestion && (
                  <div className="mt-3 p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-200 text-xs flex items-start gap-2">
                    <HelpCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold block mb-0.5">
                        {language === 'ta' ? 'கூடுதல் விவரங்கள் தேவைப்படலாம்:' : 'Important Fact Check:'}
                      </span>
                      <span>{msg.followUpQuestion}</span>
                    </div>
                  </div>
                )}

                {/* Verified Legal Provisions Cards */}
                {msg.legalProvisions && msg.legalProvisions.length > 0 && (
                  <div className="mt-3.5 space-y-2.5">
                    <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block">
                      {language === 'ta' ? 'சரிபார்க்கப்பட்ட சட்ட விதிகள் & பிரிவுகள்:' : 'Verified Statutory Provisions:'}
                    </span>
                    {msg.legalProvisions.map((prov, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-xl bg-slate-950 border border-slate-700/70 text-xs space-y-1.5"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <span className="font-bold text-blue-300 text-xs">
                            {language === 'ta' ? prov.actNameTamil || prov.actName : prov.actName}
                          </span>
                          <span className="shrink-0 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Verified
                          </span>
                        </div>
                        <div className="text-amber-400 font-mono text-[11px] font-semibold">
                          {prov.section}
                        </div>
                        <p className="text-slate-300 text-[11px] leading-relaxed">
                          {language === 'ta' ? prov.summaryTamil : prov.summaryEnglish}
                        </p>
                        {prov.officialUrl && (
                          <div className="pt-1">
                            <a
                              href={prov.officialUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-400 hover:text-blue-300 underline"
                            >
                              <span>
                                {language === 'ta' ? 'அதிகாரப்பூர்வ அரசு இணையதளத்தில் சரிபார்க்கவும்' : 'View Official Government Source'}
                              </span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Receiving Authority & Next Steps */}
                {msg.receivingAuthority && (
                  <div className="mt-3 p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-xs space-y-1.5">
                    <div className="flex items-center gap-1.5 text-slate-200 font-bold">
                      <Building className="w-3.5 h-3.5 text-blue-400" />
                      <span>{language === 'ta' ? 'சம்பந்தப்பட்ட அரசு துறை:' : 'Appropriate Official Authority:'}</span>
                    </div>
                    <p className="text-slate-300 font-medium">
                      {language === 'ta' ? msg.authorityTamil || msg.receivingAuthority : msg.receivingAuthority}
                    </p>
                  </div>
                )}

                {/* Practical Steps */}
                {msg.practicalNextSteps && msg.practicalNextSteps.length > 0 && (
                  <div className="mt-3 p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-xs">
                    <span className="font-bold text-slate-200 block mb-1.5">
                      {language === 'ta' ? 'உடனடி நடைமுறைகள்:' : 'Practical Next Steps:'}
                    </span>
                    <ul className="space-y-1 text-slate-300 list-disc list-inside text-[11px]">
                      {(language === 'ta' && msg.practicalNextStepsTamil && msg.practicalNextStepsTamil.length > 0
                        ? msg.practicalNextStepsTamil
                        : msg.practicalNextSteps
                      ).map((step, sIdx) => (
                        <li key={sIdx}>{step}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Action Buttons: Generate Complaint Draft / Nearby Help */}
                {!isUser && msg.canDraftComplaint && (
                  <div className="mt-4 pt-3 border-t border-slate-800 flex flex-wrap gap-2">
                    <button
                      onClick={() =>
                        onOpenReportWithIncident &&
                        onOpenReportWithIncident(
                          msg.text,
                          msg.identifiedCategory || 'Incident'
                        )
                      }
                      className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs px-3.5 py-2 rounded-xl transition cursor-pointer active:scale-95 shadow-sm"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>{t.createComplaintDraftButton}</span>
                    </button>

                    {onOpenNearbyHelp && (
                      <button
                        onClick={() => onOpenNearbyHelp(msg.nearbyHelpType)}
                        className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs px-3 py-2 rounded-xl border border-slate-700 transition cursor-pointer"
                      >
                        <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
                        <span>{t.findNearbyHelp}</span>
                      </button>
                    )}
                  </div>
                )}
              </div>
              <span className="text-[10px] text-slate-500 mt-1 px-1">
                {msg.timestamp}
              </span>
            </div>
          );
        })}

        {/* Loading Spinner */}
        {isLoading && (
          <div className="flex items-center gap-2.5 text-xs text-blue-400 bg-slate-900 border border-slate-800 p-3 rounded-2xl w-fit">
            <RefreshCw className="w-4 h-4 animate-spin text-blue-400" />
            <span>{t.generating}</span>
          </div>
        )}

        {/* Error message */}
        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Questions Pills */}
      {messages.length <= 3 && (
        <div className="pt-2 pb-1 shrink-0">
          <p className="text-[11px] font-semibold text-slate-400 mb-1.5 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-400" />
            {t.sampleQuestionsHeader}
          </p>
          <div className="flex gap-2 overflow-x-auto pb-1.5 scrollbar-thin">
            {sampleQuestions.slice(0, 5).map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(q.text)}
                disabled={isLoading}
                className="shrink-0 text-left text-[11px] bg-slate-900 hover:bg-slate-800 border border-slate-700/80 hover:border-blue-500/60 text-slate-200 px-3 py-1.5 rounded-xl transition cursor-pointer max-w-[260px] truncate"
              >
                {q.text}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Bar */}
      <div className="mt-2 shrink-0">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2 bg-slate-900 border border-slate-700/90 rounded-2xl p-1.5 pl-3 focus-within:border-blue-500 transition shadow-lg"
        >
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={t.askPlaceholder}
            disabled={isLoading}
            className="flex-1 bg-transparent text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none"
          />
          <button
            type="submit"
            disabled={!inputText.trim() || isLoading}
            className="flex items-center justify-center h-9 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 disabled:text-slate-500 text-white font-semibold text-xs transition cursor-pointer shrink-0 active:scale-95"
          >
            <Send className="w-3.5 h-3.5 mr-1" />
            <span>{t.send}</span>
          </button>
        </form>
      </div>
    </div>
  );
};
