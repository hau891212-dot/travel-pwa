import React, { useState, useEffect } from 'react';
import { db } from '../services/firebase';
import { doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHotel, faMapMarkerAlt, faLongArrowAltRight, faCheck, faEdit, faCoins, faCalendarAlt, faInfoCircle } from '@fortawesome/free-solid-svg-icons';

export const StayModule = ({ isEditing, setIsEditing }: { isEditing: boolean, setIsEditing: (v: boolean) => void }) => {
  const [data, setData] = useState<any>(null);
  const [form, setForm] = useState<any>(null);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, "bookings", "stay_info"), (docSnap) => {
      if (docSnap.exists()) {
        setData(docSnap.data());
        setForm(docSnap.data());
      }
    });
    return () => unsub();
  }, []);

  const handleSave = async () => {
    await updateDoc(doc(db, "bookings", "stay_info"), form);
    setIsEditing(false);
    alert('住宿參數已更新！');
  };

  if (!data) return <div className="p-10 text-center text-gray-300 italic">讀取住宿資料中...</div>;

  if (isEditing) return (
    <div className="space-y-6 animate-in slide-in-from-bottom-10 duration-500 pb-20 px-2">
      <div className="bg-white p-6 rounded-[2.5rem] shadow-sticker border-2 border-brand-green space-y-6">
        <div className="space-y-4">
           <h3 className="font-black text-brand-green flex items-center gap-2 text-sm border-b pb-2"><FontAwesomeIcon icon={faInfoCircle} /> 住宿核心資訊</h3>
           <div className="space-y-3">
             <div><label className="text-[9px] font-bold text-gray-300 ml-2">飯店名稱</label><input className="w-full bg-[#F7F4EB] p-3 rounded-xl font-bold outline-none" value={form.hotelName} onChange={e => setForm({...form, hotelName: e.target.value})} /></div>
             <div><label className="text-[9px] font-bold text-gray-300 ml-2">照片網址</label><input className="w-full bg-[#F7F4EB] p-3 rounded-xl font-bold outline-none text-xs" value={form.imgUrl} onChange={e => setForm({...form, imgUrl: e.target.value})} /></div>
             <div><label className="text-[9px] font-bold text-gray-300 ml-2">完整地址</label><input className="w-full bg-[#F7F4EB] p-3 rounded-xl font-bold outline-none" value={form.address} onChange={e => setForm({...form, address: e.target.value})} /></div>
             <div className="grid grid-cols-2 gap-3">
               <div><label className="text-[9px] font-bold text-gray-300 ml-2">地點標籤 (如:大阪)</label><input className="w-full bg-[#F7F4EB] p-3 rounded-xl font-bold outline-none" value={form.locationTag} onChange={e => setForm({...form, locationTag: e.target.value})} /></div>
               <div><label className="text-[9px] font-bold text-gray-300 ml-2">訂單編號</label><input className="w-full bg-[#F7F4EB] p-3 rounded-xl font-bold outline-none" value={form.refNo} onChange={e => setForm({...form, refNo: e.target.value})} /></div>
             </div>
           </div>
        </div>
        
        <div className="space-y-4 border-t pt-4">
           <h3 className="font-black text-brand-blue flex items-center gap-2 text-sm border-b pb-2"><FontAwesomeIcon icon={faCalendarAlt} /> 入住與退房時間</h3>
           <div className="grid grid-cols-2 gap-3">
             <div><label className="text-[9px] font-bold text-gray-300 ml-2">入日期</label><input className="w-full bg-[#F7F4EB] p-3 rounded-xl font-bold" value={form.checkInDate} onChange={e => setForm({...form, checkInDate: e.target.value})} /></div>
             <div><label className="text-[9px] font-bold text-gray-300 ml-2">入時間</label><input className="w-full bg-[#F7F4EB] p-3 rounded-xl font-bold" value={form.checkInTime} onChange={e => setForm({...form, checkInTime: e.target.value})} /></div>
             <div><label className="text-[9px] font-bold text-gray-300 ml-2">退日期</label><input className="w-full bg-[#F7F4EB] p-3 rounded-xl font-bold" value={form.checkOutDate} onChange={e => setForm({...form, checkOutDate: e.target.value})} /></div>
             <div><label className="text-[9px] font-bold text-gray-300 ml-2">退時間</label><input className="w-full bg-[#F7F4EB] p-3 rounded-xl font-bold" value={form.checkOutTime} onChange={e => setForm({...form, checkOutTime: e.target.value})} /></div>
           </div>
        </div>

        <div className="space-y-4 border-t pt-4">
           <h3 className="font-black text-brand-accent flex items-center gap-2 text-sm border-b pb-2"><FontAwesomeIcon icon={faCoins} /> 費用與天數</h3>
           <div className="grid grid-cols-2 gap-3">
             <div><label className="text-[9px] font-bold text-gray-300 ml-2">總金額 (TWD)</label><input className="w-full bg-[#F7F4EB] p-3 rounded-xl font-black text-lg" type="number" value={form.totalPrice} onChange={e => setForm({...form, totalPrice: Number(e.target.value)})} /></div>
             <div><label className="text-[9px] font-bold text-gray-300 ml-2">入住晚數</label><input className="w-full bg-[#F7F4EB] p-3 rounded-xl font-black text-lg" type="number" value={form.nights} onChange={e => setForm({...form, nights: Number(e.target.value)})} /></div>
           </div>
        </div>
        <button onClick={handleSave} className="w-full bg-brand-green text-white font-black py-5 rounded-3xl shadow-lg active:scale-95 transition-all">更新住宿數據</button>
      </div>
    </div>
  );

  return (
    <div className="bg-white rounded-[2.5rem] shadow-sticker border-2 border-[#E0E5D5] overflow-hidden animate-in fade-in zoom-in-95 duration-500 px-2 mx-1">
      <div className="h-64 bg-gray-100 relative">
        <img src={data.imgUrl} className="w-full h-full object-cover" alt="hotel" />
        <div className="absolute top-4 left-4 bg-white/90 backdrop-blur px-4 py-1.5 rounded-full flex items-center gap-2 shadow-md">
           <FontAwesomeIcon icon={faMapMarkerAlt} className="text-brand-blue text-xs" />
           {/* 這裡已經動態化，預設會抓資料庫的值 (大阪) */}
           <span className="text-xs font-black text-brand-brown">{data.locationTag || "大阪"}</span>
        </div>
      </div>
      <div className="p-6">
        <h2 className="text-3xl font-black text-brand-brown tracking-tight">{data.hotelName}</h2>
        <p className="text-xs text-gray-400 font-bold mb-6 leading-relaxed">{data.address}</p>
        <div className="bg-[#FDFBF7] p-5 rounded-3xl border-2 border-[#F0EEE6] flex justify-between items-center relative overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-brand-green"></div>
          <div><p className="text-[9px] font-black text-gray-300 uppercase">Check-in</p><p className="text-lg font-black text-brand-brown">{data.checkInDate}</p><p className="text-xs text-gray-400 font-bold">{data.checkInTime}</p></div>
          <div className="text-center px-2"><p className="text-[9px] font-black text-gray-300">{data.nights} 晚</p><FontAwesomeIcon icon={faLongArrowAltRight} className="text-gray-200" /></div>
          <div className="text-right"><p className="text-[9px] font-black text-gray-300 uppercase">Check-out</p><p className="text-lg font-black text-brand-brown">{data.checkOutDate}</p><p className="text-xs text-gray-400 font-bold">{data.checkOutTime}</p></div>
        </div>
        <div className="mt-8 flex justify-end items-baseline gap-2 leading-none"><span className="text-[10px] font-black text-gray-300 uppercase">Total</span><span className="text-4xl font-black text-brand-brown italic tracking-tighter">NT$ {data.totalPrice}</span></div>
        <div className="flex justify-end gap-4 mt-2"><p className="text-[10px] font-bold text-gray-400">每人均分 NT$ {Math.round(data.totalPrice / 3)}</p><p className="text-[10px] font-bold text-brand-green uppercase">Ref: {data.refNo}</p></div>
        <button onClick={() => setIsEditing(true)} className="mt-6 w-full py-4 text-gray-400 font-bold border-t border-dashed border-gray-100 flex items-center justify-center gap-2 active:scale-95 transition-all"><FontAwesomeIcon icon={faEdit} /> 編輯住宿所有參數</button>
      </div>
    </div>
  );
};