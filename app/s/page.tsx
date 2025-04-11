'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

export default function EventPage() {
  const searchParams = useSearchParams();
  const [eventName, setEventName] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvent = async () => {
      const id = searchParams.get('h');
      if (!id) return;
      const ref = doc(db, 'events', id);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        setEventName(snap.data().name);
      } else {
        setEventName('イベントが見つかりませんでした');
      }
      setLoading(false);
    };
    fetchEvent();
  }, [searchParams]);

  if (loading) return <div className="p-6">読み込み中…</div>;

  return (
    <main className="p-6 max-w-lg mx-auto">
      <h1 className="text-xl font-bold mb-2">イベント確認</h1>
      <p>{eventName}</p>
    </main>
  );
}
