// components/VerifyEmail.tsx
"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { FaEnvelope } from "react-icons/fa";

type FormValues = {
  email: string;
};

const verifyEmailPage = () => {
      const router = useRouter();
  const params = useSearchParams();
  const defaultEmail = params?.get("email") ?? ""; // optional prefilled email via ?email=
  const [message, setMessage] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState<number>(0);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormValues>({
    mode: "onTouched",
    defaultValues: { email: defaultEmail },
  });

  const startCooldown = (seconds = 30) => {
    setResendCooldown(seconds);
    const id = setInterval(() => {
      setResendCooldown(prev => {
        if (prev <= 1) {
          clearInterval(id);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const onSubmit = async (data: FormValues) => {
    try {
      setMessage(null);
      // Example API: send verification code to email
      // await fetch("/api/auth/send-verify-code", { method: "POST", body: JSON.stringify({ email: data.email })})
      console.log("Send code to:", data.email);
      setMessage("Verification code sent. Check your email.");
      startCooldown(30);
    } catch (err) {
      console.error(err);
      setMessage("Failed to send code. Try again.");
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;
    try {
      setMessage(null);
      // Example API: resend code
      // await fetch("/api/auth/resend-verify-code", { method: "POST", body: JSON.stringify({ email: defaultEmail })})
      console.log("Resend code to:", defaultEmail);
      setMessage("Verification code resent.");
      startCooldown(30);
    } catch (err) {
      console.error(err);
      setMessage("Failed to resend. Try again later.");
    }
  };
  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-2 bg-[#111111] text-white">
      {/* LEFT: carbon background */}
      <div
        className="hidden md:flex items-center justify-center bg-black"
        style={{
          backgroundImage: "url('/carbon-bg.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="text-center px-8">
          <div className="inline-flex items-center gap-6">
            <div className="w-20 h-20 rounded-sm border-4 border-white flex items-center justify-center">
              <div className="text-4xl font-extrabold tracking-widest">C</div>
            </div>
            <div className="text-left">
              <div className="text-3xl font-bold tracking-widest">CARBON</div>
              <div className="text-3xl font-semibold tracking-widest">ENGINES</div>
              <div className="text-sm mt-2 text-gray-300 tracking-wider">ENGINEERED FOR STRENGTH</div>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT: verify form */}
      <div className="flex items-center justify-center px-6 md:px-20">
        <div className="w-full max-w-md">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-3">Verify your mail</h1>
          <p className="text-gray-400 mb-8 text-sm">
            Account activation link sent to your email address: <br />
            <span className="text-gray-500">{defaultEmail || "exampleinfo@mail.com"}</span>
            <br />
            Please follow the link inside to continue.
          </p>

          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <label htmlFor="email" className="text-gray-300 text-sm">Email</label>
            <div className="flex items-center bg-[#222222] p-3 rounded mt-2 mb-3">
              <FaEnvelope className="text-gray-400 mr-3" />
              <input
                id="email"
                type="email"
                placeholder="test@gmail.com"
                className="w-full bg-transparent outline-none text-sm"
                {...register("email", {
                  required: "Email is required",
                  pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "Invalid email" },
                })}
                aria-invalid={!!errors.email}
              />
            </div>
            {errors.email && <p className="text-xs text-red-400 mb-3">{errors.email.message}</p>}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-white text-black font-semibold py-2 rounded mb-3 disabled:opacity-60"
            >
              {isSubmitting ? "Sending..." : "Send Code"}
            </button>
          </form>

          <div className="text-center mb-3">
            <button
              onClick={() => router.push("/")}
              className="text-sm text-gray-400 hover:underline"
            >
              Skip For Now
            </button>
          </div>

          <div className="text-center mb-3 text-sm text-gray-400">
            Didn't get the mail?{" "}
            <button
              onClick={handleResend}
              disabled={resendCooldown > 0}
              className={`font-medium ml-1 ${resendCooldown > 0 ? "text-gray-500" : "text-white underline"}`}
            >
              {resendCooldown > 0 ? `Resend (${resendCooldown}s)` : "Resend"}
            </button>
          </div>

          {message && <p className="text-center text-sm text-green-400 mb-3">{message}</p>}

          <div className="flex items-center justify-center gap-4 mt-4">
            <Link href="/login" className="text-gray-400 hover:underline text-sm">← Back to Login</Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default verifyEmailPage
