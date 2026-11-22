"use client";
import React from "react";
import { ArrowLeft, Mail } from "lucide-react";

interface VerifyEmailPanelProps {
  email: string;
  otpValue: string;
  setOtpValue: (v: string) => void;
  onVerify: () => void;
  onResend: () => void;
  onBack?: () => void;
  backLabel?: string;
  isVerifying: boolean;
  isResending: boolean;
  resendCooldown: number;
}

export function VerifyEmailPanel({
  email,
  otpValue,
  setOtpValue,
  onVerify,
  onResend,
  onBack,
  backLabel = "Back to login",
  isVerifying,
  isResending,
  resendCooldown,
}: VerifyEmailPanelProps) {
  const handleChange = (index: number, val: string) => {
    if (!/^\d*$/.test(val)) return;
    const digits = otpValue.split("");
    digits[index] = val;
    const next = digits.join("").slice(0, 6);
    setOtpValue(next);
    if (val && index < 5) {
      document.getElementById(`otp-input-${index + 1}`)?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      if (!otpValue[index] && index > 0) {
        const digits = otpValue.split("");
        digits[index - 1] = "";
        setOtpValue(digits.join(""));
        document.getElementById(`otp-input-${index - 1}`)?.focus();
      } else {
        const digits = otpValue.split("");
        digits[index] = "";
        setOtpValue(digits.join(""));
      }
    }
  };

  return (
    <div className="flex flex-col items-center space-y-8 text-center animate-in fade-in zoom-in-95 duration-300">
      {/* Icon */}
      <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center">
        <Mail size={28} className="text-primary" />
      </div>

      {/* Heading */}
      <div className="space-y-2">
        <h2 className="text-xl font-bold text-slate-900">Verify your Email</h2>
        <p className="text-sm text-slate-500">
          We sent a 6-digit code to{" "}
          <span className="font-semibold text-slate-700">{email}</span>.
          <br />
          Enter it below to continue.
        </p>
      </div>

      {/* OTP Inputs */}
      <div className="flex gap-2 justify-center">
        {[0, 1, 2, 3, 4, 5].map((index) => (
          <input
            key={index}
            id={`otp-input-${index}`}
            type="text"
            inputMode="numeric"
            maxLength={1}
            pattern="\d*"
            value={otpValue[index] || ""}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            className="w-11 h-14 text-center text-xl font-bold border border-slate-200 rounded-xl focus:border-primary focus:ring-2 focus:ring-emerald-500/10 focus:outline-none bg-white shadow-sm transition-all"
          />
        ))}
      </div>

      {/* Verify Button */}
      <button
        type="button"
        onClick={onVerify}
        disabled={otpValue.length !== 6 || isVerifying}
        className="btn-primary w-full h-12 text-sm shadow-lg shadow-primary/20 flex items-center justify-center disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {isVerifying ? "Verifying…" : "Verify Email"}
      </button>

      {/* Resend */}
      <button
        type="button"
        onClick={onResend}
        disabled={isResending || resendCooldown > 0}
        className="text-xs font-bold text-primary underline disabled:text-slate-400 disabled:cursor-not-allowed transition-colors"
      >
        {isResending
          ? "Sending…"
          : resendCooldown > 0
          ? `Resend Code (${resendCooldown}s)`
          : "Resend Code"}
      </button>

      {/* Back link */}
      {onBack && (
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-600 transition-colors"
        >
          <ArrowLeft size={13} />
          {backLabel}
        </button>
      )}
    </div>
  );
}
