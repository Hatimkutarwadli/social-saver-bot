import { useState } from "react";
import { ShieldCheck, Smartphone, ArrowRight, Loader2, Sparkles } from "lucide-react";

export default function Login({ setUserData }) {
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Use environment variable for production, fallback to production URL
  const BASE_URL = import.meta.env.VITE_API_URL || "https://social-saver-bot-tpyl.onrender.com";

  const sendOtp = async () => {
    if (!phone.trim()) {
      alert("Enter your phone number");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(`${BASE_URL}/send-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ phone })
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.detail || "Failed to send OTP");
        return;
      }

      setStep(2);

    } catch (err) {
      alert("Backend not reachable");
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async () => {
    if (!otp.trim()) {
      alert("Enter OTP");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(`${BASE_URL}/verify-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ phone, otp })
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.detail || "Invalid OTP");
        return;
      }

      setUserData(data);

    } catch (err) {
      alert("Backend not reachable");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-6 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-100/50 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-100/50 rounded-full blur-3xl animate-pulse" />

      <div className="bg-white shadow-2xl shadow-blue-100/50 rounded-[2.5rem] p-10 w-full max-w-md border border-gray-100 relative z-10 transition-all duration-500">

        <div className="flex flex-col items-center mb-10">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-blue-200 mb-6 group transition-transform hover:scale-110">
            <Sparkles className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-2">
            Social Saver
          </h1>
          <p className="text-slate-500 font-medium text-center">
            The ultimate companion for your favorite content
          </p>
        </div>

        {step === 1 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 ml-1">WhatsApp Number</label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors">
                  <Smartphone className="w-5 h-5" />
                </div>
                <input
                  type="text"
                  placeholder="e.g. +91 98765 43210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium text-slate-800"
                />
              </div>
              <p className="text-[11px] text-slate-400 ml-1">We'll send you a 6-digit verification code</p>
            </div>

            <button
              onClick={sendOtp}
              disabled={loading}
              className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-blue-600 transition-all active:scale-[0.98] shadow-lg shadow-slate-200 hover:shadow-blue-200"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  Connect WhatsApp
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100 flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-bold text-blue-900">Verification Sent</p>
                <p className="text-xs text-blue-600 font-medium">Please enter code sent to {phone}</p>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 ml-1">One-Time Password</label>
              <input
                type="text"
                maxLength={6}
                placeholder="0 0 0 0 0 0"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-center text-2xl font-bold tracking-[0.5em] text-slate-800 placeholder:opacity-30"
              />
            </div>

            <button
              onClick={verifyOtp}
              disabled={loading}
              className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-blue-700 transition-all active:scale-[0.98] shadow-lg shadow-blue-200"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  Verify & Continue
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>

            <button
              onClick={() => setStep(1)}
              className="w-full text-slate-400 text-sm font-bold hover:text-slate-600 transition-colors py-2"
            >
              Change number?
            </button>
          </div>
        )}
      </div>

      {/* Footer info */}
      <div className="absolute bottom-8 text-slate-400 text-xs font-medium tracking-wide">
        &copy; 2024 SOCIAL SAVER &bull; SECURE CLOUD STORAGE
      </div>
    </div>
  );
}
