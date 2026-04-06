import React, { useState, useEffect } from 'react';
import { db, storage } from '../services/firebase';
import { collection, addDoc, onSnapshot, query, orderBy, serverTimestamp, updateDoc, doc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { motion, AnimatePresence } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserPlus, faCamera, faTrashAlt, faCheck, faSpinner, faUserCircle } from '@fortawesome/free-solid-svg-icons';

export const MembersModule = () => {
  const [members, setMembers] = useState<any[]>([]);
  const [name, setName] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [tempAvatar, setTempAvatar] = useState('');

  // 1. 監聽雲端成員名單
  useEffect(() => {
    const q = query(collection(db, "members"), orderBy("createdAt", "asc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setMembers(data);
    });
    return () => unsubscribe();
  }, []);

  // 2. 處理頭像上傳 (Firebase Storage)
  const handleAvatarUpload = async (e: any) => {
    const file = e.target.files[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const storageRef = ref(storage, `avatars/${Date.now()}_${file.name}`);
      const snap = await uploadBytes(storageRef, file);
      const url = await getDownloadURL(snap.ref);
      setTempAvatar(url);
    } catch (err) {
      console.error(err);
      alert("上傳失敗，請檢查 Firebase Storage 是否開啟");
    } finally {
      setIsUploading(false);
    }
  };

  // 3. 新增成員
  const addMember = async () => {
    if (!name.trim()) return;
    
    // 如果沒上傳照片，就用 DiceBear 自動生成一個可愛頭像
    const finalAvatar = tempAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`;

    await addDoc(collection(db, "members"), {
      name: name.trim(),
      avatar: finalAvatar,
      isDeleted: false,
      createdAt: serverTimestamp()
    });

    setName('');
    setTempAvatar('');
    alert(`歡迎 ${name} 加入旅程！✨`);
  };

  // 4. 刪除成員 (軟刪除)
  const toggleDelete = async (id: string, currentStatus: boolean) => {
    if (window.confirm(currentStatus ? "要讓這位成員歸隊嗎？" : "確定要移除這位成員嗎？（過去的帳單仍會保留他的名字）")) {
      await updateDoc(doc(db, "members", id), {
        isDeleted: !currentStatus
      });
    }
  };

  return (
    <div className="space-y-8 pb-20 px-2">
      {/* 新增成員卡片 */}
      <div className="bg-white rounded-[2.5rem] shadow-sticker border-2 border-[#E0E5D5] p-6 space-y-5 animate-in fade-in duration-500">
        <div className="flex items-center gap-2 text-brand-green">
          <FontAwesomeIcon icon={faUserPlus} />
          <span className="font-black text-sm uppercase tracking-widest">新增旅伴</span>
        </div>

        <div className="flex flex-col items-center gap-4">
          {/* 頭像預覽與上傳 */}
          <label className="relative w-24 h-24 rounded-full border-4 border-[#F7F4EB] shadow-md cursor-pointer overflow-hidden bg-gray-50 flex items-center justify-center group">
            {isUploading ? (
              <FontAwesomeIcon icon={faSpinner} className="animate-spin text-brand-green text-2xl" />
            ) : tempAvatar ? (
              <img src={tempAvatar} className="w-full h-full object-cover" alt="preview" />
            ) : name ? (
              <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`} className="w-full h-full object-cover opacity-50" alt="auto-gen" />
            ) : (
              <FontAwesomeIcon icon={faCamera} className="text-gray-300 text-2xl group-hover:text-brand-green transition-colors" />
            )}
            <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
          </label>
          <p className="text-[10px] font-bold text-gray-400">點擊上傳照片或輸入名字自動生成</p>

          <input 
            className="w-full bg-[#F7F4EB] p-4 rounded-2xl font-black text-center text-lg text-brand-brown outline-none border-2 border-transparent focus:border-brand-green"
            placeholder="請輸入旅伴名字"
            value={name}
            onChange={e => setName(e.target.value)}
          />

          <button 
            onClick={addMember}
            className="w-full bg-brand-green text-white font-black py-4 rounded-2xl shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <FontAwesomeIcon icon={faCheck} /> 確認加入旅程
          </button>
        </div>
      </div>

      {/* 成員列表 */}
      <div className="space-y-4">
        <h3 className="font-black text-brand-text ml-4 italic flex items-center gap-2">
          <div className="w-2 h-5 bg-brand-yellow rounded-full"></div>
          目前的旅伴 ({members.filter(m => !m.isDeleted).length})
        </h3>
        
        <div className="grid grid-cols-1 gap-3">
          {members.map((m) => (
            <motion.div 
              key={m.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className={`bg-white p-4 rounded-[2rem] shadow-sm border-2 flex items-center justify-between transition-all ${m.isDeleted ? 'opacity-40 grayscale border-transparent' : 'border-[#F0EEE6]'}`}
            >
              <div className="flex items-center gap-4">
                <img src={m.avatar} className="w-14 h-14 rounded-full border-2 border-brand-bg bg-gray-50 shadow-sm" alt={m.name} />
                <div>
                  <p className="font-black text-brand-brown text-lg">{m.name}</p>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    {m.isDeleted ? "已離開旅程" : "旅程參與中 🌸"}
                  </p>
                </div>
              </div>
              
              <button 
                onClick={() => toggleDelete(m.id, m.isDeleted)}
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${m.isDeleted ? 'bg-gray-100 text-gray-400' : 'bg-red-50 text-red-300 hover:bg-red-500 hover:text-white'}`}
              >
                <FontAwesomeIcon icon={m.isDeleted ? faUserPlus : faTrashAlt} size="sm" />
              </button>
            </motion.div>
          ))}
          
          {members.length === 0 && (
            <div className="text-center py-10 text-gray-300 italic font-bold">
              還沒有旅伴加入喔，趕快新增吧！
            </div>
          )}
        </div>
      </div>
    </div>
  );
};