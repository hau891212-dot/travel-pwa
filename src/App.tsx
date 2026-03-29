import React, { useState, useEffect } from 'react';
import { BottomNav } from './components/BottomNav';
import { TodoModule } from './components/TodoModule';
import { ScheduleModule } from './components/ScheduleModule';
import { db } from './services/firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import { differenceInSeconds, parseISO, addDays, format } from 'date-fns';
import { zhTW } from 'date-fns/locale';

function App() {
  // --- 狀態管理 ---
  const [activeTab, setActiveTab] = useState('schedule');
  const [selectedDay, setSelectedDay] = useState(0); // 0 代表 Day 1, 1 代表 Day 2...
  const [now, setNow] = useState(new Date());
  const [tripInfo, setTripInfo] = useState({
    title: "載入中...",
    subtitle: "Loading...",
    startDate: "2026-05-20T00:00"
  });

  // --- 1. 監聽 Firebase 雲端設定 (大阪 7 日遊、日期等) ---
  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, "settings", "trip"), (docSnap) => {
      if (docSnap.exists()) {
        setTripInfo(docSnap.data() as any);
      }
    });
    return () => unsubscribe();
  }, []);

  // --- 2. 每秒更新計時器 (驅動倒數與進度條) ---
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // --- 3. 倒數計時與進度條邏輯 ---
  const calculateCountdown = () => {
    try {
      const target = parseISO(tripInfo.startDate);
      const totalSeconds = differenceInSeconds(target, now);
      
      if (totalSeconds <= 0) return { d: 0, h: 0, m: 0, s: 0, percent: 100 };

      const d = Math.floor(totalSeconds / (3600 * 24));
      const h = Math.floor((totalSeconds % (3600 * 24)) / 3600);
      const m = Math.floor((totalSeconds % 3600) / 60);
      const s = totalSeconds % 60;
      
      // 進度條：假設從 100 天開始倒數計算百分比
      const maxDays = 100; 
      const percent = Math.max(0, Math.min(100, ((maxDays - d) / maxDays) * 100));

      return { d, h, m, s, percent };
    } catch {
      return { d: 0, h: 0, m: 0, s: 0, percent: 0 };
    }
  };

  const countdown = calculateCountdown();

  // --- 4. 自動生成一週日期 (Day 1 - Day 7) ---
  const weekList = [...Array(7)].map((_, i) => {
    try {
      const date = addDays(parseISO(tripInfo.startDate), i);
      return {
        dayNum: i + 1,
        dateStr: format(date, 'M/dd'),
        weekday: format(date, 'eeee', { locale: zhTW }).replace('星期', ''),
      };
    } catch {
      return { dayNum: i + 1, dateStr: '0/00', weekday: '?' };
    }
  });

  // --- 5. 穿搭建議邏輯 (隨選中日期簡單變動) ---
  const outfitAdvice = selectedDay === 0 
    ? "抵達首日早晚溫差大，建議洋蔥式穿搭。" 
    : "今日行程預計步行較多，建議穿著舒適運動鞋。";

  return (
    <div className="min-h-screen pb-28"> {/* 底部留白給 Nav */}
      
      {/* --- 頂部標題與成員頭像 --- */}
      <header className="p-6 flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-black text-brand-text italic tracking-tighter">
            {tripInfo.title}
          </h1>
          <p className="text-[#78B394] font-black mt-1 text-xs tracking-[0.2em] uppercase">
            🌸 {tripInfo.subtitle}
          </p>
        </div>
        <div className="flex -space-x-3 pt-1">
          {[1, 2, 3, 4].map(i => (
            <img 
              key={i}
              className="w-10 h-10 rounded-full border-2 border-white shadow-sm bg-gray-200 object-cover"
              src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i + 40}`} 
              alt="avatar"
            />
          ))}
        </div>
      </header>

      {/* --- 主內容區域 --- */}
      <main className="px-4">
        
        {/* === 分頁：行程 (Schedule) === */}
        {activeTab === 'schedule' && (
          <div className="space-y-6 animate-in fade-in duration-500">
            
            {/* A. 橫向日期選擇器 (Day 1 - 7) */}
            <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar px-1">
              {weekList.map((item, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedDay(i)}
                  className={`flex-shrink-0 w-16 h-20 rounded-2xl flex flex-col items-center justify-center transition-all duration-300 ${
                    selectedDay === i ? 'bg-brand-blue text-white shadow-lg scale-105' : 'bg-white text-gray-400'
                  }`}
                >
                  <span className="text-[10px] font-black opacity-70 uppercase">Day {item.dayNum}</span>
                  <span className="text-lg font-black tracking-tighter">{item.dateStr}</span>
                  <span className="text-[10px] font-bold">{item.weekday}</span>
                </button>
              ))}
            </div>

            {/* B. 天氣卡片 */}
            <div className="bg-brand-blue rounded-4xl p-6 text-white shadow-xl shadow-blue-200/50 relative overflow-hidden">
               <div className="flex justify-between items-start">
                  <div>
                    <p className="text-[10px] font-black opacity-80 uppercase tracking-widest">Osaka City</p>
                    <h2 className="text-4xl font-black mt-1 tracking-tighter italic">晴朗無雲 ☀️</h2>
                  </div>
                  <div className="bg-white/20 backdrop-blur-md p-4 rounded-3xl text-right border border-white/10 shadow-inner">
                    <div className="text-4xl font-black italic tracking-tighter">13°</div>
                    <div className="text-[10px] font-bold opacity-70">5° / 13°</div>
                  </div>
               </div>
               {/* 穿搭建議區塊 */}
               <div className="mt-6 bg-white rounded-3xl p-4 flex items-center gap-4 text-brand-brown shadow-lg">
                  <div className="bg-brand-yellow w-12 h-12 rounded-full flex-shrink-0 flex items-center justify-center text-2xl shadow-sm">👕</div>
                  <div>
                    <p className="text-[9px] font-black text-brand-yellow uppercase tracking-[0.2em]">Outfit Advice</p>
                    <p className="text-xs font-bold leading-tight mt-0.5">{outfitAdvice}</p>
                  </div>
               </div>
            </div>
            
            {/* C. 倒數卡片 (含進度條與秒倒數) */}
            <div className="bg-brand-green rounded-4xl p-7 text-white shadow-xl shadow-green-100/50 relative overflow-hidden">
               <div className="relative z-10">
                 <div className="bg-white/10 backdrop-blur-sm px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest uppercase border border-white/20 inline-block mb-5">
                   🛫 Distance to Departure
                 </div>
                 {/* 進度條 */}
                 <div className="w-40 h-2.5 bg-black/10 rounded-full overflow-hidden mb-2">
                    <div 
                      className="h-full bg-white/50 rounded-full transition-all duration-1000 ease-out" 
                      style={{ width: `${countdown.percent}%` }}
                    ></div>
                 </div>
               </div>
               
               <div className="absolute right-7 bottom-6 text-right z-10">
                 <div className="flex items-baseline justify-end">
                   <span className="text-7xl font-black italic tracking-tighter leading-none">{countdown.d}</span>
                   <span className="text-xl font-black ml-1 uppercase opacity-80">天</span>
                 </div>
                 <p className="text-[10px] font-black opacity-70 mt-1 tracking-widest uppercase">
                    {countdown.h}時 {countdown.m}分 {countdown.s}秒 後出發
                 </p>
               </div>
               {/* 背景裝飾大圓 */}
               <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-white/5 rounded-full pointer-events-none"></div>
            </div>

            {/* D. 行程時間軸模組 (傳入當前選中天數 1-7) */}
            <ScheduleModule currentDay={selectedDay + 1} />
          </div>
        )}

        {/* === 分頁：準備 (Planning) === */}
        {activeTab === 'planning' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
             <div className="flex items-center gap-2 mb-6 px-2">
                <div className="w-2 h-6 bg-brand-green rounded-full"></div>
                <h2 className="text-2xl font-black text-brand-text italic uppercase tracking-tighter">行李與準備 📝</h2>
             </div>
             <TodoModule /> 
          </div>
        )}

        {/* === 分頁：其他 (開發中) === */}
        {activeTab !== 'schedule' && activeTab !== 'planning' && (
          <div className="text-center py-32 animate-pulse">
            <p className="text-5xl mb-4">🚧</p>
            <p className="font-black uppercase tracking-[0.3em] text-[10px] text-gray-300">
               {activeTab} 頁面裝修中...
            </p>
          </div>
        )}
      </main>

      {/* --- 底部導覽列 --- */}
      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
}

export default App;