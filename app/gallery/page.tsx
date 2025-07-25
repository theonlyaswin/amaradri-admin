"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import GalleryLayout from '@/components/layouts/GalleryLayout';

export default function GalleryPage() {
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

  return <GalleryLayout />;
} 