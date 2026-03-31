import React, { useState, useEffect } from 'react';
import { db } from '../services/firebase';
import { doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlane, faSuitcaseRolling, faPlaneDeparture, faCheck, faEdit, faInfoCircle, faClock, faCalendarAlt } from '@fortawesome/free-solid-svg-icons';

export const FlightModule = ({ isEditing, setIsEditing }: { isEditing: boolean, setIsEditing: (v: boolean) => void }) => {
  const [data, setData] = useState<any>(null);
  const [form, setForm] = useState<any>(null);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, "bookings", "flight_info"), (docSnap) => {
      if (docSnap.exists()) {
        const cloudData = docSnap.data();
        setData(cloudData);
        setForm(cloudData);
      }
    });
    return () => unsub();
  }, []);

  const handleSave = async () => {
    await updateDoc(doc(db, "bookings", "flight_info"), form);
    setIsEditing(false);
    alert('機票所有參數已同步至雲端！');
  };

  if (!data) return <div className="p-10 text-center text-gray-300">讀取機票中...</div>;

  const BoardingPass = ({ title, d }: { title: string, d: any }) => (
    <div className="bg-white rounded-[2.5rem] shadow-sticker border-2 border-[#E0E5D5] overflow-hidden mb-6 animate-in fade-in">
      <div className="pt-6 pb-2 text-center text-gray-400 font-black text-[10px] tracking-[0.3em] uppercase">{title} - {d?.airline}</div>
      <div className="text-center pb-4">
         <div className="inline-block bg-gray-50/50 px-8 py-2 rounded-2xl border border-gray-100">
            <h2 className="text-5xl font-black text-[#8D775F] tracking-tighter uppercase leading-none">{d?.flightNo}</h2>
         </div>
      </div>
      <div className="mx-4 p-5 bg-white rounded-[2.5rem] border-2 border-[#F0EEE6] shadow-sm flex justify-between items-center relative">
        <div className="text-center w-20">
          <p className="text-3xl font-black text-[#5D534A] leading-none">{d?.from}</p>
          <p className="text-lg font-bold text-[#5D534A] mt-1">{d?.fromTime}</p>
          <div className="mt-2 bg-[#A8C69F] text-white text-[9px] py-0.5 px-2 rounded-full font-bold inline-block">{d?.fromCity}</div>
        </div>
        <div className="flex-1 flex flex-col items-center px-1">
          <p className="text-[9px] font-bold text-gray-300 mb-1 italic">{d?.duration}</p>
          <div className="w-full flex items-center px-2">
            <div className="flex-1 h-[2px] border-t-2 border-dashed border-[#E0E5D5]"></div>
            <FontAwesomeIcon icon={faPlaneDeparture} className="mx-2 text-brand-blue text-sm" />
            <div className="flex-1 h-[2px] border-t-2 border-dashed border-[#E0E5D5]"></div>
          </div>
          <p className="text-[9px] font-bold text-gray-400 mt-1">{d?.date}</p>
        </div>
        <div className="text-center w-20">
          <p className="text-3xl font-black text-[#5D534A] leading-none">{d?.to}</p>
          <p className="text-lg font-bold text-[#5D534A] mt-1">{d?.toTime}</p>
          <div className="mt-2 bg-[#E98B6D] text-white text-[9px] py-0.5 px-2 rounded-full font-bold inline-block">{d?.toCity}</div>
        </div>
      </div>
      <div className="p-6 grid grid-cols-2 gap-4 border-t border-dashed border-gray-100 mt-4 text-center">
        <div className="flex flex-col items-center justify-center border-r border-gray-50">
          <p className="text-[8px] font-black text-gray-300 uppercase mb-1">Baggage 重量</p>
          <div className="flex items-center gap-1 font-black text-[#8D775F]"><FontAwesomeIcon icon={faSuitcaseRolling} className="text-[#A8C69F] text-xs" />{d?.baggage}</div>
        </div>
        <div className="flex flex-col items-center justify-center">
          <p className="text-[8px] font-black text-gray-300 uppercase mb-1">Aircraft 機型</p>
          <div className="flex items-center gap-1 font-black text-[#8D775F]"><FontAwesomeIcon icon={faPlane} className="text-[#E98B6D] opacity-60 text-xs" />{d?.aircraft}</div>
        </div>
      </div>
    </div>
  );

  if (isEditing) return (
    <div className="space-y-6 animate-in slide-in-from-bottom-10 duration-500 pb-20">
      {/* 去程編輯區 */}
      <div className="bg-white p-6 rounded-[2.5rem] shadow-sticker border-2 border-brand-green space-y-4">
        <h3 className="font-black text-brand-green flex items-center gap-2 text-sm border-b pb-2"><FontAwesomeIcon icon={faPlaneDeparture} /> 去程航班完整參數</h3>
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2"><label className="text-[9px] font-bold text-gray-300 ml-2">航空公司</label><input className="w-full bg-[#F7F4EB] p-3 rounded-xl font-bold" value={form.airline} onChange={e => setForm({...form, airline: e.target.value})} /></div>
          <div><label className="text-[9px] font-bold text-gray-300 ml-2">航班號</label><input className="w-full bg-[#F7F4EB] p-3 rounded-xl font-bold" value={form.flightNo} onChange={e => setForm({...form, flightNo: e.target.value})} /></div>
          <div><label className="text-[9px] font-bold text-gray-300 ml-2">日期</label><input className="w-full bg-[#F7F4EB] p-3 rounded-xl font-bold" value={form.date} onChange={e => setForm({...form, date: e.target.value})} /></div>
          <div><label className="text-[9px] font-bold text-gray-300 ml-2">出發城市 (桃園)</label><input className="w-full bg-[#F7F4EB] p-3 rounded-xl font-bold" value={form.fromCity} onChange={e => setForm({...form, fromCity: e.target.value})} /></div>
          <div><label className="text-[9px] font-bold text-gray-300 ml-2">出發代碼 (TPE)</label><input className="w-full bg-[#F7F4EB] p-3 rounded-xl font-bold" value={form.from} onChange={e => setForm({...form, from: e.target.value})} /></div>
          <div><label className="text-[9px] font-bold text-gray-300 ml-2">抵達城市 (大阪)</label><input className="w-full bg-[#F7F4EB] p-3 rounded-xl font-bold" value={form.toCity} onChange={e => setForm({...form, toCity: e.target.value})} /></div>
          <div><label className="text-[9px] font-bold text-gray-300 ml-2">抵達代碼 (KIX)</label><input className="w-full bg-[#F7F4EB] p-3 rounded-xl font-bold" value={form.to} onChange={e => setForm({...form, to: e.target.value})} /></div>
          <div><label className="text-[9px] font-bold text-gray-300 ml-2">出發時間</label><input className="w-full bg-[#F7F4EB] p-3 rounded-xl font-bold" value={form.fromTime} onChange={e => setForm({...form, fromTime: e.target.value})} /></div>
          <div><label className="text-[9px] font-bold text-gray-300 ml-2">抵達時間</label><input className="w-full bg-[#F7F4EB] p-3 rounded-xl font-bold" value={form.toTime} onChange={e => setForm({...form, toTime: e.target.value})} /></div>
          <div><label className="text-[9px] font-bold text-gray-300 ml-2">飛行時長</label><input className="w-full bg-[#F7F4EB] p-3 rounded-xl font-bold" value={form.duration} onChange={e => setForm({...form, duration: e.target.value})} /></div>
          <div><label className="text-[9px] font-bold text-gray-300 ml-2">行李額度</label><input className="w-full bg-[#F7F4EB] p-3 rounded-xl font-bold" value={form.baggage} onChange={e => setForm({...form, baggage: e.target.value})} /></div>
          <div className="col-span-2"><label className="text-[9px] font-bold text-gray-300 ml-2">飛機機型</label><input className="w-full bg-[#F7F4EB] p-3 rounded-xl font-bold" value={form.aircraft} onChange={e => setForm({...form, aircraft: e.target.value})} /></div>
        </div>
      </div>

      {/* 回程編輯區 */}
      <div className="bg-white p-6 rounded-[2.5rem] shadow-sticker border-2 border-brand-accent space-y-4">
        <h3 className="font-black text-brand-accent flex items-center gap-2 text-sm border-b pb-2">🔄 回程航班完整參數</h3>
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2"><label className="text-[9px] font-bold text-gray-300 ml-2">回程航空公司</label><input className="w-full bg-[#F7F4EB] p-3 rounded-xl font-bold text-sm" value={form.retAirline} onChange={e => setForm({...form, retAirline: e.target.value})} /></div>
          <div><label className="text-[9px] font-bold text-gray-300 ml-2">航班號</label><input className="w-full bg-[#F7F4EB] p-3 rounded-xl font-bold" value={form.retFlightNo} onChange={e => setForm({...form, retFlightNo: e.target.value})} /></div>
          <div><label className="text-[9px] font-bold text-gray-300 ml-2">日期</label><input className="w-full bg-[#F7F4EB] p-3 rounded-xl font-bold" value={form.retDate} onChange={e => setForm({...form, retDate: e.target.value})} /></div>
          <div><label className="text-[9px] font-bold text-gray-300 ml-2">出發城市 (大阪)</label><input className="w-full bg-[#F7F4EB] p-3 rounded-xl font-bold" value={form.retFromCity} onChange={e => setForm({...form, retFromCity: e.target.value})} /></div>
          <div><label className="text-[9px] font-bold text-gray-300 ml-2">目的城市 (桃園)</label><input className="w-full bg-[#F7F4EB] p-3 rounded-xl font-bold" value={form.retToCity} onChange={e => setForm({...form, retToCity: e.target.value})} /></div>
          <div><label className="text-[9px] font-bold text-gray-300 ml-2">出發時間</label><input className="w-full bg-[#F7F4EB] p-3 rounded-xl font-bold" value={form.retFromTime} onChange={e => setForm({...form, retFromTime: e.target.value})} /></div>
          <div><label className="text-[9px] font-bold text-gray-300 ml-2">抵達時間</label><input className="w-full bg-[#F7F4EB] p-3 rounded-xl font-bold" value={form.retToTime} onChange={e => setForm({...form, retToTime: e.target.value})} /></div>
          <div><label className="text-[9px] font-bold text-gray-300 ml-2">行李額度</label><input className="w-full bg-[#F7F4EB] p-3 rounded-xl font-bold" value={form.retBaggage} onChange={e => setForm({...form, retBaggage: e.target.value})} /></div>
          <div><label className="text-[9px] font-bold text-gray-300 ml-2">機型</label><input className="w-full bg-[#F7F4EB] p-3 rounded-xl font-bold" value={form.retAircraft} onChange={e => setForm({...form, retAircraft: e.target.value})} /></div>
        </div>
      </div>
      <button onClick={handleSave} className="w-full bg-brand-green text-white font-black py-5 rounded-3xl shadow-lg flex items-center justify-center gap-2 active:scale-95 transition-all"><FontAwesomeIcon icon={faCheck} /> 儲存所有航班更新</button>
    </div>
  );

  return (
    <div className="animate-in fade-in duration-500 px-2">
      <BoardingPass title="去程" d={data} />
      <BoardingPass title="回程" d={{
        airline: data.retAirline, flightNo: data.retFlightNo, from: data.retFrom, fromTime: data.retFromTime, fromCity: data.retFromCity,
        to: data.retTo, toTime: data.retToTime, toCity: data.retToCity, duration: data.retDuration, date: data.retDate, baggage: data.retBaggage, aircraft: data.retAircraft
      }} />
      <button onClick={() => setIsEditing(true)} className="w-full bg-white/50 py-5 rounded-[2rem] border-2 border-dashed border-[#E0E5D5] text-gray-400 font-bold active:scale-95 flex items-center justify-center gap-2 mb-10"><FontAwesomeIcon icon={faEdit} /> 編輯全部機票參數</button>
    </div>
  );
};