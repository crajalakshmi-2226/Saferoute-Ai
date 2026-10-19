import React, { useState, useEffect } from 'react';
import {
  FileText,
  Calendar,
  MapPin,
  Trash2,
  Edit3,
  CheckCircle2,
  ExternalLink,
  ShieldAlert,
  AlertTriangle,
  RefreshCw,
  Plus,
  Lock,
  ArrowRight
} from 'lucide-react';
import { TRANSLATIONS, Language } from '../../utils/translations';
import {
  getUserIncidentReports,
  deleteIncidentReport,
  IncidentReportData,
  UserProfileData,
} from '../../services/firebase';
import { safeStorage } from '../../utils/storage';

interface Props {
  language: Language;
  userProfile: UserProfileData | null;
  isGuest: boolean;
  onOpenReportForm: () => void;
  onViewDraft: (report: IncidentReportData) => void;
  onOpenAuth: () => void;
}

export const MyReportsScreen: React.FC<Props> = ({
  language,
  userProfile,
  isGuest,
  onOpenReportForm,
  onViewDraft,
  onOpenAuth,
}) => {
  const t = TRANSLATIONS[language];

  const [reports, setReports] = useState<IncidentReportData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [reportToDelete, setReportToDelete] = useState<IncidentReportData | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Load reports
  const fetchReports = async () => {
    setIsLoading(true);
    try {
      if (userProfile && userProfile.uid) {
        const firestoreReports = await getUserIncidentReports(userProfile.uid);
        setReports(firestoreReports);
      } else {
        const saved = safeStorage.getItem('saferoute_guest_reports');
        if (saved) {
          setReports(JSON.parse(saved));
        } else {
          setReports([]);
        }
      }
    } catch (err) {
      console.error('Failed to load reports:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [userProfile]);

  // Handle delete
  const handleConfirmDelete = async () => {
    if (!reportToDelete) return;
    setIsDeleting(true);

    try {
      if (userProfile && userProfile.uid) {
        await deleteIncidentReport(userProfile.uid, reportToDelete.id);
      } else {
        const updated = reports.filter((r) => r.id !== reportToDelete.id);
        safeStorage.setItem('saferoute_guest_reports', JSON.stringify(updated));
      }
      setReports((prev) => prev.filter((r) => r.id !== reportToDelete.id));
      setReportToDelete(null);
    } catch (err) {
      console.error('Delete error:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-24">
      {/* Header */}
      <div className="rounded-3xl bg-slate-900 border border-slate-800 p-5 sm:p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-md">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-extrabold text-white">
                {t.myReportsTitle}
              </h1>
              <p className="text-xs text-slate-400">
                {t.myReportsSubtitle}
              </p>
            </div>
          </div>

          <button
            onClick={onOpenReportForm}
            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs px-3.5 py-2 rounded-xl transition cursor-pointer self-start sm:self-auto shadow-md"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{t.reportIncident}</span>
          </button>
        </div>

        {/* Private Local Storage Notice */}
        <div className="mt-4 p-3 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs flex items-center gap-2">
          <Lock className="w-4 h-4 text-blue-400 shrink-0" />
          <span>
            {language === 'ta'
              ? 'உங்கள் புகார்கள் மற்றும் மனுக்கள் இந்த சாதனத்தில் தனிப்பட்ட முறையில் பாதுகாப்பாக சேமிக்கப்படுகின்றன.'
              : 'Confidential complaints and drafts are securely stored locally on this device.'}
          </span>
        </div>
      </div>

      {/* Reports List */}
      {isLoading ? (
        <div className="p-8 text-center text-slate-400 text-xs flex items-center justify-center gap-2">
          <RefreshCw className="w-4 h-4 animate-spin text-blue-400" />
          <span>Loading confidential records...</span>
        </div>
      ) : reports.length === 0 ? (
        <div className="rounded-3xl bg-slate-900 border border-slate-800 p-10 text-center space-y-3">
          <FileText className="w-10 h-10 text-slate-600 mx-auto" />
          <h3 className="font-bold text-white text-sm">{t.noReportsYet}</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            {t.noReportsSub}
          </p>
          <div className="pt-2">
            <button
              onClick={onOpenReportForm}
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition cursor-pointer shadow-md"
            >
              <Plus className="w-4 h-4" />
              <span>{t.reportIncident}</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {reports.map((report) => {
            const hasDraft = !!report.complaintDraft;
            return (
              <div
                key={report.id}
                className="rounded-3xl bg-slate-900 border border-slate-800 p-4 sm:p-5 hover:border-slate-700 transition shadow-md space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400 bg-blue-500/10 px-2.5 py-0.5 rounded-full border border-blue-500/20">
                        {report.category}
                      </span>
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                          report.status === 'opened_official_channel'
                            ? 'bg-purple-500/10 border-purple-500/30 text-purple-300'
                            : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                        }`}
                      >
                        {report.status.replace(/_/g, ' ')}
                      </span>
                    </div>

                    <h3 className="text-sm sm:text-base font-bold text-white line-clamp-1">
                      {report.category}
                    </h3>
                  </div>

                  <span className="text-[11px] text-slate-500">
                    {report.createdAt ? new Date(report.createdAt).toLocaleDateString() : ''}
                  </span>
                </div>

                <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed bg-slate-950 p-3 rounded-2xl border border-slate-800/80">
                  {report.description}
                </p>

                {/* Metadata row */}
                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
                  {report.location && (
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-500" />
                      <span className="truncate max-w-[200px]">{report.location}</span>
                    </span>
                  )}
                  {report.incidentDate && (
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-500" />
                      <span>{report.incidentDate.replace('T', ' ')}</span>
                    </span>
                  )}
                  {report.evidenceFiles && report.evidenceFiles.length > 0 && (
                    <span className="text-[10px] bg-slate-950 text-slate-300 px-2 py-0.5 rounded-md border border-slate-800">
                      {report.evidenceFiles.length} Evidence Attached
                    </span>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                  <button
                    onClick={() => setReportToDelete(report)}
                    className="flex items-center gap-1 text-slate-400 hover:text-rose-400 text-xs font-semibold transition cursor-pointer p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>{t.deleteReport}</span>
                  </button>

                  <button
                    onClick={() => onViewDraft(report)}
                    className="flex items-center gap-1.5 bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 font-semibold text-xs px-3.5 py-1.5 rounded-xl border border-blue-500/30 transition cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-blue-400" />
                    <span>{t.viewAndEdit}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {reportToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-2xl bg-rose-600/20 text-rose-400 border border-rose-500/30 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">
                {t.deleteConfirmTitle}
              </h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              {t.deleteConfirmDesc}
            </p>
            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                onClick={() => setReportToDelete(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-xl transition cursor-pointer"
              >
                {t.cancel}
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 rounded-xl transition cursor-pointer"
              >
                {isDeleting ? 'Deleting...' : t.confirmDelete}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
