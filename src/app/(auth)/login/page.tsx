"use client";

import React from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { FaEnvelope, FaLock, FaFacebookF, FaTwitter, FaGoogle } from "react-icons/fa";

type FormValues = {
  email: string;
  password: string;
  remember?: boolean;
};

const LoginPage= () => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ mode: "onTouched" });

  const onSubmit = async (data: FormValues) => {
    try {
      
      // const res = await fetch("/api/auth/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
      // const json = await res.json();
      console.log("login data:", data);
      alert("Form submitted. Check console for data.");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="h-[90vh] bg-[#111111]">
      <div className="w-7xl h-[90vh] mx-auto grid grid-cols-1 md:grid-cols-2 text-white">
        <div
          className="hidden h-[90vh] md:flex items-center justify-center bg-black"
          style={{
            backgroundImage: "url('/images/logImage.png')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div className="text-center px-8">
            {/* Logo block similar to your image */}
            <div className="inline-flex items-center gap-6">
              <div className="w-20 h-20 rounded-sm border-4 border-white flex items-center justify-center">
                {/* simple C shape */}
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

        {/* RIGHT: form */}
        <div className="h-[90vh] flex items-center justify-center px-6 md:px-20">
          <div className="w-full max-w-md">
            <div className="text-center">
              <h2 className="text-4xl font-bold mb-2">Log in</h2>
              <p className="text-gray-400 mb-8">
                Welcome to Back! <span aria-hidden>👋</span>
                <br />
                <span className="text-sm text-gray-500">Please sign in to your account and start the adventure</span>
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} noValidate>
              {/* email */}
              <label className="text-gray-300 text-sm">Email</label>
              <div className="flex items-center bg-[#222222] p-3 rounded mt-2 mb-1">
                <FaEnvelope className="text-gray-400 mr-3" />
                <input
                  type="email"
                  placeholder="test@gmail.com"
                  className="w-full bg-transparent outline-none text-sm"
                  {...register("email", {
                    required: "Email is required",
                    pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "Invalid email address" },
                  })}
                  aria-invalid={!!errors.email}
                />
              </div>
              {errors.email && <p className="text-xs text-red-400 mb-3">{errors.email.message}</p>}

              {/* password */}
              <label className="text-gray-300 text-sm">Password</label>
              <div className="flex items-center bg-[#222222] p-3 rounded mt-2 mb-1">
                <FaLock className="text-gray-400 mr-3" />
                <input
                  type="password"
                  placeholder="••••••••"
                  className="w-full bg-transparent outline-none text-sm"
                  {...register("password", { required: "Password is required", minLength: { value: 6, message: "Minimum 6 characters" } })}
                  aria-invalid={!!errors.password}
                />
              </div>
              {errors.password && <p className="text-xs text-red-400 mb-3">{errors.password.message}</p>}

              <div className="flex justify-between items-center text-sm mb-6 text-gray-300">
                <label className="flex items-center gap-2">
                  <input type="checkbox" className="h-4 w-4 accent-white" {...register("remember")} />
                  Remember me
                </label>
                <Link href="/forgetPassword" className="text-sm text-gray-300 hover:underline">
                  Forgot Password?
                </Link>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-white text-black font-semibold py-2 rounded mb-4 disabled:opacity-60"
              >
                {isSubmitting ? "Signing in..." : "Sign in"}
              </button>
            </form>

            <p className="text-center text-gray-400 text-sm">
              New on our platform?{" "}
              <Link className="text-white underline" href="/signup">
                Create an account
              </Link>
            </p>

            <div className="flex items-center justify-center gap-3 my-5">
              <div className="h-px bg-gray-700 flex-1" />
              <span className="text-xs text-gray-500">or</span>
              <div className="h-px bg-gray-700 flex-1" />
            </div>

            <div className="flex justify-center gap-4">
              <button className="w-10 h-10 flex items-center justify-center bg-white rounded">
                <FaFacebookF className="text-blue-600" />
              </button>
              <button className="w-10 h-10 flex items-center justify-center bg-white rounded">
                <FaTwitter className="text-sky-500" />
              </button>
              <button className="w-10 h-10 flex items-center justify-center bg-white rounded">
                <FaGoogle className="text-red-500" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
