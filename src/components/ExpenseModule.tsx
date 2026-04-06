import React, { useState, useEffect } from 'react';
import { db, storage } from '../services/firebase';
import { collection, addDoc, onSnapshot, query, orderBy, serverTimestamp, doc, deleteDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { motion, AnimatePresence } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPen, faListUl, faCamera, faCoins, faMapMarkerAlt, faCheckCircle, faSpinner, faTrashAlt } from '@fortawesome/free-solid-svg-icons';
import { format } from 'date-fns';

export const ExpenseModule = () => {
  const [subTab, setSubTab] = useState<'entry' | 'details'>('entry');
  const [members, setMembers] = useState<any[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const [form, setForm] = useState({
    date: format(new Date(), 'yyyy-MM-dd'),
    currency: 'JPY',
    amount: '',
    payerId: '',
    payerName: '',
    location: '',
    item: '',
    images: [] as string[]
  });

  const JPY_RATE = 0.215; // 這裡可以改為當下匯率

  useEffect(() => {
    // 監聽成員 (用於底部選單)
    const unsubM = onSnapshot(collection(db, "members"), (s) => {
      setMembers(s.docs.map(d => ({id: d.id, ...d.data()})).filter(m => !m.isDeleted));
    });
    // 監聽支出
    const q = query(collection(db, "expenses"), orderBy("date", "desc"), orderBy("createdAt", "desc"));
    const unsubE = onSnapshot(q, (s) => setExpenses(s.docs.map(d => ({id: d.id, ...d.data()}))));
    return () => { unsubM(); unsubE(); };
  }, []);

  const handleUpload = async (e: any) => {
    const files = e.target.files;
    if (!files.length) return;
    setIsUploading(true);
    const newImages = [...form.images];
    for (let file of files) {
      const sRef = ref(storage, `receipts/${Date.now()}_${file.name}`);
      const snap = await uploadBytes(sRef, file);
      const url = await getDownloadURL(snap.ref);
      newImages.push(url);
    }
    setForm({...form, images: newImages});
    setIsUploading(false);
  };

  const handleAdd = async () => {
    if (!form.amount || !form.payerId || !form.item) return alert("必填欄位未填寫喔！");
    const amt = parseFloat(form.amount);
    const twd = form.currency === 'JPY' ? Math.round(amt * JPY_RATE) : amt;
    await addDoc(collection(db, "expenses"), { ...form, amount: amt, twdAmount: twd, createdAt: serverTimestamp() });
    setForm({ ...form, amount: '', item: '', location: '', images: [] });
    alert("已新增一筆紀錄 ✨");
  };

  const totalTWD = expenses.reduce((a, b) => a + (b.twdAmount || 0), 0);

  return (
    <div className="space-y-6 pb-20">
      {/* 1. 頂部雙標籤按鈕 */}
      <div className="flex bg-white/50 backdrop-blur rounded-full p-1 border border-[#E0E5D5] mx-4 mt-2 shadow-sm">
        <button onClick={() => setSubTab('entry')} className={`flex-1 py-3 rounded-full text-sm font-black transition-all flex items-center justify-center gap-2 ${subTab === 'entry' ? 'bg-brand-green text-white shadow-md' : 'text-gray-400'}`}>
          <FontAwesomeIcon icon={faPen} /> 記帳
        </button>
        <button onClick={() => setSubTab('details')} className={`flex-1 py-3 rounded-full text-sm font-black transition-all flex items-center justify-center gap-2 ${subTab === 'details' ? 'bg-brand-green text-white shadow-md' : 'text-gray-400'}`}>
          <FontAwesomeIcon icon={faListUl} /> 明細
        </button>
      </div>

      <AnimatePresence mode="wait">
        {subTab === 'entry' ? (
          <motion.div key="entry" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="px-4">
            <div className="bg-white rounded-[2.5rem] shadow-sticker border-2 border-[#E0E5D5] p-6 space-y-5">
              <div className="flex items-center gap-2 text-[#D4A017]">
                <FontAwesomeIcon icon={faCoins} />
                <span className="font-black text-sm uppercase tracking-widest">記帳輸入</span>
              </div>

              {/* 日期選擇 */}
              <div className="space-y-1">
                <p className="text-[10px] font-black text-gray-300 ml-2">日期 Date</p>
                <input type="date" className="w-full bg-[#F7F4EB] p-4 rounded-2xl font-bold text-brand-brown outline-none border-2 border-transparent focus:border-brand-green/30" value={form.date} onChange={e => setForm({...form, date: e.target.value})} />
              </div>

              {/* 幣別切換 */}
              <div className="space-y-1">
                <p className="text-[10px] font-black text-gray-300 ml-2">幣別 (預設 JPY)</p>
                <div className="flex gap-2">
                  {['JPY', 'TWD'].map(c => (
                    <button key={c} onClick={() => setForm({...form, currency: c})} className={`flex-1 py-3 rounded-xl font-black border-2 transition-all ${form.currency === c ? 'border-brand-green bg-brand-green/5 text-brand-green' : 'border-gray-100 text-gray-300 bg-white'}`}>{c}</button>
                  ))}
                </div>
              </div>

              {/* 金額輸入 */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-brand-accent ml-2">* 金額 Amount</p>
                  <input type="number" inputMode="numeric" className="w-full bg-[#F7F4EB] p-4 rounded-2xl font-black text-2xl outline-none" value={form.amount} onChange={e => setForm({...form, amount: e.target.value})} />
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-gray-300 ml-2">約合台幣 TWD</p>
                  <div className="bg-gray-50/50 p-4 rounded-2xl font-black text-2xl text-gray-300 border border-gray-100">
                    {form.currency === 'JPY' ? Math.round(Number(form.amount) * JPY_RATE) : form.amount || 0}
                  </div>
                </div>
              </div>

              {/* 支付方式 (靜態按鈕) */}
              <div className="space-y-1">
                <p className="text-[10px] font-black text-gray-300 ml-2">支付方式</p>
                <div className="flex gap-2 overflow-x-auto no-scrollbar">
                  {['現金', '信用卡', 'ICOCA', '行動支付'].map(m => (
                    <button key={m} className="flex-shrink-0 px-5 py-2 rounded-xl border-2 border-gray-100 text-gray-400 font-bold text-xs"> {m} </button>
                  ))}
                </div>
              </div>

              {/* 地點與項目 */}
              <div className="space-y-3">
                <input className="w-full bg-[#F7F4EB] p-4 rounded-2xl font-bold outline-none border-2 border-transparent focus:border-brand-green/30" placeholder="地點 (選填)" value={form.location} onChange={e => setForm({...form, location: e.target.value})} />
                <div className="flex gap-2">
                  <input className="flex-1 bg-[#F7F4EB] p-4 rounded-2xl font-bold outline-none border-2 border-transparent focus:border-brand-green/30" placeholder="* 消費項目" value={form.item} onChange={e => setForm({...form, item: e.target.value})} />
                  <label className="w-14 h-14 bg-brand-green/10 rounded-2xl flex items-center justify-center text-brand-green cursor-pointer shadow-inner relative overflow-hidden">
                    {isUploading ? <FontAwesomeIcon icon={faSpinner} className="animate-spin" /> : 
                     form.images.length > 0 ? <img src={form.images[0]} className="w-full h-full object-cover" /> : <FontAwesomeIcon icon={faCamera} />}
                    <input type="file" multiple accept="image/*" className="hidden" onChange={handleUpload} />
                  </label>
                </div>
              </div>

              {/* 重要：成員選擇選單 (截圖最下方那列) */}
              <div className="space-y-2">
                <p className="text-[10px] font-black text-gray-300 ml-2 uppercase">支付者 Payer</p>
                <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
                  {members.map(m => (
                    <button key={m.id} onClick={() => setForm({...form, payerId: m.id, payerName: m.name})} className={`flex-shrink-0 flex items-center gap-2 px-3 py-2 rounded-full border-2 transition-all ${form.payerId === m.id ? 'border-brand-green bg-brand-green/10' : 'border-gray-100 opacity-50'}`}>
                      <img src={m.avatar} className="w-8 h-8 rounded-full border border-white shadow-sm" />
                      <span className="text-xs font-black text-brand-brown">{m.name}</span>
                    </button>
                  ))}
                  {members.length === 0 && <p className="text-xs text-gray-300 italic p-2">請先去「成員」頁面新增旅伴喔！</p>}
                </div>
              </div>

              <button onClick={handleAdd} className="w-full bg-brand-green text-white font-black py-5 rounded-[2rem] shadow-lg active:scale-95 transition-all text-lg mt-4">完成記帳</button>
            </div>
          </motion.div>
        ) : (
          <motion.div key="details" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="px-4 space-y-6">
            {/* 總結卡片 (截圖 3) */}
            <div className="bg-brand-yellow rounded-[2.5rem] p-8 text-brand-brown shadow-xl relative overflow-hidden">
               <p className="text-xs font-black opacity-60 uppercase tracking-widest">總支出 (TWD)</p>
               <h2 className="text-6xl font-black italic mt-2 tracking-tighter">NT$ {totalTWD.toLocaleString()}</h2>
               <div className="mt-6 pt-6 border-t border-brand-brown/10 flex justify-between">
                  <div><p className="text-[10px] font-black opacity-50 uppercase">日圓支出</p><p className="text-lg font-black">¥ {expenses.filter(e => e.currency === 'JPY').reduce((a, b) => a + b.amount, 0).toLocaleString()}</p></div>
                  <div className="text-right"><p className="text-[10px] font-black opacity-50 uppercase">匯率試算</p><p className="text-lg font-black">1 : {JPY_RATE}</p></div>
               </div>
               <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/10 rounded-full"></div>
            </div>

            {/* 明細列表 */}
            <div className="space-y-4">
               <h3 className="font-black text-brand-text ml-2 italic text-lg">帳務明細</h3>
               {expenses.map((exp) => (
                 <div key={exp.id} className="bg-white p-5 rounded-[2.5rem] shadow-sm border-2 border-[#F0EEE6] flex items-center justify-between">
                    <div className="flex items-center gap-4">
                       <div className="w-14 h-14 bg-[#F7F4EB] rounded-2xl flex items-center justify-center overflow-hidden border border-gray-100">
                          {exp.images?.length > 0 ? <img src={exp.images[0]} className="w-full h-full object-cover" /> : <FontAwesomeIcon icon={faStore} className="text-gray-200" />}
                       </div>
                       <div>
                          <p className="font-black text-brand-brown text-lg">{exp.item}</p>
                          <div className="flex items-center gap-2">
                             <span className="text-[10px] font-bold text-gray-400 bg-gray-50 px-2 py-0.5 rounded-md">{exp.payerName}</span>
                             <span className="text-[10px] text-gray-300">{exp.date}</span>
                          </div>
                       </div>
                    </div>
                    <div className="text-right">
                       <p className="font-black text-brand-brown text-lg">{exp.currency === 'JPY' ? '¥' : '$'} {exp.amount.toLocaleString()}</p>
                       <p className="text-[10px] font-bold text-gray-400 italic">≈ NT$ {exp.twdAmount}</p>
                    </div>
                 </div>
               ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};