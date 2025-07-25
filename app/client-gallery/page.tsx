"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';

export default function ClientGalleryPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
      if (!firebaseUser) {
        router.replace('/');
      }
    });
    return () => unsub();
  }, [router]);

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center text-lg text-gray-500">Loading...</div>;
  }

  if (!user) {
    return null;
  }

  return (
    <div className="flex flex-col min-h-screen items-center justify-center">
      <h1 className="text-2xl font-bold mb-4">Client Gallery</h1>
      <p className="text-gray-600">Client gallery content will be here</p>
    </div>
  );
} 