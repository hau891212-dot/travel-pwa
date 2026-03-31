import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion'; // 引入動畫庫
import { BottomNav } from './components/BottomNav';
import { TodoModule } from './components/TodoModule';
import { ScheduleModule } from './components/ScheduleModule';
import { WeatherSection } from './components/WeatherSection';
import { db } from './services/firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import { differenceInSeconds, parseISO, addDays, format } from 'date-fns';
import { zhTW } from 'date-fns/locale';

// --- 垂直滾動數字小組件 ---
const RollingNumber = ({ value }: { value: number }) => {
  const digits = value.toString().split(''); // 將數字轉為陣列，例如 18 變成 ["1", "8"]

  return (
    <div className="flex overflow-hidden">
      {digits.map((digit, index) => (
        <div key={index} className="relative h-[1em] leading-none">
          <motion.span
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            transition={{ 
              type: "spring", 
              stiffness: 50, 
              damping: 15, 
              delay: index * 0.1 
            }}
            className="inline-block"
          >
            {digit}
          </motion.span>
        </div>
      ))}
    </div>
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

  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, "settings", "trip"), (docSnap) => {
      if (docSnap.exists()) setTripInfo(docSnap.data() as any);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const calculateCountdown = () => {
    try {
      const target = parseISO(tripInfo.startDate);
      const totalSeconds = differenceInSeconds(target, now);
      if (totalSeconds <= 0) return { d: 0, h: 0, m: 0, s: 0, percent: 100 };
      const d = Math.floor(totalSeconds / (3600 * 24));
      const h = Math.floor((totalSeconds % (3600 * 24)) / 3600);
      const m = Math.floor((totalSeconds % 3600) / 60);
      const s = totalSeconds % 60;
      const percent = Math.max(0, Math.min(100, ((100 - d) / 100) * 100));
      return { d, h, m, s, percent };
    } catch { return { d: 0, h: 0, m: 0, s: 0, percent: 0 }; }
  };

  const countdown = calculateCountdown();

  return (
    <div className="min-h-screen pb-28">
      <header className="p-6 flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-black text-brand-text italic tracking-tighter">{tripInfo.title}</h1>
          <p className="text-[#78B394] font-black mt-1 text-xs tracking-[0.2em] uppercase">🌸 {tripInfo.subtitle}</p>
        </div>
        <div className="flex -space-x-3 pt-1">
          {[1, 2, 3, 4].map(i => (
            <img key={i} className="w-10 h-10 rounded-full border-2 border-white shadow-sm bg-gray-200" src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i + 50}`} alt="avatar" />
          ))}
        </div>
      </header>

      <main className="px-4">
        {activeTab === 'schedule' && (
          <div className="space-y-6 animate-in fade-in duration-500">
            <WeatherSection startDate={tripInfo.startDate} />
            
            {/* --- 倒數卡片 (更新版) --- */}
            <div className="bg-brand-green rounded-4xl p-7 text-white shadow-xl shadow-green-100/50 relative overflow-hidden">
               <div className="relative z-10">
                 {/* 修改處：中文化標題 */}
                 <div className="bg-white/10 backdrop-blur-sm px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest uppercase border border-white/20 inline-block mb-5">
                   🛫 距離出發倒數
                 </div>
                 <div className="w-40 h-2.5 bg-black/10 rounded-full overflow-hidden mb-2">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${countdown.percent}%` }}
                      transition={{ duration: 1.5, ease: "easeOut" }}
                      className="h-full bg-white/50 rounded-full" 
                    ></motion.div>
                 </div>
               </div>
               
               <div className="absolute right-7 bottom-6 text-right z-10">
                 <div className="flex items-baseline justify-end">
                   {/* 修改處：垂直滑動數字 */}
                   <span className="text-7xl font-black italic tracking-tighter leading-none flex items-end">
                     <RollingNumber value={countdown.d} />
                   </span>
                   <span className="text-xl font-black ml-1 uppercase opacity-80">天</span>
                 </div>
                 <p className="text-[10px] font-black opacity-70 mt-1 tracking-widest uppercase">
                    {countdown.h}時 {countdown.m}分 {countdown.s}秒 後出發
                 </p>
               </div>
               <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-white/5 rounded-full pointer-events-none"></div>
            </div>

            <ScheduleModule key={selectedDay} currentDay={selectedDay + 1} />
          </div>
        )}

        {activeTab === 'planning' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 p-2">
             <TodoModule /> 
          </div>
        )}
      </main>

      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
}

export default App;