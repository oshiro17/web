'use client';

import { useState } from 'react';
import { db } from '@/lib/firebase';
import { addDoc, collection } from 'firebase/firestore';

export default function HomePage() {
  const [eventName, setEventName] = useState('');
  const [link, setLink] = useState('');

  const handleSubmit = async () => {
    if (!eventName.trim()) return;

    const docRef = await addDoc(collection(db, 'events'), {
      name: eventName,
      createdAt: new Date(),
    });

    const newUrl = `${window.location.origin}/s?h=${docRef.id}`;
    setLink(newUrl);
    await navigator.clipboard.writeText(newUrl);
    alert('リンクをコピーしました！');
  };

  return (
    <main className="p-6 max-w-lg mx-auto">
      <h1 className="text-2xl mb-4">イベント作成</h1>
      <input
        type="text"
        placeholder="イベント名"
        className="border p-2 w-full mb-4"
        value={eventName}
        onChange={(e) => setEventName(e.target.value)}
      />
      <button
        className="bg-blue-600 text-white px-4 py-2 rounded"
        onClick={handleSubmit}
      >
        イベント作成してリンク生成
      </button>
      {link && (
        <div className="mt-4">
          <p>このリンクを共有：</p>
          <a href={link} className="text-blue-600 underline">
            {link}
          </a>
        </div>
      )}
    </main>
  );
}
