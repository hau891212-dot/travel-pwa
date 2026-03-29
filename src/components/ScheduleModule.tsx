import React, { useState, useEffect } from 'react';
import { db } from '../services/firebase';
import { 
  collection, addDoc, onSnapshot, query, orderBy, 
  where, serverTimestamp, deleteDoc, doc, updateDoc 
} from 'firebase/firestore';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUtensils, faMapMarkerAlt, faBus, faHotel, faTrashAlt, faEdit } from '@fortawesome/free-solid-svg-icons';

const eventTypes = {
  sight: { icon: faMapMarkerAlt, color: 'bg-[#78B394]', label: '景點' },
  food: { icon: faUtensils, color: 'bg-[#F9E58B]', label: '美食' },
  transport: { icon: faBus, color: 'bg-[#4BA3E3]', label: '交通' },
  hotel: { icon: faHotel, color: 'bg-[#8D775F]', label: '住宿' },
};

export const ScheduleModule = ({ currentDay }: { currentDay: number }) => {
  const [events, setEvents] = useState<any[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ title: '', time: '10:00', type: 'sight', notes: '' });

  // 1. 這裡最重要：加上 where("day", "==", currentDay)
  useEffect(() => {
    // 建立一個精準的查詢：只要當天的資料
    const q = query(
      collection(db, "schedule"), 
      where("day", "==", currentDay), 
      orderBy("time", "asc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setEvents(data);
    }, (error) => {
      console.error("Firebase 查詢失敗，可能需要建立索引:", error);
    });
    
    return () => unsubscribe();
  }, [currentDay]); // 當天數改變，這裡會重新執行

  const handleSave = async () => {
    if (!form.title) return;
    
    if (editingId) {
      // 修改現有行程
      await updateDoc(doc(db, "schedule", editingId), {
        ...form,
        updatedAt: serverTimestamp()
      });
    } else {
      // 新增行程：確保有存入 day 欄位
      await addDoc(collection(db, "schedule"), {
        ...form,
        day: currentDay, // 這行保證它屬於哪一天
        createdAt: serverTimestamp()
      });
    }
    
    setForm({ title: '', time: '10:00', type: 'sight', notes: '' });
    setShowAdd(false);
    setEditingId(null);
  };

  const startEdit = (event: any) => {
    setForm({ title: event.title, time: event.time, type: event.type, notes: event.notes || '' });
    setEditingId(event.id);
    setShowAdd(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center px-2">
        <div className="flex items-center gap-2">
          <div className="w-2 h-6 bg-brand-yellow rounded-full"></div>
          <h3 className="text-xl font-bold text-brand-text italic uppercase">Day {currentDay} 計畫</h3>
        </div>
        <button 
          onClick={() => { setShowAdd(!showAdd); setEditingId(null); }}
          className="bg-brand-yellow text-brand-brown font-black px-5 py-2 rounded-full text-xs shadow-sticker active:scale-95"
        >
          {showAdd ? '關閉' : '+ 新增行程'}
        </button>
      </div>

      {showAdd && (
        <div className="bg-white p-5 rounded-4xl border-4 border-brand-yellow shadow-xl mx-2 space-y-4 animate-in zoom-in duration-200">
          <input 
            className="w-full bg-[#F7F4EB] rounded-2xl p-4 outline-none font-bold text-brand-brown"
            placeholder="要去哪裡？"
            value={form.title}
            onChange={e => setForm({...form, title: e.target.value})}
          />
          <div className="flex gap-2">
            <input type="time" className="flex-1 bg-[#F7F4EB] rounded-2xl p-3 font-bold" value={form.time} onChange={e => setForm({...form, time: e.target.value})} />
            <select className="flex-1 bg-[#F7F4EB] rounded-2xl p-3 font-bold" value={form.type} onChange={e => setForm({...form, type: e.target.value})}>
              <option value="sight">景點</option><option value="food">美食</option><option value="transport">交通</option><option value="hotel">住宿</option>
            </select>
          </div>
          <textarea 
            className="w-full bg-[#F7F4EB] rounded-2xl p-4 outline-none font-medium text-sm text-brand-brown"
            placeholder="點這裡輸入備註內容..."
            rows={2}
            value={form.notes}
            onChange={e => setForm({...form, notes: e.target.value})}
          />
          <button onClick={handleSave} className="w-full bg-brand-green text-white font-black py-4 rounded-2xl shadow-lg">
            {editingId ? '儲存修改' : '加入行程'}
          </button>
        </div>
      )}

      <div className="relative before:absolute before:left-7 before:top-4 before:bottom-4 before:w-1 before:bg-[#E0E5D5] before:rounded-full space-y-3">
        {events.map((event) => {
          const config = eventTypes[event.type as keyof typeof eventTypes] || eventTypes.sight;
          return (
            <div key={event.id} className="flex gap-4 p-2 animate-in slide-in-from-left duration-300">
              <div className={`w-10 h-10 rounded-2xl ${config.color} text-white flex-shrink-0 flex items-center justify-center z-10 shadow-lg border-2 border-white`}>
                <FontAwesomeIcon icon={config.icon} />
              </div>
              <div className="flex-1 bg-white p-4 rounded-3xl shadow-sticker border-2 border-[#E0E5D5] active:scale-95 transition-all">
                <div className="flex justify-between items-start">
                  <div onClick={() => startEdit(event)}>
                    <p className="text-[10px] font-black text-gray-400 tracking-widest">{event.time}</p>
                    <h4 className="font-bold text-brand-brown text-lg">{event.title}</h4>
                    {event.notes && <p className="text-xs text-gray-400 mt-1 italic border-t border-dashed pt-1">{event.notes}</p>}
                  </div>
                  <button onClick={() => deleteDoc(doc(db, "schedule", event.id))} className="text-gray-200 hover:text-red-400 p-2">
                    <FontAwesomeIcon icon={faTrashAlt} size="xs" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};