import React, { useState, useEffect } from 'react';
import {
  Shield,
  Accessibility,
  Compass,
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Locate,
  Loader2,
  ChevronRight,
  FileText,
  ShieldCheck,
  X,
  Sparkles,
  MapPin,
  Volume2,
  Sliders,
  RefreshCw,
} from 'lucide-react';
import {
  auth,
  signInWithGoogle,
  loginWithEmail,
  registerWithEmail,
  resetPassword,
  saveUserProfile,
  getUserProfile,
  isFirebaseConfigured,
  UserProfileData,
} from '../../services/firebase';
import { MOBILITY_PROFILES } from '../../data/mobilityProfiles';
import { MobilityProfile, MobilityPreferences, Coordinates } from '../../types';
import { requestCurrentPosition } from '../../services/locationService';
import { reverseGeocode } from '../../services/mapboxService';

interface Props {
  onAuthSuccess: (userProfile: UserProfileData) => void;
  onContinueAsGuest: () => void;
  onClose?: () => void;
  initialMode?: 'auth' | 'onboarding';
}

export const AuthAndOnboardingScreen: React.FC<Props> = ({
  onAuthSuccess,
  onContinueAsGuest,
  onClose,
  initialMode = 'auth',
}) => {
  // Mode: 'auth' | 'onboarding'
  const [currentMode, setCurrentMode] = useState<'auth' | 'onboarding'>(initialMode);
  // Auth tab: 'signin' | 'signup' | 'forgot'
  const [authTab, setAuthTab] = useState<'signin' | 'signup' | 'forgot'>('signin');

  // Form states
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Status & feedback
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  // Policy modal
  const [showPolicyModal, setShowPolicyModal] = useState<'terms' | 'privacy' | null>(null);

  // Onboarding states
  const [onboardingUid, setOnboardingUid] = useState<string>('');
  const [onboardingStep, setOnboardingStep] = useState<1 | 2 | 3>(1);
  const [locationName, setLocationName] = useState<string>('San Francisco, CA');
  const [locationCoords, setLocationCoords] = useState<Coordinates | undefined>(undefined);
  const [isLocating, setIsLocating] = useState(false);
  const [selectedProfileId, setSelectedProfileId] = useState<string>('wheelchair');
  const [preferences, setPreferences] = useState<MobilityPreferences>(() => {
    return MOBILITY_PROFILES[0].defaultPreferences;
  });

  // Check current auth user on mount
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
      if (currentUser && currentMode === 'auth') {
        setLoading(true);
        try {
          const profile = await getUserProfile(currentUser.uid);
          if (profile && profile.onboardingCompleted) {
            onAuthSuccess(profile);
          } else {
            // Need onboarding
            setOnboardingUid(currentUser.uid);
            setFullName(currentUser.displayName || profile?.fullName || '');
            setEmail(currentUser.email || profile?.email || '');
            setCurrentMode('onboarding');
          }
        } catch {
          // Fallback to onboarding
          setOnboardingUid(currentUser.uid);
          setFullName(currentUser.displayName || '');
          setEmail(currentUser.email || '');
          setCurrentMode('onboarding');
        } finally {
          setLoading(false);
        }
      }
    });

    return () => unsubscribe();
  }, [currentMode, onAuthSuccess]);

  // When selectedProfileId changes, sync default preferences
  const handleSelectProfile = (profile: MobilityProfile) => {
    setSelectedProfileId(profile.id);
    setPreferences(profile.defaultPreferences);
  };

  // Google sign in handler
  const handleGoogleSignIn = async () => {
    if (!isFirebaseConfigured) {
      setErrorMessage(
        'Firebase configuration is not active. Please ensure your Firebase credentials are provisioned.'
      );
      return;
    }
    setLoading(true);
    setErrorMessage(null);
    try {
      const result = await signInWithGoogle();
      const user = result.user;
      const existingProfile = await getUserProfile(user.uid);
      if (existingProfile && existingProfile.onboardingCompleted) {
        onAuthSuccess(existingProfile);
      } else {
        setOnboardingUid(user.uid);
        setFullName(user.displayName || '');
        setEmail(user.email || '');
        setCurrentMode('onboarding');
      }
    } catch (err: any) {
      if (err.code === 'auth/popup-closed-by-user') {
        setErrorMessage('Google sign-in popup was closed before completion.');
      } else if (err.code === 'auth/cancelled-popup-request') {
        setErrorMessage('Sign-in was cancelled.');
      } else {
        setErrorMessage(err.message || 'Unable to sign in with Google. Please check your credentials.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Email Sign In handler
  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setErrorMessage('Please enter both your email and password.');
      return;
    }
    setLoading(true);
    setErrorMessage(null);
    try {
      const cred = await loginWithEmail(email.trim(), password);
      const user = cred.user;
      const existingProfile = await getUserProfile(user.uid);
      if (existingProfile && existingProfile.onboardingCompleted) {
        onAuthSuccess(existingProfile);
      } else {
        setOnboardingUid(user.uid);
        setFullName(user.displayName || existingProfile?.fullName || email.split('@')[0]);
        setEmail(user.email || email);
        setCurrentMode('onboarding');
      }
    } catch (err: any) {
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password') {
        setErrorMessage('Invalid email or password. Please verify and try again.');
      } else if (err.code === 'auth/user-not-found') {
        setErrorMessage('No user account found with this email. Click "Create Account" above.');
      } else {
        setErrorMessage(err.message || 'Failed to sign in. Please verify your credentials.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Email Sign Up handler
  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      setErrorMessage('Please provide your full name.');
      return;
    }
    if (!email.trim()) {
      setErrorMessage('Please provide a valid email address.');
      return;
    }
    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match. Please re-type your confirm password.');
      return;
    }

    setLoading(true);
    setErrorMessage(null);
    try {
      const cred = await registerWithEmail(email.trim(), password, fullName.trim());
      const user = cred.user;
      setOnboardingUid(user.uid);
      setCurrentMode('onboarding');
    } catch (err: any) {
      if (err.code === 'auth/email-already-in-use') {
        setErrorMessage('This email is already registered. Please switch to the Sign In tab.');
      } else if (err.code === 'auth/weak-password') {
        setErrorMessage('Password is too weak. Please choose a stronger password.');
      } else {
        setErrorMessage(err.message || 'Failed to create account. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Password reset handler
  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setErrorMessage('Please enter your account email to receive the password reset link.');
      return;
    }
    setLoading(true);
    setErrorMessage(null);
    try {
      await resetPassword(email.trim());
      setSuccessNotice(`Password reset instructions have been dispatched to ${email.trim()}.`);
      setAuthTab('signin');
    } catch (err: any) {
      setErrorMessage(err.message || 'Unable to send password reset email.');
    } finally {
      setLoading(false);
    }
  };

  // GPS auto-detect for onboarding
  const handleDetectLocation = async () => {
    setIsLocating(true);
    try {
      const res = await requestCurrentPosition();
      if (res.status === 'success' && res.coordinates) {
        setLocationCoords(res.coordinates);
        // Reverse geocode if available
        const geocoded = await reverseGeocode(res.coordinates.lng, res.coordinates.lat);
        if (geocoded) {
          setLocationName(geocoded);
        } else {
          setLocationName(
            `${res.coordinates.lat.toFixed(4)}, ${res.coordinates.lng.toFixed(4)}`
          );
        }
      } else {
        setErrorMessage(res.errorMessage || 'Unable to retrieve location.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to obtain GPS coordinates.');
    } finally {
      setIsLocating(false);
    }
  };

  // Complete onboarding and save to Firestore
  const handleSaveOnboardingProfile = async () => {
    if (!fullName.trim()) {
      setErrorMessage('Please provide your full name before continuing.');
      setOnboardingStep(1);
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    const profilePayload: UserProfileData = {
      uid: onboardingUid || auth.currentUser?.uid || `guest-${Date.now()}`,
      fullName: fullName.trim(),
      email: email.trim() || auth.currentUser?.email || '',
      currentLocationName: locationName,
      currentLocationLat: locationCoords?.lat,
      currentLocationLng: locationCoords?.lng,
      mobilityProfile: selectedProfileId,
      mobilityPreferences: preferences,
      onboardingCompleted: true,
      updatedAt: new Date().toISOString(),
    };

    try {
      // If user is authenticated, save directly to Firestore
      if (auth.currentUser) {
        await saveUserProfile(profilePayload);
      }
      // Save local backup
      localStorage.setItem('saferoute_user_profile', JSON.stringify(profilePayload));
      localStorage.setItem('saferoute_active_profile', selectedProfileId);
      localStorage.setItem('saferoute_preferences', JSON.stringify(preferences));
      localStorage.setItem('saferoute_onboarding_seen', 'true');

      onAuthSuccess(profilePayload);
    } catch (err: any) {
      console.error('Failed to save user profile:', err);
      // Still allow progression if network is offline
      onAuthSuccess(profilePayload);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-4 overflow-y-auto">
      <div className="w-full max-w-xl my-auto rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden text-slate-100 relative">
        {/* Optional close button if invoked from settings */}
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-20 p-2 rounded-xl bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-700 transition"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        {/* ================= MODE: AUTHENTICATION ================= */}
        {currentMode === 'auth' && (
          <div className="p-6 sm:p-8 space-y-6">
            {/* Header with Brand & Accessible Art Illustration */}
            <div className="text-center space-y-3">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-600 to-cyan-500 shadow-lg shadow-blue-500/25">
                <Shield className="h-7 w-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-extrabold tracking-tight text-white">
                  SafeRoute<span className="text-blue-400"> AI</span>
                </h1>
                <p className="text-xs font-semibold uppercase tracking-wider text-blue-400 mt-0.5">
                  The best route is the one that works for you
                </p>
                <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                  Accessible, human-centric route planning tailored to your physical mobility, safety, and comfort.
                </p>
              </div>

              {/* Accessible Navigation Vector Illustration */}
              <div className="py-2">
                <div className="mx-auto max-w-xs h-28 rounded-2xl bg-gradient-to-b from-blue-950/50 to-slate-900 border border-blue-500/20 p-3 flex items-center justify-around relative overflow-hidden">
                  <div className="absolute inset-0 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:16px_16px] opacity-20" />
                  
                  {/* Wheelchair icon */}
                  <div className="flex flex-col items-center gap-1 z-10">
                    <div className="w-10 h-10 rounded-full bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400 shadow-md">
                      <Accessibility className="w-5 h-5 text-blue-400" />
                    </div>
                    <span className="text-[10px] text-slate-300 font-medium">Accessible</span>
                  </div>

                  {/* Connected Smooth Path */}
                  <div className="flex-1 flex items-center justify-center px-2 z-10">
                    <div className="w-full flex items-center">
                      <div className="h-1 flex-1 bg-gradient-to-r from-blue-500 via-cyan-400 to-emerald-400 rounded-full" />
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 ring-4 ring-emerald-500/20 animate-pulse" />
                    </div>
                  </div>

                  {/* Safe Arrival Marker */}
                  <div className="flex flex-col items-center gap-1 z-10">
                    <div className="w-10 h-10 rounded-full bg-emerald-600/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow-md">
                      <MapPin className="w-5 h-5 text-emerald-400" />
                    </div>
                    <span className="text-[10px] text-slate-300 font-medium">Safe Arrival</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Error & Success Feedback */}
            {errorMessage && (
              <div className="rounded-2xl bg-rose-500/10 border border-rose-500/30 p-3.5 flex items-start gap-2.5 text-xs text-rose-300 animate-in fade-in">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span className="flex-1 leading-relaxed">{errorMessage}</span>
                <button
                  onClick={() => setErrorMessage(null)}
                  className="text-rose-400 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {successNotice && (
              <div className="rounded-2xl bg-emerald-500/10 border border-emerald-500/30 p-3.5 flex items-start gap-2.5 text-xs text-emerald-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span className="flex-1 leading-relaxed">{successNotice}</span>
              </div>
            )}

            {/* Primary Action: Continue with Google */}
            <div className="space-y-3">
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-2xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-sm shadow-md transition active:scale-[0.99] disabled:opacity-50 cursor-pointer"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin text-slate-900" />
                ) : (
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                )}
                <span>Continue with Google</span>
              </button>

              <div className="relative flex items-center justify-center my-3">
                <div className="border-t border-slate-800 w-full" />
                <span className="bg-slate-900 px-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  or continue with email
                </span>
              </div>
            </div>

            {/* Email Sign In / Sign Up Tabs */}
            <div className="space-y-4">
              <div className="flex rounded-xl bg-slate-950 p-1 border border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setAuthTab('signin');
                    setErrorMessage(null);
                  }}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition ${
                    authTab === 'signin'
                      ? 'bg-blue-600 text-white shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAuthTab('signup');
                    setErrorMessage(null);
                  }}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition ${
                    authTab === 'signup'
                      ? 'bg-blue-600 text-white shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Create Account
                </button>
              </div>

              {/* Sign In Form */}
              {authTab === 'signin' && (
                <form onSubmit={handleEmailSignIn} className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        required
                        className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-blue-500 transition"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-semibold text-slate-300">Password</label>
                      <button
                        type="button"
                        onClick={() => {
                          setAuthTab('forgot');
                          setErrorMessage(null);
                        }}
                        className="text-[11px] text-blue-400 hover:underline"
                      >
                        Forgot password?
                      </button>
                    </div>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                        className="w-full pl-9 pr-10 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-blue-500 transition"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-200"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full mt-2 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                    <span>Sign In</span>
                  </button>
                </form>
              )}

              {/* Sign Up Form */}
              {authTab === 'signup' && (
                <form onSubmit={handleEmailSignUp} className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Full Name
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Alex Morgan"
                        required
                        className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-blue-500 transition"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        required
                        className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-blue-500 transition"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Password
                      </label>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Min. 6 chars"
                          required
                          className="w-full pl-9 pr-9 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-blue-500 transition"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-2.5 top-2.5 text-slate-400 hover:text-white"
                        >
                          {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Confirm Password
                      </label>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                        <input
                          type={showConfirmPassword ? 'text' : 'password'}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="Repeat password"
                          required
                          className="w-full pl-9 pr-9 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-blue-500 transition"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-2.5 top-2.5 text-slate-400 hover:text-white"
                        >
                          {showConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full mt-2 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                    <span>Create Account & Continue</span>
                  </button>
                </form>
              )}

              {/* Forgot Password Form */}
              {authTab === 'forgot' && (
                <form onSubmit={handlePasswordReset} className="space-y-3">
                  <p className="text-xs text-slate-300">
                    Enter the email associated with your account, and we will send a password reset link.
                  </p>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Account Email
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        required
                        className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-blue-500 transition"
                      />
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setAuthTab('signin')}
                      className="flex-1 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300"
                    >
                      Back to Sign In
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs font-bold text-white shadow flex items-center justify-center gap-1.5"
                    >
                      {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                      <span>Send Reset Link</span>
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* Guest Option */}
            <div className="pt-2 border-t border-slate-800 text-center">
              <button
                type="button"
                onClick={onContinueAsGuest}
                className="w-full py-2.5 rounded-2xl bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-bold transition flex items-center justify-center gap-2 border border-slate-700/80 cursor-pointer"
              >
                <span>Continue as Guest</span>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>
              <p className="text-[11px] text-slate-500 mt-2">
                Guest sessions store route history locally without cloud synchronization.
              </p>
            </div>

            {/* Terms & Privacy Links */}
            <div className="flex items-center justify-center gap-4 text-[11px] text-slate-400 pt-1">
              <button
                type="button"
                onClick={() => setShowPolicyModal('terms')}
                className="hover:text-blue-400 underline decoration-slate-600 cursor-pointer"
              >
                Terms of Service
              </button>
              <span>•</span>
              <button
                type="button"
                onClick={() => setShowPolicyModal('privacy')}
                className="hover:text-blue-400 underline decoration-slate-600 cursor-pointer"
              >
                Privacy Policy
              </button>
            </div>
          </div>
        )}

        {/* ================= MODE: FIRST-TIME USER ONBOARDING ================= */}
        {currentMode === 'onboarding' && (
          <div className="p-6 sm:p-8 space-y-6">
            {/* Onboarding Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-500 shadow-md">
                  <Accessibility className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h2 className="text-base font-extrabold text-white">
                    Personalize Your Mobility Profile
                  </h2>
                  <p className="text-xs text-slate-400">
                    Step {onboardingStep} of 3 — Tailoring SafeRoute AI to your exact requirements
                  </p>
                </div>
              </div>
            </div>

            {/* Step Indicators */}
            <div className="flex items-center gap-2">
              {[1, 2, 3].map((s) => (
                <div
                  key={s}
                  className={`h-1.5 flex-1 rounded-full transition-all ${
                    s <= onboardingStep ? 'bg-blue-500' : 'bg-slate-800'
                  }`}
                />
              ))}
            </div>

            {errorMessage && (
              <div className="rounded-xl bg-rose-500/10 border border-rose-500/30 p-3 text-xs text-rose-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* STEP 1: Personal & Current Location */}
            {onboardingStep === 1 && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Your Full Name
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Account Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    disabled
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/50 border border-slate-800 text-sm text-slate-400 cursor-not-allowed"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold text-slate-300">
                      Primary Locality / Base Area
                    </label>
                    <button
                      type="button"
                      onClick={handleDetectLocation}
                      disabled={isLocating}
                      className="flex items-center gap-1.5 text-xs font-bold text-blue-400 hover:text-blue-300 transition cursor-pointer"
                    >
                      {isLocating ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Locate className="w-3.5 h-3.5" />
                      )}
                      <span>Use My Current Location</span>
                    </button>
                  </div>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      value={locationName}
                      onChange={(e) => setLocationName(e.target.value)}
                      placeholder="e.g. San Francisco, CA"
                      className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Used to set your map center and localized sidewalk intelligence on boot.
                  </p>
                </div>
              </div>
            )}

            {/* STEP 2: Mobility Profile Selection */}
            {onboardingStep === 2 && (
              <div className="space-y-3">
                <p className="text-xs text-slate-300">
                  Select your primary mobility context. This dictates our baseline barrier scoring penalties.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-72 overflow-y-auto pr-1">
                  {MOBILITY_PROFILES.map((p) => {
                    const isSelected = p.id === selectedProfileId;
                    return (
                      <div
                        key={p.id}
                        onClick={() => handleSelectProfile(p)}
                        className={`p-3.5 rounded-2xl border text-left cursor-pointer transition ${
                          isSelected
                            ? 'bg-blue-600/15 border-blue-500 ring-1 ring-blue-500/50 text-white'
                            : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-bold text-white flex items-center gap-1.5">
                            {p.name}
                          </span>
                          {isSelected && <CheckCircle2 className="w-4 h-4 text-blue-400" />}
                        </div>
                        <p className="text-[11px] text-slate-400 leading-tight">
                          {p.tagline}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* STEP 3: Fine-Grained Preferences & Voice Guidance */}
            {onboardingStep === 3 && (
              <div className="space-y-4 max-h-80 overflow-y-auto pr-1">
                <p className="text-xs text-slate-300">
                  Fine-tune your routing constraints. The scoring engine evaluates each route against these settings.
                </p>

                <div className="space-y-2">
                  {[
                    { key: 'avoidStairs', label: 'Strictly Avoid Stairs', desc: 'Require elevators or gentle ramps at elevation shifts' },
                    { key: 'preferRamps', label: 'Prioritize Ramps & Curb Cuts', desc: 'Favor corners with ADA compliant sloped curbs' },
                    { key: 'avoidSteepSlopes', label: 'Avoid Steep Incline Slopes', desc: 'Keep pathway gradients below 5% grade' },
                    { key: 'preferStableSurfaces', label: 'Prefer Smooth Pavement', desc: 'Avoid cobblestone, unpaved gravel, or cracked asphalt' },
                    { key: 'preferSaferCrossings', label: 'Prefer Signalized Crossings', desc: 'Route through intersections with pedestrian signals' },
                    { key: 'avoidNarrowPassages', label: 'Avoid Narrow Walkways', desc: 'Ensure at least 36-inch clearance for mobility aids' },
                    { key: 'enableSpokenGuidance', label: 'Spoken Voice Audio Guidance', desc: 'Read out step-by-step turns and hazard alerts' },
                  ].map((item) => {
                    const checked = !!(preferences as any)[item.key];
                    return (
                      <label
                        key={item.key}
                        className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800/80 cursor-pointer hover:border-slate-700 transition"
                      >
                        <div className="pr-3">
                          <span className="text-xs font-bold text-white block">{item.label}</span>
                          <span className="text-[10px] text-slate-400">{item.desc}</span>
                        </div>
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={(e) =>
                            setPreferences({
                              ...preferences,
                              [item.key]: e.target.checked,
                            })
                          }
                          className="h-4 w-4 rounded border-slate-700 text-blue-600 focus:ring-blue-500"
                        />
                      </label>
                    );
                  })}
                </div>

                {/* Max Walking Distance */}
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-200 mb-1">
                    <span>Preferred Max Walking Distance</span>
                    <span className="text-blue-400 font-mono">
                      {preferences.maxWalkingDistanceMeters || 1200} m
                    </span>
                  </div>
                  <input
                    type="range"
                    min="400"
                    max="4000"
                    step="100"
                    value={preferences.maxWalkingDistanceMeters || 1200}
                    onChange={(e) =>
                      setPreferences({
                        ...preferences,
                        maxWalkingDistanceMeters: Number(e.target.value),
                      })
                    }
                    className="w-full accent-blue-500"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                    <span>400m (Close)</span>
                    <span>4,000m (Long Distance)</span>
                  </div>
                </div>
              </div>
            )}

            {/* Onboarding Navigation Footer */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-800">
              {onboardingStep > 1 ? (
                <button
                  type="button"
                  onClick={() => setOnboardingStep((prev) => (prev - 1) as any)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 transition"
                >
                  Previous
                </button>
              ) : (
                <div />
              )}

              {onboardingStep < 3 ? (
                <button
                  type="button"
                  onClick={() => {
                    if (onboardingStep === 1 && !fullName.trim()) {
                      setErrorMessage('Please enter your full name.');
                      return;
                    }
                    setErrorMessage(null);
                    setOnboardingStep((prev) => (prev + 1) as any);
                  }}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs font-bold text-white shadow-md transition"
                >
                  <span>Continue</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSaveOnboardingProfile}
                  disabled={loading}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-xs font-bold text-white shadow-md transition disabled:opacity-50"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                  <span>Save Profile & Start Navigating</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* ================= MODAL: TERMS & PRIVACY ================= */}
        {showPolicyModal && (
          <div className="absolute inset-0 z-30 bg-slate-950/95 p-6 flex flex-col justify-between overflow-y-auto animate-in fade-in">
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-400" />
                  <h3 className="text-sm font-bold text-white">
                    {showPolicyModal === 'terms'
                      ? 'SafeRoute AI Terms of Service'
                      : 'SafeRoute AI Privacy Policy'}
                  </h3>
                </div>
                <button
                  onClick={() => setShowPolicyModal(null)}
                  className="p-1 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="text-xs text-slate-300 space-y-3 leading-relaxed">
                {showPolicyModal === 'terms' ? (
                  <>
                    <p>
                      <strong>1. Inclusive Navigation Notice:</strong> SafeRoute AI provides route recommendations using crowdsourced obstacle data, computer vision, and open spatial mapping. While we strive for maximum accuracy, urban environments change frequently. Always assess real-world conditions for your immediate safety.
                    </p>
                    <p>
                      <strong>2. Community Reporting:</strong> User-submitted hazard reports (such as broken elevators, construction barriers, or missing ramps) are verified and shared to assist the community. Submissions must not contain abusive or unlawful content.
                    </p>
                    <p>
                      <strong>3. Service Availability:</strong> SafeRoute AI is provided as-is without warranties of uninterrupted spatial service. Routing geometry is computed with Mapbox Directions and our proprietary multi-factor accessibility engine.
                    </p>
                  </>
                ) : (
                  <>
                    <p>
                      <strong>1. Respect for Location Privacy:</strong> SafeRoute AI accesses your device GPS strictly when you tap &quot;Use My Current Location&quot;. We do not operate continuous background location tracking or sell personal geolocation coordinates.
                    </p>
                    <p>
                      <strong>2. Secure Profile Storage:</strong> Your mobility settings and route preferences are securely stored in your private Firestore record under strict ABAC rules. Only you can view or modify your personal profile.
                    </p>
                    <p>
                      <strong>3. AI Computer Vision Safety:</strong> Photos captured for sidewalk hazard detection are processed securely via server-side Gemini 3.8 Flash to identify physical obstacles. No facial recognition or biometric profiling is executed.
                    </p>
                  </>
                )}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setShowPolicyModal(null)}
                className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs"
              >
                Close & Return
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
