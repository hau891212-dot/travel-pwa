import React, { useState, useEffect } from 'react';
import { db } from '../services/firebase';
import { doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faPlane, faHotel, faCar, faIdCard, 
  faSuitcaseRolling, faPlaneDeparture, faEdit, faChevronRight 
} from '@fortawesome/free-solid-svg-icons';

// 定義分類標籤
const tabs = [
  { id: 'flight', label: '機票', icon: faPlane },
  { id: 'stay', label: '住宿', icon: faHotel },
  { id: 'car', label: '租車', icon: faCar },
  { id: 'voucher', label: '憑證', icon: faIdCard },
];

export const BookingsModule = () => {
  const [activeTab, setActiveTab] = useState('flight');
  const [flightData, setFlightData] = useState<any>(null);

  // 監聽 Firebase 裡的機票資訊
  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, "bookings", "flight_info"), (docSnap) => {
      if (docSnap.exists()) {
        setFlightData(docSnap.data());
      } else {
        // 如果沒資料，給個預設值
        setFlightData({
          airline: "釜山航空",
          flightNo: "BX 796",
          from: "KHH", fromCity: "高雄", fromTime: "15:00",
          to: "PUS", toCity: "釜山", toTime: "18:25",
          duration: "02h25m",
          date: "2026/03/10",
          baggage: "15kg",
          aircraft: "A321",
          price: "NT$4,633",
          purchasedDate: "2025/11/14",
          via: "官網"
        });
      }
    });
    return () => unsubscribe();
  }, []);

  if (!flightData) return null;

  return (
    <div className="space-y-6 pb-10">
      {/* 1. 頂部切換標籤 (Pill Tabs) */}
      <div className="flex bg-white rounded-full p-1 shadow-sm border border-[#E0E5D5] mx-2">
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
        <div className="animate-in fade-in zoom-in-95 duration-500 space-y-4">
          {/* 2. 登機證卡片 */}
          <div className="bg-white rounded-[2.5rem] shadow-sticker border-2 border-[#E0E5D5] overflow-hidden mx-2">
            {/* 航空公司與標籤 */}
            <div className="p-6 pb-0 flex justify-between items-center">
              <span className="text-gray-400 font-bold text-sm tracking-widest mx-auto">{flightData.airline}</span>
              <span className="absolute right-8 top-24 bg-gray-50 text-[10px] px-2 py-1 rounded-md text-gray-400 font-bold">同一張訂單</span>
            </div>

            {/* 航班編號大字 */}
            <div className="text-center py-4">
              <h2 className="text-6xl font-black text-brand-text tracking-tighter uppercase">{flightData.flightNo}</h2>
            </div>

            {/* 飛行路徑核心區區 */}
            <div className="px-6 py-8 bg-[#F8FAFF] mx-4 rounded-[2rem] border-2 border-dashed border-blue-100 flex justify-between items-center relative">
              <div className="text-center">
                <p className="text-3xl font-black text-brand-text leading-none">{flightData.from}</p>
                <p className="text-xl font-bold text-brand-text mt-1">{flightData.fromTime}</p>
                <span className="inline-block mt-2 bg-brand-green text-white text-[10px] px-3 py-0.5 rounded-full">{flightData.fromCity}</span>
              </div>

              {/* 中間飛機圖標與虛線 */}
              <div className="flex-1 flex flex-col items-center px-2">
                <p className="text-[10px] font-bold text-gray-300 mb-1">{flightData.duration}</p>
                <div className="w-full flex items-center">
                  <div className="flex-1 h-0.5 border-t-2 border-dashed border-gray-200"></div>
                  <FontAwesomeIcon icon={faPlaneDeparture} className="mx-2 text-brand-blue" />
                  <div className="flex-1 h-0.5 border-t-2 border-dashed border-gray-200"></div>
                </div>
                <p className="text-[10px] font-bold text-gray-300 mt-1">{flightData.date}</p>
              </div>

              <div className="text-center">
                <p className="text-3xl font-black text-brand-text leading-none">{flightData.to}</p>
                <p className="text-xl font-bold text-brand-text mt-1">{flightData.toTime}</p>
                <span className="inline-block mt-2 bg-brand-accent text-white text-[10px] px-3 py-0.5 rounded-full">{flightData.toCity}</span>
              </div>
            </div>

            {/* 詳細資訊網格 */}
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50/50 p-4 rounded-3xl border border-gray-100">
                  <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest text-center mb-1">Baggage</p>
                  <div className="flex items-center justify-center gap-2 text-brand-brown">
                    <FontAwesomeIcon icon={faSuitcaseRolling} className="text-brand-green" />
                    <span className="font-black">{flightData.baggage}</span>
                  </div>
                </div>
                <div className="bg-gray-50/50 p-4 rounded-3xl border border-gray-100">
                  <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest text-center mb-1">Aircraft</p>
                  <div className="flex items-center justify-center gap-2 text-brand-brown">
                    <FontAwesomeIcon icon={faPlane} className="text-brand-accent opacity-50" />
                    <span className="font-black">{flightData.aircraft}</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="px-4">
                  <p className="text-[10px] font-black text-gray-300 uppercase">Price & Type</p>
                  <p className="text-lg font-black text-brand-text">{flightData.price}</p>
                  <p className="text-[10px] font-bold text-gray-300">同一張訂單</p>
                </div>
                <div className="px-4 border-l border-gray-100">
                  <p className="text-[10px] font-black text-gray-300 uppercase">Purchased</p>
                  <p className="text-lg font-black text-brand-text">{flightData.purchasedDate}</p>
                  <p className="text-[10px] font-bold text-gray-300">via {flightData.via}</p>
                </div>
              </div>
            </div>

            {/* 底部編輯按鈕 */}
            <div className="px-6 pb-6">
              <button className="w-full bg-[#F7F4EB] py-4 rounded-2xl flex items-center justify-center gap-2 text-gray-400 font-bold active:scale-95 transition-all">
                <FontAwesomeIcon icon={faEdit} />
                編輯航班資訊
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab !== 'flight' && (
        <div className="text-center py-20 text-gray-300 font-bold italic animate-pulse">
           {tabs.find(t => t.id === activeTab)?.label} 頁面建置中...
        </div>
      )}
    </div>
  );
};