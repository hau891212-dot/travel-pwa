import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlane, faHotel, faCar, faIdCard, faLock, faTimes } from '@fortawesome/free-solid-svg-icons';
import { FlightModule } from './FlightModule';
import { StayModule } from './StayModule';

const tabs = [
  { id: 'flight', label: '機票', icon: faPlane },
  { id: 'stay', label: '住宿', icon: faHotel },
  { id: 'car', label: '租車', icon: faCar },
  { id: 'voucher', label: '憑證', icon: faIdCard },
];

export const BookingsModule = () => {
  const [activeTab, setActiveTab] = useState('flight');
  const [isLocked, setIsLocked] = useState(true); // 是否處於鎖定狀態
  const [showPinModal, setShowPinModal] = useState(false);
  const [pin, setPin] = useState('');
  const [innerEditing, setInnerEditing] = useState(false); // 內部的編輯模式

  const handlePinSubmit = () => {
    if (pin === '0912') {
      setIsLocked(false);
      setShowPinModal(false);
      setInnerEditing(true); // 直接進入編輯模式
      setPin('');
    } else {
      alert('密碼錯誤！請輸入 0912');
      setPin('');
    }
  };

  // 當使用者點擊子元件的編輯按鈕時，如果未鎖定則直接編輯，若鎖定則跳 PIN 碼
  const triggerEdit = (status: boolean) => {
    if (isLocked) {
      setShowPinModal(true);
    } else {
      setInnerEditing(status);
    }
  };

  return (
    <div className="pb-20">
      {/* 霧化固定子選單 */}
      <div className="sticky top-[88px] z-40 bg-brand-bg/60 backdrop-blur-xl border-b border-[#E0E5D5]/20 py-3 px-4 mb-4">
        <div className="flex bg-white rounded-full p-1 shadow-sm border border-[#E0E5D5]">
          {tabs.map((tab) => (
            <button key={tab.id} onClick={() => { setActiveTab(tab.id); setInnerEditing(false); }} className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-full text-xs font-black transition-all ${activeTab === tab.id ? 'bg-brand-green text-white shadow-md' : 'text-gray-400'}`}>
              <FontAwesomeIcon icon={tab.icon} />{tab.label}
            </button>
          ))}
        </div>
      </div>

      <main className="px-4">
        <AnimatePresence mode="wait">
          {activeTab === 'flight' && <FlightModule key="flight" isEditing={innerEditing} setIsEditing={triggerEdit} />}
          {activeTab === 'stay' && <StayModule key="stay" isEditing={innerEditing} setIsEditing={triggerEdit} />}
          {(activeTab === 'car' || activeTab === 'voucher') && (
            <div className="py-20 text-center text-gray-300 font-bold italic animate-pulse">此分頁功能開發中 👷</div>
          )}
        </AnimatePresence>
      </main>

      {/* PIN 驗證彈窗 */}
      <AnimatePresence>
        {showPinModal && (
          <div className="fixed inset-0 z-[1200] bg-black/60 backdrop-blur-sm flex items-center justify-center p-6">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white rounded-[2.5rem] p-8 w-full max-w-xs text-center shadow-2xl">
               <div className="w-16 h-16 bg-brand-yellow/20 text-brand-yellow rounded-full flex items-center justify-center mx-auto mb-4 text-2xl"><FontAwesomeIcon icon={faLock} /></div>
               <h3 className="text-xl font-black text-brand-brown mb-2">管理員驗證</h3>
               <p className="text-xs text-gray-400 mb-6 font-bold uppercase">請輸入密碼以進行修改</p>
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