import React, { useState } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { useNavigate } from 'react-router-dom';
import { Send, Image as ImageIcon, Type, AlignLeft, Loader2, ArrowLeft } from 'lucide-react';
import { motion } from 'motion/react';

export default function CreatePost() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content) {
      setError('Vui lòng nhập đầy đủ tiêu đề và nội dung.');
      return;
    }

    setLoading(true);
    try {
      await addDoc(collection(db, 'posts'), {
        title,
        content,
        imageUrl: imageUrl || null,
        createdAt: serverTimestamp(),
        authorId: auth.currentUser?.uid
      });
      navigate('/');
    } catch (err) {
      console.error(err);
      setError('Đã có lỗi xảy ra khi đăng bài.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto pb-32 pt-6">
      <div className="flex items-center gap-6 mb-10 px-1">
        <button 
          onClick={() => navigate(-1)}
          className="w-12 h-12 flex items-center justify-center bg-white rounded-2xl premium-shadow border border-slate-50 text-slate-400 hover:text-slate-950 transition-all hover:scale-105 active:scale-95"
        >
          <ArrowLeft className="w-5 h-5" strokeWidth={3} />
        </button>
        <div className="flex flex-col -space-y-1">
          <h1 className="text-3xl font-black text-slate-950 italic tracking-tighter uppercase leading-none">Soạn thảo</h1>
          <span className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-500">Trình soạn thảo Thông báo Hệ thống</span>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-[3rem] premium-shadow border border-slate-50 overflow-hidden relative"
      >
        <div className="absolute top-0 right-0 p-8 opacity-5">
           <Type className="w-16 h-16 text-slate-950" />
        </div>

        <form onSubmit={handleSubmit} className="p-10 sm:p-12 space-y-8 relative z-10">
          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-5 bg-rose-50 border border-rose-100 text-rose-600 rounded-[1.5rem] text-[10px] font-black uppercase tracking-tight flex items-center gap-3"
            >
              <div className="w-1.5 h-1.5 bg-rose-600 rounded-full animate-pulse" />
              {error}
            </motion.div>
          )}

          <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] ml-1 italic">Định danh bài đăng / Tiêu đề</label>
            <div className="relative group">
              <Type className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 w-5 h-5 group-hover:text-indigo-500 transition-colors" />
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full pl-14 pr-6 py-5 bg-slate-50 border-2 border-slate-50 rounded-2xl focus:ring-8 focus:ring-indigo-500/5 focus:border-indigo-500 focus:bg-white outline-none transition-all font-black text-slate-950 text-sm placeholder:italic placeholder:text-slate-200"
                placeholder="NHẬP TIÊU ĐỀ HỆ THỐNG..."
              />
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] ml-1 italic">Nội dung bài đăng</label>
            <div className="relative group">
              <AlignLeft className="absolute left-5 top-6 text-slate-300 w-5 h-5 group-hover:text-indigo-500 transition-colors" />
              <textarea
                required
                rows={6}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full pl-14 pr-6 py-6 bg-slate-50 border-2 border-slate-50 rounded-[2rem] focus:ring-8 focus:ring-indigo-500/5 focus:border-indigo-500 focus:bg-white outline-none transition-all font-bold text-slate-950 text-sm resize-none placeholder:italic placeholder:text-slate-200"
                placeholder="XÂY DỰNG NỘI DUNG THÔNG BÁO TẠI ĐÂY..."
              />
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] ml-1 italic">URL Hình ảnh (Không bắt buộc)</label>
            <div className="relative group">
              <ImageIcon className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 w-5 h-5 group-hover:text-indigo-500 transition-colors" />
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="w-full pl-14 pr-6 py-5 bg-slate-50 border-2 border-slate-50 rounded-2xl focus:ring-8 focus:ring-indigo-500/5 focus:border-indigo-500 focus:bg-white outline-none transition-all font-bold text-slate-950 text-sm placeholder:italic placeholder:text-slate-200"
                placeholder="https://cloud.cdn/resource.jpg"
              />
            </div>
          </div>

          <motion.button
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={loading}
            className="w-full bg-slate-950 text-white py-6 rounded-[2rem] font-black text-xs uppercase tracking-[0.4em] flex items-center justify-center gap-4 hover:bg-slate-800 transition-all shadow-2xl shadow-indigo-500/10 disabled:opacity-50 group"
          >
            {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Send className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" strokeWidth={3} />}
            ĐĂNG BÀI LÊN MẠNG LƯỚI
          </motion.button>
        </form>
      </motion.div>
      
      <div className="mt-8 text-center opacity-20">
         <p className="text-[9px] font-black uppercase tracking-[0.5em] text-slate-400">Cấp độ Bảo mật 4: Nút Quản trị</p>
      </div>
    </div>
  );
}
