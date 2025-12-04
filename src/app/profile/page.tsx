// app/profile/page.tsx
'use client';
import React, { useEffect, useState } from 'react';
import { fetchWithAuth, logout } from '../../lib/authClient';
import { useRouter } from 'next/navigation';

interface User {
    name?: string;
    username?: string;
    email?: string;
    avatarUrl?: string;
    role?: string;
    status?: string;
    memberShip?: string;
    mobile?: string;
    timezone?: string;
    language?: string;
    allowNotification?: boolean;
    createdAt?: string;
    lastLoginAt?: string;
    lastActiveAt?: string;
    trialEndsAt?: string;
    notifications?: any[];
}

function formatDate(d: any) {
    if (!d) return '—';
    try {
        const dt = new Date(d);
        return dt.toLocaleString();
    } catch {
        return d;
    }
}

const ProfilePage = () => {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        (async () => {
            setLoading(true);
            try {
                // fetchWithAuth sends credentials: 'include' so cookie will be sent
                const res = await fetchWithAuth('/api/auth/profile');

                if (res.status === 401 || res.status === 403) {
                    // Unauthorized
                    await logout();
                    router.push('/login');
                    return;
                }

                if (!res.ok) {
                    const payload = await res.json().catch(() => ({}));
                    throw new Error(payload?.message || `Failed to load profile (${res.status})`);
                }

                const data = await res.json();
                const profile = data.data ?? data.user ?? data;

                setUser(profile);

            } catch (e: any) {
                console.error(e);
                setError(e?.message || 'Failed to load profile');
            } finally {
                setLoading(false);
            }
        })();
    }, [router]);

    function handleLogout() {
        logout();
        router.push('/login');
    }

    if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    if (error) return <div className="min-h-screen flex items-center justify-center text-red-600">{error}</div>;
    if (!user) return <div className="min-h-screen flex items-center justify-center">No user found.</div>;

    return (
        <div className="min-h-screen bg-black p-6 text-white">
            <div className="max-w-3xl mx-auto bg-[#111111] p-6 rounded-lg shadow-lg">

                <div className="bg-[#111111] rounded-lg shadow p-6">
                    <div className="flex items-center gap-6">
                        <img
                            src={user.avatarUrl || '/images/default-avatar.png'}
                            alt="avatar"
                            className="w-24 h-24 rounded-full object-cover border"
                        />

                        <div className="flex-1">
                            <h1 className="text-2xl font-semibold">{user.name || user.username || user.email}</h1>
                            <p className="text-sm ">{user.email}</p>

                            <div className="mt-2 flex flex-wrap gap-3 items-center">
                                <span className="text-xs px-2 py-1 rounded">{user.role ?? 'USER'}</span>
                                <span className="text-xs px-2 py-1 rounded">Status: {user.status ?? '—'}</span>
                                <span className="text-xs px-2 py-1 rounded">Plan: {user.memberShip ?? 'FREE'}</span>
                            </div>

                            <div className="mt-2 text-sm">
                                {user.mobile ? <span>📞 {user.mobile} • </span> : null}
                                <span>Timezone: {user.timezone ?? 'UTC'}</span>
                            </div>
                        </div>

                        <div className="flex flex-col gap-2">
                            <button onClick={() => router.push('/profile/edit')} className="px-4 py-2 rounded border text-sm">Edit</button>
                            <button onClick={handleLogout} className="px-4 py-2 rounded bg-red-600 text-white text-sm">Logout</button>
                        </div>
                    </div>

                    <hr className="my-4" />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <div className="text-xs ">Username</div>
                            <div className="font-medium">{user.username ?? '—'}</div>

                            <div className="text-xs  mt-3">Language</div>
                            <div className="font-medium">{user.language ?? 'EN'}</div>

                            <div className="text-xs  mt-3">Allow Notifications</div>
                            <div className="font-medium">{user.allowNotification ? 'Yes' : 'No'}</div>

                            <div className="text-xs  mt-3">Member Since</div>
                            <div className="font-medium">{formatDate(user.createdAt)}</div>
                        </div>

                        <div className="space-y-2">
                            <div className="text-xs ">Last Login</div>
                            <div className="font-medium">{formatDate(user.lastLoginAt)}</div>

                            <div className="text-xs  mt-3">Last Active</div>
                            <div className="font-medium">{formatDate(user.lastActiveAt)}</div>

                            <div className="text-xs  mt-3">Trial Ends</div>
                            <div className="font-medium">{formatDate(user.trialEndsAt)}</div>

                            <div className="text-xs  mt-3">Notifications</div>
                            <div className="font-medium">{Array.isArray(user.notifications) ? user.notifications.length : 0}</div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default ProfilePage;
