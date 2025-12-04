// components/ResetPassword.tsx
"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { FaLock, FaEye, FaEyeSlash } from "react-icons/fa";
import Image from "next/image";

type FormValues = {
  password: string;
  confirm: string;
};

const ResetPasswordPage = () => {
  const router = useRouter();
  const params = useSearchParams();
  const token = params?.get("token") ?? ""; // token via ?token=...
  const email = params?.get("email") ?? ""; // optional

  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm<FormValues>({
    mode: "onTouched",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const password = watch("password", "");

  const onSubmit = async (data: FormValues) => {
    setServerError(null);
    if (!token) {
      setServerError("Reset token missing. Use the link sent to your email.");
      return;
    }

    try {
      const res = await fetch("https://api.yamiz.org/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, email: email || undefined, password: data.password }),
      });

      const payload = await res.json().catch(() => ({}));

      if (!res.ok) {
        // show backend message if available
        const msg = payload?.message || payload?.error || `Reset failed (${res.status})`;
        throw new Error(msg);
      }

      setSuccessMsg("Password updated successfully. Redirecting to login...");
      // small delay so user sees the message
      setTimeout(() => {
        router.push("/login");
      }, 1000);
    } catch (err: any) {
      console.error("Reset error:", err);
      setServerError(err?.message || "Something went wrong while resetting password.");
    }
  };
  return (
    <div className="h-[90vh] bg-[#111111]">
      <div className=" h-[90vh] grid grid-cols-1 md:grid-cols-2 text-white">
        {/* LEFT: carbon background */}
        <div
          className="h-[90vh] hidden md:flex items-center justify-center bg-black"
          style={{
            backgroundImage: "url('/images/logImage.png')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
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

        {/* RIGHT: reset form */}
        <div className="h-[90vh] flex items-center justify-center px-6 md:px-20">
          <div className="w-full max-w-md">
            <h1 className="text-4xl md:text-5xl font-extrabold mb-2">Reset password</h1>
            <p className="text-gray-400 mb-6 text-sm">
              {email ? `For ${email}` : "Enter your new password below."}
            </p>

            <form onSubmit={handleSubmit(onSubmit)} noValidate>
              {/* New Password */}
              <label htmlFor="password" className="text-gray-300 text-sm">New Password</label>
              <div className="relative flex items-center bg-[#222222] p-3 rounded mt-2 mb-4">
                <FaLock className="text-gray-400 mr-3" />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  {...register("password", {
                    required: "Password is required",
                    minLength: { value: 8, message: "Password must be at least 8 characters" },
                  })}
                  placeholder="•••••••••••••"
                  className="w-full bg-transparent outline-none text-sm"
                  aria-invalid={!!errors.password}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  className="absolute right-3 text-gray-400"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-red-400 mb-3">{errors.password.message}</p>}

              {/* Confirm Password */}
              <label htmlFor="confirm" className="text-gray-300 text-sm">Confirm Password</label>
              <div className="relative flex items-center bg-[#222222] p-3 rounded mt-2 mb-4">
                <FaLock className="text-gray-400 mr-3" />
                <input
                  id="confirm"
                  type={showConfirm ? "text" : "password"}
                  {...register("confirm", {
                    required: "Please confirm your password",
                    validate: value => value === password || "Passwords do not match",
                  })}
                  placeholder="•••••••••••••"
                  className="w-full bg-transparent outline-none text-sm"
                  aria-invalid={!!errors.confirm}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(v => !v)}
                  className="absolute right-3 text-gray-400"
                  aria-label="Toggle confirm password visibility"
                >
                  {showConfirm ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
              {errors.confirm && <p className="text-xs text-red-400 mb-3">{errors.confirm.message}</p>}

              {serverError && <div className="text-xs text-red-400 mb-3">{serverError}</div>}
              {successMsg && <div className="text-xs text-green-500 mb-3">{successMsg}</div>}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-white text-black font-semibold py-2 rounded mb-4 disabled:opacity-60"
              >
                {isSubmitting ? "Setting..." : "Set New Password"}
              </button>
            </form>

            <div className="flex items-center gap-2 text-sm text-gray-300 mb-6">
              <Link href="/login" className="inline-flex items-center gap-2 hover:underline">
                <span className="text-sm">←</span>
                <span>Back To Login</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default ResetPasswordPage
