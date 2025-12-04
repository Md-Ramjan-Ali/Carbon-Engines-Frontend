// components/SignupForm.tsx
"use client";
import Image from 'next/image';
import Link from 'next/link';
import React, { useState } from 'react'
import { useForm } from "react-hook-form";
import { FaUser, FaEnvelope, FaLock, FaFacebookF, FaTwitter, FaGoogle } from "react-icons/fa";
import { useRouter } from 'next/navigation';


type FormValues = {
    username: string;
    email: string;
    password: string;
    confirm: string;
    terms: boolean;
};

const signUpPage = () => {
    const router = useRouter();
    const [serverError, setServerError] = useState<string | null>(null);
    const {
        register,
        handleSubmit,
        watch,
        formState: { errors, isSubmitting },
    } = useForm<FormValues>({
        mode: "onTouched",
        defaultValues: {
            username: "",
            email: "",
            password: "",
            confirm: "",
            terms: false,
        },
    });

    const password = watch("password");

    async function onSubmit(data: FormValues) {
        setServerError(null);
        try {

            const body =  await fetch("https://api.yamiz.org/api/auth/register", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(data),
            });
            console.log('signup response:', body);

            // Otherwise OTP/email verification step is needed
            router.push(`/verify-otp?email=${encodeURIComponent(data.email)}`);
        } catch (err: any) {
            console.error('Signup failed', err);
            // Try to derive a friendly message from backend payloads
            let msg = 'Signup failed';
            if (err) {
                if (typeof err === 'string') msg = err;
                else if (err.message) msg = err.message;
                else if (err?.payload?.message) msg = err.payload.message;
                else msg = JSON.stringify(err).slice(0, 200);
            }
            setServerError(msg);
        }
    }

    return (
        <div className="h-[90vh]  bg-[#111111]">
            <div className=" h-[90vh] grid grid-cols-1 md:grid-cols-2 text-white">
                {/* LEFT: carbon background (using uploaded local image path) */}
                <div
                    className="h-[90vh] hidden md:flex items-center justify-center bg-black"
                    style={{
                        backgroundImage: "url('/images/logImage.png')",
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                    }}
                >
                    <div className="text-center">
                        {/* Logo block similar to your image */}
                        <div className="flex items-center gap-2">
                            <div className="w-40 h-40 flex items-center justify-center">
                                {/* simple C shape */}
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

                {/* RIGHT: signup form */}
                <div className="h-[90vh] flex items-center justify-center px-6 md:px-20">
                    <div className="w-full max-w-md">
                        <div className="text-center">
                            <h2 className="text-4xl font-bold mb-2">Sign Up</h2>
                            <p className="text-gray-400 mb-8">
                                Welcome to Back! <span aria-hidden>👋</span>
                                <br />
                                <span className="text-sm text-gray-500">Please sign up to create your account and start the adventure</span>
                            </p>
                        </div>

                        <form onSubmit={handleSubmit(onSubmit)} noValidate>
                            {/* Username */}
                            <label htmlFor="username" className="text-gray-300 text-sm">Username</label>
                            <div className="flex items-center bg-[#222222] p-3 rounded mt-2 mb-4">
                                <FaUser className="text-gray-400 mr-3" />
                                <input
                                    id="username"
                                    {...register("username", { required: "Username is required", minLength: { value: 2, message: "Minimum 2 chars" } })}
                                    className="w-full bg-transparent outline-none text-sm"
                                    placeholder="yourname"
                                    aria-invalid={!!errors.username}
                                />
                            </div>
                            {errors.username && <p className="text-xs text-red-400 mb-2">{errors.username.message}</p>}

                            {/* Email */}
                            <label htmlFor="email" className="text-gray-300 text-sm">Email</label>
                            <div className="flex items-center bg-[#222222] p-3 rounded mt-2 mb-4">
                                <FaEnvelope className="text-gray-400 mr-3" />
                                <input
                                    id="email"
                                    {...register("email", {
                                        required: "Email is required",
                                        pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "Invalid email address" },
                                    })}
                                    className="w-full bg-transparent outline-none text-sm"
                                    placeholder="you@example.com"
                                    aria-invalid={!!errors.email}
                                />
                            </div>
                            {errors.email && <p className="text-xs text-red-400 mb-2">{errors.email.message}</p>}

                            {/* Password */}
                            <label htmlFor="password" className="text-gray-300 text-sm">Password</label>
                            <div className="flex items-center bg-[#222222] p-3 rounded mt-2 mb-4">
                                <FaLock className="text-gray-400 mr-3" />
                                <input
                                    id="password"
                                    type="password"
                                    {...register("password", { required: "Password is required", minLength: { value: 6, message: "Min 6 chars" } })}
                                    className="w-full bg-transparent outline-none text-sm"
                                    placeholder="••••••••"
                                    aria-invalid={!!errors.password}
                                />
                            </div>
                            {errors.password && <p className="text-xs text-red-400 mb-2">{errors.password.message}</p>}

                            {/* Confirm */}
                            <label htmlFor="confirm" className="text-gray-300 text-sm">Confirm Password</label>
                            <div className="flex items-center bg-[#222222] p-3 rounded mt-2 mb-3">
                                <FaLock className="text-gray-400 mr-3" />
                                <input
                                    id="confirm"
                                    type="password"
                                    {...register("confirm", {
                                        required: "Please confirm password",
                                        validate: value => value === password || "Passwords do not match",
                                    })}
                                    className="w-full bg-transparent outline-none text-sm"
                                    placeholder="••••••••"
                                    aria-invalid={!!errors.confirm}
                                />
                            </div>
                            {errors.confirm && <p className="text-xs text-red-400 mb-2">{errors.confirm.message}</p>}

                            {/* Terms */}
                            <div className="flex items-start gap-2 text-sm mb-6">
                                <label className="flex items-center gap-2 text-gray-300">
                                    <input {...register("terms", { required: "You must accept Terms" })} type="checkbox" className="h-4 w-4 accent-white" />
                                    I agree to the <a href="#" className="underline">Terms & Conditions</a>
                                </label>
                            </div>
                            {errors.terms && <p className="text-xs text-red-400 mb-2">{(errors.terms as any).message}</p>}

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full bg-white text-black font-semibold py-2 rounded mb-4 disabled:opacity-60"
                            >
                                {isSubmitting ? "Creating..." : "Create account"}
                            </button>
                        </form>

                        <div className="">
                            <p className="text-center text-gray-400 text-sm">
                                Already have an account?{" "}
                                <Link className="text-white underline" href="/login">
                                    Sign in
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
        </div>
    )
}

export default signUpPage
