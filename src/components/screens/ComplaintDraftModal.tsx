import React, { useState } from 'react';
import {
  FileText,
  Copy,
  Download,
  ExternalLink,
  CheckCircle2,
  X,
  Edit3,
  ShieldCheck,
  Building,
  Scale,
  Clock,
  AlertCircle,
  Landmark,
  Shield,
  Layers,
  PhoneCall,
  Sparkles
} from 'lucide-react';
import { TRANSLATIONS, Language } from '../../utils/translations';
import { IncidentReportData, updateIncidentReportStatus } from '../../services/firebase';
import { OFFICIAL_GRIEVANCE_PORTALS, OfficialGrievancePortal } from '../../data/officialPortals';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  draftData: any;
  reportData: IncidentReportData;
  language: Language;
  onReportUpdated?: (updated: IncidentReportData) => void;
}

export const ComplaintDraftModal: React.FC<Props> = ({
  isOpen,
  onClose,
  draftData,
  reportData,
  language,
  onReportUpdated,
}) => {
  if (!isOpen || !draftData) return null;
  const t = TRANSLATIONS[language];
  const isTamil = language === 'ta';

  // Selected official portal state
  const [selectedPortalId, setSelectedPortalId] = useState<string>(() => {
    const cat = (reportData.category || '').toLowerCase();
    if (cat.includes('access') || cat.includes('barrier') || cat.includes('ramp')) return 'sugamya_bharat';
    if (cat.includes('highway') || cat.includes('expressway')) return 'nhai_morth';
    if (cat.includes('police') || cat.includes('theft') || cat.includes('assault') || cat.includes('harass')) return 'tn_police';
    if (cat.includes('road') || cat.includes('pothole') || cat.includes('footpath') || cat.includes('speed')) return 'gcc_municipal';
    return 'gcc_municipal';
  });

  const selectedPortal = OFFICIAL_GRIEVANCE_PORTALS.find((p) => p.id === selectedPortalId) || OFFICIAL_GRIEVANCE_PORTALS[0];

  // Editable draft body
  const [editableDraftText, setEditableDraftText] = useState<string>(() => {
    if (language === 'ta' && draftData.fullFormattedDraftTamil) {
      return draftData.fullFormattedDraftTamil;
    }
    return draftData.fullFormattedDraft || '';
  });

  const [currentStatus, setCurrentStatus] = useState<IncidentReportData['status']>(
    reportData.status || 'draft_created'
  );
  const [copied, setCopied] = useState(false);
  const [portalLaunchToast, setPortalLaunchToast] = useState<string | null>(null);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(editableDraftText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  const handleDownload = () => {
    const blob = new Blob([editableDraftText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `SafeRoute_Complaint_Draft_${Date.now()}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleOpenOfficialChannel = async () => {
    // 1. Auto-copy draft to clipboard so user can easily paste on the official portal
    try {
      await navigator.clipboard.writeText(editableDraftText);
      setCopied(true);
    } catch (e) {
      console.warn('Clipboard write error:', e);
    }

    setPortalLaunchToast(
      isTamil
        ? `புகார் மனு நகலெடுக்கப்பட்டது! ${selectedPortal.nameTamil.split('(')[0]} இணையதளம் திறக்கப்படுகிறது...`
        : `Complaint draft copied! Launching ${selectedPortal.name.split('/')[0]} portal...`
    );

    // 2. Open chosen official portal website
    window.open(selectedPortal.portalUrl, '_blank', 'noopener,noreferrer');
    
    // 3. Update status to 'opened_official_channel'
    setCurrentStatus('opened_official_channel');
    if (reportData.userId && reportData.userId !== 'guest_user') {
      updateIncidentReportStatus(reportData.userId, reportData.id, 'opened_official_channel').catch(console.error);
    }
    if (onReportUpdated) {
      onReportUpdated({
        ...reportData,
        status: 'opened_official_channel',
        receivingAuthority: selectedPortal.name,
        officialPortalUrl: selectedPortal.portalUrl,
        complaintDraft: editableDraftText,
      });
    }

    setTimeout(() => setPortalLaunchToast(null), 4500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-3xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-white">
                {t.complaintDraftTitle}
              </h2>
              <p className="text-xs text-slate-400">
                {draftData.subject || reportData.category}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {/* Status Tracker */}
          <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
              {t.draftStatus}
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <div
                className={`p-2 rounded-xl border text-center text-xs font-semibold ${
                  currentStatus === 'draft_created'
                    ? 'bg-blue-600/20 border-blue-500 text-blue-300'
                    : 'bg-slate-900 border-slate-800 text-slate-400'
                }`}
              >
                {t.statusDraftCreated}
              </div>
              <div
                className={`p-2 rounded-xl border text-center text-xs font-semibold ${
                  currentStatus === 'ready_for_review'
                    ? 'bg-amber-600/20 border-amber-500 text-amber-300'
                    : 'bg-slate-900 border-slate-800 text-slate-400'
                }`}
              >
                {t.statusReadyForReview}
              </div>
              <div
                className={`p-2 rounded-xl border text-center text-xs font-semibold ${
                  currentStatus === 'opened_official_channel'
                    ? 'bg-purple-600/20 border-purple-500 text-purple-300'
                    : 'bg-slate-900 border-slate-800 text-slate-400'
                }`}
              >
                {t.statusOpenedPortal}
              </div>
              <div
                className={`p-2 rounded-xl border text-center text-xs font-semibold ${
                  currentStatus === 'submitted_confirmed'
                    ? 'bg-emerald-600/20 border-emerald-500 text-emerald-300'
                    : 'bg-slate-900 border-slate-800 text-slate-500'
                }`}
              >
                {t.statusSubmittedConfirmed}
              </div>
            </div>
          </div>

          {/* Portal Launch Notification Toast */}
          {portalLaunchToast && (
            <div className="p-3 rounded-2xl bg-emerald-950/90 border border-emerald-500/50 text-emerald-300 text-xs flex items-center gap-2 shadow-lg animate-bounce">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="font-semibold">{portalLaunchToast}</span>
            </div>
          )}

          {/* Authority Selection Section (User Request: "last la entha option la complaint nu kekanum antha option padi antha website la poitu complaint poganum") */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Landmark className="w-4 h-4 text-cyan-400" />
                <span>
                  {isTamil
                    ? 'எந்த அரசு இணையதளத்தில் புகார் அளிக்க விரும்புகிறீர்கள்?'
                    : 'Select Official Portal to File Complaint'}
                </span>
              </label>
              <span className="text-[10px] text-cyan-400 bg-cyan-950 border border-cyan-500/30 px-2 py-0.5 rounded-full font-mono">
                {isTamil ? 'அரசு தளம்' : 'Govt Portal'}
              </span>
            </div>

            <p className="text-[11px] text-slate-400">
              {isTamil
                ? 'உங்கள் புகார் எந்த துறைக்குச் செல்ல வேண்டும் என்பதைத் தேர்ந்தெடுக்கவும். தேர்வு செய்த பின் நேரடியாக அந்த அரசு இணையதளம் திறக்கப்படும்.'
                : 'Select the authority handling your incident. Your complaint text will be automatically copied, and their official portal will launch directly.'}
            </p>

            {/* Portal Option Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
              {OFFICIAL_GRIEVANCE_PORTALS.map((portal) => {
                const isSelected = selectedPortalId === portal.id;

                return (
                  <div
                    key={portal.id}
                    onClick={() => setSelectedPortalId(portal.id)}
                    className={`p-3 rounded-xl border text-left cursor-pointer transition space-y-1.5 ${
                      isSelected
                        ? 'bg-blue-600/20 border-blue-500 ring-1 ring-blue-500/40 shadow-md'
                        : 'bg-slate-900 border-slate-800/90 hover:border-slate-700 hover:bg-slate-800/40'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-1.5">
                      <span className="text-xs font-bold text-white leading-tight">
                        {isTamil ? portal.nameTamil : portal.name}
                      </span>
                      {isSelected && (
                        <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" />
                      )}
                    </div>

                    <div className="text-[10px] text-slate-400 line-clamp-2">
                      {isTamil ? portal.scopeTamil : portal.scope}
                    </div>

                    <div className="flex items-center justify-between pt-1 text-[10px] font-mono">
                      <span className={`px-2 py-0.5 rounded-md border ${portal.badgeColor}`}>
                        {portal.badge}
                      </span>
                      {portal.tollFree && (
                        <span className="text-slate-400 flex items-center gap-1">
                          <PhoneCall className="w-3 h-3 text-emerald-400" />
                          <span>{portal.tollFree}</span>
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Selected Portal Target Banner */}
            <div className="p-3 rounded-xl bg-slate-900/90 border border-cyan-500/30 flex items-center justify-between text-xs text-slate-300">
              <div className="flex items-center gap-2 truncate">
                <ExternalLink className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <span className="font-semibold text-white truncate">
                  {isTamil ? selectedPortal.nameTamil.split('(')[0] : selectedPortal.name}
                </span>
                <span className="text-[11px] text-cyan-400 font-mono hidden sm:inline truncate">
                  ({selectedPortal.portalUrl})
                </span>
              </div>
              <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider shrink-0">
                {isTamil ? 'தயார்' : 'Target Ready'}
              </span>
            </div>
          </div>

          {/* User Facts Notice */}
          <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-300 text-[11px] flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-blue-400 shrink-0" />
            <span>{t.factWarning}</span>
          </div>

          {/* Editable Text Area */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Edit3 className="w-3.5 h-3.5 text-blue-400" />
                {t.editDraft}
              </label>
              <span className="text-[11px] text-slate-500">
                {isTamil ? 'புகார் மனுவை சரிபார்த்து திருத்திக் கொள்ளலாம்' : 'You can edit this draft before proceeding'}
              </span>
            </div>
            <textarea
              rows={11}
              value={editableDraftText}
              onChange={(e) => setEditableDraftText(e.target.value)}
              className="w-full rounded-2xl bg-slate-950 border border-slate-800 p-4 font-mono text-xs text-slate-200 focus:outline-none focus:border-blue-500 leading-relaxed"
            />
          </div>
        </div>

        {/* Modal Actions */}
        <div className="p-4 sm:p-5 border-t border-slate-800 bg-slate-950/60 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs px-3.5 py-2.5 rounded-xl border border-slate-700 transition cursor-pointer"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>{copied ? (isTamil ? 'நகலெடுக்கப்பட்டது!' : 'Copied!') : t.copyDraft}</span>
            </button>

            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs px-3.5 py-2.5 rounded-xl border border-slate-700 transition cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{t.downloadDraft}</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleOpenOfficialChannel}
              className="flex items-center gap-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs sm:text-sm px-5 py-2.5 rounded-xl transition cursor-pointer shadow-lg active:scale-95"
            >
              <span>
                {isTamil
                  ? `புகாரை நகலெடுத்து இணையதளத்திற்குச் செல்`
                  : `Copy Draft & Proceed to ${selectedPortal.badge}`}
              </span>
              <ExternalLink className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
