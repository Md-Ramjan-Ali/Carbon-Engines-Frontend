'use client';
import { useRouter } from 'next/router';
import { useState } from 'react'

const verifyOtpPage = () => {
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    async function submit() {
        setError(null);
        try {
            const body = await verifyOtp(email, otp);
            if (body && body.user) router.push('/home');
            else setError('Invalid OTP');
        } catch (e) { setError('Failed to verify'); }
    }
    return (
        <div className="max-w-md mx-auto space-y-4">
            <h2 className="text-xl font-semibold">OTP verification</h2>
            <input value={email} onChange={e => setEmail(e.target.value)} placeholder="your email" className="w-full rounded border px-3 py-2" />
            <OtpInput length={4} onChange={setOtp} />
            {error && <div className="text-red-600">{error}</div>}
            <button onClick={submit} className="w-full rounded bg-blue-600 text-white py-2">Verify</button>
        </div>
    )
}

export default verifyOtpPage
