import React, { useState, useRef } from 'react';
import {
  Camera,
  Upload,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Info,
  ShieldCheck,
  RefreshCw,
  Eye,
  Sliders,
  ChevronRight,
  ShieldAlert
} from 'lucide-react';

export const AIVisionScreen: React.FC = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMsg('Please select a valid image file (JPEG, PNG, WebP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setSelectedImage(reader.result as string);
      setAnalysisResult(null);
      setErrorMsg(null);
      setIsDemoMode(false);
    };
    reader.readAsDataURL(file);
  };

  const handleAnalyzeImage = async () => {
    if (!selectedImage) return;

    setAnalyzing(true);
    setErrorMsg(null);
    setAnalysisResult(null);

    try {
      const res = await fetch('/api/barrier-vision', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: selectedImage,
          mimeType: 'image/jpeg',
          locationNote: 'Pedestrian sidewalk view',
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 503) {
          setErrorMsg(
            'GEMINI_API_KEY is not configured in Secrets. Configure GEMINI_API_KEY to run live multimodal vision inspection, or test with sample audit data below.'
          );
        } else {
          setErrorMsg(data.error || 'Failed to analyze barrier photo.');
        }
        return;
      }

      setAnalysisResult(data.analysis);
      setIsDemoMode(false);
    } catch (err: any) {
      setErrorMsg(err.message || 'Network error communicating with vision backend.');
    } finally {
      setAnalyzing(false);
    }
  };

  // Sample audit demonstration when API key is not configured
  const handleLoadSampleAnalysis = () => {
    setIsDemoMode(true);
    setErrorMsg(null);
    setAnalysisResult({
      summary: 'Moderate physical barriers observed: 6 stone risers without adjacent ramp, with uneven pavement transition.',
      accessibility_rating: 'moderate_difficulty',
      confidence_percentage: 88,
      detected_barriers: [
        {
          type: 'stairs',
          severity: 'high',
          description: 'Flight of 6 unpainted stone steps without handrails or contrast edges.',
          affected_profiles: ['wheelchair', 'elderly', 'walking_difficulty'],
        },
        {
          type: 'uneven_surface',
          severity: 'medium',
          description: 'Cracked concrete flagstones at landing with 2cm vertical lip.',
          affected_profiles: ['wheelchair', 'elderly'],
        },
      ],
      positive_signals: [
        {
          feature: 'Adequate pathway width',
          description: 'Sidewalk clearance exceeds 140cm, allowing rollator and companion walking.',
        },
      ],
      recommendation: 'Not recommended for manual wheelchairs without assistance. Use the alternative ramp entrance located 60m east.',
    });
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-purple-600/20 text-purple-400 border border-purple-500/30">
            <Camera className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400 bg-purple-500/10 px-2.5 py-0.5 rounded-full border border-purple-500/20">
                Multimodal Computer Vision
              </span>
            </div>
            <h1 className="text-lg font-extrabold text-white mt-0.5">AI Barrier Scanner</h1>
            <p className="text-xs text-slate-400">
              Upload a photo of a sidewalk, curb, or building entrance to detect stairs, ramps, and trip hazards with Gemini.
            </p>
          </div>
        </div>
      </div>

      {/* Image Capture / Upload Area */}
      <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-xl space-y-4">
        <input
          type="file"
          ref={fileInputRef}
          accept="image/*"
          capture="environment"
          onChange={handleFileChange}
          className="hidden"
        />

        {!selectedImage ? (
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-slate-700 hover:border-purple-500/60 rounded-2xl p-8 text-center cursor-pointer transition bg-slate-950/50 group"
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-500/10 text-purple-400 border border-purple-500/20 mx-auto group-hover:scale-105 transition mb-3">
              <Camera className="w-7 h-7" />
            </div>
            <h3 className="text-sm font-bold text-white">Capture or Upload Sidewalk Photo</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              Snap steps, ramps, cracked paving or street crossings to evaluate physical barrier risks.
            </p>
            <div className="mt-4 inline-flex items-center gap-2 rounded-xl bg-purple-600 hover:bg-purple-500 px-4 py-2 text-xs font-bold text-white shadow-md transition">
              <Upload className="w-3.5 h-3.5" />
              <span>Select Photo</span>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="relative rounded-2xl overflow-hidden border border-slate-700 max-h-80 flex items-center justify-center bg-black">
              <img
                src={selectedImage}
                alt="Selected barrier photo"
                className="max-h-80 w-auto object-contain"
              />
              <button
                onClick={() => {
                  setSelectedImage(null);
                  setAnalysisResult(null);
                }}
                className="absolute top-3 right-3 bg-slate-900/80 hover:bg-slate-900 text-white rounded-xl px-3 py-1.5 text-xs font-semibold backdrop-blur-md border border-slate-700"
              >
                Change Photo
              </button>
            </div>

            <button
              onClick={handleAnalyzeImage}
              disabled={analyzing}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 py-3 text-xs font-bold text-white shadow-md transition cursor-pointer"
            >
              {analyzing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Inspecting Infrastructure with Gemini 3.8 Flash...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Analyze Physical Accessibility</span>
                </>
              )}
            </button>
          </div>
        )}

        {/* Error / Key Guidance */}
        {errorMsg && (
          <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-500/30 text-xs text-amber-200 space-y-2">
            <div className="flex items-center gap-2 font-bold text-amber-300">
              <AlertTriangle className="w-4 h-4" />
              <span>Model Endpoint Notice</span>
            </div>
            <p className="leading-relaxed">{errorMsg}</p>
            <button
              onClick={handleLoadSampleAnalysis}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-600/30 hover:bg-amber-600/50 border border-amber-500/40 text-amber-100 font-semibold text-xs transition"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Preview Demo Barrier Analysis Schema</span>
            </button>
          </div>
        )}
      </div>

      {/* Analysis Results Display */}
      {analysisResult && (
        <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-xl space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-purple-400">
                  {isDemoMode ? 'Demo / Simulation Inspection' : 'Live Gemini Model Inspection'}
                </span>
                {isDemoMode && (
                  <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded text-slate-400">
                    Sample Data
                  </span>
                )}
              </div>
              <h2 className="text-base font-extrabold text-white mt-1">Infrastructure Assessment</h2>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="text-xs font-bold text-slate-400">Confidence</div>
                <div className="text-lg font-extrabold text-purple-400 font-mono">
                  {analysisResult.confidence_percentage}%
                </div>
              </div>
            </div>
          </div>

          {/* Verdict Banner */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Verdict</span>
            <p className="text-xs text-slate-200 leading-relaxed font-medium">
              {analysisResult.summary}
            </p>
          </div>

          {/* Detected Barriers */}
          {analysisResult.detected_barriers?.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Detected Physical Obstacles ({analysisResult.detected_barriers.length})
              </h3>
              <div className="space-y-2">
                {analysisResult.detected_barriers.map((bar: any, idx: number) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl bg-amber-950/20 border border-amber-500/20 text-xs space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white uppercase text-[11px]">
                        {bar.type.replace('_', ' ')}
                      </span>
                      <span className="text-[10px] uppercase font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded">
                        {bar.severity} Severity
                      </span>
                    </div>
                    <p className="text-amber-200/90">{bar.description}</p>
                    {bar.affected_profiles && (
                      <div className="flex flex-wrap gap-1 pt-1">
                        {bar.affected_profiles.map((p: string, i: number) => (
                          <span key={i} className="rounded bg-slate-900 px-1.5 py-0.5 text-[10px] text-slate-300">
                            Impacts {p}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Positive Signals */}
          {analysisResult.positive_signals?.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Positive Accessibility Features
              </h3>
              <div className="space-y-2">
                {analysisResult.positive_signals.map((pos: any, idx: number) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/20 text-xs flex items-start gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-white">{pos.feature}</span>
                      <p className="text-emerald-200/90 mt-0.5">{pos.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recommendation */}
          {analysisResult.recommendation && (
            <div className="p-4 rounded-2xl bg-blue-950/30 border border-blue-500/30 text-xs space-y-1">
              <span className="font-bold text-blue-300 uppercase text-[10px] tracking-wider">
                Pedestrian Guidance Recommendation:
              </span>
              <p className="text-slate-200 leading-relaxed font-medium">
                {analysisResult.recommendation}
              </p>
            </div>
          )}

          <div className="text-[10px] text-slate-500 flex items-center gap-1 pt-2">
            <Info className="w-3.5 h-3.5 shrink-0" />
            <span>AI vision observations are assistive estimations and do not replace certified on-site structural accessibility audits.</span>
          </div>
        </div>
      )}
    </div>
  );
};
