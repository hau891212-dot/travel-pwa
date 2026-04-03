import React, { useState, useEffect } from 'react';
import { db, storage } from '../services/firebase';
import { collection, addDoc, onSnapshot, query, orderBy, serverTimestamp, doc, deleteDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { motion, AnimatePresence } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPen, faListUl, faCamera, faUsers, faCoins, faStore, faTrashAlt } from '@fortawesome/free-solid-svg-icons';
import { format } from 'date-fns';

export const ExpenseModule = () => {
  const [subTab, setSubTab] = useState<'entry' | 'details'>('entry');
  const [members, setMembers] = useState<any[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    date: format(new Date(), 'yyyy-MM-dd'),
    currency: 'JPY',
    amount: '',
    payerId: '',
    payerName: '',
    item: '',
    imageUrl: ''
  });

  const JPY_RATE = 0.215; // 預設日幣匯率

  useEffect(() => {
    // 監聽成員與帳務
    const unsubM = onSnapshot(collection(db, "members"), (s) => setMembers(s.docs.map(d => ({id: d.id, ...d.data()}))));
    const q = query(collection(db, "expenses"), orderBy("date", "desc"), orderBy("createdAt", "desc"));
    const unsubE = onSnapshot(q, (s) => setExpenses(s.docs.map(d => ({id: d.id, ...d.data()}))));
    return () => { unsubM(); unsubE(); };
  }, []);

  const handleUpload = async (e: any) => {
    const file = e.target.files[0];
    if (!file) return;
    setLoading(true);
    const sRef = ref(storage, `receipts/${Date.now()}`);
    await uploadBytes(sRef, file);
    const url = await getDownloadURL(sRef);
    setForm({...form, imageUrl: url});
    setLoading(false);
  };

  const handleAdd = async () => {
    if (!form.amount || !form.payerId) return alert("請輸入金額與支付者");
    const amt = parseFloat(form.amount);
    const twd = form.currency === 'JPY' ? Math.round(amt * JPY_RATE) : amt;
    await addDoc(collection(db, "expenses"), { ...form, amount: amt, twdAmount: twd, createdAt: serverTimestamp() });
    setForm({ ...form, amount: '', item: '', imageUrl: '' });
    alert("已記錄支出！");
  };

  const totalTWD = expenses.reduce((a, b) => a + (b.twdAmount || 0), 0);

  return (
    <div className="space-y-6 pb-10">
      <div className="flex bg-white rounded-full p-1 shadow-sm border border-[#E0E5D5] mx-2">
        <button onClick={() => setSubTab('entry')} className={`flex-1 py-3 rounded-full text-xs font-black transition-all ${subTab === 'entry' ? 'bg-brand-green text-white shadow-md' : 'text-gray-400'}`}><FontAwesomeIcon icon={faPen} className="mr-2"/>記帳</button>
        <button onClick={() => setSubTab('details')} className={`flex-1 py-3 rounded-full text-xs font-black transition-all ${subTab === 'details' ? 'bg-brand-green text-white shadow-md' : 'text-gray-400'}`}><FontAwesomeIcon icon={faListUl} className="mr-2"/>明細</button>
      </div>

      <AnimatePresence mode="wait">
        {subTab === 'entry' ? (
          <motion.div key="entry" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="px-2 space-y-4">
            <div className="bg-white rounded-[2.5rem] shadow-sticker border-2 border-[#E0E5D5] p-6 space-y-4">
              <h3 className="font-black text-brand-brown mb-2 flex items-center gap-2"><FontAwesomeIcon icon={faCoins} className="text-brand-yellow"/> 新增消費</h3>
              <input type="date" className="w-full bg-[#F7F4EB] p-4 rounded-2xl font-bold" value={form.date} onChange={e => setForm({...form, date: e.target.value})} />
              <div className="flex gap-2">
                {['JPY', 'TWD'].map(c => (
                  <button key={c} onClick={() => setForm({...form, currency: c})} className={`flex-1 py-3 rounded-xl font-black border-2 ${form.currency === c ? 'border-brand-green text-brand-green bg-brand-green/5' : 'border-gray-50 text-gray-300'}`}>{c}</button>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <input type="number" placeholder="金額" className="bg-[#F7F4EB] p-4 rounded-2xl font-black text-2xl" value={form.amount} onChange={e => setForm({...form, amount: e.target.value})} />
                <div className="bg-gray-50 p-4 rounded-2xl font-black text-2xl text-gray-300">≈ {form.currency === 'JPY' ? Math.round(Number(form.amount) * JPY_RATE) : form.amount}</div>
              </div>
              <div className="flex gap-2">
                <input placeholder="消費項目 (例如: 晚餐)" className="flex-1 bg-[#F7F4EB] p-4 rounded-2xl font-bold" value={form.item} onChange={e => setForm({...form, item: e.target.value})} />
                <label className="w-14 h-14 bg-brand-green/10 rounded-2xl flex items-center justify-center text-brand-green cursor-pointer"><input type="file" className="hidden" onChange={handleUpload}/><FontAwesomeIcon icon={faCamera}/></label>
              </div>
              <div className="flex gap-3 overflow-x-auto py-2 no-scrollbar">
                {members.map(m => (
                  <button key={m.id} onClick={() => setForm({...form, payerId: m.id, payerName: m.name})} className={`flex-shrink-0 flex flex-col items-center gap-1 transition-all ${form.payerId === m.id ? 'scale-110' : 'opacity-40 grayscale'}`}>
                    <img src={m.avatar} className="w-12 h-12 rounded-full border-2 border-brand-green" /><span className="text-[10px] font-bold">{m.name}</span>
                  </button>
                ))}
              </div>
              <button onClick={handleAdd} className="w-full bg-brand-green text-white font-black py-5 rounded-3xl shadow-lg active:scale-95">完成記帳</button>
            </div>
          </motion.div>
        ) : (
          <motion.div key="details" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="px-2 space-y-6">
            <div className="bg-brand-yellow rounded-[2.5rem] p-8 text-brand-brown shadow-xl relative overflow-hidden">
               <p className="text-xs font-black opacity-60 uppercase">總支出 (TWD)</p>
               <h2 className="text-5xl font-black italic mt-2">NT$ {totalTWD.toLocaleString()}</h2>
               <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/10 rounded-full"></div>
            </div>
            <div className="space-y-3">
               {expenses.map(exp => (
                 <div key={exp.id} className="bg-white p-4 rounded-[2rem] shadow-sm border-2 border-[#F0EEE6] flex justify-between items-center">
                    <div className="flex items-center gap-4">
                       <div className="w-12 h-12 bg-[#F7F4EB] rounded-full flex items-center justify-center overflow-hidden">{exp.imageUrl ? <img src={exp.imageUrl} className="w-full h-full object-cover" /> : <FontAwesomeIcon icon={faStore} className="text-gray-200" />}</div>
                       <div><p className="font-black text-brand-brown">{exp.item}</p><p className="text-[10px] text-gray-400 font-bold">{exp.payerName} · {exp.date}</p></div>
                    </div>
                    <div className="text-right">
                       <p className="font-black text-brand-brown">{exp.currency === 'JPY' ? '¥' : '$'} {exp.amount.toLocaleString()}</p>
                       <button onClick={() => deleteDoc(doc(db, "expenses", exp.id))} className="text-[10px] text-red-300 mt-1"><FontAwesomeIcon icon={faTrashAlt}/></button>
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