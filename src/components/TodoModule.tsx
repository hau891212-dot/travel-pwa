import React, { useState, useEffect } from 'react';
import { db } from '../services/firebase';
import { collection, addDoc, onSnapshot, query, orderBy, updateDoc, doc, deleteDoc, serverTimestamp } from 'firebase/firestore';

export const TodoModule = () => {
  const [todos, setTodos] = useState<any[]>([]);
  const [input, setInput] = useState('');

  useEffect(() => {
    // 監聽 Firebase 雲端資料
    const q = query(collection(db, "todos"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setTodos(data);
    });
    return () => unsubscribe();
  }, []);

  const addTodo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    try {
      await addDoc(collection(db, "todos"), {
        text: input,
        completed: false,
        createdAt: serverTimestamp()
      });
      setInput('');
    } catch (err) {
      console.error("增加失敗:", err);
    }
  };

  return (
    <div className="space-y-4">
      <form onSubmit={addTodo} className="flex gap-2 px-2">
        <input 
          className="flex-1 bg-white border-2 border-[#E0E5D5] rounded-2xl px-4 py-3 outline-none focus:border-brand-blue shadow-sm"
          placeholder="想帶什麼？"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button className="bg-brand-green text-white px-6 rounded-2xl font-bold shadow-lg active:scale-95 transition-all">新增</button>
      </form>

      <div className="space-y-3 px-2">
        {todos.map(todo => (
          <div key={todo.id} className="bg-white p-5 rounded-3xl shadow-sm border-2 border-[#E0E5D5] flex items-center justify-between animate-in zoom-in duration-300">
            <div className="flex items-center gap-4">
              <input 
                type="checkbox" 
                className="w-6 h-6 rounded-lg accent-brand-green cursor-pointer"
                checked={todo.completed} 
                onChange={() => updateDoc(doc(db, "todos", todo.id), { completed: !todo.completed })} 
              />
              <span className={`text-lg font-medium ${todo.completed ? 'line-through text-gray-300' : 'text-brand-brown'}`}>
                {todo.text}
              </span>
            </div>
            <button 
              onClick={() => deleteDoc(doc(db, "todos", todo.id))}
              className="text-gray-300 hover:text-red-400 font-bold text-xs uppercase p-2"
            >
              刪除
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};