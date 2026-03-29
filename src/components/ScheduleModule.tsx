import React, { useState, useEffect } from 'react';
import { db } from '../services/firebase';
import { 
  collection, addDoc, onSnapshot, query, orderBy, 
  where, serverTimestamp, deleteDoc, doc, updateDoc 
} from 'firebase/firestore';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faUtensils, faMapMarkerAlt, faBus, faHotel, 
  faTrashAlt, faEdit, faStickyNote, faCheck 
} from '@fortawesome/free-solid-svg-icons';

const eventTypes = {
  sight: { icon: faMapMarkerAlt, color: 'bg-[#78B394]', label: '景點' },
  food: { icon: faUtensils, color: 'bg-[#F9E58B]', label: '美食' },
  transport: { icon: faBus, color: 'bg-[#4BA3E3]', label: '交通' },
  hotel: { icon: faHotel, color: 'bg-[#8D775F]', label: '住宿' },
};

// 接收來自 App.tsx 的 currentDay (第幾天)
export const ScheduleModule = ({ currentDay }: { currentDay: number }) => {
  const [events, setEvents] = useState<any[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null); // 正在編輯哪一筆
  
  // 表單狀態 (包含備註)
  const [form, setForm] = useState({ title: '', time: '10:00', type: 'sight', notes: '' });

  // 1. 核心邏輯：根據「當前選中的天數」過濾行程
  useEffect(() => {
    // 增加 where("day", "==", currentDay) 的過濾條件
    const q = query(
      collection(db, "schedule"), 
      where("day", "==", currentDay),
      orderBy("time", "asc")
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setEvents(data);
    });
    return () => unsubscribe();
  }, [currentDay]); // 當天數改變時，自動重新抓資料

  // 新增行程
  const handleAdd = async () => {
    if (!form.title) return;
    await addDoc(collection(db, "schedule"), {
      ...form,
      day: currentDay, // 儲存它是第幾天的行程
      createdAt: serverTimestamp()
    });
    setForm({ title: '', time: '10:00', type: 'sight', notes: '' });
    setShowAdd(false);
  };

  // 修改行程
  const handleUpdate = async (id: string) => {
    await updateDoc(doc(db, "schedule", id), {
      ...form,
      updatedAt: serverTimestamp()
    });
    setEditingId(null);
    setForm({ title: '', time: '10:00', type: 'sight', notes: '' });
  };

  // 進入編輯模式
  const startEdit = (event: any) => {
    setEditingId(event.id);
    setForm({ title: event.title, time: event.time, type: event.type, notes: event.notes || '' });
  };

  return (
    <div className="space-y-6">
      {/* 標題區域 */}
      <div className="flex justify-between items-center px-2">
        <div className="flex items-center gap-2">
          <div className="w-2 h-6 bg-brand-yellow rounded-full"></div>
          <h3 className="text-xl font-bold text-brand-text italic uppercase">Day {currentDay} 行程表</h3>
        </div>
        <button 
          onClick={() => { setShowAdd(!showAdd); setEditingId(null); }}
          className="bg-brand-yellow text-brand-brown font-black px-5 py-2 rounded-full text-xs shadow-sticker active:scale-95"
        >
          {showAdd ? '取消' : '+ 新增'}
        </button>
      </div>

      {/* 新增/編輯表單 (動態變換標題與按鈕) */}
      {(showAdd || editingId) && (
        <div className="bg-white p-5 rounded-4xl border-4 border-brand-yellow shadow-xl animate-in zoom-in duration-300 mx-2 space-y-4">
          <p className="font-black text-brand-yellow text-xs uppercase tracking-widest text-center">
            {editingId ? '修改現有行程' : '新增計畫至雲端'}
          </p>
          <input 
            className="w-full bg-[#F7F4EB] rounded-2xl p-3 outline-none font-bold text-brand-brown"
            placeholder="要去哪裡？"
            value={form.title}
            onChange={e => setForm({...form, title: e.target.value})}
          />
          <div className="flex gap-2">
            <input type="time" className="flex-1 bg-[#F7F4EB] rounded-2xl p-3 font-bold" value={form.time} onChange={e => setForm({...form, time: e.target.value})} />
            <select className="flex-1 bg-[#F7F4EB] rounded-2xl p-3 font-bold" value={form.type} onChange={e => setForm({...form, type: e.target.value})}>
              <option value="sight">風景景點</option><option value="food">美食餐廳</option><option value="transport">交通接駁</option><option value="hotel">飯店住宿</option>
            </select>
          </div>
          {/* 備註欄位 */}
          <textarea 
            className="w-full bg-[#F7F4EB] rounded-2xl p-3 outline-none font-bold text-sm text-brand-brown"
            placeholder="補充備註 (例如：要預約、這餐不吃牛...)"
            rows={2}
            value={form.notes}
            onChange={e => setForm({...form, notes: e.target.value})}
          />
          <button 
            onClick={() => editingId ? handleUpdate(editingId) : handleAdd()} 
            className="w-full bg-brand-green text-white font-black py-4 rounded-2xl shadow-lg active:scale-95"
          >
            {editingId ? '確認修改' : '放入大阪行李箱'}
          </button>
        </div>
      )}

      {/* 時間軸列表 */}
      <div className="relative before:absolute before:left-7 before:top-4 before:bottom-4 before:w-1 before:bg-[#E0E5D5] before:rounded-full space-y-3">
        {events.length === 0 ? (
          <p className="text-center py-10 text-gray-300 font-bold italic text-sm">這天還沒有排行程喔 🍃</p>
        ) : events.map((event) => {
          const config = eventTypes[event.type as keyof typeof eventTypes] || eventTypes.sight;
          return (
            <div key={event.id} className="flex gap-4 p-2 group animate-in slide-in-from-left duration-500">
              <div className={`w-10 h-10 rounded-2xl ${config.color} text-white flex-shrink-0 flex items-center justify-center z-10 shadow-lg border-2 border-white`}>
                <FontAwesomeIcon icon={config.icon} />
              </div>
              
              <div className="flex-1 bg-white p-4 rounded-3xl shadow-sticker border-2 border-[#E0E5D5] transition-all">
                <div className="flex justify-between items-start mb-1">
                  <div>
                    <p className="text-[10px] font-black text-gray-400 tracking-widest">{event.time}</p>
                    <h4 className="font-bold text-brand-brown text-lg">{event.title}</h4>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => startEdit(event)} className="text-gray-300 hover:text-brand-blue p-1 transition-colors"><FontAwesomeIcon icon={faEdit} /></button>
                    <button onClick={() => deleteDoc(doc(db, "schedule", event.id))} className="text-gray-300 hover:text-red-400 p-1 transition-colors"><FontAwesomeIcon icon={faTrashAlt} /></button>
                  </div>
                </div>
                
                {/* 顯示備註區域 */}
                {event.notes && (
                  <div className="mt-2 pt-2 border-t border-dashed border-gray-100 flex items-start gap-2">
                    <FontAwesomeIcon icon={faStickyNote} className="text-[10px] text-brand-yellow mt-1" />
                    <p className="text-xs font-medium text-gray-400 italic leading-relaxed">{event.notes}</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};