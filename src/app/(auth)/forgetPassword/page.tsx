"use client";

import React from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { FaEnvelope, FaFacebookF, FaTwitter, FaGoogle } from "react-icons/fa";

type FormValues = {
    email: string;
};

const forgetPasswordPage = () => {
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<FormValues>({ mode: "onTouched" });

    const onSubmit = async (data: FormValues) => {
        try {

            // await fetch("/api/auth/forgot-password", { method: "POST", body: JSON.stringify(data) })
            console.log("Sending reset link to:", data.email);
            alert("If the email exists, a reset link will be sent.");
        } catch (err) {
            console.error(err);
        }
    };
    return (
        <div className="h-[90vh]  bg-[#111111] ">
            <div className="w-7xl h-[90vh] mx-auto grid grid-cols-1 md:grid-cols-2 text-white">
                {/* LEFT: carbon background */}
                <div
                    className="hidden md:flex items-center justify-center bg-black"
                    style={{
                        backgroundImage: "url('/images/logImage.png')",
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

                {/* RIGHT: form */}
                <div className="flex items-center justify-center px-6 md:px-20">
                    <div className="w-full max-w-md">
                        <h1 className="text-4xl md:text-5xl font-extrabold mb-3">Forgot Password?</h1>
                        <p className="text-gray-400 mb-8 text-sm">
                            Lost your password? Please enter your email address. You will receive a link to create a new password via email.
                        </p>

                        <form onSubmit={handleSubmit(onSubmit)} noValidate>
                            <label htmlFor="email" className="text-gray-300 text-sm">Email</label>
                            <div className="flex items-center bg-[#222222] p-3 rounded mt-2 mb-3">
                                <FaEnvelope className="text-gray-400 mr-3" />
                                <input
                                    id="email"
                                    type="email"
                                    {...register("email", {
                                        required: "Email is required",
                                        pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "Enter a valid email" },
                                    })}
                                    placeholder="test@gmail.com"
                                    className="w-full bg-transparent outline-none text-sm"
                                    aria-invalid={!!errors.email}
                                />
                            </div>
                            {errors.email && <p className="text-xs text-red-400 mb-2">{errors.email.message}</p>}

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full bg-white text-black font-semibold py-2 rounded mb-4 disabled:opacity-60"
                            >
                                {isSubmitting ? "Sending..." : "Send Reset Link"}
                            </button>
                        </form>

                        <div className="flex items-center gap-2 text-sm text-gray-300 mb-6">
                            <Link href="/login" className="inline-flex items-center gap-2 hover:underline">
                                <span className="text-sm">←</span>
                                <span>Back To Login</span>
                            </Link>
                        </div>

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
    )
}

export default forgetPasswordPage
