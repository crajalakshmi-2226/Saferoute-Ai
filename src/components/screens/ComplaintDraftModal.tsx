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
  AlertCircle
} from 'lucide-react';
import { TRANSLATIONS, Language } from '../../utils/translations';
import { IncidentReportData, updateIncidentReportStatus } from '../../services/firebase';

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

  const handleOpenOfficialChannel = () => {
    const url = draftData.officialPortalUrl || reportData.officialPortalUrl || 'https://eservices.tnpolice.gov.in/';
    window.open(url, '_blank', 'noopener,noreferrer');
    
    // Update status to 'opened_official_channel'
    setCurrentStatus('opened_official_channel');
    if (reportData.userId && reportData.userId !== 'guest_user') {
      updateIncidentReportStatus(reportData.userId, reportData.id, 'opened_official_channel').catch(console.error);
    }
    if (onReportUpdated) {
      onReportUpdated({
        ...reportData,
        status: 'opened_official_channel',
        complaintDraft: editableDraftText,
      });
    }
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

          {/* Receiving Authority and Verified Law Banner */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs space-y-1">
              <span className="text-slate-400 font-semibold block">
                {t.receivingAuthorityLabel}:
              </span>
              <p className="font-bold text-white text-xs sm:text-sm">
                {language === 'ta'
                  ? draftData.addressedToTamil || draftData.addressedTo
                  : draftData.addressedTo}
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs space-y-1">
              <span className="text-slate-400 font-semibold block">
                {t.applicableProvisionsLabel}:
              </span>
              <p className="font-bold text-amber-400 text-xs">
                {draftData.applicableLegalProvisions && draftData.applicableLegalProvisions.length > 0
                  ? draftData.applicableLegalProvisions.join(', ')
                  : 'Applicable statutory provisions'}
              </p>
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
                You can edit this draft before copying or submitting
              </span>
            </div>
            <textarea
              rows={12}
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
              <span>{copied ? 'Copied to Clipboard!' : t.copyDraft}</span>
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
              className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition cursor-pointer shadow-md active:scale-95"
            >
              <span>{t.openOfficialPortal}</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
