import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlane } from '@fortawesome/free-solid-svg-icons';
import { BottomNav } from './components/BottomNav';
import { TodoModule } from './components/TodoModule';
import { ScheduleModule } from './components/ScheduleModule';
import { WeatherSection } from './components/WeatherSection';
import { BookingsModule } from './components/BookingsModule';
import { ExpenseModule } from './components/ExpenseModule'; // 新增：記帳模組
import { db } from './services/firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import { differenceInSeconds, parseISO, addDays, format } from 'date-fns';
import { zhTW } from 'date-fns/locale';

// --- 跑秒倒數組件 (從 100 倒數至目標，防斜體切字) ---
const CounterNumber = ({ target, isReady }: { target: number, isReady: boolean }) => {
  const [displayValue, setDisplayValue] = useState(100);
  useEffect(() => {
    if (!isReady) return;
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
  }, [target, isReady]);

  return (
    <motion.span 
      initial={{ opacity: 0 }}
      animate={isReady ? { opacity: 1 } : { opacity: 0 }}
      className="inline-block" 
      style={{ paddingRight: '0.15em' }}
    >
      {displayValue}
    </motion.span>
  );
};

function App() {
  // --- 狀態管理 ---
  const [activeTab, setActiveTab] = useState('schedule');
  const [selectedDay, setSelectedDay] = useState(0);
  const [now, setNow] = useState(new Date());
  const [isLoading, setIsLoading] = useState(true); 
  const [tripInfo, setTripInfo] = useState({
    title: "",
    subtitle: "",
    startDate: "2026-04-19T09:00"
  });

  // --- 1. 監聽 Firebase 資料 ---
  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, "settings", "trip"), (docSnap) => {
      if (docSnap.exists()) {
        setTripInfo(docSnap.data() as any);
        // 延遲 1.5 秒讓飛機動畫完整播放
        setTimeout(() => setIsLoading(false), 1500);
      }
    });
    return () => unsubscribe();
  }, []);

  // --- 2. 倒數計時器 ---
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // --- 3. 計算倒數數據 ---
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

  // --- 4. 生成 7 天日期列表 ---
  const weekList = [...Array(7)].map((_, i) => {
    try {
      const date = addDays(parseISO(tripInfo.startDate), i);
      return {
        dayNum: i + 1,
        dateStr: format(date, 'M/dd'),
      };
    } catch { return { dayNum: i + 1, dateStr: '0/00' }; }
  });

  return (
    <div className="min-h-screen pb-28">
      {/* === A. 啟動畫面 (Splash Screen) === */}
      <AnimatePresence>
        {isLoading && (
          <motion.div 
            key="splash" 
            exit={{ opacity: 0, y: -20 }} 
            className="fixed inset-0 z-[3000] bg-brand-bg flex flex-col items-center justify-center"
          >
            <motion.div 
              animate={{ y: [0, -25, 0] }} 
              transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }} 
              className="text-brand-green text-8xl drop-shadow-2xl"
            >
              <FontAwesomeIcon icon={faPlane} />
            </motion.div>
            <div className="mt-12 bg-white px-8 py-3 rounded-full shadow-sticker border-2 border-[#E0E5D5] font-black text-brand-brown tracking-[0.2em] text-sm uppercase">
              雲端資料同步中...
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* === B. 固定頂部 (Sticky Header) === */}
      <div className="sticky top-0 z-50 bg-brand-bg/70 backdrop-blur-xl border-b border-[#E0E5D5]/30">
        <header className="p-6 pb-2 flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-black text-brand-text italic tracking-tighter">
              {tripInfo.title || "正在載入..."}
            </h1>
            <p className="text-[#78B394] font-black mt-1 text-xs tracking-widest uppercase">
              🌸 {tripInfo.subtitle || "こんにちは"}
            </p>
          </div>
          <div className="flex -space-x-3 pt-1">
            {[1, 2, 3, 4].map(i => (
              <img key={i} className="w-10 h-10 rounded-full border-2 border-white shadow-sm bg-gray-200" src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i + 200}`} alt="avatar" />
            ))}
          </div>
        </header>

        {/* 只有在「行程」分頁顯示日期選單，且一起固定在頂部 */}
        <AnimatePresence>
          {activeTab === 'schedule' && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="flex gap-3 overflow-x-auto pb-4 px-6 no-scrollbar"
            >
              {weekList.map((item, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedDay(i)}
                  className={`flex-shrink-0 w-16 h-20 rounded-2xl flex flex-col items-center justify-center transition-all duration-300 ${
                    selectedDay === i ? 'bg-brand-blue text-white shadow-lg scale-105' : 'bg-white text-gray-400 border border-[#E0E5D5]/50'
                  }`}
                >
                  <span className="text-[10px] font-black opacity-70 uppercase">Day {item.dayNum}</span>
                  <span className="text-lg font-black tracking-tighter">{item.dateStr}</span>
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* === C. 內容區域 === */}
      <main className="px-4 mt-2">
        
        {/* --- 分頁 1：行程 --- */}
        {activeTab === 'schedule' && (
          <div className="space-y-6 animate-in fade-in duration-500">
            <WeatherSection startDate={tripInfo.startDate} />
            
            {/* 倒數計時卡片 */}
            <div className="bg-brand-green rounded-4xl p-7 text-white shadow-xl shadow-green-100/50 relative overflow-hidden">
               <div className="relative z-10">
                 <div className="bg-white/10 backdrop-blur-sm px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest uppercase border border-white/20 inline-block mb-5">🛫 距離出發倒數</div>
                 <div className="w-40 h-2.5 bg-black/10 rounded-full overflow-hidden mb-2">
                    <motion.div 
                      initial={{ width: 0 }} 
                      animate={!isLoading ? { width: `${countdown.percent}%` } : { width: 0 }} 
                      transition={{ duration: 1.5, ease: "easeOut", delay: 0.5 }} 
                      className="h-full bg-white/50 rounded-full"
                    ></motion.div>
                 </div>
               </div>
               
               <div className="absolute right-7 bottom-6 text-right z-10">
                 <div className="flex items-baseline justify-end leading-none">
                   <span className="text-7xl font-black italic tracking-tighter flex items-end">
                     <CounterNumber target={countdown.d} isReady={!isLoading} />
                   </span>
                   <span className="text-xl font-black ml-2 uppercase opacity-80">天</span>
                 </div>
                 <p className="text-[10px] font-black opacity-70 mt-1 uppercase tracking-wider">
                   {countdown.h}時 {countdown.m}分 {countdown.s}秒 後出發
                 </p>
               </div>
               <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-white/5 rounded-full pointer-events-none"></div>
            </div>
            
            <ScheduleModule key={selectedDay} currentDay={selectedDay + 1} />
          </div>
        )}

        {/* --- 分頁 2：預訂 (機票/住宿/租車) --- */}
        {activeTab === 'bookings' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
             <BookingsModule />
          </div>
        )}

        {/* --- 分頁 3：記帳 (財務系統) --- */}
        {activeTab === 'expense' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
             <ExpenseModule />
          </div>
        )}

        {/* --- 分頁 4：準備 --- */}
        {activeTab === 'planning' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 p-2">
             <div className="flex items-center gap-2 mb-6">
                <div className="w-2 h-6 bg-brand-green rounded-full"></div>
                <h2 className="text-2xl font-black text-brand-text italic uppercase">準備清單 📝</h2>
             </div>
             <TodoModule /> 
          </div>
        )}

        {/* --- 分頁 5：成員 (簡化版) --- */}
        {activeTab === 'members' && (
          <div className="text-center py-32 animate-pulse text-gray-300 font-bold uppercase tracking-widest text-xs">
            成員管理介面 正在趕工中... 👷
          </div>
        )}
      </main>

      {/* === D. 底部導覽列 === */}
      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
}

export default App;