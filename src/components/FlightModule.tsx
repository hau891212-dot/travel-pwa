import React, { useState, useEffect } from 'react';
import { db } from '../services/firebase';
import { doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlane, faSuitcaseRolling, faPlaneDeparture, faCheck, faEdit } from '@fortawesome/free-solid-svg-icons';

export const FlightModule = ({ isEditing, setIsEditing }: { isEditing: boolean, setIsEditing: (v: boolean) => void }) => {
  const [data, setData] = useState<any>(null);
  const [form, setForm] = useState<any>(null);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, "bookings", "flight_info"), (docSnap) => {
      if (docSnap.exists()) {
        setData(docSnap.data());
        setForm(docSnap.data());
      }
    });
    return () => unsub();
  }, []);

  const handleSave = async () => {
    await updateDoc(doc(db, "bookings", "flight_info"), form);
    setIsEditing(false);
    alert('機票數據同步成功！');
  };

  if (!data) return <div className="p-10 text-center text-gray-300">讀取機票中...</div>;

  const BoardingPass = ({ title, d }: { title: string, d: any }) => (
    <div className="bg-white rounded-[2.5rem] shadow-sticker border-2 border-[#E0E5D5] overflow-hidden mb-6">
      <div className="pt-6 pb-2 text-center text-gray-400 font-bold text-xs tracking-widest uppercase">{title} - {d?.airline}</div>
      <div className="text-center pb-4"><div className="inline-block bg-gray-50/50 px-8 py-2 rounded-2xl border border-gray-100"><h2 className="text-5xl font-black text-[#8D775F] tracking-tighter uppercase">{d?.flightNo}</h2></div></div>
      <div className="mx-4 p-5 bg-white rounded-[2.5rem] border-2 border-[#F0EEE6] shadow-sm flex justify-between items-center">
        <div className="text-center w-20">
          <p className="text-3xl font-black text-[#5D534A]">{d?.from}</p>
          <p className="text-lg font-bold text-[#5D534A]">{d?.fromTime}</p>
          <div className="mt-1 bg-[#A8C69F] text-white text-[9px] py-0.5 px-2 rounded-full font-bold inline-block">{d?.fromCity}</div>
        </div>
        <div className="flex-1 flex flex-col items-center px-1">
          <p className="text-[9px] font-bold text-gray-300 mb-1">{d?.duration}</p>
          <div className="w-full flex items-center px-2"><div className="flex-1 h-[2px] border-t-2 border-dashed border-[#E0E5D5]"></div><FontAwesomeIcon icon={faPlaneDeparture} className="mx-2 text-brand-blue text-sm" /><div className="flex-1 h-[2px] border-t-2 border-dashed border-[#E0E5D5]"></div></div>
          <p className="text-[9px] font-bold text-gray-400 mt-1">{d?.date}</p>
        </div>
        <div className="text-center w-20">
          <p className="text-3xl font-black text-[#5D534A]">{d?.to}</p>
          <p className="text-lg font-bold text-[#5D534A]">{d?.toTime}</p>
          <div className="mt-1 bg-[#E98B6D] text-white text-[9px] py-0.5 px-2 rounded-full font-bold inline-block">{d?.toCity}</div>
        </div>
      </div>
      <div className="p-6 grid grid-cols-2 gap-4 border-t border-dashed border-gray-100 mt-4 text-center">
        <div><p className="text-[8px] font-black text-gray-300 uppercase">Baggage</p><div className="flex items-center justify-center gap-1 font-black text-[#8D775F]"><FontAwesomeIcon icon={faSuitcaseRolling} className="text-[#A8C69F]" />{d?.baggage}</div></div>
        <div><p className="text-[8px] font-black text-gray-300 uppercase">Aircraft</p><div className="flex items-center justify-center gap-1 font-black text-[#8D775F]"><FontAwesomeIcon icon={faPlane} className="text-[#E98B6D] opacity-60" />{d?.aircraft}</div></div>
      </div>
    </div>
  );

  if (isEditing) return (
    <div className="space-y-6 animate-in slide-in-from-bottom-10 duration-500 pb-10">
      <div className="bg-white p-6 rounded-[2.5rem] shadow-sticker border-2 border-brand-green space-y-4">
        <h3 className="font-black text-brand-green border-b pb-2 flex items-center gap-2"><FontAwesomeIcon icon={faPlaneDeparture} /> 去程完整參數編輯</h3>
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2"><input className="w-full bg-gray-50 p-4 rounded-xl font-bold text-sm" placeholder="航空公司" value={form.airline} onChange={e => setForm({...form, airline: e.target.value})} /></div>
          <input className="bg-gray-50 p-3 rounded-xl font-bold" placeholder="航班號" value={form.flightNo} onChange={e => setForm({...form, flightNo: e.target.value})} />
          <input className="bg-gray-50 p-3 rounded-xl font-bold" placeholder="日期" value={form.date} onChange={e => setForm({...form, date: e.target.value})} />
          <input className="bg-gray-50 p-3 rounded-xl font-bold" placeholder="出發代碼 (TPE)" value={form.from} onChange={e => setForm({...form, from: e.target.value})} />
          <input className="bg-gray-50 p-3 rounded-xl font-bold" placeholder="出發城市 (桃園)" value={form.fromCity} onChange={e => setForm({...form, fromCity: e.target.value})} />
          <input className="bg-gray-50 p-3 rounded-xl font-bold" placeholder="抵達代碼 (KIX)" value={form.to} onChange={e => setForm({...form, to: e.target.value})} />
          <input className="bg-gray-50 p-3 rounded-xl font-bold" placeholder="抵達城市 (大阪)" value={form.toCity} onChange={e => setForm({...form, toCity: e.target.value})} />
        </div>
      </div>

      <div className="bg-white p-6 rounded-[2.5rem] shadow-sticker border-2 border-brand-accent space-y-4">
        <h3 className="font-black text-brand-accent border-b pb-2">🔄 回程完整參數編輯</h3>
        <div className="grid grid-cols-2 gap-3">
          <input className="bg-gray-50 p-3 rounded-xl font-bold" placeholder="回程航班" value={form.retFlightNo} onChange={e => setForm({...form, retFlightNo: e.target.value})} />
          <input className="bg-gray-50 p-3 rounded-xl font-bold" placeholder="日期" value={form.retDate} onChange={e => setForm({...form, retDate: e.target.value})} />
          <input className="bg-gray-50 p-3 rounded-xl font-bold" placeholder="出發時間" value={form.retFromTime} onChange={e => setForm({...form, retFromTime: e.target.value})} />
          <input className="bg-gray-50 p-3 rounded-xl font-bold" placeholder="抵達時間" value={form.retToTime} onChange={e => setForm({...form, retToTime: e.target.value})} />
        </div>
      </div>
      <button onClick={handleSave} className="w-full bg-brand-green text-white font-black py-5 rounded-2xl shadow-lg flex items-center justify-center gap-2 active:scale-95"><FontAwesomeIcon icon={faCheck} /> 儲存所有變更至雲端</button>
    </div>
  );

  return (
    <>
      <BoardingPass title="去程" d={data} />
      <BoardingPass title="回程" d={{
        airline: data.retAirline, flightNo: data.retFlightNo, from: data.retFrom, fromTime: data.retFromTime, fromCity: data.retFromCity,
        to: data.retTo, toTime: data.retToTime, toCity: data.retToCity, duration: data.retDuration, date: data.retDate, baggage: data.retBaggage, aircraft: data.retAircraft
      }} />
      <button onClick={() => setIsEditing(true)} className="w-full bg-white/50 py-5 rounded-[2rem] border-2 border-dashed border-[#E0E5D5] text-gray-400 font-bold active:scale-95 flex items-center justify-center gap-2"><FontAwesomeIcon icon={faEdit} /> 編輯機票資訊</button>
    </>
  );
};