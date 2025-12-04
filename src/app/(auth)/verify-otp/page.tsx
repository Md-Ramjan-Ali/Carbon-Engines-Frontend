// app/(auth)/verify-otp/page.tsx
'use client';
import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import OtpInput from '../../../components/otpInput/otpInput';
import { verifyOtp, resendOtp } from '../../../lib/authClient';

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
            const body = await verifyOtp(email, otp);
            // verifyOtp in authClient already saves token & user (if backend returns)
            // If backend didn't return token but mark verified, you may need to call login or fetch profile.
            router.push('/profile');
        } catch (err) {
            console.error(err);
            setError(err?.message || 'OTP verification failed');
        } finally {
            setLoading(false);
        }
    }

    async function handleResend() {
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
                <p className="text-sm mb-4">We sent a 4-digit code to <strong>{email}</strong></p>

                <div className="mb-4 flex justify-center">
                    <OtpInput length={4} onChange={setOtp} />
                </div>

                {error && <div className="text-red-600 mb-2">{error}</div>}
                {resendMsg && <div className="text-sm text-green-600 mb-2">{resendMsg}</div>}

                <div className="flex flex-col gap-2">
                    <button onClick={handleSubmit} disabled={loading} className="flex-1 py-2 bg-blue-600 text-white rounded">
                        {loading ? 'Verifying...' : 'Verify OTP'}
                    </button>
                    <button onClick={handleResend} disabled={resendLoading} className="py-2 px-3 underline text-sm">
                        {resendLoading ? '...' : 'Resend'}
                    </button>
                </div>
            </div>
        </div>
    )
}

export default VerifyOtpPage

