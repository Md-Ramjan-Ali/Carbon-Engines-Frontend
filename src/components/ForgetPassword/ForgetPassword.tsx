// app/(auth)/forgetPassword/page.tsx
'use client';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FaEnvelope } from 'react-icons/fa';
import OtpInput from '../../components/otpInput/otpInput'; // adjust path if your component path differs

type EmailForm = { email: string };
type ResetForm = { email?: string; password: string; confirm: string };

const ForgetPassword = () => {
    const router = useRouter();
    const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? 'https://api.yamiz.org';

    // email form
    const { register, handleSubmit, formState: { errors, isSubmitting }, setValue } = useForm<EmailForm>({ mode: 'onTouched' });
    // reset form
    const { register: regReset, handleSubmit: handleResetSubmit, watch, formState: { errors: resetErrors, isSubmitting: resetting } } = useForm<ResetForm>({ mode: 'onTouched' });

    // UI state
    const [showOtpBox, setShowOtpBox] = useState(false);
    const [otp, setOtp] = useState('');
    const [resetToken, setResetToken] = useState<string | null>(null); // optional token returned from verify
    const [isVerified, setIsVerified] = useState(false); // becomes true after successful OTP verification
    const [submittedEmail, setSubmittedEmail] = useState<string | null>(null);
    const [message, setMessage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [resendCooldown, setResendCooldown] = useState<number>(0);

    const password = watch('password', '');

    function startCooldown(seconds = 30) {
        setResendCooldown(seconds);
        const id = setInterval(() => {
            setResendCooldown(prev => {
                if (prev <= 1) { clearInterval(id); return 0; }
                return prev - 1;
            });
        }, 1000);
    }

    // 1) send forgot-password (request OTP)
    async function onSendReset(data: EmailForm) {
        setMessage(null); setError(null); setLoading(true);
        try {
            const emailStr = String(data.email).trim();
            if (!emailStr) throw new Error('Email is required');

            const res = await fetch(`${API_BASE}/api/auth/forgot-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: emailStr })
            });
            const payload = await res.json().catch(() => ({}));
            if (!res.ok) throw new Error(payload?.message || `Request failed (${res.status})`);

            // save email for further steps
            setSubmittedEmail(emailStr);
            setValue('email', emailStr);

            setMessage('If the email exists, an OTP / reset link has been sent. Check your inbox.');
            setShowOtpBox(true);
            setIsVerified(false);          // ensure reset form hidden until verified
            startCooldown(30);
        } catch (e: any) {
            console.error('forgot-password error', e);
            setError(e?.message || 'Failed to send reset link');
        } finally {
            setLoading(false);
        }
    }

    // 2) verify otp
    async function handleVerifyOtp() {
        setError(null); setMessage(null);
        const email = submittedEmail;
        if (!email) { setError('Email missing — first send reset link'); return; }
        if (!otp || otp.length !== 4) { setError('Enter 4-digit OTP'); return; }

        setLoading(true);
        try {
            const res = await fetch(`${API_BASE}/api/auth/verify-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: String(email), otp: String(otp) })
            });

            const payload = await res.json().catch(() => ({}));
            if (!res.ok) {
                const msg = payload?.message || payload?.error || `Verify failed (${res.status})`;
                throw new Error(msg);
            }

            // optional token returned by server
            const token = payload?.token ?? payload?.data?.token ?? null;
            if (token) setResetToken(String(token));

            // **CRITICAL**: show only reset form from now on (hide email + otp UI)
            setIsVerified(true);
            setShowOtpBox(false);
            setMessage('OTP verified. Please set your new password.');
        } catch (e: any) {
            console.error('verify-otp error', e);
            const m = e?.message || 'OTP verification failed';
            setError(String(m));
        } finally {
            setLoading(false);
        }
    }

    // resend OTP
    async function handleResend() {
        setError(null); setMessage(null);
        const email = submittedEmail;
        if (!email) { setError('Email missing — first send reset link'); return; }
        if (resendCooldown > 0) return;
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE}/api/auth/resend-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: String(email) })
            });
            const payload = await res.json().catch(() => ({}));
            if (!res.ok) throw new Error(payload?.message || `Resend failed (${res.status})`);
            setMessage('OTP resent. Check your email.');
            setShowOtpBox(true);
            startCooldown(30);
        } catch (e: any) {
            console.error('resend error', e);
            setError(e?.message || 'Failed to resend');
        } finally {
            setLoading(false);
        }
    }

    // 3) reset password on same page
    // backend expects { email, otp, newPassword } or { token, newPassword }
    async function onResetSubmit(data: ResetForm) {
        setError(null); setMessage(null);

        try {
            if (!data.password) { setError('Password required'); return; }
            if (data.password !== data.confirm) { setError('Passwords do not match'); return; }

            const email = (data.email?.trim() || submittedEmail);
            if (!email) { setError('Email missing for reset.'); return; }

            let bodyPayload: any;
            if (resetToken) {
                bodyPayload = { token: String(resetToken), newPassword: String(data.password) };
            } else {
                const otpStr = String(otp ?? '').trim();
                if (!otpStr || otpStr.length !== 4) { setError('OTP missing or invalid'); return; }
                bodyPayload = { email: String(email), otp: otpStr, newPassword: String(data.password) };
            }

            // debug log (remove in production)
            console.log('RESET payload =>', bodyPayload);

            setLoading(true);
            const res = await fetch(`${API_BASE}/api/auth/reset-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(bodyPayload)
            });

            const payload = await res.json().catch(() => ({}));
            if (!res.ok) {
                const msg = payload?.message || payload?.error || `Reset failed (${res.status})`;
                throw new Error(msg);
            }

            // if server returns token, you can save for immediate login
            const token = payload?.token ?? payload?.data?.token ?? null;
            if (token) {
                try { localStorage.setItem('ce_token', String(token)); } catch { }
            }

            setMessage('Password updated successfully. Redirecting to profile...');
            setTimeout(() => router.push('/profile'), 900);
        } catch (e: any) {
            console.error('reset-password error', e);
            setError(e?.message || 'Failed to reset password');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="h-[90vh] bg-[#111111]">
            <div className="h-[90vh] grid grid-cols-1 md:grid-cols-2 text-white">
                <div className="h-[90vh] hidden md:flex items-center justify-center bg-black"
                    style={{ backgroundImage: "url('/images/logImage.png')", backgroundSize: 'cover', backgroundPosition: 'center' }}>
                    <div className="text-center">
                        <div className="flex items-center gap-2">
                            <div className="w-40 h-40 flex items-center justify-center"><Image src="/images/logo.png" alt="Logo" width={400} height={400} /></div>
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
                        <h1 className="text-4xl md:text-5xl font-bold mb-3">Forgot Password?</h1>
                        <p className="text-gray-400 mb-6 text-sm">Enter your email — you'll get a 4-digit OTP. After verifying OTP you will be able to set a new password.</p>

                        {/* EMAIL + OTP UI: show only when NOT verified */}
                        {!isVerified && (
                            <>
                                <form onSubmit={handleSubmit(onSendReset)} noValidate>
                                    <label htmlFor="email" className="text-gray-300 text-sm">Email</label>
                                    <div className="flex items-center bg-[#222222] p-3 rounded mt-2 mb-3">
                                        <FaEnvelope className="text-gray-400 mr-3" />
                                        <input id="email" type="email"
                                            {...register('email', { required: 'Email is required', pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Enter a valid email' } })}
                                            placeholder="you@example.com"
                                            className="w-full bg-transparent outline-none text-sm"
                                            aria-invalid={!!errors.email} />
                                    </div>
                                    {errors.email && <p className="text-xs text-red-400 mb-2">{errors.email.message}</p>}
                                    <button type="submit" disabled={isSubmitting || loading} className="w-full bg-white text-black font-semibold py-2 rounded mb-4 disabled:opacity-60">{isSubmitting || loading ? 'Sending...' : 'Send Reset Link'}</button>
                                </form>

                                {showOtpBox && (
                                    <div className="bg-[#0f0f0f] p-4 rounded mb-4">
                                        <div className="text-sm text-gray-300 mb-2">Enter the 4-digit code sent to your email ({submittedEmail ?? '—'})</div>
                                        <div className="flex justify-center mb-3"><OtpInput length={4} onChange={setOtp} /></div>
                                        {message && <div className="text-sm text-green-400 mb-2">{message}</div>}
                                        {error && <div className="text-sm text-red-400 mb-2">{error}</div>}
                                        <div className="flex gap-2 mb-3">
                                            <button type="button" onClick={handleVerifyOtp} disabled={loading} className="flex-1 py-2 bg-blue-600 text-white rounded">{loading ? 'Verifying...' : 'Verify OTP'}</button>
                                            <button type="button" onClick={handleResend} disabled={resendCooldown > 0 || loading} className="px-3 underline text-sm">{resendCooldown > 0 ? `Resend (${resendCooldown}s)` : 'Resend'}</button>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}

                        {/* RESET PASSWORD FORM shown only AFTER OTP verified */}
                        {isVerified && (
                            <div className="bg-[#111111] p-4 rounded mb-4">
                                <h3 className="text-lg font-medium mb-2">Set new password</h3>
                                <form onSubmit={handleResetSubmit(onResetSubmit)} noValidate>
                                    <label className="text-xs text-gray-300">Email</label>
                                    <div className="flex items-center bg-[#222222] p-3 rounded mt-2 mb-2">
                                        <input type="email" {...regReset('email', { required: 'Email is required' })} defaultValue={submittedEmail ?? ''} className="w-full bg-transparent outline-none text-sm" />
                                    </div>

                                    <label className="text-xs text-gray-300">New password</label>
                                    <div className="flex items-center bg-[#222222] p-3 rounded mt-2 mb-2">
                                        <input type="password" {...regReset('password', { required: 'Password is required', minLength: { value: 8, message: 'Min 8 chars' } })} className="w-full bg-transparent outline-none text-sm" placeholder="••••••••" />
                                    </div>
                                    {resetErrors.password && <div className="text-xs text-red-400 mb-2">{resetErrors.password.message}</div>}

                                    <label className="text-xs text-gray-300">Confirm password</label>
                                    <div className="flex items-center bg-[#222222] p-3 rounded mt-2 mb-2">
                                        <input type="password" {...regReset('confirm', { required: 'Confirm password', validate: val => val === password || 'Passwords do not match' })} className="w-full bg-transparent outline-none text-sm" placeholder="••••••••" />
                                    </div>
                                    {resetErrors.confirm && <div className="text-xs text-red-400 mb-2">{resetErrors.confirm.message}</div>}

                                    {message && <div className="text-sm text-green-400 mb-2">{message}</div>}
                                    {error && <div className="text-sm text-red-400 mb-2">{error}</div>}

                                    <button type="submit" disabled={resetting || loading} className="w-full bg-white text-black font-semibold py-2 rounded mb-2">{resetting || loading ? 'Setting...' : 'Set New Password'}</button>
                                </form>
                            </div>
                        )}

                        <div className="flex items-center gap-2 text-sm text-gray-300 mb-6">
                            <Link href="/login" className="inline-flex items-center gap-2 hover:underline"><span>←</span><span>Back To Login</span></Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ForgetPassword;
