import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faPlane, faHotel, faCar, faIdCard, faLock, faTimes, faShieldAlt 
} from '@fortawesome/free-solid-svg-icons';

// 引入子模組
import { FlightModule } from './FlightModule';
import { StayModule } from './StayModule';
import { CarModule } from './CarModule';

// 定義子分頁選單
const tabs = [
  { id: 'flight', label: '機票', icon: faPlane },
  { id: 'stay', label: '住宿', icon: faHotel },
  { id: 'car', label: '租車', icon: faCar },
  { id: 'voucher', label: '憑證', icon: faIdCard },
];

export const BookingsModule = () => {
  const [activeTab, setActiveTab] = useState('flight');
  
  // 安全鎖定狀態：一旦解鎖成功，在本次使用期間都不會再詢問密碼
  const [isLocked, setIsLocked] = useState(true); 
  const [showPinModal, setShowPinModal] = useState(false);
  const [pin, setPin] = useState('');
  
  // 控制子模組是否進入「編輯模式」
  const [innerEditing, setInnerEditing] = useState(false);

  // 密碼驗證邏輯
  const handlePinSubmit = () => {
    if (pin === '0912') {
      setIsLocked(false);
      setShowPinModal(false);
      setInnerEditing(true); // 驗證過後直接開啟編輯介面
      setPin('');
    } else {
      alert('密碼錯誤！請輸入正確的 4 位數管理密碼');
      setPin('');
    }
  };

  // 當子模組點擊「編輯」按鈕時，統一由此函式判斷
  const handleTriggerEdit = (status: boolean) => {
    if (isLocked) {
      setShowPinModal(true);
    } else {
      setInnerEditing(status);
    }
  };

  return (
    <div className="pb-32">
      {/* 1. 霧化固定子導覽列 (Sticky sub-nav) 
          top-[88px] 是為了卡在主標題下方 */}
      <div className="sticky top-[88px] z-40 bg-brand-bg/60 backdrop-blur-xl border-b border-[#E0E5D5]/30 py-4 px-2 mb-4">
        <div className="flex bg-white rounded-full p-1 shadow-sm border border-[#E0E5D5] max-w-md mx-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setInnerEditing(false); // 切換分頁時自動關閉編輯模式
              }}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-full text-xs font-black transition-all ${
                activeTab === tab.id 
                  ? 'bg-brand-green text-white shadow-lg scale-105' 
                  : 'text-gray-400 hover:text-brand-brown'
              }`}
            >
              <FontAwesomeIcon icon={tab.icon} />
              <span className="hidden xs:inline">{tab.label}</span>
              {activeTab === tab.id && <motion.div layoutId="activeTabDot" className="w-1 h-1 bg-white rounded-full" />}
            </button>
          ))}
        </div>
      </div>

      {/* 2. 主要內容顯示區 */}
      <div className="px-4">
        <AnimatePresence mode="wait">
          {activeTab === 'flight' && (
            <motion.div
              key="flight-module"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <FlightModule isEditing={innerEditing} setIsEditing={handleTriggerEdit} />
            </motion.div>
          )}

          {activeTab === 'stay' && (
            <motion.div
              key="stay-module"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <StayModule isEditing={innerEditing} setIsEditing={handleTriggerEdit} />
            </motion.div>
          )}

          {activeTab === 'car' && (
            <motion.div
              key="car-module"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <CarModule isEditing={innerEditing} setIsEditing={handleTriggerEdit} />
            </motion.div>
          )}

          {activeTab === 'voucher' && (
            <motion.div
              key="voucher-placeholder"
              className="py-32 text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300">
                <FontAwesomeIcon icon={faIdCard} size="2x" />
              </div>
              <p className="text-gray-300 font-black italic uppercase tracking-widest text-sm">憑證管理模組開發中...</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 3. 管理員驗證彈窗 (PIN Modal) */}
      <AnimatePresence>
        {showPinModal && (
          <div className="fixed inset-0 z-[2000] bg-black/60 backdrop-blur-sm flex items-center justify-center p-6">
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white rounded-[3rem] p-10 w-full max-w-xs text-center shadow-2xl border-4 border-brand-yellow/30"
            >
              <div className="w-20 h-20 bg-brand-yellow/10 text-brand-yellow rounded-full flex items-center justify-center mx-auto mb-6 text-3xl shadow-inner">
                <FontAwesomeIcon icon={faShieldAlt} />
              </div>
              
              <h3 className="text-2xl font-black text-brand-brown mb-2 tracking-tighter">身分驗證</h3>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em] mb-8">請輸入管理密碼以修改數據</p>
              
              <input 
                type="password" 
                autoFocus
                inputMode="numeric"
                maxLength={4}
                className="w-full bg-[#F7F4EB] rounded-3xl py-5 text-center text-4xl font-black tracking-[0.8em] outline-none border-2 border-transparent focus:border-brand-yellow transition-all shadow-inner text-brand-brown"
                placeholder="****"
                value={pin}
                onChange={e => setPin(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handlePinSubmit()}
              />
              
              <div className="flex gap-4 mt-8">
                <button 
                  onClick={() => { setShowPinModal(false); setPin(''); }}
                  className="flex-1 py-4 font-black text-gray-400 text-sm active:scale-90 transition-all"
                >
                  取消
                </button>
                <button 
                  onClick={handlePinSubmit}
                  className="flex-1 bg-brand-yellow py-4 rounded-2xl font-black text-brand-brown shadow-lg active:scale-95 transition-all text-sm"
                >
                  確認解鎖
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};