import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlane, faClock, faWalking, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import { BottomNav } from './components/BottomNav';
import { TodoModule } from './components/TodoModule';
import { ScheduleModule } from './components/ScheduleModule';
import { WeatherSection } from './components/WeatherSection';
import { BookingsModule } from './components/BookingsModule';
import { ExpenseModule } from './components/ExpenseModule';
import { db } from './services/firebase';
import { doc, onSnapshot, collection, query, where, orderBy, limit } from 'firebase/firestore';
import { differenceInSeconds, parseISO, addDays, format, isAfter } from 'date-fns';

// --- 跑秒倒數組件 (改為跑「小時」) ---
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
      if (start > end) start--; else if (start < end) start++;
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
  const [activeTab, setActiveTab] = useState('schedule');
  const [selectedDay, setSelectedDay] = useState(0);
  const [now, setNow] = useState(new Date());
  const [isLoading, setIsLoading] = useState(true); 
  const [currentEvent, setCurrentEvent] = useState<any>(null); // 智慧提示行程
  const [tripInfo, setTripInfo] = useState({
    title: "",
    subtitle: "",
    startDate: "2026-04-19T09:00"
  });

  // 1. 監聽 Firebase 基本資料
  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, "settings", "trip"), (docSnap) => {
      if (docSnap.exists()) {
        setTripInfo(docSnap.data() as any);
        setTimeout(() => setIsLoading(false), 1500);
      }
    });
    return () => unsubscribe();
  }, []);

  // 2. 計時器與當前行程抓取
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (isLoading) return;
    const currentTimeStr = format(now, 'HH:mm');
    const q = query(
      collection(db, "schedule"),
      where("day", "==", selectedDay + 1),
      where("time", ">=", currentTimeStr),
      orderBy("time", "asc"),
      limit(1)
    );
    const unsubEvent = onSnapshot(q, (snap) => {
      if (!snap.empty) setCurrentEvent(snap.docs[0].data());
      else setCurrentEvent(null);
    });
    return () => unsubEvent();
  }, [selectedDay, now, isLoading]);

  // 3. 核心倒數運算 (小時制)
  const calculateCountdown = () => {
    try {
      const target = parseISO(tripInfo.startDate);
      const totalSeconds = differenceInSeconds(target, now);
      const isTripStarted = isAfter(now, target);

      if (isTripStarted) return { isStarted: true, percent: 100 };

      const h = Math.floor(totalSeconds / 3600);
      const m = Math.floor((totalSeconds % 3600) / 60);
      const s = totalSeconds % 60;
      const percent = Math.max(0, Math.min(100, (1 - (totalSeconds / (100 * 24 * 3600))) * 100));

      return { isStarted: false, h, m, s, percent };
    } catch { return { isStarted: false, h: 0, m: 0, s: 0, percent: 0 }; }
  };

  const timer = calculateCountdown();

  const weekList = [...Array(7)].map((_, i) => {
    const date = addDays(parseISO(tripInfo.startDate), i);
    return { dayNum: i + 1, dateStr: format(date, 'M/dd') };
  });

  return (
    <div className="min-h-screen pb-28">
      {/* 啟動畫面 */}
      <AnimatePresence>
        {isLoading && (
          <motion.div key="splash" exit={{ opacity: 0 }} className="fixed inset-0 z-[3000] bg-brand-bg flex flex-col items-center justify-center">
            <motion.div animate={{ y: [0, -25, 0] }} transition={{ repeat: Infinity, duration: 2 }} className="text-brand-green text-8xl"><FontAwesomeIcon icon={faPlane} /></motion.div>
            <div className="mt-12 bg-white px-8 py-3 rounded-full shadow-sticker border-2 border-[#E0E5D5] font-black text-brand-brown tracking-widest text-sm">雲端資料同步中...</div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 固定頂部標題與日期 */}
      <div className="sticky top-0 z-50 bg-brand-bg/70 backdrop-blur-xl border-b border-[#E0E5D5]/30">
        <header className="p-6 pb-2 flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-black text-brand-text italic tracking-tighter">{tripInfo.title || "正在載入..."}</h1>
            <p className="text-[#78B394] font-black mt-1 text-xs tracking-widest uppercase">🌸 {tripInfo.subtitle}</p>
          </div>
          <div className="flex -space-x-3 pt-1">
            {[1, 2, 3, 4].map(i => (<img key={i} className="w-10 h-10 rounded-full border-2 border-white shadow-sm bg-gray-200" src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i + 400}`} />))}
          </div>
        </header>

        <AnimatePresence>
          {activeTab === 'schedule' && (
            <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="flex gap-3 overflow-x-auto pb-4 px-6 no-scrollbar">
              {weekList.map((item, i) => (
                <button key={i} onClick={() => setSelectedDay(i)} className={`flex-shrink-0 w-16 h-20 rounded-2xl flex flex-col items-center justify-center transition-all ${selectedDay === i ? 'bg-brand-blue text-white shadow-lg scale-105' : 'bg-white text-gray-400 border border-[#E0E5D5]/50'}`}><span className="text-[10px] font-black opacity-70 uppercase">Day {item.dayNum}</span><span className="text-lg font-black tracking-tighter">{item.dateStr}</span></button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <main className="px-4 mt-6">
        {activeTab === 'schedule' && (
          <div className="space-y-6 animate-in fade-in duration-500">
            <WeatherSection startDate={tripInfo.startDate} />
            
            {/* --- 智慧動態卡片切換 --- */}
            <AnimatePresence mode="wait">
              {!timer.isStarted ? (
                /* 倒數模式：大數字顯示總小時 */
                <motion.div key="countdown" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, y: -20 }} className="bg-brand-green rounded-4xl p-7 text-white shadow-xl shadow-green-100/50 relative overflow-hidden mx-1">
                   <div className="relative z-10">
                     <div className="bg-white/10 backdrop-blur-sm px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest uppercase border border-white/20 inline-block mb-5">🛫 距離出發倒數</div>
                     <div className="w-40 h-2.5 bg-black/10 rounded-full overflow-hidden mb-2">
                        <motion.div initial={{ width: 0 }} animate={!isLoading ? { width: `${timer.percent}%` } : { width: 0 }} transition={{ duration: 1.5, delay: 0.5 }} className="h-full bg-white/50 rounded-full"></motion.div>
                     </div>
                   </div>
                   <div className="absolute right-7 bottom-6 text-right z-10">
                     <div className="flex items-baseline justify-end leading-none">
                       <span className="text-7xl font-black italic tracking-tighter flex items-end">
                         <CounterNumber target={timer.h!} isReady={!isLoading} />
                       </span>
                       <span className="text-xl font-black ml-1 uppercase opacity-80">H</span>
                     </div>
                     <p className="text-[10px] font-black opacity-70 mt-1 uppercase tracking-widest">{timer.m}分 {timer.s}秒 後出發</p>
                   </div>
                   <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-white/5 rounded-full" />
                </motion.div>
              ) : (
                /* 旅行模式：顯示當前/下一個行程提示 */
                <motion.div key="live" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-[2.5rem] p-5 shadow-sticker border-2 border-brand-yellow flex items-center justify-between mx-1">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-brand-yellow rounded-2xl flex items-center justify-center text-brand-brown text-2xl shadow-inner">
                      <FontAwesomeIcon icon={faWalking} className="animate-bounce" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-brand-yellow uppercase tracking-widest">NEXT ACTIVITY</p>
                      <h3 className="text-xl font-black text-brand-brown">{currentEvent ? currentEvent.title : "今天的計畫都完成了！"}</h3>
                      {currentEvent && <p className="text-xs font-bold text-gray-400 mt-0.5">{currentEvent.time} 開始</p>}
                    </div>
                  </div>
                  <div className="bg-[#F7F4EB] w-10 h-10 rounded-full flex items-center justify-center text-brand-yellow"><FontAwesomeIcon icon={faChevronRight} /></div>
                </motion.div>
              )}
            </AnimatePresence>

            <ScheduleModule key={selectedDay} currentDay={selectedDay + 1} />
          </div>
        )}

        {/* 其他分頁維持現狀 */}
        {activeTab === 'bookings' && <div className="animate-in fade-in slide-in-from-bottom-4 duration-500"><BookingsModule /></div>}
        {activeTab === 'expense' && <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 pt-4"><header className="px-2 mb-4 text-2xl font-black text-brand-text italic uppercase tracking-tighter">財務與分帳系統 💰</header><ExpenseModule /></div>}
        {activeTab === 'planning' && <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 p-2 pt-4"><header className="flex items-center gap-2 mb-6"><div className="w-2 h-6 bg-brand-green rounded-full"></div><h2 className="text-2xl font-black text-brand-text italic uppercase">準備清單 📝</h2></header><TodoModule /></div>}
      </main>

      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
}

export default App;