import React, { useState, useEffect } from 'react';
import { db, storage } from '../services/firebase';
import { collection, addDoc, onSnapshot, query, orderBy, serverTimestamp, doc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { motion, AnimatePresence } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPen, faListUl, faCamera, faUsers, faCoins, faCalendarAlt, faStore, faCheckCircle } from '@fortawesome/free-solid-svg-icons';
import { format } from 'date-fns';

export const ExpenseModule = () => {
  const [subTab, setSubTab] = useState<'entry' | 'details'>('entry');
  const [members, setMembers] = useState<any[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // 表單狀態
  const [form, setForm] = useState({
    date: format(new Date(), 'yyyy-MM-dd'),
    currency: 'JPY',
    amount: '',
    payerId: '',
    payerName: '',
    location: '',
    item: '',
    imageUrl: '',
    splitWith: [] as string[] // 分攤成員 ID 列表
  });

  // 匯率預設
  const JPY_RATE = 0.215;

  useEffect(() => {
    // 1. 監聽成員 (只抓取未被刪除的，用於下拉選單)
    const unsubMembers = onSnapshot(collection(db, "members"), (snap) => {
      const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setMembers(list);
    });

    // 2. 監聽帳務明細
    const q = query(collection(db, "expenses"), orderBy("date", "desc"), orderBy("createdAt", "desc"));
    const unsubExpenses = onSnapshot(q, (snap) => {
      setExpenses(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    return () => { unsubMembers(); unsubExpenses(); };
  }, []);

  // 圖片上傳邏輯
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true);
    try {
      const storageRef = ref(storage, `receipts/${Date.now()}_${file.name}`);
      const snap = await uploadBytes(storageRef, file);
      const url = await getDownloadURL(snap.ref);
      setForm({ ...form, imageUrl: url });
    } catch (err) { alert("上傳失敗"); }
    setLoading(false);
  };

  // 儲存帳務
  const handleSubmit = async () => {
    if (!form.amount || !form.payerId || !form.item) {
      alert("請填寫必填欄位 (*)");
      return;
    }
    const amountNum = parseFloat(form.amount);
    const twdAmount = form.currency === 'JPY' ? Math.round(amountNum * JPY_RATE) : amountNum;
    
    await addDoc(collection(db, "expenses"), {
      ...form,
      amount: amountNum,
      twdAmount: twdAmount,
      createdAt: serverTimestamp()
    });
    
    alert("已新增一筆記錄！");
    setForm({ ...form, amount: '', item: '', location: '', imageUrl: '', splitWith: [] });
  };

  // 分帳算法邏輯
  const calculateSettlement = () => {
    const totalSpent = expenses.reduce((acc, curr) => acc + curr.twdAmount, 0);
    const balances: { [key: string]: { paid: number, name: string, avatar: string } } = {};
    
    members.forEach(m => {
      balances[m.id] = { paid: 0, name: m.name, avatar: m.avatar };
    });

    expenses.forEach(exp => {
      if (balances[exp.payerId]) {
        balances[exp.payerId].paid += exp.twdAmount;
      }
    });

    return { totalSpent, balances };
  };

  const { totalSpent, balances } = calculateSettlement();

  return (
    <div className="pb-20 space-y-6">
      {/* 1. 子分頁切換按鈕 */}
      <div className="flex bg-white rounded-full p-1 shadow-sm border border-[#E0E5D5] mx-2">
        <button onClick={() => setSubTab('entry')} className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-full text-sm font-black transition-all ${subTab === 'entry' ? 'bg-brand-green text-white shadow-md' : 'text-gray-400'}`}>
          <FontAwesomeIcon icon={faPen} /> 記帳
        </button>
        <button onClick={() => setSubTab('details')} className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-full text-sm font-black transition-all ${subTab === 'details' ? 'bg-brand-green text-white shadow-md' : 'text-gray-400'}`}>
          <FontAwesomeIcon icon={faListUl} /> 明細
        </button>
      </div>

      <AnimatePresence mode="wait">
        {subTab === 'entry' ? (
          <motion.div key="entry" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="px-2 space-y-4">
            <div className="bg-white rounded-[2.5rem] shadow-sticker border-2 border-[#E0E5D5] p-6 space-y-5">
              <h3 className="text-xl font-black text-brand-brown flex items-center gap-2">
                <div className="w-8 h-8 bg-brand-yellow/20 rounded-full flex items-center justify-center text-brand-yellow text-sm">
                  <FontAwesomeIcon icon={faCoins} />
                </div> 記帳輸入
              </h3>

              {/* 日期與幣別 */}
              <div className="space-y-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-black text-gray-300 ml-2 uppercase">日期 Date</label>
                  <input type="date" className="bg-[#F7F4EB] p-4 rounded-2xl font-bold text-brand-brown outline-none" value={form.date} onChange={e => setForm({...form, date: e.target.value})} />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-black text-gray-300 ml-2 uppercase">幣別 Currency</label>
                  <div className="flex gap-2">
                    {['JPY', 'TWD'].map(c => (
                      <button key={c} onClick={() => setForm({...form, currency: c})} className={`flex-1 py-3 rounded-xl font-black border-2 transition-all ${form.currency === c ? 'border-brand-green bg-brand-green/5 text-brand-green' : 'border-gray-100 text-gray-300'}`}>{c}</button>
                    ))}
                  </div>
                </div>
              </div>

              {/* 金額 */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-black text-brand-accent ml-2 uppercase">* 金額 Amount</label>
                  <input type="number" inputMode="numeric" className="bg-[#F7F4EB] p-4 rounded-2xl font-black text-2xl outline-none" placeholder="0" value={form.amount} onChange={e => setForm({...form, amount: e.target.value})} />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-black text-gray-300 ml-2 uppercase">約合台幣 TWD</label>
                  <div className="bg-gray-50 p-4 rounded-2xl font-black text-2xl text-gray-300">
                    {form.currency === 'JPY' ? Math.round(parseFloat(form.amount || '0') * JPY_RATE) : form.amount || 0}
                  </div>
                </div>
              </div>

              {/* 地點與項目 */}
              <div className="space-y-3">
                <input className="w-full bg-[#F7F4EB] p-4 rounded-2xl font-bold outline-none" placeholder="地點 (例如：便利商店)" value={form.location} onChange={e => setForm({...form, location: e.target.value})} />
                <div className="flex gap-2">
                  <input className="flex-1 bg-[#F7F4EB] p-4 rounded-2xl font-bold outline-none" placeholder="* 消費項目 (例如：午餐)" value={form.item} onChange={e => setForm({...form, item: e.target.value})} />
                  <label className="w-14 h-14 bg-brand-green/10 rounded-2xl flex items-center justify-center text-brand-green cursor-pointer active:scale-90 transition-all border-2 border-brand-green/20">
                    <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                    <FontAwesomeIcon icon={faCamera} />
                  </label>
                </div>
                {form.imageUrl && <p className="text-[10px] text-brand-green font-bold">✓ 照片已就緒</p>}
              </div>

              {/* 付款人選擇 (與成員頁面同步) */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-300 ml-2 uppercase">* 支付者 Payer</label>
                <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
                  {members.filter(m => !m.isDeleted).map(m => (
                    <button key={m.id} onClick={() => setForm({...form, payerId: m.id, payerName: m.name})} className={`flex-shrink-0 flex flex-col items-center gap-1 transition-all ${form.payerId === m.id ? 'scale-110' : 'opacity-40 grayscale'}`}>
                      <img src={m.avatar} className="w-12 h-12 rounded-full border-2 border-brand-green" alt={m.name} />
                      <span className="text-[10px] font-black">{m.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              <button onClick={handleSubmit} className="w-full bg-brand-green text-white font-black py-5 rounded-3xl shadow-lg active:scale-95 transition-all">新增一筆支出</button>
            </div>
          </motion.div>
        ) : (
          <motion.div key="details" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="px-2 space-y-6">
            {/* 黃色總覽卡片 */}
            <div className="bg-brand-yellow rounded-[2.5rem] p-8 text-brand-brown shadow-xl relative overflow-hidden">
               <p className="text-xs font-black opacity-60 uppercase tracking-widest">總支出 (TWD)</p>
               <h2 className="text-6xl font-black italic mt-2 tracking-tighter">NT$ {totalSpent.toLocaleString()}</h2>
               <div className="mt-6 pt-6 border-t border-brand-brown/10 grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[10px] font-black opacity-50 uppercase">日圓總計</p>
                    <p className="text-lg font-black">¥ {expenses.filter(e => e.currency === 'JPY').reduce((acc, curr) => acc + curr.amount, 0).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black opacity-50 uppercase">預設匯率</p>
                    <p className="text-lg font-black">1 : {JPY_RATE}</p>
                  </div>
               </div>
               <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/10 rounded-full"></div>
            </div>

            {/* 結算報告區 */}
            <div className="bg-white rounded-[2.5rem] p-6 shadow-sticker border-2 border-[#E0E5D5] space-y-4">
               <h3 className="font-black text-brand-text flex items-center gap-2 italic"><FontAwesomeIcon icon={faUsers} /> 結算報告 (均分)</h3>
               <div className="space-y-3">
                 {Object.values(balances).map((b: any, i) => {
                   const share = totalSpent / members.length;
                   const diff = b.paid - share;
                   return (
                     <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-2xl">
                        <div className="flex items-center gap-3">
                           <img src={b.avatar} className="w-10 h-10 rounded-full" />
                           <div>
                              <p className="text-xs font-black">{b.name}</p>
                              <p className="text-[10px] text-gray-400">已付 NT$ {b.paid.toLocaleString()}</p>
                           </div>
                        </div>
                        <div className="text-right">
                           <p className={`text-sm font-black ${diff >= 0 ? 'text-brand-green' : 'text-brand-accent'}`}>
                             {diff >= 0 ? `+${Math.round(diff)}` : Math.round(diff)}
                           </p>
                           <p className="text-[9px] font-bold text-gray-300 uppercase">{diff >= 0 ? '應收' : '應付'}</p>
                        </div>
                     </div>
                   );
                 })}
               </div>
            </div>

            {/* 帳務列表 */}
            <div className="space-y-3">
               <h3 className="font-black text-brand-text ml-2 italic">帳務明細</h3>
               {expenses.map((exp) => (
                 <div key={exp.id} className="bg-white p-4 rounded-[2rem] shadow-sm border-2 border-[#F0EEE6] flex items-center justify-between">
                    <div className="flex items-center gap-4">
                       <div className="w-12 h-12 bg-[#F7F4EB] rounded-full flex items-center justify-center overflow-hidden">
                          {exp.imageUrl ? <img src={exp.imageUrl} className="w-full h-full object-cover" /> : <FontAwesomeIcon icon={faStore} className="text-gray-200" />}
                       </div>
                       <div>
                          <p className="font-black text-brand-brown">{exp.item}</p>
                          <div className="flex items-center gap-2">
                             <span className="text-[10px] font-bold text-gray-300 bg-gray-50 px-2 py-0.5 rounded-md">{exp.payerName}</span>
                             <span className="text-[10px] text-gray-300">{exp.date}</span>
                          </div>
                       </div>
                    </div>
                    <div className="text-right">
                       <p className="font-black text-brand-brown">{exp.currency === 'JPY' ? '¥' : '$'} {exp.amount.toLocaleString()}</p>
                       <p className="text-[10px] font-bold text-gray-400">≈ NT$ {exp.twdAmount}</p>
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