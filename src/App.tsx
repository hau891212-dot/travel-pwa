import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlane } from '@fortawesome/free-solid-svg-icons';
import { BottomNav } from './components/BottomNav';
import { TodoModule } from './components/TodoModule';
import { ScheduleModule } from './components/ScheduleModule';
import { WeatherSection } from './components/WeatherSection';
import { db } from './services/firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import { differenceInSeconds, parseISO } from 'date-fns';

// --- 1. 跑秒倒數組件 ---
const CounterNumber = ({ target }: { target: number }) => {
  const [displayValue, setDisplayValue] = useState(100);
  useEffect(() => {
    let start = 100;
    const end = target;
    const duration = 1500;
    const totalSteps = Math.abs(start - end);
    if (totalSteps === 0) { setDisplayValue(end); return; }
    const stepTime = duration / totalSteps;
    const timer = setInterval(() => {
      if (start > end) start--;
      else if (start < end) start++;
      setDisplayValue(start);
      if (start === end) clearInterval(timer);
    }, Math.max(stepTime, 10));
    return () => clearInterval(timer);
  }, [target]);
  return (
    <motion.span className="inline-block" style={{ paddingRight: '0.15em' }}>
      {displayValue}
    </motion.span>
  );
};

function App() {
  const [activeTab, setActiveTab] = useState('schedule');
  const [selectedDay, setSelectedDay] = useState(0);
  const [now, setNow] = useState(new Date());
  const [isLoading, setIsLoading] = useState(true); // 控制啟動畫面
  const [tripInfo, setTripInfo] = useState({
    title: "",
    subtitle: "",
    startDate: "2026-04-19T09:00"
  });

  // 監聽 Firebase 資料
  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, "settings", "trip"), (docSnap) => {
      if (docSnap.exists()) {
        setTripInfo(docSnap.data() as any);
        // 資料載入後，為了讓啟動動畫美一點，我們稍微延遲 1.5 秒再關閉
        setTimeout(() => setIsLoading(false), 1500);
      }
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
      {/* --- 啟動畫面 (Splash Screen) --- */}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.5 } }}
            className="fixed inset-0 z-[999] bg-brand-bg flex flex-col items-center justify-center"
          >
            {/* 飛機容器 */}
            <div className="relative">
              {/* 飛機圖標 + 上下浮動動畫 */}
              <motion.div
                animate={{ y: [0, -20, 0] }}
                transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                className="text-brand-green text-7xl"
              >
                <FontAwesomeIcon icon={faPlane} />
              </motion.div>
              
              {/* 飛機下方的影子動畫 */}
              <motion.div
                animate={{ scale: [1, 1.3, 1], opacity: [0.2, 0.1, 0.2] }}
                transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                className="w-12 h-2 bg-black/10 rounded-[100%] mx-auto mt-4 blur-sm"
              ></motion.div>
            </div>

            {/* 載入文字卡片 */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mt-12 bg-white px-8 py-3 rounded-full shadow-sticker border-2 border-[#E0E5D5]"
            >
              <p className="text-brand-brown font-bold tracking-widest flex items-center gap-2">
                雲端資料同步中...
                <span className="flex gap-1">
                  <motion.span animate={{ opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 1 }}>.</motion.span>
                  <motion.span animate={{ opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }}>.</motion.span>
                  <motion.span animate={{ opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }}>.</motion.span>
                </span>
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- 正式內容 --- */}
      <header className="p-6 flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-black text-brand-text italic tracking-tighter">
            {tripInfo.title || "載入中..."}
          </h1>
          <p className="text-[#78B394] font-black mt-1 text-xs tracking-widest uppercase">
            🌸 {tripInfo.subtitle || "..."}
          </p>
        </div>
        <div className="flex -space-x-3 pt-1">
          {[1, 2, 3, 4].map(i => (
            <img key={i} className="w-10 h-10 rounded-full border-2 border-white shadow-sm bg-gray-200" src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i + 66}`} alt="avatar" />
          ))}
        </div>
      </header>

      <main className="px-4">
        {activeTab === 'schedule' && (
          <div className="space-y-6 animate-in fade-in duration-500">
            <WeatherSection startDate={tripInfo.startDate} />
            <div className="bg-brand-green rounded-4xl p-7 text-white shadow-xl shadow-green-100/50 relative overflow-hidden">
               <div className="relative z-10">
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
                 <div className="flex items-baseline justify-end leading-none">
                   <span className="text-7xl font-black italic tracking-tighter flex items-end">
                     <CounterNumber target={countdown.d} />
                   </span>
                   <span className="text-xl font-black ml-2 uppercase opacity-80">天</span>
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
             <div className="flex items-center gap-2 mb-6">
                <div className="w-2 h-6 bg-brand-green rounded-full"></div>
                <h2 className="text-2xl font-black text-brand-text italic uppercase">準備清單 📝</h2>
             </div>
             <TodoModule /> 
          </div>
        )}
      </main>

      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
}

export default App;