import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BottomNav } from './components/BottomNav';
import { TodoModule } from './components/TodoModule';
import { ScheduleModule } from './components/ScheduleModule';
import { WeatherSection } from './components/WeatherSection';
import { db } from './services/firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import { differenceInSeconds, parseISO } from 'date-fns';

// --- 1. 快速跑秒倒數組件 ---
const CounterNumber = ({ target }: { target: number }) => {
  const [displayValue, setDisplayValue] = useState(100); // 從 100 開始

  useEffect(() => {
    let start = 100;
    const end = target;
    const duration = 1500; // 動畫總共 1.5 秒
    
    const totalSteps = Math.abs(start - end);
    if (totalSteps === 0) {
      setDisplayValue(end);
      return;
    }

    const stepTime = duration / totalSteps;

    const timer = setInterval(() => {
      if (start > end) {
        start--;
      } else if (start < end) {
        start++;
      }
      
      setDisplayValue(start);

      if (start === end) {
        clearInterval(timer);
      }
    }, Math.max(stepTime, 10)); // 確保最小間隔 10ms，避免瀏覽器卡死

    return () => clearInterval(timer);
  }, [target]);

  return (
    <motion.span
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="inline-block"
      style={{ paddingRight: '0.15em' }} // 給斜體字留空間，防止邊緣被吃掉
    >
      {displayValue}
    </motion.span>
  );
};

function App() {
  const [activeTab, setActiveTab] = useState('schedule');
  const [selectedDay, setSelectedDay] = useState(0);
  const [now, setNow] = useState(new Date());
  const [tripInfo, setTripInfo] = useState({
    title: "載入中...",
    subtitle: "Loading...",
    startDate: "2026-04-19T09:00"
  });

  // 監聽 Firebase 雲端設定
  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, "settings", "trip"), (docSnap) => {
      if (docSnap.exists()) {
        setTripInfo(docSnap.data() as any);
      }
    });
    return () => unsubscribe();
  }, []);

  // 每一秒更新現在時間
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // 計算精確倒數
  const calculateCountdown = () => {
    try {
      const target = parseISO(tripInfo.startDate);
      const totalSeconds = differenceInSeconds(target, now);
      
      if (totalSeconds <= 0) return { d: 0, h: 0, m: 0, s: 0, percent: 100 };

      const d = Math.floor(totalSeconds / (3600 * 24));
      const h = Math.floor((totalSeconds % (3600 * 24)) / 3600);
      const m = Math.floor((totalSeconds % 3600) / 60);
      const s = totalSeconds % 60;
      
      // 假設從 100 天前開始計算進度條
      const percent = Math.max(0, Math.min(100, ((100 - d) / 100) * 100));

      return { d, h, m, s, percent };
    } catch {
      return { d: 0, h: 0, m: 0, s: 0, percent: 0 };
    }
  };

  const countdown = calculateCountdown();

  return (
    <div className="min-h-screen pb-28">
      
      {/* 頂部標題 */}
      <header className="p-6 flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-black text-brand-text italic tracking-tighter">
            {tripInfo.title}
          </h1>
          <p className="text-[#78B394] font-black mt-1 text-xs tracking-widest uppercase">
            🌸 {tripInfo.subtitle}
          </p>
        </div>
        <div className="flex -space-x-3 pt-1">
          {[1, 2, 3, 4].map(i => (
            <img 
              key={i}
              className="w-10 h-10 rounded-full border-2 border-white shadow-sm bg-gray-200"
              src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i + 60}`} 
              alt="avatar"
            />
          ))}
        </div>
      </header>

      <main className="px-4">
        {activeTab === 'schedule' && (
          <div className="space-y-6 animate-in fade-in duration-500">
            
            {/* A. 天氣與日期選擇 */}
            <WeatherSection startDate={tripInfo.startDate} />

            {/* B. 倒數卡片 (修正版) */}
            <div className="bg-brand-green rounded-4xl p-7 text-white shadow-xl shadow-green-100/50 relative overflow-hidden">
               <div className="relative z-10">
                 {/* 標題中文化 */}
                 <div className="bg-white/10 backdrop-blur-sm px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest uppercase border border-white/20 inline-block mb-5">
                   🛫 距離出發倒數
                 </div>
                 {/* 進度條 */}
                 <div className="w-40 h-2.5 bg-black/10 rounded-full overflow-hidden mb-2">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${countdown.percent}%` }}
                      transition={{ duration: 1.5, ease: "easeOut" }}
                      className="h-full bg-white/50 rounded-full" 
                    ></motion.div>
                 </div>
               </div>
               
               {/* 數字區域：移除 overflow 防止切字 */}
               <div className="absolute right-7 bottom-6 text-right z-10">
                 <div className="flex items-baseline justify-end leading-none">
                   <span className="text-7xl font-black italic tracking-tighter flex items-end">
                     {/* 使用新的跑秒倒數組件 */}
                     <CounterNumber target={countdown.d} />
                   </span>
                   <span className="text-xl font-black ml-2 uppercase opacity-80">天</span>
                 </div>
                 <p className="text-[10px] font-black opacity-70 mt-1 tracking-widest uppercase">
                    {countdown.h}時 {countdown.m}分 {countdown.s}秒 後出發
                 </p>
               </div>
               
               {/* 背景大圓裝飾 */}
               <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-white/5 rounded-full pointer-events-none"></div>
            </div>

            {/* C. 行程表：使用 key 保證日期切換時畫面刷新 */}
            <ScheduleModule key={selectedDay} currentDay={selectedDay + 1} />
          </div>
        )}

        {/* 準備頁面 */}
        {activeTab === 'planning' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 p-2">
             <div className="flex items-center gap-2 mb-6">
                <div className="w-2 h-6 bg-brand-green rounded-full"></div>
                <h2 className="text-2xl font-black text-brand-text italic uppercase">準備清單 📝</h2>
             </div>
             <TodoModule /> 
          </div>
        )}
      </main>

      {/* 底部選單 */}
      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
}

export default App;