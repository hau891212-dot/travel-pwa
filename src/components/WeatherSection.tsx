import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCloudRain, faWind, faSun, faTshirt, faCloud, faTemperatureHigh } from '@fortawesome/free-solid-svg-icons';
import { addDays, format, parseISO } from 'date-fns';

// 你的專屬 API Key
const API_KEY = "1ee9f73bedb1ab0526bc87ef0fd8ff45"; 
const CITY = "Osaka"; 

export const WeatherSection = ({ startDate }: { startDate: string }) => {
  const [selectedDay, setSelectedDay] = useState(0);
  const [weather, setWeather] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        setLoading(true);
        setError(false);
        // 抓取大阪即時天氣
        const response = await axios.get(
          `https://api.openweathermap.org/data/2.5/weather?q=${CITY}&appid=${API_KEY}&units=metric&lang=zh_tw`
        );
        setWeather(response.data);
      } catch (err) {
        console.error("天氣抓取失敗:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    fetchWeather();
  }, []);

  // 穿搭建議邏輯
  const getAdvice = (temp: number, desc: string) => {
    if (desc.includes("雨")) return "今天大阪有雨，出門記得帶傘，穿防水防滑的鞋子。";
    if (temp <= 12) return "大阪現在很冷！建議穿厚大衣、圍巾，內層穿發熱衣。";
    if (temp <= 18) return "氣溫偏涼，建議採用洋蔥式穿搭：長袖加防風外套。";
    if (temp <= 24) return "天氣很舒服，一件薄長袖或襯衫就足夠了。";
    return "大阪很熱，建議穿著透氣短袖，並注意防曬補水。";
  };

  const getWeatherIcon = (desc: string) => {
    if (desc.includes("雨")) return faCloudRain;
    if (desc.includes("雲")) return faCloud;
    return faSun;
  };

  // 讀取中的畫面 (做一個漂亮的骨架屏)
  if (loading) return (
    <div className="mx-2 h-64 bg-white/30 animate-pulse rounded-4xl flex items-center justify-center">
      <p className="text-brand-blue font-black italic tracking-widest">OSAKA WEATHER LOADING...</p>
    </div>
  );

  // 如果 Key 還沒生效或出錯
  if (error) return (
    <div className="mx-2 p-6 bg-red-100 rounded-4xl text-red-500 text-sm font-bold">
      天氣資料暫時無法取得 (API Key 可能需要 1 小時生效)
    </div>
  );

  return (
    <div className="space-y-6">
      {/* 1. 日期選擇器 */}
      <div className="flex gap-3 overflow-x-auto pb-2 px-2 no-scrollbar">
        {[...Array(7)].map((_, i) => {
          const date = addDays(parseISO(startDate), i);
          const isActive = selectedDay === i;
          return (
            <button
              key={i}
              onClick={() => setSelectedDay(i)}
              className={`flex-shrink-0 w-16 h-20 rounded-2xl flex flex-col items-center justify-center transition-all duration-300 ${
                isActive ? 'bg-brand-blue text-white shadow-lg scale-105' : 'bg-white text-gray-400'
              }`}
            >
              <span className="text-[10px] font-black opacity-70 uppercase">Day {i + 1}</span>
              <span className="text-lg font-black tracking-tighter">{format(date, 'M/dd')}</span>
            </button>
          );
        })}
      </div>

      {/* 2. 真實天氣卡片 */}
      <div className="bg-brand-blue rounded-4xl p-6 text-white shadow-xl shadow-blue-200/50 relative mx-2 overflow-hidden">
        <div className="flex justify-between items-start relative z-10">
          <div>
            <p className="text-[10px] font-black opacity-80 uppercase tracking-widest flex items-center gap-1">
              <span className="w-2 h-2 bg-green-300 rounded-full animate-ping"></span> Live in {weather?.name}
            </p>
            <h2 className="text-4xl font-black mt-1 tracking-tighter italic">
              {weather?.weather[0].description} 
              <FontAwesomeIcon icon={getWeatherIcon(weather?.weather[0].description)} className="ml-2 text-3xl" />
            </h2>
          </div>
          
          {/* 對話框氣溫 */}
          <div className="bg-white/20 backdrop-blur-md p-4 rounded-3xl text-right border border-white/10 shadow-inner">
            <div className="text-5xl font-black italic tracking-tighter">{Math.round(weather?.main.temp)}°</div>
            <div className="text-[10px] font-bold opacity-70 uppercase tracking-widest">Feels {Math.round(weather?.main.feels_like)}°</div>
          </div>
        </div>

        {/* 三格數據 */}
        <div className="grid grid-cols-3 gap-3 mt-8 relative z-10">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 text-center border border-white/5">
            <p className="text-[9px] font-black opacity-60 uppercase">Humidity</p>
            <p className="text-lg font-black">{weather?.main.humidity}%</p>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 text-center border border-white/5">
            <p className="text-[9px] font-black opacity-60 uppercase">Wind</p>
            <p className="text-lg font-black">{weather?.wind.speed}m/s</p>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 text-center border border-white/5">
            <p className="text-[9px] font-black opacity-60 uppercase">Pressure</p>
            <p className="text-lg font-black">{weather?.main.pressure}</p>
          </div>
        </div>

        {/* 穿搭建議區塊 */}
        <div className="bg-white rounded-3xl mt-6 p-4 flex items-center gap-4 text-brand-brown shadow-lg relative z-10">
          <div className="bg-brand-yellow w-12 h-12 rounded-full flex-shrink-0 flex items-center justify-center text-2xl shadow-sm text-white">
            <FontAwesomeIcon icon={faTshirt} />
          </div>
          <div>
            <p className="text-[9px] font-black text-brand-yellow uppercase tracking-widest">Outfit Advice 穿搭建議</p>
            <p className="text-xs font-bold leading-tight mt-0.5">
              {getAdvice(weather?.main.temp, weather?.weather[0].description)}
            </p>
          </div>
        </div>

        {/* 背景裝飾 */}
        <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/5 rounded-full"></div>
      </div>
    </div>
  );
};