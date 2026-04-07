import React, { useState, useEffect } from 'react';
import { db, storage } from '../services/firebase';
import { collection, addDoc, onSnapshot, query, orderBy, serverTimestamp, deleteDoc, doc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import imageCompression from 'browser-image-compression'; 
import { motion, AnimatePresence } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPen, faListUl, faCamera, faCoins, faTrashAlt, faSpinner, faTimes, faReceipt } from '@fortawesome/free-solid-svg-icons';
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
    method: '現金',
    payerId: '',
    payerName: '',
    item: '',
    location: '',
    images: [] as string[]
  });

  const JPY_RATE = 0.215;

  useEffect(() => {
    const unsubM = onSnapshot(collection(db, "members"), (s) => {
      setMembers(s.docs.map(d => ({id: d.id, ...d.data()})).filter(m => !m.isDeleted));
    });
    const q = query(collection(db, "expenses"), orderBy("date", "desc"), orderBy("createdAt", "desc"));
    const unsubE = onSnapshot(q, (s) => {
      setExpenses(s.docs.map(d => ({id: d.id, ...d.data()})));
    });
    return () => { unsubM(); unsubE(); };
  }, []);

  const handleUpload = async (e: any) => {
    const files = e.target.files;
    if (!files.length) return;
    setIsUploading(true);
    const newImages = [...form.images];
    for (let file of files) {
      try {
        const options = { maxSizeMB: 0.5, maxWidthOrHeight: 1200, fileType: 'image/webp' };
        const compressedFile = await imageCompression(file, options);
        const sRef = ref(storage, `receipts/${Date.now()}_${file.name}.webp`);
        await uploadBytes(sRef, compressedFile);
        const url = await getDownloadURL(snap.ref); // 注意這裡修正為 snap.ref
        newImages.push(url);
      } catch (err) { 
        // 修正 Storage 連結邏輯
        const sRef = ref(storage, `receipts/${Date.now()}`);
        const snap = await uploadBytes(sRef, file);
        const url = await getDownloadURL(snap.ref);
        newImages.push(url);
      }
    }
    setForm({...form, images: newImages});
    setIsUploading(false);
  };

  const handleSubmit = async () => {
    if (!form.amount || !form.payerId || !form.item) return alert("必填欄位漏掉囉！");
    const amt = parseFloat(form.amount);
    const twd = form.currency === 'JPY' ? Math.round(amt * JPY_RATE) : amt;
    await addDoc(collection(db, "expenses"), { ...form, amount: amt, twdAmount: twd, createdAt: serverTimestamp() });
    setForm({ ...form, amount: '', item: '', location: '', images: [] });
    alert("記帳成功！💰");
  };

  const totalTWD = expenses.reduce((a, b) => a + (b.twdAmount || 0), 0);

  return (
    <div className="space-y-6 pb-24">
      <div className="flex bg-white/50 backdrop-blur rounded-full p-1 border border-[#E0E5D5] mx-4 shadow-sm">
        <button onClick={() => setSubTab('entry')} className={`flex-1 py-3 rounded-full text-sm font-black transition-all ${subTab === 'entry' ? 'bg-brand-green text-white shadow-md' : 'text-gray-400'}`}>記帳</button>
        <button onClick={() => setSubTab('details')} className={`flex-1 py-3 rounded-full text-sm font-black transition-all ${subTab === 'details' ? 'bg-brand-green text-white shadow-md' : 'text-gray-400'}`}>明細</button>
      </div>

      <AnimatePresence mode="wait">
        {subTab === 'entry' ? (
          <motion.div key="entry" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="px-4">
            <div className="bg-white rounded-[2.5rem] shadow-sticker border-2 border-[#E0E5D5] p-6 space-y-5">
              <div className="space-y-1">
                <p className="text-[10px] font-black text-gray-300 ml-2 uppercase">日期 Date</p>
                <input type="date" className="w-full bg-[#F7F4EB] p-4 rounded-2xl font-bold text-brand-brown outline-none" value={form.date} onChange={e => setForm({...form, date: e.target.value})} />
              </div>

              <div className="space-y-1">
                <p className="text-[10px] font-black text-gray-300 ml-2 uppercase">幣別 Currency</p>
                <div className="flex gap-3">
                  {['JPY', 'TWD'].map(c => (
                    <button key={c} onClick={() => setForm({...form, currency: c})} className={`flex-1 py-4 rounded-2xl font-black border-2 transition-all ${form.currency === c ? 'border-brand-green bg-brand-green text-white shadow-lg' : 'border-[#E0E5D5] bg-white text-gray-400'}`}>{c}</button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-brand-accent ml-2">* 金額 AMOUNT</p>
                  <input type="number" inputMode="decimal" className="w-full bg-[#F7F4EB] p-4 rounded-2xl font-black text-2xl outline-none" value={form.amount} onChange={e => setForm({...form, amount: e.target.value})} />
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-gray-300 ml-2">約合台幣 TWD</p>
                  <div className="bg-white p-4 rounded-2xl font-black text-2xl text-gray-300 border-2 border-[#F0EEE6] h-[68px] flex items-center">≈ {form.currency === 'JPY' ? Math.round(Number(form.amount) * JPY_RATE) : form.amount || 0}</div>
                </div>
              </div>

              <div className="space-y-3">
                <input className="w-full bg-[#F7F4EB] p-4 rounded-2xl font-bold outline-none" placeholder="地點 (例如：便利商店)" value={form.location} onChange={e => setForm({...form, location: e.target.value})} />
                <div className="flex gap-2">
                  <input className="flex-1 bg-[#F7F4EB] p-4 rounded-2xl font-bold outline-none" placeholder="* 消費項目" value={form.item} onChange={e => setForm({...form, item: e.target.value})} />
                  <label className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-brand-green border-2 border-brand-green cursor-pointer relative overflow-hidden">
                    {isUploading ? <FontAwesomeIcon icon={faSpinner} className="animate-spin" /> : form.images.length > 0 ? <img src={form.images[0]} className="w-full h-full object-cover" /> : <FontAwesomeIcon icon={faCamera} />}
                    <input type="file" multiple accept="image/*" className="hidden" onChange={handleUpload} />
                  </label>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-[10px] font-black text-gray-300 ml-2 uppercase">支付者 PAYER</p>
                <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
                  {members.map(m => (
                    <button key={m.id} onClick={() => setForm({...form, payerId: m.id, payerName: m.name})} className={`flex-shrink-0 flex items-center gap-3 px-4 py-2 rounded-full border-2 transition-all ${form.payerId === m.id ? 'border-brand-green bg-brand-green text-white shadow-lg' : 'border-[#F0EEE6] bg-white text-gray-400'}`}>
                      <img src={m.avatar} className="w-8 h-8 rounded-full border-2 border-white" />
                      <span className="text-xs font-black">{m.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              <button onClick={handleSubmit} className="w-full bg-brand-green text-white font-black py-5 rounded-[2.5rem] shadow-lg active:scale-95 transition-all text-xl mt-4">確認完成記帳 ✨</button>
            </div>
          </motion.div>
        ) : (
          <motion.div key="details" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="px-4 space-y-6">
            <div className="bg-brand-yellow rounded-[2.5rem] p-8 text-brand-brown shadow-xl relative overflow-hidden">
               <p className="text-xs font-black opacity-60 uppercase">目前總支出 (TWD)</p>
               <h2 className="text-6xl font-black italic mt-2">NT$ {totalTWD.toLocaleString()}</h2>
               <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/10 rounded-full" />
            </div>
            <div className="space-y-4">
               {expenses.map((exp) => (
                 <div key={exp.id} className="bg-white p-5 rounded-[2.5rem] shadow-sm border-2 border-[#F0EEE6] space-y-4">
                    <div className="flex justify-between items-start">
                       <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-brand-yellow/10 text-brand-yellow rounded-2xl flex items-center justify-center"><FontAwesomeIcon icon={faReceipt} /></div>
                          <div><p className="font-black text-brand-brown text-lg">{exp.item}</p><p className="text-[10px] font-bold text-white bg-brand-green px-2 py-0.5 rounded-md inline-block">{exp.payerName}</p></div>
                       </div>
                       <div className="text-right">
                          <p className="font-black text-brand-brown text-lg">{exp.currency === 'JPY' ? '¥' : '$'} {exp.amount.toLocaleString()}</p>
                          <p className="text-[10px] font-bold text-gray-400">≈ NT$ {exp.twdAmount}</p>
                       </div>
                    </div>
                    {exp.images?.length > 0 && (
                      <div className="flex gap-2 overflow-x-auto no-scrollbar"><{exp.images.map((url: string, i: number) => (<img key={i} src={url} className="w-20 h-20 object-cover rounded-xl" />))}/div>
                    )}
                 </div>
               ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};