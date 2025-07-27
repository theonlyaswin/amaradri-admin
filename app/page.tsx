"use client";
import { useEffect, useState } from 'react';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/firebase';
import { signInWithEmailAndPassword, onAuthStateChanged, signOut, User } from 'firebase/auth';

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (user) {
      redirect('/gallery');
    }
  }, [user]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (e: any) {
      setError(e.message);
    }
  };

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center text-lg text-gray-500">Loading...</div>;
  }

  if (!user) {
    return (
      <div className="flex flex-col min-h-screen items-center justify-center">
        <div className="text-2xl font-bold mb-4">Sign in to continue</div>
        <form className="flex flex-col gap-4 w-80" onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="border rounded-md px-3 py-2"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="border rounded-md px-3 py-2"
            required
          />
          <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded-md">Sign in</button>
        </form>
        {error && <div className="mt-4 text-red-500">{error}</div>}
      </div>
    );
  }

  // If user is logged in, redirect will happen
  return null;
}