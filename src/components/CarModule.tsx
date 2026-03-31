import React, { useState, useEffect } from 'react';
import { db } from '../services/firebase';
import { doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faCar, faKey, faFlagCheckered, faMapMarkerAlt, 
  faEdit, faCheck, faUsers, faInfoCircle, faCalendarDay, faMoneyBillWave 
} from '@fortawesome/free-solid-svg-icons';

export const CarModule = ({ isEditing, setIsEditing }: { isEditing: boolean, setIsEditing: (v: boolean) => void }) => {
  const [data, setData] = useState<any>(null);
  const [form, setForm] = useState<any>(null);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, "bookings", "car_info"), (docSnap) => {
      if (docSnap.exists()) {
        const cloudData = docSnap.data();
        setData(cloudData);
        setForm(cloudData);
      }
    });
    return () => unsub();
  }, []);

  const handleSave = async () => {
    try {
      await updateDoc(doc(db, "bookings", "car_info"), form);
      setIsEditing(false);
      alert('租車數據已同步更新！');
    } catch (err) {
      alert('儲存失敗');
    }
  };

  if (!data) return <div className="p-10 text-center text-gray-300 italic animate-pulse">讀取租車資料中...</div>;

  // 計算邏輯
  const exchangeRate = data.exchangeRate || 0.024;
  const totalTWD = Math.round(data.totalKRW * exchangeRate);
  const perPersonTWD = Math.round(totalTWD / (data.splitCount || 4));
  const perDayTWD = Math.round(perPersonTWD / (data.tripDays || 14));

  if (isEditing) return (
    <div className="space-y-6 animate-in slide-in-from-bottom-10 duration-500 pb-20 px-2">
      <div className="bg-white p-6 rounded-[2.5rem] shadow-sticker border-2 border-brand-green space-y-6">
        <div className="space-y-4">
           <h3 className="font-black text-brand-green flex items-center gap-2 text-sm border-b pb-2"><FontAwesomeIcon icon={faInfoCircle} /> 租車基本資訊</h3>
           <input className="w-full bg-[#F7F4EB] p-4 rounded-2xl font-bold outline-none" placeholder="租車公司" value={form.companyName} onChange={e => setForm({...form, companyName: e.target.value})} />
           <input className="w-full bg-[#F7F4EB] p-4 rounded-2xl font-bold outline-none" placeholder="副標題" value={form.subtitle} onChange={e => setForm({...form, subtitle: e.target.value})} />
           <input className="w-full bg-[#F7F4EB] p-4 rounded-2xl font-bold outline-none" placeholder="預約編號" value={form.bookingId} onChange={e => setForm({...form, bookingId: e.target.value})} />
        </div>

        <div className="space-y-4 border-t pt-4">
           <h3 className="font-black text-brand-blue flex items-center gap-2 text-sm border-b pb-2"><FontAwesomeIcon icon={faKey} /> 時間與地點</h3>
           <div className="grid grid-cols-2 gap-3">
             <div className="col-span-2 text-[10px] font-black text-gray-300 ml-2">PICK-UP 取車</div>
             <input className="bg-[#F7F4EB] p-3 rounded-xl font-bold text-sm" value={form.pickUpDate} onChange={e => setForm({...form, pickUpDate: e.target.value})} />
             <input className="bg-[#F7F4EB] p-3 rounded-xl font-bold text-sm" value={form.pickUpTime} onChange={e => setForm({...form, pickUpTime: e.target.value})} />
             <input className="col-span-2 bg-[#F7F4EB] p-3 rounded-xl font-bold text-sm" placeholder="取車地點" value={form.pickUpLocation} onChange={e => setForm({...form, pickUpLocation: e.target.value})} />
             
             <div className="col-span-2 text-[10px] font-black text-gray-300 ml-2 mt-2">RETURN 還車</div>
             <input className="bg-[#F7F4EB] p-3 rounded-xl font-bold text-sm" value={form.returnDate} onChange={e => setForm({...form, returnDate: e.target.value})} />
             <input className="bg-[#F7F4EB] p-3 rounded-xl font-bold text-sm" value={form.returnTime} onChange={e => setForm({...form, returnTime: e.target.value})} />
             <input className="col-span-2 bg-[#F7F4EB] p-3 rounded-xl font-bold text-sm" placeholder="還車地點" value={form.returnLocation} onChange={e => setForm({...form, returnLocation: e.target.value})} />
           </div>
        </div>

        <div className="space-y-4 border-t pt-4">
           <h3 className="font-black text-brand-accent flex items-center gap-2 text-sm border-b pb-2"><FontAwesomeIcon icon={faMoneyBillWave} /> 費用與匯率</h3>
           <div className="grid grid-cols-2 gap-3">
             <div className="col-span-2"><label className="text-[10px] font-black text-gray-300 ml-2">總金額 (KRW 韓元)</label><input className="w-full bg-[#F7F4EB] p-3 rounded-xl font-black text-lg" type="number" value={form.totalKRW} onChange={e => setForm({...form, totalKRW: Number(e.target.value)})} /></div>
             <div><label className="text-[10px] font-black text-gray-300 ml-2">匯率 (預設 0.024)</label><input className="w-full bg-[#F7F4EB] p-3 rounded-xl font-bold" type="number" step="0.001" value={form.exchangeRate} onChange={e => setForm({...form, exchangeRate: Number(e.target.value)})} /></div>
             <div><label className="text-[10px] font-black text-gray-300 ml-2">分攤人數</label><input className="w-full bg-[#F7F4EB] p-3 rounded-xl font-bold" type="number" value={form.splitCount} onChange={e => setForm({...form, splitCount: Number(e.target.value)})} /></div>
             <div className="col-span-2"><label className="text-[10px] font-black text-gray-300 ml-2">行程天數</label><input className="w-full bg-[#F7F4EB] p-3 rounded-xl font-bold" type="number" value={form.tripDays} onChange={e => setForm({...form, tripDays: Number(e.target.value)})} /></div>
           </div>
        </div>
        <button onClick={handleSave} className="w-full bg-brand-green text-white font-black py-5 rounded-3xl shadow-lg active:scale-95">儲存所有租車參數</button>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 animate-in fade-in zoom-in-95 duration-500">
      {/* 租車卡片上半部 */}
      <div className="bg-white rounded-[2.5rem] shadow-sticker border-2 border-[#E0E5D5] overflow-hidden p-6 relative">
        <div className="flex justify-between items-start mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-brand-green/10 text-brand-green rounded-2xl flex items-center justify-center text-2xl shadow-inner">
              <FontAwesomeIcon icon={faCar} />
            </div>
            <div>
              <h2 className="text-2xl font-black text-brand-brown leading-tight">租車預約</h2>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{data.subtitle}</p>
            </div>
          </div>
          <button onClick={() => setIsEditing(true)} className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center text-gray-300 border border-gray-100"><FontAwesomeIcon icon={faEdit} size="sm" /></button>
        </div>

        <div className="space-y-1 mb-6">
           <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Rental Company 租車公司</p>
           <h3 className="text-4xl font-black text-[#5D534A] tracking-tighter">{data.companyName}</h3>
        </div>

        <div className="bg-[#F8FAFF] p-4 rounded-2xl border border-blue-50 flex items-center gap-4 mb-8">
           <span className="text-[10px] font-black text-blue-300 uppercase">預約編號</span>
           <span className="text-xl font-black text-brand-blue tracking-wider">{data.bookingId}</span>
        </div>

        {/* 垂直時間軸 */}
        <div className="relative pl-10 space-y-10 before:absolute before:left-[19px] before:top-2 before:bottom-2 before:w-1 before:bg-[#F0EEE6] before:rounded-full">
           {/* 取車 */}
           <div className="relative">
              <div className="absolute -left-[31px] top-0 w-6 h-6 bg-brand-green text-white rounded-full flex items-center justify-center shadow-md border-2 border-white z-10">
                <FontAwesomeIcon icon={faKey} className="text-[10px]" />
              </div>
              <p className="text-[10px] font-black text-brand-green uppercase">Pick-up 取車</p>
              <p className="text-2xl font-black text-brand-brown mt-1 tracking-tight">{data.pickUpDate} <span className="ml-2">{data.pickUpTime}</span></p>
              <div className="flex items-center gap-1 text-gray-400 mt-1">
                <FontAwesomeIcon icon={faMapMarkerAlt} className="text-[10px]" />
                <span className="text-xs font-bold">{data.pickUpLocation}</span>
              </div>
           </div>
           {/* 還車 */}
           <div className="relative">
              <div className="absolute -left-[31px] top-0 w-6 h-6 bg-brand-accent text-white rounded-full flex items-center justify-center shadow-md border-2 border-white z-10">
                <FontAwesomeIcon icon={faFlagCheckered} className="text-[10px]" />
              </div>
              <p className="text-[10px] font-black text-brand-accent uppercase">Return 還車</p>
              <p className="text-2xl font-black text-brand-brown mt-1 tracking-tight">{data.returnDate} <span className="ml-2">{data.returnTime}</span></p>
              <div className="flex items-center gap-1 text-gray-400 mt-1">
                <FontAwesomeIcon icon={faMapMarkerAlt} className="text-[10px]" />
                <span className="text-xs font-bold">{data.returnLocation}</span>
              </div>
           </div>
        </div>

        <div className="flex gap-2 mt-10">
           <div className="bg-[#E9F2E6] text-brand-green px-4 py-2 rounded-xl text-[10px] font-black flex items-center gap-2">
              <FontAwesomeIcon icon={faCalendarDay} /> {data.tripDays} 天行程
           </div>
           <div className="bg-[#FFF4E6] text-brand-accent px-4 py-2 rounded-xl text-[10px] font-black flex items-center gap-2">
              <FontAwesomeIcon icon={faUsers} /> {data.splitCount} 人分攤
           </div>
        </div>
      </div>

      {/* 費用明細卡片 */}
      <div className="bg-white rounded-[2.5rem] shadow-sticker border-2 border-[#E0E5D5] p-8 space-y-6">
         <div className="flex items-center gap-2">
            <h3 className="text-xl font-black text-brand-brown">費用明細</h3>
            <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">Cost Breakdown</span>
         </div>

         <div className="space-y-1">
            <p className="text-[10px] font-black text-gray-300 uppercase">總金額 (KRW)</p>
            <h4 className="text-4xl font-black text-brand-brown tracking-tighter italic">₩{data.totalKRW.toLocaleString()}</h4>
            <p className="text-lg font-bold text-gray-400">≈ NT$ {totalTWD.toLocaleString()}</p>
         </div>

         <div className="grid grid-cols-1 gap-3 border-t border-dashed border-gray-100 pt-6">
            <div className="bg-gray-50/50 p-4 rounded-3xl flex justify-between items-center border border-gray-100/50">
               <div className="flex items-center gap-3 text-brand-blue">
                  <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm"><FontAwesomeIcon icon={faUsers} /></div>
                  <span className="text-xs font-bold">每人均分</span>
               </div>
               <div className="text-right">
                  <p className="text-xl font-black text-brand-brown tracking-tighter">NT$ {perPersonTWD.toLocaleString()}</p>
                  <p className="text-[10px] font-bold text-gray-300 italic">₩ {(data.totalKRW / data.splitCount).toLocaleString()}</p>
               </div>
            </div>

            <div className="bg-gray-50/50 p-4 rounded-3xl flex justify-between items-center border border-gray-100/50">
               <div className="flex items-center gap-3 text-brand-accent">
                  <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm"><FontAwesomeIcon icon={faCalendarDay} /></div>
                  <span className="text-xs font-bold">每人 / 每天</span>
               </div>
               <div className="text-right">
                  <p className="text-xl font-black text-brand-brown tracking-tighter">NT$ {perDayTWD.toLocaleString()}</p>
                  <p className="text-[10px] font-bold text-gray-300 italic">₩ {Math.round(data.totalKRW / data.splitCount / data.tripDays).toLocaleString()}</p>
               </div>
            </div>
         </div>

         <p className="text-center text-[9px] font-bold text-gray-300 italic">* 匯率試算: {exchangeRate}</p>
      </div>
    </div>
  );
};