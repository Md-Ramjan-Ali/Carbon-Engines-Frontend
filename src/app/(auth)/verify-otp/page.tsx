// app/(auth)/verify-otp/page.tsx
'use client';
import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import OtpInput from '../../../components/otpInput/otpInput';
import { verifyOtp, resendOtp, fetchWithAuth } from '../../../lib/authClient'; 

const VerifyOtpPage = () => {
    const router = useRouter();
    const sp = useSearchParams();
    const email = sp.get('email') || '';

    const [otp, setOtp] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [resendLoading, setResendLoading] = useState(false);
    const [resendMsg, setResendMsg] = useState<string | null>(null);

    async function handleSubmit() {
        setError(null);
        if (!email) { setError('Email missing'); return; }
        if (otp.length !== 4) { setError('Enter 4 digit OTP'); return; }

        setLoading(true);
        try {
            // 1) Call verify endpoint (this should return { user, token } or similar)
            const body = await verifyOtp(email, otp);
            console.log('verify response:', body);

            // 2) Basic checks: token or user present
            const hasToken = !!body?.token;
            const hasUser = !!body?.user;
            if (!hasToken && !hasUser) {
                // backend didn't return token/user — but may have set cookie; try profile fetch to confirm
                // fallthrough to profile check below
                console.warn('verify returned no token/user — will try profile check');
            }

            // 3) Try to fetch profile to confirm auth works (recommended)
            try {
                // use fetchWithAuth so token-from-cookie or cookie-based flows are supported
                const profileRes = await fetchWithAuth('/api/auth/profile', { method: 'GET' });
                if (!profileRes.ok) {
                    // not authorized — show message (but don't kill user)
                    const payload = await profileRes.json().catch(() => ({}));
                    throw new Error(payload?.message || `Profile fetch failed (${profileRes.status})`);
                }
                // profile ok -> go to profile page
                router.push('/profile');
                return;
            } catch (profileErr: any) {
                console.warn('Profile check failed after verify:', profileErr);
                // If verify returned token/user explicitly, we may still redirect
                if (hasToken || hasUser) {
                    router.push('/profile');
                    return;
                }
                // else show error
                setError(profileErr?.message || 'Verification succeeded but profile check failed.');
                return;
            }
        } catch (err: any) {
            console.error(err);
            const msg = err?.message || err?.payload?.message || 'OTP verification failed';
            setError(String(msg));
        } finally {
            setLoading(false);
        }
    }

    async function handleResend() {
        if (!email) { setResendMsg('No email to resend to'); return; }
        setResendLoading(true);
        setResendMsg(null);
        try {
            await resendOtp(email);
            setResendMsg('OTP resent. Check your email.');
        } catch (e) {
            console.error(e);
            setResendMsg('Failed to resend OTP.');
        } finally {
            setResendLoading(false);
        }
    }

    return (
        <div className=" h-[90vh] flex flex-col justify-center items-center p-6 bg-black text-white ">
            <div className="border-gray-100 bg-[#111111] rounded-md shadow-2xl text-center p-6 max-w-md w-full">
                <h2 className="text-xl font-semibold mb-2">Verify your email</h2>
                <p className="text-sm mb-4">We sent a 4-digit code to <strong>{email || 'your email'}</strong></p>

                <div className="mb-4 flex justify-center">
                    <OtpInput length={4} onChange={setOtp} />
                </div>

                {error && <div className="text-red-600 mb-2">{error}</div>}
                {resendMsg && <div className="text-sm text-green-600 mb-2">{resendMsg}</div>}

                <div className="flex flex-col gap-2">
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="flex-1 py-2 bg-blue-600 text-white rounded disabled:opacity-60"
                    >
                        {loading ? 'Verifying...' : 'Verify OTP'}
                    </button>

                    <button
                        onClick={handleResend}
                        disabled={resendLoading || !email}
                        className="py-2 px-3 underline text-sm disabled:opacity-60"
                    >
                        {resendLoading ? '...' : 'Resend'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default VerifyOtpPage;
