import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform, animate } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlane, faClock, faWalking, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import { BottomNav } from './components/BottomNav';
import { TodoModule } from './components/TodoModule';
import { ScheduleModule } from './components/ScheduleModule';
import { WeatherSection } from './components/WeatherSection';
import { BookingsModule } from './components/BookingsModule';
import { ExpenseModule } from './components/ExpenseModule';
import { MembersModule } from './components/MembersModule';
import { db } from './services/firebase';
import { doc, onSnapshot, collection, query, where, orderBy, limit } from 'firebase/firestore';
import { differenceInSeconds, parseISO, addDays, format, isAfter } from 'date-fns';

// --- 垂直跑秒組件 ---
const RollingDigit = ({ value }: { value: string | number }) => (
  <div className="relative h-[1.2em] overflow-hidden leading-none">
    <AnimatePresence mode="popLayout">
      <motion.span
        key={value}
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -20, opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="block font-black italic"
      >
        {value}
      </motion.span>
    </AnimatePresence>
  </div>
);

// --- 進階曲線跑秒組件 (400 -> Target) ---
const CounterNumber = ({ target, isReady }: { target: number, isReady: boolean }) => {
  const count = useMotionValue(400);
  const rounded = useTransform(count, (latest) => Math.round(latest));
  useEffect(() => {
    if (isReady) {
      animate(count, target, { 
        duration: 4, 
        ease: [0.16, 1, 0.3, 1],
      });
    }
  }, [target, isReady]);
  return <motion.span style={{ paddingRight: '0.05em' }}>{rounded}</motion.span>;
};

function App() {
  const [activeTab, setActiveTab] = useState('schedule');
  const [selectedDay, setSelectedDay] = useState(0);
  const [now, setNow] = useState(new Date());
  const [isLoading, setIsLoading] = useState(true);
  const [currentEvent, setCurrentEvent] = useState<any>(null);
  const [tripInfo, setTripInfo] = useState({ title: "", subtitle: "", startDate: "2026-04-19T09:00" });
  const [members, setMembers] = useState<any[]>([]);

  useEffect(() => {
    const unsubTrip = onSnapshot(doc(db, "settings", "trip"), (snap) => {
      if (snap.exists()) {
        setTripInfo(snap.data() as any);
        setTimeout(() => setIsLoading(false), 1200);
      }
    });
    const unsubMembers = onSnapshot(query(collection(db, "members"), where("isDeleted", "==", false)), (snap) => {
      setMembers(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return () => { unsubTrip(); unsubMembers(); };
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (isLoading) return;
    const currentTimeStr = format(now, 'HH:mm');
    const q = query(collection(db, "schedule"), where("day", "==", selectedDay + 1), where("time", ">=", currentTimeStr), orderBy("time", "asc"), limit(1));
    const unsubEvent = onSnapshot(q, (snap) => {
      if (!snap.empty) setCurrentEvent(snap.docs[0].data());
      else setCurrentEvent(null);
    });
    return () => unsubEvent();
  }, [selectedDay, now, isLoading]);

  const calculateCountdown = () => {
    try {
      const target = parseISO(tripInfo.startDate);
      const totalSeconds = differenceInSeconds(target, now);
      if (isAfter(now, target)) return { isStarted: true, percent: 100 };
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
      <AnimatePresence>{isLoading && (
        <motion.div key="splash" exit={{ opacity: 0, y: -20 }} className="fixed inset-0 z-[3000] bg-brand-bg flex flex-col items-center justify-center">
          <motion.div animate={{ y: [0, -20, 0] }} transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }} className="text-brand-green text-8xl shadow-2xl"><FontAwesomeIcon icon={faPlane} /></motion.div>
          <div className="mt-12 bg-white px-8 py-3 rounded-full shadow-sticker border-2 border-[#E0E5D5] font-black text-brand-brown tracking-widest text-sm uppercase">雲端資料同步中...</div>
        </motion.div>
      )}</AnimatePresence>

      <div className="sticky top-0 z-50 bg-brand-bg/70 backdrop-blur-xl border-b border-[#E0E5D5]/30">
        <header className="p-6 pb-2 flex justify-between items-start">
          <div><h1 className="text-3xl font-black text-brand-text italic tracking-tighter">{tripInfo.title || "..." }</h1><p className="text-[#78B394] font-black mt-1 text-xs tracking-widest uppercase">🌸 {tripInfo.subtitle}</p></div>
          <div className="flex -space-x-3 pt-1">
            {members.slice(0, 4).map(m => (<img key={m.id} className="w-10 h-10 rounded-full border-2 border-white shadow-sm bg-white object-cover" src={m.avatar} alt={m.name} />))}
          </div>
        </header>
        <AnimatePresence>{activeTab === 'schedule' && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="flex gap-3 overflow-x-auto pb-4 px-6 no-scrollbar">
            {weekList.map((item, i) => (
              <button key={i} onClick={() => setSelectedDay(i)} className={`flex-shrink-0 w-16 h-20 rounded-2xl flex flex-col items-center justify-center transition-all ${selectedDay === i ? 'bg-brand-blue text-white shadow-lg scale-105' : 'bg-white text-gray-400 border border-[#E0E5D5]/50'}`}><span className="text-[10px] font-black opacity-70 uppercase">Day {item.dayNum}</span><span className="text-lg font-black tracking-tighter">{item.dateStr}</span></button>
            ))}
          </motion.div>
        )}</AnimatePresence>
      </div>

      <main className="px-4 mt-2">
        {activeTab === 'schedule' && (
          <div className="space-y-6 animate-in fade-in duration-500">
            <WeatherSection startDate={tripInfo.startDate} />
            <AnimatePresence mode="wait">
              {!timer.isStarted ? (
                <motion.div key="countdown" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, y: -20 }} className="bg-brand-green rounded-4xl p-7 text-white shadow-xl relative overflow-hidden mx-1">
                   <div className="relative z-10 flex justify-between items-center">
                     <div>
                       <div className="bg-white/10 backdrop-blur-sm px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest uppercase border border-white/20 inline-block mb-4">距離出發倒數</div>
                       <div className="w-32 h-2 bg-black/10 rounded-full overflow-hidden">
                        <motion.div initial={{ width: 0 }} animate={!isLoading ? { width: `${timer.percent}%` } : { width: 0 }} transition={{ duration: 4, ease: "easeOut" }} className="h-full bg-white/50 rounded-full" />
                       </div>
                     </div>
                     <div className="text-right leading-none">
                       <div className="text-5xl font-black italic tracking-tighter flex items-baseline justify-end">
                         {/* 這裡使用了跑秒組件 */}
                         <CounterNumber target={timer.h!} isReady={!isLoading} />
                         <span className="text-xl ml-1 not-italic opacity-80 font-black">小時</span>
                       </div>
                       <p className="text-[10px] font-black opacity-70 tracking-widest uppercase mt-2">
                         剩餘 {timer.m}分 {timer.s}秒
                       </p>
                     </div>
                   </div>
                   <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-white/5 rounded-full" />
                </motion.div>
              ) : (
                <motion.div key="live" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-[2.5rem] p-5 shadow-sticker border-2 border-brand-yellow flex items-center justify-between mx-1">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-brand-yellow rounded-2xl flex items-center justify-center text-brand-brown text-2xl shadow-inner"><FontAwesomeIcon icon={faWalking} className="animate-bounce" /></div>
                    <div><p className="text-[10px] font-black text-brand-yellow uppercase tracking-widest">NEXT ACTIVITY 下個行程</p><h3 className="text-xl font-black text-brand-brown">{currentEvent ? currentEvent.title : "行程結束囉！"}</h3>{currentEvent && <p className="text-xs font-bold text-gray-400 mt-0.5">{currentEvent.time} 開始</p>}</div>
                  </div>
                  <div className="bg-[#F7F4EB] w-10 h-10 rounded-full flex items-center justify-center text-brand-yellow active:scale-90"><FontAwesomeIcon icon={faChevronRight} /></div>
                </motion.div>
              )}
            </AnimatePresence>
            <ScheduleModule key={selectedDay} currentDay={selectedDay + 1} />
          </div>
        )}
        {activeTab === 'members' && <div className="animate-in fade-in duration-500"><MembersModule /></div>}
        {activeTab === 'expense' && <div className="animate-in fade-in duration-500"><ExpenseModule /></div>}
        {activeTab === 'bookings' && <div className="animate-in fade-in duration-500"><BookingsModule /></div>}
        {activeTab === 'planning' && <div className="animate-in fade-in duration-500 p-2"><TodoModule /></div>}
      </main>

      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
}

export default App;