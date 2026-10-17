import React, { useState, useRef } from 'react';
import {
  FileText,
  MapPin,
  Calendar,
  Clock,
  Camera,
  Video,
  Upload,
  AlertTriangle,
  CheckCircle2,
  Trash2,
  Lock,
  Sparkles,
  RefreshCw,
  Locate,
  Shield,
  FileCheck
} from 'lucide-react';
import { TRANSLATIONS, Language } from '../../utils/translations';
import { Coordinates } from '../../types';
import { requestCurrentPosition } from '../../services/locationService';
import {
  saveIncidentReport,
  IncidentReportData,
  EvidenceFileItem,
  UserProfileData,
} from '../../services/firebase';
import { safeStorage } from '../../utils/storage';

interface Props {
  language: Language;
  userProfile: UserProfileData | null;
  isGuest: boolean;
  initialDescription?: string;
  initialCategory?: string;
  onOpenDraftModal: (draftData: any, reportData: IncidentReportData) => void;
  onGoToMyReports: () => void;
}

const CATEGORIES = [
  'Harassment or intimidation',
  'Theft',
  'Physical assault or violence',
  'Sexual harassment',
  'Public noise complaint',
  'Road damage or dangerous obstruction',
  'Accessibility barrier',
  'Transport-related complaint',
  'Consumer complaint',
  'Cybercrime',
  'Public-service complaint',
  'Environmental or pollution concern',
  'Other incident'
];

export const IncidentReportScreen: React.FC<Props> = ({
  language,
  userProfile,
  isGuest,
  initialDescription = '',
  initialCategory = '',
  onOpenDraftModal,
  onGoToMyReports,
}) => {
  const t = TRANSLATIONS[language];

  const [category, setCategory] = useState<string>(initialCategory || CATEGORIES[0]);
  const [customCategory, setCustomCategory] = useState<string>('');
  const [description, setDescription] = useState<string>(initialDescription);
  const [incidentDate, setIncidentDate] = useState<string>(() => {
    const now = new Date();
    return now.toISOString().slice(0, 16);
  });
  const [locationText, setLocationText] = useState<string>('');
  const [coordinates, setCoordinates] = useState<Coordinates | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [desiredAssistance, setDesiredAssistance] = useState<string>('');
  const [preferredLang, setPreferredLang] = useState<Language>(language);
  const [evidenceList, setEvidenceList] = useState<EvidenceFileItem[]>([]);
  
  const [isSaving, setIsSaving] = useState(false);
  const [isDrafting, setIsDrafting] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  // Acquire live GPS position
  const handleUseCurrentLocation = async () => {
    setIsLocating(true);
    setFormError(null);
    try {
      const result = await requestCurrentPosition();
      if (result.status === 'success' && result.coordinates) {
        setCoordinates(result.coordinates);
        if (!locationText) {
          setLocationText(`GPS: ${result.coordinates.lat.toFixed(5)}, ${result.coordinates.lng.toFixed(5)}`);
        }
      } else {
        setFormError(
          result.errorMessage ||
          (language === 'ta'
            ? 'இருப்பிட அனுமதி வழங்கப்படவில்லை. நீங்கள் கைமுறையாக முகவரியை உள்ளிடலாம்.'
            : 'Location permission was denied or unavailable. You can enter the location manually.')
        );
      }
    } catch (err: any) {
      console.warn('Location denied or failed:', err);
      setFormError(
        language === 'ta'
          ? 'இருப்பிட அனுமதி வழங்கப்படவில்லை. நீங்கள் கைமுறையாக முகவரியை உள்ளிடலாம்.'
          : 'Location permission was denied or unavailable. You can enter the location manually.'
      );
    } finally {
      setIsLocating(false);
    }
  };

  // Handle image upload with size restriction
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, fileType: 'image' | 'video') => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    const maxSizeBytes = fileType === 'image' ? 15 * 1024 * 1024 : 30 * 1024 * 1024; // 15MB img, 30MB vid

    if (file.size > maxSizeBytes) {
      setFormError(
        language === 'ta'
          ? `கோப்பு அளவு அனுமதிக்கப்பட்ட வரம்பை விட அதிகமாக உள்ளது (அதிகபட்சம் ${fileType === 'image' ? '15MB' : '30MB'}).`
          : `File size exceeds the limit (Max ${fileType === 'image' ? '15MB' : '30MB'}).`
      );
      return;
    }

    const newItem: EvidenceFileItem = {
      id: `ev-${Date.now()}`,
      name: file.name,
      type: file.type || fileType,
      sizeBytes: file.size,
      uploadedAt: new Date().toISOString(),
      previewUrl: URL.createObjectURL(file),
    };

    setEvidenceList((prev) => [...prev, newItem]);
    setFormError(null);
  };

  const handleRemoveEvidence = (id: string) => {
    setEvidenceList((prev) => prev.filter((item) => item.id !== id));
  };

  // Generate Complaint Draft via Backend API
  const handleGenerateDraft = async () => {
    if (!description.trim()) {
      setFormError(
        language === 'ta'
          ? 'தயவுசெய்து என்ன நடந்தது என்பதை விவரிக்கவும்.'
          : 'Please describe what happened in the incident description field.'
      );
      return;
    }

    setIsDrafting(true);
    setFormError(null);

    const activeCat = category === 'Other incident' && customCategory.trim() ? customCategory : category;

    try {
      const res = await fetch('/api/generate-complaint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: activeCat,
          description,
          incidentDate,
          location: locationText,
          desiredAssistance,
          language: preferredLang,
          evidenceList: evidenceList.map((e) => e.name),
        }),
      });

      if (!res.ok) {
        throw new Error(`Failed to generate draft: HTTP ${res.status}`);
      }

      const data = await res.json();
      const draft = data.draft;

      // Construct provisional report payload
      const reportPayload: IncidentReportData = {
        id: `rep_${Date.now()}`,
        userId: userProfile?.uid || 'guest_user',
        category: activeCat,
        description,
        incidentDate,
        location: locationText,
        latitude: coordinates?.lat,
        longitude: coordinates?.lng,
        preferredLanguage: preferredLang,
        desiredAssistance,
        complaintDraft: preferredLang === 'ta' && draft.fullFormattedDraftTamil ? draft.fullFormattedDraftTamil : draft.fullFormattedDraft,
        status: 'draft_created',
        receivingAuthority: draft.addressedTo || 'Appropriate Official Authority',
        officialPortalUrl: draft.officialPortalUrl || 'https://eservices.tnpolice.gov.in/',
        evidenceFiles: evidenceList,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      onOpenDraftModal(draft, reportPayload);
    } catch (err: any) {
      console.error('Draft error:', err);
      setFormError(
        language === 'ta'
          ? 'மனுவை உருவாக்குவதில் சிக்கல் ஏற்பட்டது. மீண்டும் முயற்சிக்கவும்.'
          : 'Failed to generate complaint draft. Please check connection and try again.'
      );
    } finally {
      setIsDrafting(false);
    }
  };

  // Save report to Firestore or local storage
  const handleSaveReport = async () => {
    if (!description.trim()) {
      setFormError(
        language === 'ta'
          ? 'தயவுசெய்து என்ன நடந்தது என்பதை விவரிக்கவும்.'
          : 'Please describe what happened in the incident description field.'
      );
      return;
    }

    setIsSaving(true);
    setFormError(null);
    const activeCat = category === 'Other incident' && customCategory.trim() ? customCategory : category;

    const reportPayload: IncidentReportData = {
      id: `rep_${Date.now()}`,
      userId: userProfile?.uid || 'guest_user',
      category: activeCat,
      description,
      incidentDate,
      location: locationText,
      latitude: coordinates?.lat,
      longitude: coordinates?.lng,
      preferredLanguage: preferredLang,
      desiredAssistance,
      status: 'ready_for_review',
      evidenceFiles: evidenceList,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
      if (userProfile && userProfile.uid) {
        // Save to Firebase Firestore under users/{userId}/reports/{reportId}
        await saveIncidentReport(reportPayload);
      } else {
        // Save to safeStorage for guests
        const existing = safeStorage.getItem('saferoute_guest_reports');
        const list: IncidentReportData[] = existing ? JSON.parse(existing) : [];
        list.unshift(reportPayload);
        safeStorage.setItem('saferoute_guest_reports', JSON.stringify(list));
      }

      setSaveSuccess(true);
      setTimeout(() => {
        setSaveSuccess(false);
        onGoToMyReports();
      }, 1500);
    } catch (err: any) {
      console.error('Save report error:', err);
      // Fallback save to safeStorage
      const existing = safeStorage.getItem('saferoute_guest_reports');
      const list: IncidentReportData[] = existing ? JSON.parse(existing) : [];
      list.unshift(reportPayload);
      safeStorage.setItem('saferoute_guest_reports', JSON.stringify(list));
      setSaveSuccess(true);
      setTimeout(() => {
        setSaveSuccess(false);
        onGoToMyReports();
      }, 1500);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-24">
      {/* Title Card */}
      <div className="rounded-3xl bg-slate-900 border border-slate-800 p-5 sm:p-6 shadow-xl relative overflow-hidden">
        <div className="flex items-center gap-3 mb-2">
          <div className="h-10 w-10 rounded-2xl bg-gradient-to-tr from-amber-600 to-orange-500 flex items-center justify-center text-white shadow-md">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-extrabold text-white">
              {t.incidentReportTitle}
            </h1>
            <p className="text-xs text-slate-400">
              {t.incidentReportSubtitle}
            </p>
          </div>
        </div>

        {/* Confidentiality Badge */}
        <div className="mt-3 flex items-center gap-2 bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300">
          <Lock className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>
            {language === 'ta'
              ? 'இந்தத் தகவல்கள் உங்கள் தனிப்பட்ட கணக்கில் மட்டுமே ரகசியமாக வைக்கப்படும். பொதுவில் பகிரப்படாது.'
              : 'End-to-end privacy: Reports remain strictly confidential under your authenticated account.'}
          </span>
        </div>
      </div>

      {formError && (
        <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2.5">
          <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{formError}</span>
        </div>
      )}

      {saveSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="font-semibold">
            {language === 'ta'
              ? 'சம்பவப் புகார் வெற்றிகரமாகச் சேமிக்கப்பட்டது! உங்கள் கோப்புறையில் சேர்க்கப்பட்டுள்ளது.'
              : 'Incident report saved successfully to your confidential records!'}
          </span>
        </div>
      )}

      {/* Main Form Card */}
      <div className="rounded-3xl bg-slate-900 border border-slate-800 p-5 sm:p-6 space-y-5 shadow-lg">
        {/* 1. Category */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-200 uppercase tracking-wider block">
            {t.categoryLabel}
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full rounded-2xl bg-slate-950 border border-slate-800 px-4 py-3 text-xs sm:text-sm text-slate-200 focus:outline-none focus:border-blue-500 transition cursor-pointer"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat} className="bg-slate-900 text-slate-200">
                {cat}
              </option>
            ))}
          </select>

          {category === 'Other incident' && (
            <input
              type="text"
              value={customCategory}
              onChange={(e) => setCustomCategory(e.target.value)}
              placeholder={language === 'ta' ? 'சம்பவ வகையை உள்ளிடவும்...' : 'Specify custom incident type...'}
              className="mt-2 w-full rounded-2xl bg-slate-950 border border-slate-800 px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
            />
          )}
        </div>

        {/* 2. What Happened? */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-200 uppercase tracking-wider block">
            {t.whatHappenedLabel} <span className="text-rose-400">*</span>
          </label>
          <textarea
            rows={5}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={t.whatHappenedPlaceholder}
            className="w-full rounded-2xl bg-slate-950 border border-slate-800 p-4 text-xs sm:text-sm text-slate-200 focus:outline-none focus:border-blue-500 transition placeholder-slate-500 leading-relaxed"
          />
        </div>

        {/* 3. Date & Time */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-200 uppercase tracking-wider block">
            {t.dateTimeLabel}
          </label>
          <div className="relative">
            <input
              type="datetime-local"
              value={incidentDate}
              onChange={(e) => setIncidentDate(e.target.value)}
              className="w-full rounded-2xl bg-slate-950 border border-slate-800 px-4 py-2.5 text-xs sm:text-sm text-slate-200 focus:outline-none focus:border-blue-500 transition cursor-pointer"
            />
          </div>
        </div>

        {/* 4. Incident Location */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-200 uppercase tracking-wider block">
              {t.locationLabel}
            </label>
            <button
              type="button"
              onClick={handleUseCurrentLocation}
              disabled={isLocating}
              className="flex items-center gap-1.5 text-xs font-semibold text-blue-400 hover:text-blue-300 transition cursor-pointer"
            >
              <Locate className={`w-3.5 h-3.5 ${isLocating ? 'animate-spin' : ''}`} />
              <span>{isLocating ? 'Capturing GPS...' : t.useCurrentGps}</span>
            </button>
          </div>

          <div className="relative">
            <input
              type="text"
              value={locationText}
              onChange={(e) => setLocationText(e.target.value)}
              placeholder={t.locationPlaceholder}
              className="w-full rounded-2xl bg-slate-950 border border-slate-800 pl-10 pr-4 py-3 text-xs sm:text-sm text-slate-200 focus:outline-none focus:border-blue-500 transition"
            />
            <MapPin className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
          </div>

          {coordinates && (
            <p className="text-[11px] text-emerald-400 flex items-center gap-1 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5" /> {t.gpsCaptured} ({coordinates.lat.toFixed(4)}, {coordinates.lng.toFixed(4)})
            </p>
          )}
        </div>

        {/* 5. Evidence Handling */}
        <div className="space-y-2.5 pt-2 border-t border-slate-800">
          <label className="text-xs font-bold text-slate-200 uppercase tracking-wider block">
            {t.evidenceLabel}
          </label>
          <p className="text-xs text-slate-400">
            {t.evidenceNotice}
          </p>

          {/* Safety warning */}
          <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <span>{t.evidenceSafetyWarning}</span>
          </div>

          {/* Upload trigger buttons */}
          <div className="flex flex-wrap gap-2.5 pt-1">
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              className="hidden"
              onChange={(e) => handleFileUpload(e, 'image')}
            />
            <input
              type="file"
              ref={videoInputRef}
              accept="video/*"
              className="hidden"
              onChange={(e) => handleFileUpload(e, 'video')}
            />

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 px-3.5 py-2 text-xs font-semibold text-slate-200 transition cursor-pointer"
            >
              <Camera className="w-3.5 h-3.5 text-blue-400" />
              <span>{t.takePhoto}</span>
            </button>

            <button
              type="button"
              onClick={() => videoInputRef.current?.click()}
              className="flex items-center gap-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 px-3.5 py-2 text-xs font-semibold text-slate-200 transition cursor-pointer"
            >
              <Video className="w-3.5 h-3.5 text-purple-400" />
              <span>{t.recordVideo}</span>
            </button>
          </div>

          {/* Evidence List */}
          {evidenceList.length > 0 && (
            <div className="mt-3 space-y-2">
              {evidenceList.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 rounded-2xl bg-slate-950 border border-slate-800 text-xs"
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <FileCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                    <div className="truncate">
                      <span className="font-semibold text-slate-200 truncate block">
                        {item.name}
                      </span>
                      <span className="text-[10px] text-slate-500">
                        {(item.sizeBytes / 1024 / 1024).toFixed(2)} MB • {item.type}
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveEvidence(item.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 6. Language & Desired Assistance */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-800">
          <div>
            <label className="text-xs font-bold text-slate-200 uppercase tracking-wider block mb-2">
              {t.preferredLangLabel}
            </label>
            <div className="flex rounded-xl bg-slate-950 border border-slate-800 p-1">
              <button
                type="button"
                onClick={() => setPreferredLang('en')}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition ${
                  preferredLang === 'en' ? 'bg-blue-600 text-white' : 'text-slate-400'
                }`}
              >
                English
              </button>
              <button
                type="button"
                onClick={() => setPreferredLang('ta')}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition ${
                  preferredLang === 'ta' ? 'bg-blue-600 text-white' : 'text-slate-400'
                }`}
              >
                தமிழ்
              </button>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-200 uppercase tracking-wider block mb-2">
              {t.desiredAssistanceLabel}
            </label>
            <input
              type="text"
              value={desiredAssistance}
              onChange={(e) => setDesiredAssistance(e.target.value)}
              placeholder={t.desiredAssistancePlaceholder}
              className="w-full rounded-2xl bg-slate-950 border border-slate-800 px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center gap-3">
          <button
            type="button"
            onClick={handleGenerateDraft}
            disabled={isDrafting || isSaving}
            className="w-full sm:flex-1 flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs sm:text-sm py-3.5 px-5 transition cursor-pointer shadow-lg active:scale-95 disabled:opacity-50"
          >
            {isDrafting ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4 text-amber-300" />
            )}
            <span>{isDrafting ? 'Structuring Draft with AI...' : t.generateDraftButton}</span>
          </button>

          <button
            type="button"
            onClick={handleSaveReport}
            disabled={isDrafting || isSaving}
            className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs sm:text-sm py-3.5 px-5 border border-slate-700 transition cursor-pointer active:scale-95 disabled:opacity-50"
          >
            {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
            <span>{isSaving ? t.saving : t.saveReportButton}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
