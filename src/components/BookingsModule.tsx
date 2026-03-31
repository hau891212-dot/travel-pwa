import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { db } from '../services/firebase';
import { doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faPlane, faHotel, faCar, faIdCard, 
  faSuitcaseRolling, faPlaneDeparture, faEdit, faCheck, faTimes, faLock, faExchangeAlt 
} from '@fortawesome/free-solid-svg-icons';

const tabs = [
  { id: 'flight', label: '機票', icon: faPlane },
  { id: 'stay', label: '住宿', icon: faHotel },
  { id: 'car', label: '租車', icon: faCar },
  { id: 'voucher', label: '憑證', icon: faIdCard },
];

export const BookingsModule = () => {
  const [activeTab, setActiveTab] = useState('flight');
  const [flightData, setFlightData] = useState<any>(null);
  const [showPinModal, setShowPinModal] = useState(false);
  const [pin, setPin] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<any>(null);

  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, "bookings", "flight_info"), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setFlightData(data);
        if (!editForm) setEditForm(data);
      }
    });
    return () => unsubscribe();
  }, [editForm]);

  const handlePinSubmit = () => {
    if (pin === '0912') {
      setEditForm({...flightData});
      setIsEditing(true);
      setShowPinModal(false);
      setPin('');
    } else {
      alert('密碼錯誤！');
      setPin('');
    }
  };

  const handleSave = async () => {
    try {
      await updateDoc(doc(db, "bookings", "flight_info"), editForm);
      setIsEditing(false);
      alert('雲端資料已同步更新！');
    } catch (error) {
      alert('更新失敗');
    }
  };

  // 登機證卡片元件 (重複使用)
  const FlightCard = ({ data, title }: { data: any, title: string }) => (
    <div className="bg-white rounded-[2.5rem] shadow-sticker border-2 border-[#E0E5D5] overflow-hidden relative mb-6">
      <div className="pt-6 pb-2 text-center">
        <span className="text-gray-400 font-bold text-xs tracking-[0.3em] uppercase">{title} - {data.airline}</span>
      </div>
      <div className="text-center pb-4">
         <div className="inline-block bg-gray-50/80 px-8 py-2 rounded-2xl border border-gray-100">
            <h2 className="text-5xl font-black text-[#8D775F] tracking-tighter uppercase leading-none">{data.flightNo}</h2>
         </div>
      </div>
      <div className="mx-4 p-5 bg-white rounded-[2rem] border-2 border-[#F0EEE6] shadow-sm flex justify-between items-center relative">
        <div className="text-center w-20">
          <p className="text-3xl font-black text-[#5D534A]">{data.from}</p>
          <p className="text-lg font-bold text-[#5D534A]">{data.fromTime}</p>
          <div className="mt-1 bg-[#A8C69F] text-white text-[9px] py-0.5 px-2 rounded-full font-bold inline-block whitespace-nowrap">{data.fromCity}</div>
        </div>
        <div className="flex-1 flex flex-col items-center px-1">
          <p className="text-[9px] font-bold text-gray-300 mb-1">{data.duration}</p>
          <div className="w-full flex items-center">
            <div className="flex-1 h-[2px] border-t-2 border-dashed border-[#E0E5D5]"></div>
            <FontAwesomeIcon icon={faPlaneDeparture} className="mx-2 text-brand-blue text-sm" />
            <div className="flex-1 h-[2px] border-t-2 border-dashed border-[#E0E5D5]"></div>
          </div>
          <p className="text-[9px] font-bold text-gray-400 mt-1">{data.date}</p>
        </div>
        <div className="text-center w-20">
          <p className="text-3xl font-black text-[#5D534A]">{data.to}</p>
          <p className="text-lg font-bold text-[#5D534A]">{data.toTime}</p>
          <div className="mt-1 bg-[#E98B6D] text-white text-[9px] py-0.5 px-2 rounded-full font-bold inline-block whitespace-nowrap">{data.toCity}</div>
        </div>
      </div>
      <div className="p-6 grid grid-cols-2 gap-4 border-t border-dashed border-gray-100 mt-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-[#A8C69F]"><FontAwesomeIcon icon={faSuitcaseRolling} size="sm" /></div>
          <div><p className="text-[8px] font-black text-gray-300 uppercase">Baggage</p><p className="text-sm font-black text-[#8D775F]">{data.baggage}</p></div>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-[#E98B6D] opacity-60"><FontAwesomeIcon icon={faPlane} size="sm" /></div>
          <div><p className="text-[8px] font-black text-gray-300 uppercase">Aircraft</p><p className="text-sm font-black text-[#8D775F]">{data.aircraft}</p></div>
        </div>
      </div>
    </div>
  );

  if (!flightData) return <div className="p-10 text-center text-gray-300">資料讀取中...</div>;

  return (
    <div className="space-y-4 pb-32 px-2">
      <div className="flex bg-white rounded-full p-1 shadow-sm border border-[#E0E5D5]">
        {tabs.map((tab) => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-full text-xs font-black transition-all ${activeTab === tab.id ? 'bg-brand-green text-white shadow-md' : 'text-gray-400'}`}>
            <FontAwesomeIcon icon={tab.icon} />{tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'flight' && (
        <div className="animate-in fade-in zoom-in-95 duration-500">
          {/* 去程卡片 */}
          <FlightCard title="去程" data={{
            airline: flightData.airline, flightNo: flightData.flightNo, from: flightData.from, fromTime: flightData.fromTime, fromCity: flightData.fromCity,
            to: flightData.to, toTime: flightData.toTime, toCity: flightData.toCity, duration: flightData.duration, date: flightData.date, baggage: flightData.baggage, aircraft: flightData.aircraft
          }} />

          {/* 回程卡片 (如果 Firebase 有回程欄位) */}
          <FlightCard title="回程" data={{
            airline: flightData.retAirline || flightData.airline, 
            flightNo: flightData.retFlightNo || "未設定", 
            from: flightData.retFrom || "KIX", fromTime: flightData.retFromTime || "--:--", fromCity: flightData.retFromCity || "大阪",
            to: flightData.retTo || "TPE", toTime: flightData.retToTime || "--:--", toCity: flightData.retToCity || "桃園",
            duration: flightData.retDuration || "--", date: flightData.retDate || "--", baggage: flightData.retBaggage || "20kg", aircraft: flightData.retAircraft || "A320"
          }} />

          <button onClick={() => setShowPinModal(true)} className="w-full bg-white/50 py-4 rounded-3xl border-2 border-dashed border-[#E0E5D5] flex items-center justify-center gap-2 text-gray-400 font-bold active:scale-95 transition-all shadow-sm">
            <FontAwesomeIcon icon={faEdit} /> 編輯全部航班資訊
          </button>
        </div>
      )}

      {/* 編輯頁面 (全螢幕) */}
      <AnimatePresence>
        {isEditing && (
          <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 25 }} className="fixed inset-0 z-[1100] bg-brand-bg p-6 overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-black text-brand-brown italic">編輯雲端數據</h2>
              <button onClick={() => setIsEditing(false)} className="bg-white w-10 h-10 rounded-full shadow-md flex items-center justify-center text-gray-400"><FontAwesomeIcon icon={faTimes} /></button>
            </div>

            <div className="space-y-6 pb-10">
              {/* 去程編輯區 */}
              <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-[#E0E5D5]">
                <h3 className="font-black text-brand-green mb-4 flex items-center gap-2"><FontAwesomeIcon icon={faPlaneDeparture} /> 去程設定</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2"><label className="text-[10px] font-bold text-gray-400">航空公司</label><input className="w-full bg-gray-50 p-3 rounded-xl font-bold" value={editForm.airline} onChange={e => setEditForm({...editForm, airline: e.target.value})} /></div>
                  <div><label className="text-[10px] font-bold text-gray-400">航班號</label><input className="w-full bg-gray-50 p-3 rounded-xl font-bold" value={editForm.flightNo} onChange={e => setEditForm({...editForm, flightNo: e.target.value})} /></div>
                  <div><label className="text-[10px] font-bold text-gray-400">日期</label><input className="w-full bg-gray-50 p-3 rounded-xl font-bold" value={editForm.date} onChange={e => setEditForm({...editForm, date: e.target.value})} /></div>
                  <div><label className="text-[10px] font-bold text-gray-400">出發城市</label><input className="w-full bg-gray-50 p-3 rounded-xl font-bold" value={editForm.fromCity} onChange={e => setEditForm({...editForm, fromCity: e.target.value})} /></div>
                  <div><label className="text-[10px] font-bold text-gray-400">目的城市</label><input className="w-full bg-gray-50 p-3 rounded-xl font-bold" value={editForm.toCity} onChange={e => setEditForm({...editForm, toCity: e.target.value})} /></div>
                </div>
              </div>

              {/* 回程編輯區 */}
              <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-[#E0E5D5]">
                <h3 className="font-black text-brand-accent mb-4 flex items-center gap-2"><FontAwesomeIcon icon={faExchangeAlt} /> 回程設定</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2"><label className="text-[10px] font-bold text-gray-400">航空公司</label><input className="w-full bg-gray-50 p-3 rounded-xl font-bold" value={editForm.retAirline} onChange={e => setEditForm({...editForm, retAirline: e.target.value})} /></div>
                  <div><label className="text-[10px] font-bold text-gray-400">航班號</label><input className="w-full bg-gray-50 p-3 rounded-xl font-bold" value={editForm.retFlightNo} onChange={e => setEditForm({...editForm, retFlightNo: e.target.value})} /></div>
                  <div><label className="text-[10px] font-bold text-gray-400">日期</label><input className="w-full bg-gray-50 p-3 rounded-xl font-bold" value={editForm.retDate} onChange={e => setEditForm({...editForm, retDate: e.target.value})} /></div>
                  <div><label className="text-[10px] font-bold text-gray-400">出發城市</label><input className="w-full bg-gray-50 p-3 rounded-xl font-bold" value={editForm.retFromCity} onChange={e => setEditForm({...editForm, retFromCity: e.target.value})} /></div>
                  <div><label className="text-[10px] font-bold text-gray-400">目的城市</label><input className="w-full bg-gray-50 p-3 rounded-xl font-bold" value={editForm.retToCity} onChange={e => setEditForm({...editForm, retToCity: e.target.value})} /></div>
                </div>
              </div>

              <button onClick={handleSave} className="w-full bg-brand-green text-white font-black py-5 rounded-2xl shadow-lg flex items-center justify-center gap-2 active:scale-95 transition-all">
                <FontAwesomeIcon icon={faCheck} /> 儲存所有變更
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* PIN 彈窗 */}
      <AnimatePresence>
        {showPinModal && (
          <div className="fixed inset-0 z-[1200] bg-black/60 backdrop-blur-sm flex items-center justify-center p-6">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-[2.5rem] p-8 w-full max-w-xs text-center shadow-2xl">
              <div className="w-16 h-16 bg-brand-yellow/20 text-brand-yellow rounded-full flex items-center justify-center mx-auto mb-4 text-2xl"><FontAwesomeIcon icon={faLock} /></div>
              <h3 className="text-xl font-black text-brand-brown mb-2">管理員驗證</h3>
              <input type="password" autoFocus inputMode="numeric" className="w-full bg-gray-100 rounded-2xl py-4 text-center text-3xl font-black tracking-[0.5em] outline-none border-2 border-transparent focus:border-brand-yellow mb-6" placeholder="****" value={pin} onChange={e => setPin(e.target.value)} onKeyDown={e => e.key === 'Enter' && handlePinSubmit()} />
              <div className="flex gap-3">
                <button onClick={() => setShowPinModal(false)} className="flex-1 py-3 font-bold text-gray-400">取消</button>
                <button onClick={handlePinSubmit} className="flex-1 bg-brand-yellow py-3 rounded-2xl font-black text-brand-brown shadow-md">確認</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};