'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { doc, getDoc, collection, getDocs, addDoc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';

export default function EventViewPage() {
  const searchParams = useSearchParams();
  const [data, setData] = useState<any>(null);
  const [responses, setResponses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formName, setFormName] = useState('');
  const [formComment, setFormComment] = useState('');
  const [formAnswers, setFormAnswers] = useState<{ [key: string]: string }>({});
  const [selectedPlan, setSelectedPlan] = useState('');

  const handleResponseSubmit = async () => {
    const id = searchParams.get('h');
    if (!id || !formName.trim()) return;

    const newResponse = {
      name: formName,
      comment: formComment,
      answers: formAnswers,
      votedPlan: selectedPlan,
      createdAt: new Date(),
    };

    const ref = doc(db, 'events', id);
    await addDoc(collection(ref, 'responses'), newResponse);

    setResponses((prev) => [...prev, newResponse]);
    setFormName('');
    setFormComment('');
    setFormAnswers({});
    setSelectedPlan('');
    setShowForm(false);
  };

  useEffect(() => {
    const fetchEvent = async () => {
      const id = searchParams.get('h');
      if (!id) return;

      const ref = doc(db, 'events', id);
      const snap = await getDoc(ref);
      if (!snap.exists()) {
        setData({ error: true });
        setLoading(false);
        return;
      }

      const eventData = snap.data();
      setData(eventData);

      const responseSnap = await getDocs(collection(ref, 'responses'));
      const responseList = responseSnap.docs.map(doc => doc.data());
      setResponses(responseList);
      setLoading(false);
    };

    fetchEvent();
  }, [searchParams]);

  if (loading) return <p className="p-6">読み込み中…</p>;
  if (!data || data.error) return <p className="p-6">イベントが見つかりませんでした。</p>;

  return (
    <main className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl mb-2 font-bold">🗓 イベント名</h1>
      <p className="mb-4">{data.name}</p>

      {data.memo && (
        <>
          <h2 className="text-xl mb-1 font-semibold">📝 メモ</h2>
          <p className="mb-4 whitespace-pre-wrap">{data.memo}</p>
        </>
      )}

      {data.planOptions?.length > 0 && (
        <>
          <h2 className="text-xl mb-2 font-semibold">📍 プラン候補</h2>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {data.planOptions.map((plan: any, i: number) => {
              const voteCount = responses.filter(res => res.votedPlan === plan.name).length;
              return (
                <li key={i} className="border p-4 rounded-lg bg-white shadow">
                  <h3 className="text-md font-bold">{plan.name}</h3>
                  {plan.address && <p className="text-sm text-gray-600">📍 {plan.address}</p>}
                  {plan.note && <p className="text-sm text-gray-500 mt-1">{plan.note}</p>}
                  <p className="mt-2 text-sm font-medium text-blue-700">🗳 {voteCount}票</p>
                </li>
              );
            })}
          </ul>
        </>
      )}

      <h2 className="text-xl mb-2 font-semibold">🕒 日程候補</h2>
      <ul className="list-disc ml-5 mb-6">
        {data.timeOptions?.map((opt: string, i: number) => (
          <li key={i}>{opt}</li>
        ))}
      </ul>

      {data.timeOptions?.length > 0 && (
        <>
          <h2 className="text-xl mt-6 mb-2 font-semibold">📊 回答一覧</h2>

          <table className="w-full border text-sm text-center mb-6">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-2">日程</th>
                <th>○</th>
                <th>△</th>
                <th>×</th>
              </tr>
            </thead>
            <tbody>
              {data.timeOptions.map((time: string) => {
                const count = { '○': 0, '△': 0, '×': 0 };
                responses.forEach((res) => {
                  const answer = res.answers?.[time];
                  if (answer && count[answer as '○' | '△' | '×'] !== undefined) {
                    count[answer as '○' | '△' | '×']++;
                  }
                });

                return (
                  <tr key={time}>
                    <td className="p-2 border">{time}</td>
                    <td className="border">{count['○']}人</td>
                    <td className="border">{count['△']}人</td>
                    <td className="border">{count['×']}人</td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <h3 className="text-md font-bold mt-4 mb-2">🧑‍🤝‍🧑 各参加者の回答</h3>
          <table className="w-full border text-sm text-center mb-8">
            <thead>
              <tr className="bg-gray-50">
                <th className="p-1">名前</th>
                {data.timeOptions.map((t: string) => (
                  <th key={t}>{t}</th>
                ))}
                <th>投票プラン</th>
                <th>コメント</th>
              </tr>
            </thead>
            <tbody>
              {responses.map((res, i) => (
                <tr key={i}>
                  <td className="border p-1">{res.name}</td>
                  {data.timeOptions.map((t: string) => (
                    <td key={t} className="border p-1">{res.answers?.[t] || ''}</td>
                  ))}
                  <td className="border p-1">{res.votedPlan || '-'}</td>
                  <td className="border p-1">{res.comment || ''}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}

      <div className="text-center mt-8">
        <Button
          onClick={() => setShowForm(!showForm)}
          className="rounded-full px-6 py-3 text-lg"
        >
          出欠を入力する
        </Button>
      </div>

      {showForm && (
        <div className="mt-6 p-4 border rounded-xl bg-gray-50">
          <h3 className="text-lg font-semibold mb-2">📝 出欠を入力</h3>

          <input
            type="text"
            placeholder="名前（必須）"
            className="w-full mb-2 px-3 py-2 border rounded"
            value={formName}
            onChange={(e) => setFormName(e.target.value)}
          />

          <textarea
            placeholder="コメント（任意）"
            className="w-full mb-4 px-3 py-2 border rounded"
            value={formComment}
            onChange={(e) => setFormComment(e.target.value)}
          />

          {data.planOptions?.length > 0 && (
            <div className="mb-4">
              <p className="text-sm font-semibold mb-2">🗳 どのプランが良い？</p>
              <div className="space-y-2">
                {data.planOptions.map((plan: any, i: number) => (
                  <label key={i} className="block text-sm">
                    <input
                      type="radio"
                      name="votedPlan"
                      value={plan.name}
                      checked={selectedPlan === plan.name}
                      onChange={(e) => setSelectedPlan(e.target.value)}
                      className="mr-2"
                    />
                    {plan.name}
                  </label>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-3">
            {data.timeOptions.map((opt: string, i: number) => (
              <div key={i}>
                <p className="text-sm font-medium mb-1">{opt}</p>
                <div className="flex gap-3">
                  {['○', '△', '×'].map((v) => (
                    <label key={v} className="flex items-center gap-1 text-sm">
                      <input
                        type="radio"
                        name={`response-${opt}`}
                        value={v}
                        checked={formAnswers[opt] === v}
                        onChange={() =>
                          setFormAnswers((prev) => ({ ...prev, [opt]: v }))
                        }
                      />
                      {v}
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <Button onClick={handleResponseSubmit} className="mt-6 w-full">
            回答を送信する
          </Button>
        </div>
      )}
    </main>
  );
}
