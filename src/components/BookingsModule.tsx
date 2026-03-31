import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { db } from '../services/firebase';
import { doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faPlane, faHotel, faCar, faIdCard, faMapMarkerAlt,
  faPlaneDeparture, faEdit, faTimes, faCheck, faLock, faSuitcaseRolling, faLongArrowAltRight 
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
  const [stayData, setStayData] = useState<any>(null);
  
  const [showPinModal, setShowPinModal] = useState(false);
  const [pin, setPin] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<any>(null);

  useEffect(() => {
    const unsubFlight = onSnapshot(doc(db, "bookings", "flight_info"), (docSnap) => {
      if (docSnap.exists()) setFlightData(docSnap.data());
    });
    const unsubStay = onSnapshot(doc(db, "bookings", "stay_info"), (docSnap) => {
      if (docSnap.exists()) setStayData(docSnap.data());
    });
    return () => { unsubFlight(); unsubStay(); };
  }, []);

  const handlePinSubmit = () => {
    if (pin === '0912') {
      setEditForm(activeTab === 'flight' ? {...flightData} : {...stayData});
      setIsEditing(true);
      setShowPinModal(false);
      setPin('');
    } else {
      alert('密碼錯誤！請輸入 0912');
      setPin('');
    }
  };

  const handleSave = async () => {
    const docId = activeTab === 'flight' ? "flight_info" : "stay_info";
    await updateDoc(doc(db, "bookings", docId), editForm);
    setIsEditing(false);
  };

  // --- 登機證卡片元件 (去程與回程通用) ---
  const BoardingPass = ({ data, title }: { data: any, title: string }) => (
    <div className="bg-white rounded-[2.5rem] shadow-sticker border-2 border-[#E0E5D5] overflow-hidden relative mb-6 animate-in fade-in zoom-in-95 duration-500">
      <div className="pt-6 pb-2 text-center relative">
        <span className="text-gray-400 font-bold text-xs tracking-[0.2em] uppercase">{title} - {data?.airline || "航空公司"}</span>
        <div className="absolute right-6 top-6 bg-gray-50 text-[9px] px-2 py-1 rounded border border-gray-100 text-gray-400 font-bold italic">同一張訂單</div>
      </div>

      <div className="text-center pb-4">
         <div className="inline-block bg-gray-50/50 px-10 py-2 rounded-3xl border border-gray-100">
            <h2 className="text-6xl font-black text-[#8D775F] tracking-tighter uppercase leading-none">{data?.flightNo || "---"}</h2>
         </div>
      </div>

      {/* 核心路徑區 (虛線機票感) */}
      <div className="mx-4 p-6 bg-white rounded-[2.5rem] border-2 border-[#F0EEE6] shadow-sm flex justify-between items-center relative">
        <div className="text-center w-24">
          <p className="text-4xl font-black text-[#5D534A] leading-none">{data?.from || "---"}</p>
          <p className="text-xl font-bold text-[#5D534A] mt-2">{data?.fromTime || "00:00"}</p>
          <div className="mt-2 bg-[#A8C69F] text-white text-[10px] py-1 px-3 rounded-full font-bold inline-block whitespace-nowrap">{data?.fromCity || "城市"}</div>
        </div>

        <div className="flex-1 flex flex-col items-center">
          <p className="text-[9px] font-bold text-gray-300 mb-1">{data?.duration || "--h--m"}</p>
          <div className="w-full flex items-center px-2">
            <div className="flex-1 h-[2px] border-t-2 border-dashed border-[#E0E5D5]"></div>
            <FontAwesomeIcon icon={faPlaneDeparture} className="mx-2 text-brand-blue text-xl" />
            <div className="flex-1 h-[2px] border-t-2 border-dashed border-[#E0E5D5]"></div>
          </div>
          <p className="text-[9px] font-bold text-gray-400 mt-1">{data?.date || "2026/00/00"}</p>
        </div>

        <div className="text-center w-24">
          <p className="text-4xl font-black text-[#5D534A] leading-none">{data?.to || "---"}</p>
          <p className="text-xl font-bold text-[#5D534A] mt-2">{data?.toTime || "00:00"}</p>
          <div className="mt-2 bg-[#E98B6D] text-white text-[10px] py-1 px-3 rounded-full font-bold inline-block whitespace-nowrap">{data?.toCity || "城市"}</div>
        </div>
      </div>

      <div className="p-6 grid grid-cols-2 gap-4 border-t border-dashed border-gray-100 mt-4">
        <div className="text-center py-2 border-r border-gray-50">
          <p className="text-[9px] font-black text-gray-300 uppercase tracking-widest mb-1">Baggage</p>
          <div className="flex items-center justify-center gap-2">
            <FontAwesomeIcon icon={faSuitcaseRolling} className="text-[#A8C69F]" />
            <span className="font-black text-[#8D775F]">{data?.baggage || "---"}</span>
          </div>
        </div>
        <div className="text-center py-2">
          <p className="text-[9px] font-black text-gray-300 uppercase tracking-widest mb-1">Aircraft</p>
          <div className="flex items-center justify-center gap-2">
            <FontAwesomeIcon icon={faPlane} className="text-[#E98B6D] opacity-60" />
            <span className="font-black text-[#8D775F]">{data?.aircraft || "---"}</span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="pb-32 px-2">
      {/* 霧化固定子選單 */}
      <div className="sticky top-[88px] z-40 bg-brand-bg/60 backdrop-blur-xl border-b border-[#E0E5D5]/20 py-3 px-2 mb-6">
        <div className="flex bg-white rounded-full p-1 shadow-sm border border-[#E0E5D5]">
          {tabs.map((tab) => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-full text-xs font-black transition-all ${activeTab === tab.id ? 'bg-brand-green text-white shadow-md' : 'text-gray-400'}`}>
              <FontAwesomeIcon icon={tab.icon} />{tab.label}
            </button>
          ))}
        </div>
      </div>

      <main className="px-2">
        {/* --- 機票分頁 (復原版) --- */}
        {activeTab === 'flight' && (
          <div>
            {!flightData ? (
              <div className="p-10 text-center font-bold text-gray-300 animate-pulse">讀取機票中...</div>
            ) : (
              <>
                <BoardingPass title="去程" data={flightData} />
                <BoardingPass title="回程" data={{
                  airline: flightData.retAirline, flightNo: flightData.retFlightNo, from: flightData.retFrom, fromTime: flightData.retFromTime, fromCity: flightData.retFromCity,
                  to: flightData.retTo, toTime: flightData.retToTime, toCity: flightData.retToCity, duration: flightData.retDuration, date: flightData.retDate, baggage: flightData.retBaggage, aircraft: flightData.retAircraft
                }} />
                <button onClick={() => setShowPinModal(true)} className="w-full bg-[#FDFBF7] py-5 rounded-[2rem] border-2 border-dashed border-[#E0E5D5] flex items-center justify-center gap-2 text-gray-400 font-bold active:scale-95 transition-all shadow-sm mb-10">
                  <FontAwesomeIcon icon={faEdit} /> 編輯航班數據
                </button>
              </>
            )}
          </div>
        )}

        {/* --- 住宿分頁 (整合版) --- */}
        {activeTab === 'stay' && (
          <div className="animate-in fade-in zoom-in-95 duration-500">
            {!stayData ? (
               <button onClick={() => setShowPinModal(true)} className="w-full py-16 border-4 border-dashed border-gray-100 rounded-[3rem] text-gray-300 font-black flex flex-col items-center gap-3">
                  <FontAwesomeIcon icon={faHotel} size="2x" /> + 新增住宿資訊
               </button>
            ) : (
              <div className="bg-white rounded-[2.5rem] shadow-sticker border-2 border-[#E0E5D5] overflow-hidden">
                <div className="h-64 bg-gray-100 relative">
                  <img src={stayData.imgUrl} className="w-full h-full object-cover" alt="hotel" />
                  <div className="absolute top-4 left-4 bg-white/90 backdrop-blur px-4 py-1.5 rounded-full flex items-center gap-2 shadow-md">
                     <FontAwesomeIcon icon={faMapMarkerAlt} className="text-brand-blue text-xs" />
                     <span className="text-xs font-black text-brand-brown">{stayData.locationTag || "大阪"}</span>
                  </div>
                </div>
                <div className="p-6">
                  <h2 className="text-3xl font-black text-brand-brown">{stayData.hotelName}</h2>
                  <p className="text-xs text-gray-400 font-bold mb-6">{stayData.address}</p>
                  <div className="bg-[#FDFBF7] p-5 rounded-3xl border-2 border-[#F0EEE6] flex justify-between items-center relative overflow-hidden">
                    <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-brand-green"></div>
                    <div><p className="text-[9px] font-black text-gray-300 uppercase">Check-in</p><p className="text-lg font-black text-brand-brown leading-none">{stayData.checkInDate}</p></div>
                    <FontAwesomeIcon icon={faLongArrowAltRight} className="text-gray-200" />
                    <div className="text-right"><p className="text-[9px] font-black text-gray-300 uppercase">Check-out</p><p className="text-lg font-black text-brand-brown leading-none">{stayData.checkOutDate}</p></div>
                  </div>
                  <div className="mt-8 flex justify-end items-baseline gap-2">
                    <span className="text-[10px] font-black text-gray-300">Total</span>
                    <span className="text-4xl font-black text-brand-brown italic tracking-tighter">NT$ {stayData.totalPrice}</span>
                  </div>
                  <button onClick={() => setShowPinModal(true)} className="mt-6 w-full py-4 text-gray-400 font-bold border-t border-dashed border-gray-100 flex items-center justify-center gap-2"><FontAwesomeIcon icon={faEdit} /> 編輯住宿資訊</button>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* 編輯全螢幕視窗 */}
      <AnimatePresence>
        {isEditing && (
          <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} className="fixed inset-0 z-[1100] bg-brand-bg p-6 overflow-y-auto">
             <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-black text-brand-brown italic">編輯雲端數據</h2>
                <button onClick={() => setIsEditing(false)} className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-md"><FontAwesomeIcon icon={faTimes} /></button>
             </div>
             <div className="bg-white p-6 rounded-[2.5rem] shadow-sticker space-y-4">
                {activeTab === 'stay' ? (
                  <>
                    <input className="w-full bg-gray-50 p-4 rounded-xl font-bold" placeholder="飯店名稱" value={editForm.hotelName} onChange={e => setEditForm({...editForm, hotelName: e.target.value})} />
                    <input className="w-full bg-gray-50 p-4 rounded-xl font-bold" placeholder="圖片網址" value={editForm.imgUrl} onChange={e => setEditForm({...editForm, imgUrl: e.target.value})} />
                    <input className="w-full bg-gray-50 p-4 rounded-xl font-bold" placeholder="總價" value={editForm.totalPrice} onChange={e => setEditForm({...editForm, totalPrice: e.target.value})} />
                  </>
                ) : (
                  <div className="space-y-4">
                    <p className="font-black text-brand-green">去程設定</p>
                    <input className="w-full bg-gray-50 p-4 rounded-xl font-bold" placeholder="去程航班" value={editForm.flightNo} onChange={e => setEditForm({...editForm, flightNo: e.target.value})} />
                    <p className="font-black text-brand-accent">回程設定</p>
                    <input className="w-full bg-gray-50 p-4 rounded-xl font-bold" placeholder="回程航班" value={editForm.retFlightNo} onChange={e => setEditForm({...editForm, retFlightNo: e.target.value})} />
                  </div>
                )}
                <button onClick={handleSave} className="w-full bg-brand-green text-white font-black py-5 rounded-2xl shadow-lg mt-4">儲存所有變更</button>
             </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* PIN 彈窗 (0912) */}
      <AnimatePresence>
        {showPinModal && (
          <div className="fixed inset-0 z-[1200] bg-black/60 backdrop-blur-sm flex items-center justify-center p-6">
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-white rounded-[2.5rem] p-8 w-full max-w-xs text-center shadow-2xl">
               <div className="w-16 h-16 bg-brand-yellow/20 text-brand-yellow rounded-full flex items-center justify-center mx-auto mb-4 text-2xl"><FontAwesomeIcon icon={faLock} /></div>
               <h3 className="text-xl font-black text-brand-brown">輸入密碼 0912</h3>
               <input type="password" autoFocus inputMode="numeric" className="w-full bg-gray-100 rounded-2xl py-4 text-center text-3xl font-black tracking-[0.5em] outline-none mt-4" value={pin} onChange={e => setPin(e.target.value)} onKeyDown={e => e.key === 'Enter' && handlePinSubmit()} />
               <button onClick={handlePinSubmit} className="w-full bg-brand-yellow py-3 rounded-2xl font-black text-brand-brown mt-6">確認解鎖</button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};