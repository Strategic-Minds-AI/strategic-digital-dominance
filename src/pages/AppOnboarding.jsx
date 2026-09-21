import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserPlus, Mail, Lock, MapPin, Loader2, ArrowRight, CheckCircle2, Sparkles } from "lucide-react";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { LOGO_URL } from "@/components/Logo";
import BackButton from "@/components/BackButton";
import { toast } from "@/components/ui/use-toast";

const PERKS = [
  "Get exclusive offers only for Epoxy Pro App users",
  "Up-to-the-moment updates on your projects",
  "Opportunities to experience the most advanced products on the market",
];

export default function AppOnboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState("account"); // account | otp | done
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [location, setLocation] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAccount = async (e) => {
    e.preventDefault();
    setError("");
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    if (!location.trim()) {
      setError("Please enter your location so we can match you to your nearest dealer");
      return;
    }
    setLoading(true);
    try {
      await base44.auth.register({ email, password });
      setStep("otp");
    } catch (err) {
      setError(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    setError("");
    setLoading(true);
    try {
      const result = await base44.auth.verifyOtp({ email, otpCode });
      if (result?.access_token) {
        base44.auth.setToken(result.access_token);
      }
      try {
        await base44.auth.updateMe({ full_name: username, location: location.trim() });
      } catch (e) {
        // non-fatal — profile fields saved later if this fails
      }
      setStep("done");
      setTimeout(() => navigate("/funnel"), 1400);
    } catch (err) {
      setError(err.message || "Invalid verification code");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError("");
    try {
      await base44.auth.resendOtp(email);
      toast({ title: "Code sent", description: "Check your email for the new code." });
    } catch (err) {
      setError(err.message || "Failed to resend code");
    }
  };

  return (
    <div className="min-h-screen bg-stone-950 flex flex-col">
      {/* Header */}
      <header className="border-b border-amber-500/20 bg-stone-950/80 backdrop-blur sticky top-0 z-20">
        <div className="max-w-md mx-auto px-5 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BackButton className="text-stone-400 hover:text-white" showLabel={false} />
            <Link to="/" className="flex items-center gap-2">
              <img src={LOGO_URL} alt="XPS" className="h-8 w-8 object-contain" />
              <span className="text-white font-bold text-sm">Epoxy Pro App</span>
            </Link>
          </div>
          <Link to="/funnel" className="text-xs text-stone-400 hover:text-amber-500 transition">
            Skip for now
          </Link>
        </div>
      </header>

      <div className="flex-1 flex items-center justify-center px-5 py-10">
        <div className="w-full max-w-md">
          {/* Perks callout */}
          <div className="mb-6 rounded-2xl border-2 border-amber-500 bg-amber-500/10 p-5">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="h-5 w-5 text-amber-500" />
              <span className="text-sm font-bold text-amber-400 tracking-wide uppercase">App Member Perks</span>
            </div>
            <ul className="space-y-2">
              {PERKS.map((p, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-stone-200 leading-relaxed">
                  <CheckCircle2 className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                  <span>{p}</span>
                </li>
              ))}
            </ul>
          </div>

          {step === "account" && (
            <div className="rounded-2xl bg-white shadow-xl p-6 md:p-8">
              <div className="text-center mb-6">
                <img src={LOGO_URL} alt="XPS" className="w-14 h-14 object-contain mx-auto" />
                <h1 className="mt-3 text-2xl font-extrabold text-stone-900">Create your app account</h1>
                <p className="mt-1 text-sm text-stone-500">Then we'll walk you through your free floor estimate.</p>
              </div>

              {error && (
                <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">{error}</div>
              )}

              <form onSubmit={handleAccount} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="username">Username</Label>
                  <div className="relative">
                    <UserPlus className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                    <Input
                      id="username"
                      type="text"
                      autoFocus
                      placeholder="Choose a username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="pl-10 h-12"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="email">Email address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                    <Input
                      id="email"
                      type="email"
                      autoComplete="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10 h-12"
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                      <Input
                        id="password"
                        type="password"
                        autoComplete="new-password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-10 h-12"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="confirm">Confirm</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                      <Input
                        id="confirm"
                        type="password"
                        autoComplete="new-password"
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="pl-10 h-12"
                        required
                      />
                    </div>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="location">Your location (ZIP code or city, state)</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                    <Input
                      id="location"
                      type="text"
                      placeholder="33069"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="pl-10 h-12"
                      required
                    />
                  </div>
                  <p className="text-xs text-stone-400">Used to match you with your nearest XPS dealer.</p>
                </div>
                <Button type="submit" className="w-full h-12 font-bold text-base" disabled={loading}>
                  {loading ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Creating account...</>
                  ) : (
                    <>Create account & start estimate <ArrowRight className="w-4 h-4 ml-2" /></>
                  )}
                </Button>
              </form>

              <p className="mt-5 text-center text-xs text-stone-400">
                Already have an account?{" "}
                <Link to="/login" className="text-amber-600 font-semibold hover:underline">Log in</Link>
              </p>
            </div>
          )}

          {step === "otp" && (
            <div className="rounded-2xl bg-white shadow-xl p-6 md:p-8">
              <div className="text-center mb-6">
                <div className="w-14 h-14 rounded-full bg-amber-500/10 flex items-center justify-center mx-auto">
                  <Mail className="h-7 w-7 text-amber-600" />
                </div>
                <h1 className="mt-3 text-2xl font-extrabold text-stone-900">Verify your email</h1>
                <p className="mt-1 text-sm text-stone-500">We sent a 6-digit code to {email}</p>
              </div>

              {error && (
                <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">{error}</div>
              )}

              <div className="flex justify-center mb-6">
                <InputOTP maxLength={6} value={otpCode} onChange={setOtpCode} autoFocus autoComplete="one-time-code">
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
              </div>
              <Button className="w-full h-12 font-bold text-base" onClick={handleVerify} disabled={loading || otpCode.length < 6}>
                {loading ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Verifying...</>
                ) : (
                  <>Verify & continue <ArrowRight className="w-4 h-4 ml-2" /></>
                )}
              </Button>
              <p className="text-center text-sm text-stone-500 mt-4">
                Didn't receive the code?{" "}
                <button onClick={handleResend} className="text-amber-600 font-semibold hover:underline">Resend</button>
              </p>
            </div>
          )}

          {step === "done" && (
            <div className="rounded-2xl bg-white shadow-xl p-8 text-center">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto">
                <CheckCircle2 className="h-9 w-9 text-green-600" />
              </div>
              <h1 className="mt-4 text-2xl font-extrabold text-stone-900">Account created!</h1>
              <p className="mt-2 text-sm text-stone-500">Taking you to your free floor estimate...</p>
              <div className="mt-5 flex justify-center">
                <Loader2 className="w-6 h-6 text-amber-500 animate-spin" />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}