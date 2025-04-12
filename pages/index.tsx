'use client';

import { useState } from 'react';
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { db } from '@/lib/firebase';
import { addDoc, collection } from 'firebase/firestore';
import { format } from "date-fns";
import { ja } from 'date-fns/locale';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function HomePage() {
  const [eventName, setEventName] = useState('');
  const [memo, setMemo] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [timeOptions, setTimeOptions] = useState<string[]>([]);
  const [link, setLink] = useState('');
  const [selectedHour, setSelectedHour] = useState('');
  const [selectedMinute, setSelectedMinute] = useState('');
  const [useplanOptions, setUseplanOptions] = useState(false);
  // const [planOptions, setplanOptions] = useState<string[]>([]);
  // const [PlanshopInput, setPlanShopInput] = useState('');
  // state追加
const [PlanshopInput, setPlanShopInput] = useState({ name: '', address: '', note: '' });
// const [planOptions, setplanOptions] = useState<
  // { name: string; address: string; note: string }[]
// >([]);
const [useVotePlans, setUseVotePlans] = useState(false);
const [planInput, setPlanInput] = useState({ name: '', address: '', note: '' });
const [planOptions, setPlanOptions] = useState<{ name: string; address: string; note: string }[]>([]);

const handlePlanInputChange = (key: 'name' | 'address' | 'note', value: string) => {
  setPlanInput((prev) => ({ ...prev, [key]: value }));
};

const addPlanOption = () => {
  if (!planInput.name.trim()) return;
  setPlanOptions([...planOptions, { ...planInput }]);
  setPlanInput({ name: '', address: '', note: '' });
};

const removePlanOption = (index: number) => {
  const updated = [...planOptions];
  updated.splice(index, 1);
  setPlanOptions(updated);
};


// 入力変更
const handlePlanShopInputChange = (key: 'name' | 'address' | 'note', value: string) => {
  setPlanShopInput((prev) => ({ ...prev, [key]: value }));
};

// // 追加処理
// const addPlanShop = () => {
//   if (!PlanshopInput.name.trim()) return;
//   setplanOptions([...planOptions, { ...PlanshopInput }]);
//   setPlanShopInput({ name: '', address: '', note: '' });
// };

// // 削除処理
// const removePlan = (index: number) => {
//   const updated = [...planOptions];
//   updated.splice(index, 1);
//   setplanOptions(updated);
// };


  const addTimeOption = () => {
    if (!selectedDate || !selectedHour || !selectedMinute) return;
    const dateStr = format(selectedDate, "M/d(E)", { locale: ja });
    const timeStr = `${selectedHour}:${selectedMinute}〜`;
    const full = `${dateStr} ${timeStr}`;
    if (timeOptions.includes(full)) return;
    setTimeOptions([...timeOptions, full]);
    setSelectedDate(undefined);
    setSelectedHour('');
    setSelectedMinute('');
  };

  const removeTimeOption = (index: number) => {
    const updated = [...timeOptions];
    updated.splice(index, 1);
    setTimeOptions(updated);
  };

  const handleSubmit = async () => {
    if (!eventName.trim()) return;

    const docRef = await addDoc(collection(db, 'events'), {
      name: eventName,
      memo,
      timeOptions,
      planOptions: useVotePlans ? planOptions : [],

      createdAt: new Date(),
    });
    

    const newUrl = `${window.location.origin}/s?h=${docRef.id}`;
    setLink(newUrl);
    await navigator.clipboard.writeText(newUrl);
    alert('リンクをコピーしました！');
  };

  return (
    <main className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
      <div className="bg-white shadow-2xl rounded-2xl p-8 max-w-2xl w-full space-y-6">
        <h1 className="text-3xl font-bold text-gray-800 text-center">🎉 イベント作成</h1>

        <Input
          placeholder="イベント名"
          value={eventName}
          onChange={(e) => setEventName(e.target.value)}
        />

        <Input
          placeholder="メモ（任意）"
          value={memo}
          onChange={(e) => setMemo(e.target.value)}
        />

        {/* 🍱 お店候補を使うかどうか */}
{/* 🗳️ 投票機能のON/OFF */}
<div className="flex items-center gap-2">
  <Checkbox
    checked={useVotePlans}
    onCheckedChange={(v: any) => setUseVotePlans(!!v)}
  />
  <span className="font-medium text-gray-800">投票機能を追加する</span>
</div>

{/* 説明文 */}
{useVotePlans && (
  <div className="text-sm text-gray-600 ml-1 mb-2">
    投票機能で、みんなでどこに行きたいか決めよう！プランを複数追加して、みんなに投票してもらおう。
  </div>
)}

        {useVotePlans && (
  <div className="space-y-4">
    <div className="flex flex-col gap-2 md:flex-row">
      <Input
        placeholder="例：海でBBQ、家でパーティー、日帰りスキー"
        value={planInput.name}
        onChange={(e) => handlePlanInputChange('name', e.target.value)}
      />
      <Input
        placeholder="場所（任意）"
        value={planInput.address}
        onChange={(e) => handlePlanInputChange('address', e.target.value)}
      />
      <Input
        placeholder="メモ（任意）"
        value={planInput.note}
        onChange={(e) => handlePlanInputChange('note', e.target.value)}
      />
      <Button onClick={addPlanOption}>追加</Button>
    </div>

    <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {planOptions.map((plan, i) => (
        <li key={i} className="border p-4 rounded-lg bg-white shadow">
          <h3 className="text-md font-bold">{plan.name}</h3>
          {plan.address && <p className="text-sm text-gray-600">📍{plan.address}</p>}
          {plan.note && <p className="text-sm text-gray-500 mt-1">{plan.note}</p>}
          <Button
            variant="ghost"
            size="sm"
            className="text-red-500 hover:bg-red-100 mt-2"
            onClick={() => removePlanOption(i)}
          >
            🗑️ 削除
          </Button>
        </li>
      ))}
    </ul>
  </div>
)}

        

        {/* 🕒 日程候補 */}
        <div className="space-y-2">
          <label className="font-medium text-gray-700">日付選択</label>
          <Calendar mode="single" selected={selectedDate} onSelect={setSelectedDate} />

          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <label className="block font-medium text-gray-700 mb-1">時</label>
              <Select onValueChange={(v) => setSelectedHour(v)} value={selectedHour}>
                <SelectTrigger>
                  <SelectValue placeholder="時を選択" />
                </SelectTrigger>
                <SelectContent>
                  {[...Array(24)].map((_, i) => {
                    const v = String(i).padStart(2, '0');
                    return <SelectItem key={v} value={v}>{v}</SelectItem>;
                  })}
                </SelectContent>
              </Select>
            </div>

            <div className="flex-1">
              <label className="block font-medium text-gray-700 mb-1">分</label>
              <Select onValueChange={(v) => setSelectedMinute(v)} value={selectedMinute}>
                <SelectTrigger>
                  <SelectValue placeholder="分を選択" />
                </SelectTrigger>
                <SelectContent>
                  {["00", "15", "30", "45"].map((v) => (
                    <SelectItem key={v} value={v}>{v}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button onClick={addTimeOption}>候補追加</Button>
          <ul className="list-disc ml-5 mt-2 text-gray-800 space-y-1">
            {timeOptions.map((opt, i) => (
              <li key={i} className="flex justify-between items-center">
                <span>{opt}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-red-500 hover:bg-red-100"
                  onClick={() => removeTimeOption(i)}
                >
                  🗑️
                </Button>
              </li>
            ))}
          </ul>
        </div>

        <Button className="w-full bg-blue-600 hover:bg-blue-500" onClick={handleSubmit}>
          🚀 イベント作成してリンク生成
        </Button>

        {link && (
          <div className="bg-blue-50 p-4 rounded-xl shadow-inner text-center">
            <p className="text-blue-700 font-medium">このリンクを共有：</p>
            <a href={link} className="text-blue-800 underline break-all">
              {link}
            </a>
          </div>
        )}
      </div>
    </main>
  );
}
