import React, { useState, useEffect } from 'react';
import { db } from '../services/firebase';
import { doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faPlane, faHotel, faCar, faIdCard, 
  faSuitcaseRolling, faPlaneDeparture, faEdit, faCheck, faTimes 
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
  
  // 密碼與編輯狀態
  const [showPinModal, setShowPinModal] = useState(false);
  const [pin, setPin] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<any>(null);

  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, "bookings", "flight_info"), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setFlightData(data);
        setEditForm(data); // 同步給編輯表單
      }
    });
    return () => unsubscribe();
  }, []);

  // 驗證密碼
  const handlePinSubmit = () => {
    if (pin === '0912') {
      setIsEditing(true);
      setShowPinModal(false);
      setPin('');
    } else {
      alert('密碼錯誤！');
      setPin('');
    }
  };

  // 儲存修改至 Firebase
  const handleSave = async () => {
    try {
      await updateDoc(doc(db, "bookings", "flight_info"), editForm);
      setIsEditing(false);
    } catch (error) {
      console.error("更新失敗", error);
    }
  };

  if (!flightData) return <div className="p-10 text-center font-bold text-gray-300">讀取資料中...</div>;

  return (
    <div className="space-y-4 pb-20 px-2">
      {/* 1. 分類標籤 */}
      <div className="flex bg-white rounded-full p-1 shadow-sm border border-[#E0E5D5]">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-full text-xs font-black transition-all ${
              activeTab === tab.id ? 'bg-brand-green text-white shadow-md' : 'text-gray-400'
            }`}
          >
            <FontAwesomeIcon icon={tab.icon} />
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'flight' && (
        <div className="animate-in fade-in zoom-in-95 duration-500">
          {/* 2. 登機證主體 */}
          <div className="bg-white rounded-[2.5rem] shadow-sticker border-2 border-[#E0E5D5] overflow-hidden relative">
            
            {/* 航空公司抬頭 */}
            <div className="pt-6 pb-2 text-center relative">
              <span className="text-gray-400 font-bold text-sm tracking-[0.2em]">{flightData.airline}</span>
              <div className="absolute right-6 top-6 bg-gray-50 text-[9px] px-2 py-1 rounded border border-gray-100 text-gray-400 font-bold">同一張訂單</div>
            </div>

            {/* 航班大字號碼 */}
            <div className="text-center pb-4">
               <div className="inline-block bg-gray-50/50 px-10 py-2 rounded-3xl border border-gray-100">
                  <h2 className="text-6xl font-black text-[#8D775F] tracking-tighter uppercase leading-none">{flightData.flightNo}</h2>
               </div>
            </div>

            {/* 飛行路徑白卡區塊 */}
            <div className="mx-4 p-6 bg-white rounded-[2.5rem] border-2 border-[#F0EEE6] shadow-sm flex justify-between items-center relative">
              {/* 出發地 */}
              <div className="text-center w-24">
                <p className="text-4xl font-black text-[#5D534A] leading-none">{flightData.from}</p>
                <p className="text-xl font-bold text-[#5D534A] mt-2">{flightData.fromTime}</p>
                <div className="mt-2 bg-[#A8C69F] text-white text-[10px] py-1 px-3 rounded-full font-bold inline-block">{flightData.fromCity}</div>
              </div>

              {/* 中間飛機 & 日期 */}
              <div className="flex-1 flex flex-col items-center">
                <p className="text-[10px] font-bold text-gray-300 mb-1">{flightData.duration}</p>
                <div className="w-full flex items-center px-2">
                  <div className="flex-1 h-[2px] border-t-2 border-dashed border-[#E0E5D5]"></div>
                  <FontAwesomeIcon icon={faPlaneDeparture} className="mx-2 text-brand-blue text-xl" />
                  <div className="flex-1 h-[2px] border-t-2 border-dashed border-[#E0E5D5]"></div>
                </div>
                <p className="text-[10px] font-bold text-gray-400 mt-1">{flightData.date}</p>
              </div>

              {/* 目的地 */}
              <div className="text-center w-24">
                <p className="text-4xl font-black text-[#5D534A] leading-none">{flightData.to}</p>
                <p className="text-xl font-bold text-[#5D534A] mt-2">{flightData.toTime}</p>
                <div className="mt-2 bg-[#E98B6D] text-white text-[10px] py-1 px-3 rounded-full font-bold inline-block">{flightData.toCity}</div>
              </div>
            </div>

            {/* 下方詳細資訊網格 */}
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center py-2 border-r border-[#F0EEE6]">
                  <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest mb-1">Baggage</p>
                  <div className="flex items-center justify-center gap-2">
                    <FontAwesomeIcon icon={faSuitcaseRolling} className="text-[#A8C69F]" />
                    <span className="font-black text-[#8D775F]">{flightData.baggage}</span>
                  </div>
                </div>
                <div className="text-center py-2">
                  <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest mb-1">Aircraft</p>
                  <div className="flex items-center justify-center gap-2">
                    <FontAwesomeIcon icon={faPlane} className="text-[#E98B6D] opacity-60" />
                    <span className="font-black text-[#8D775F]">{flightData.aircraft}</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 border-t border-[#F0EEE6] pt-6">
                <div className="pl-2">
                  <p className="text-[10px] font-black text-gray-300 uppercase">Price & Type</p>
                  <p className="text-lg font-black text-[#5D534A]">{flightData.price}</p>
                  <p className="text-[9px] font-bold text-gray-300 uppercase">同一張訂單</p>
                </div>
                <div className="pl-4 border-l border-[#F0EEE6]">
                  <p className="text-[10px] font-black text-gray-300 uppercase">Purchased</p>
                  <p className="text-lg font-black text-[#5D534A]">{flightData.purchasedDate}</p>
                  <p className="text-[9px] font-bold text-gray-300 italic uppercase">via {flightData.via}</p>
                </div>
              </div>

              {/* 編輯按鈕 */}
              {!isEditing && (
                <button 
                  onClick={() => setShowPinModal(true)}
                  className="w-full bg-[#FDFBF7] py-4 rounded-3xl border-2 border-[#F0EEE6] flex items-center justify-center gap-2 text-gray-400 font-bold active:scale-95 transition-all mt-4 shadow-sm"
                >
                  <FontAwesomeIcon icon={faEdit} />
                  編輯航班資訊
                </button>
              )}
            </div>
          </div>

          {/* 編輯模式表單 */}
          {isEditing && (
            <div className="mt-4 bg-white rounded-4xl p-6 border-4 border-brand-yellow shadow-xl space-y-4 animate-in zoom-in duration-300">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-black text-brand-brown">直接修改航班數據</h3>
                <button onClick={() => setIsEditing(false)} className="text-gray-400"><FontAwesomeIcon icon={faTimes} /></button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <input className="bg-gray-50 p-3 rounded-xl text-sm font-bold" placeholder="航空公司" value={editForm.airline} onChange={e => setEditForm({...editForm, airline: e.target.value})} />
                <input className="bg-gray-50 p-3 rounded-xl text-sm font-bold" placeholder="航班號碼" value={editForm.flightNo} onChange={e => setEditForm({...editForm, flightNo: e.target.value})} />
                <input className="bg-gray-50 p-3 rounded-xl text-sm font-bold" placeholder="出發城市" value={editForm.fromCity} onChange={e => setEditForm({...editForm, fromCity: e.target.value})} />
                <input className="bg-gray-50 p-3 rounded-xl text-sm font-bold" placeholder="目的城市" value={editForm.toCity} onChange={e => setEditForm({...editForm, toCity: e.target.value})} />
                <input className="bg-gray-50 p-3 rounded-xl text-sm font-bold" placeholder="出發時間" value={editForm.fromTime} onChange={e => setEditForm({...editForm, fromTime: e.target.value})} />
                <input className="bg-gray-50 p-3 rounded-xl text-sm font-bold" placeholder="抵達時間" value={editForm.toTime} onChange={e => setEditForm({...editForm, toTime: e.target.value})} />
              </div>
              <button onClick={handleSave} className="w-full bg-brand-green text-white font-black py-4 rounded-2xl flex items-center justify-center gap-2 shadow-lg">
                <FontAwesomeIcon icon={faCheck} /> 儲存至雲端
              </button>
            </div>
          )}
        </div>
      )}

      {/* PIN 碼彈窗 */}
      {showPinModal && (
        <div className="fixed inset-0 z-[1000] bg-black/60 backdrop-blur-sm flex items-center justify-center p-6">
          <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-white rounded-[2.5rem] p-8 w-full max-w-xs text-center shadow-2xl">
            <h3 className="text-xl font-black text-brand-brown mb-4">輸入管理密碼</h3>
            <input 
              type="password" 
              autoFocus
              className="w-full bg-gray-100 rounded-2xl py-4 text-center text-2xl font-black tracking-[0.5em] outline-none border-2 border-transparent focus:border-brand-yellow"
              placeholder="****"
              value={pin}
              onChange={e => setPin(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handlePinSubmit()}
            />
            <div className="flex gap-2 mt-6">
              <button onClick={() => setShowPinModal(false)} className="flex-1 py-3 font-bold text-gray-400">取消</button>
              <button onClick={handlePinSubmit} className="flex-1 bg-brand-yellow py-3 rounded-2xl font-black text-brand-brown">確認</button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};