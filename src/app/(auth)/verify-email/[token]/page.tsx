"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { FaEnvelope } from "react-icons/fa";
import Image from "next/image";
import OtpInput from "../../../../components/otpInput/otpInput"; 
import { verifyOtp, resendOtp } from "../../../../lib/authClient"; 

type FormValues = {
  email: string;
};

const VerifyEmailPage = () => {
  const router = useRouter();
  const params = useSearchParams();
  const defaultEmail = params?.get("email") ?? "";
  const [message, setMessage] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState<number>(0);
  const [showOtpBox, setShowOtpBox] = useState<boolean>(false);
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [verifyLoading, setVerifyLoading] = useState(false);

  const { register, handleSubmit, formState: { errors, isSubmitting }, setValue } = useForm<FormValues>({
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

  // send initial verification code
  const onSubmit = async (data: FormValues) => {
    setMessage(null);
    setLoading(true);
    try {
      // call backend forgot/resend endpoint (you already have this in forget flow)
      const res = await fetch("https://api.yamiz.org/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: data.email }),
      });

      const payload = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(payload?.message || `Failed (${res.status})`);

      setMessage("Verification code sent. Check your email.");
      setShowOtpBox(true);
      setValue("email", data.email);
      startCooldown(30);
    } catch (err: any) {
      console.error(err);
      setMessage(err?.message || "Failed to send code.");
    } finally {
      setLoading(false);
    }
  };

  // verify the 4-digit OTP
  const handleVerifyOtp = async () => {
    setMessage(null);
    if (!otp || otp.length !== 4) { setMessage("Enter 4 digit OTP"); return; }
    const email = (document.getElementById("email") as HTMLInputElement)?.value || defaultEmail;
    if (!email) { setMessage("Email missing"); return; }

    setVerifyLoading(true);
    try {
      // verifyOtp should return { success:true, token?, user? } or throw
      const body = await verifyOtp(email, otp);
      // If backend returns token, redirect to reset with token or profile depending on your flow
      if (body?.token) {
        // Redirect to reset page with token (common pattern)
        router.push(`/auth/reset?token=${encodeURIComponent(body.token)}&email=${encodeURIComponent(email)}`);
        return;
      }
      // If backend marks verified and you want to go to reset page without token:
      if (body?.success || body?.user) {
        // either go to profile or reset page (choose your flow)
        router.push("/profile");
        return;
      }
      // fallback
      setMessage("Verified but no redirect info from server.");
    } catch (err: any) {
      console.error(err);
      const msg = err?.message || err?.payload?.message || "OTP verification failed";
      setMessage(String(msg));
    } finally {
      setVerifyLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;
    const email = (document.getElementById("email") as HTMLInputElement)?.value || defaultEmail;
    if (!email) { setMessage("Email missing"); return; }

    setMessage(null);
    setLoading(true);
    try {
      // call your resend endpoint
      await resendOtp(email);
      setMessage("OTP resent. Check your email.");
      setShowOtpBox(true);
      startCooldown(30);
    } catch (err: any) {
      console.error(err);
      setMessage(err?.message || "Failed to resend OTP.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-[90vh] bg-[#111111]">
      <div className=" h-[90vh] grid grid-cols-1 md:grid-cols-2 text-white">
        <div
          className="h-[90vh] hidden md:flex items-center justify-center bg-black"
          style={{ backgroundImage: "url('/images/logo-bg.png')", backgroundSize: "cover", backgroundPosition: "center" }}
        >
          <div className="text-center">
            <div className="flex items-center gap-2">
              <div className="w-40 h-40 flex items-center justify-center">
                <Image src="/images/logo.png" alt="Logo" width={400} height={400} />
              </div>
              <div className="text-left">
                <div className="text-7xl font-bold tracking-widest">CARBON</div>
                <div className="text-7xl font-semibold tracking-widest">ENGINES</div>
                <div className="text-xl mt-2 text-gray-300 tracking-wider">ENGINEERED FOR STRENGTH</div>
              </div>
            </div>
          </div>
        </div>

        <div className="h-[90vh] flex items-center justify-center px-6 md:px-20">
          <div className="w-full max-w-md">
            <h1 className="text-4xl md:text-5xl font-extrabold mb-3">Verify your mail</h1>
            <p className="text-gray-400 mb-6 text-sm">
              Account activation code will be sent to: <br />
              <span className="text-gray-500">{defaultEmail || "example@mail.com"}</span>
            </p>

            {/* send code form */}
            <form onSubmit={handleSubmit(onSubmit)} noValidate>
              <label htmlFor="email" className="text-gray-300 text-sm">Email</label>
              <div className="flex items-center bg-[#222222] p-3 rounded mt-2 mb-3">
                <FaEnvelope className="text-gray-400 mr-3" />
                <input
                  id="email"
                  type="email"
                  placeholder="test@gmail.com"
                  className="w-full bg-transparent outline-none text-sm"
                  {...register("email", { required: "Email is required", pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "Invalid email" } })}
                  aria-invalid={!!errors.email}
                />
              </div>
              {errors.email && <p className="text-xs text-red-400 mb-3">{errors.email.message}</p>}

              <div className="flex gap-2">
                <button type="submit" disabled={isSubmitting || loading} className="flex-1 bg-white text-black py-2 rounded">
                  {loading ? "Sending..." : "Send Code"}
                </button>
                <button type="button" onClick={handleResend} disabled={resendCooldown > 0 || loading} className="px-3 bg-transparent underline">
                  {resendCooldown > 0 ? `Resend (${resendCooldown}s)` : "Resend"}
                </button>
              </div>
            </form>

            {/* OTP input - shown after send */}
            {showOtpBox && (
              <div className="mt-6 text-center">
                <p className="text-sm text-gray-300 mb-3">Enter the 4-digit code sent to your email</p>
                <div className="flex justify-center mb-3">
                  <OtpInput length={4} onChange={setOtp} />
                </div>
                {message && <div className="text-sm text-green-400 mb-3">{message}</div>}
                <div className="flex gap-2">
                  <button onClick={handleVerifyOtp} disabled={verifyLoading} className="flex-1 py-2 bg-blue-600 text-white rounded">
                    {verifyLoading ? "Verifying..." : "Verify OTP"}
                  </button>
                  <button onClick={handleResend} disabled={resendCooldown > 0 || loading} className="px-3 underline">
                    {resendCooldown > 0 ? `Resend (${resendCooldown}s)` : "Resend"}
                  </button>
                </div>
              </div>
            )}

            <div className="text-center mt-6">
              <Link href="/login" className="text-gray-400 hover:underline">← Back to Login</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default VerifyEmailPage
