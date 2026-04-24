import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { User, Calendar, Smartphone, Send, AlertCircle, ArrowLeft, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';
import { useDocument } from 'react-firebase-hooks/firestore';

export default function Onboarding() {
  const [displayName, setDisplayName] = useState('');
  const [day, setDay] = useState('');
  const [month, setMonth] = useState('');
  const [year, setYear] = useState('');
  const [shopeeId, setShopeeId] = useState('');
  const [tiktokId, setTiktokId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const [profileSnap] = useDocument(
    auth.currentUser ? doc(db, 'users', auth.currentUser.uid) : null
  );
  const isEditing = !!profileSnap?.data()?.onboardingCompleted;

  useEffect(() => {
    async function fetchExistingData() {
      if (!auth.currentUser) return;
      
      if (auth.currentUser.displayName) {
        setDisplayName(auth.currentUser.displayName);
      }

      try {
        const docRef = doc(db, 'users', auth.currentUser.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.displayName) setDisplayName(data.displayName);
          if (data.shopeeId) setShopeeId(data.shopeeId);
          if (data.tiktokId) setTiktokId(data.tiktokId);
          if (data.birthDate) {
            const [y, m, d] = data.birthDate.split('-');
            setYear(y);
            setMonth(parseInt(m, 10).toString());
            setDay(parseInt(d, 10).toString());
          }
        }
      } catch (err) {
        console.error("Error fetching existing profile:", err);
      }
    }
    fetchExistingData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser) return;
    if (!shopeeId && !tiktokId) {
      setError('Bạn cần điền ít nhất một ID nền tảng (Shopee hoặc TikTok)');
      return;
    }

    setLoading(true);
    try {
      const birthDate = year && month && day ? `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}` : '';
      
      const existingToken = profileSnap?.data()?.apiToken;
      const apiToken = existingToken || crypto.randomUUID();

      await setDoc(doc(db, 'users', auth.currentUser.uid), {
        displayName,
        birthDate,
        shopeeId,
        tiktokId,
        apiToken,
        onboardingCompleted: true,
      }, { merge: true });
      
      if (isEditing) {
        navigate('/profile', { replace: true });
      } else {
        navigate('/', { replace: true });
      }
    } catch (err) {
      console.error(err);
      setError('Đã có lỗi xảy ra khi lưu thông tin.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center pb-32 pt-10 px-4">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg bg-white rounded-[32px] elegant-card p-8 sm:p-10 relative overflow-hidden"
      >
        <div className="text-center mb-8 relative z-10">
          {isEditing && (
            <button 
              onClick={() => navigate(-1)}
              className="absolute left-0 top-0 p-3 text-slate-400 hover:text-slate-900 transition-all bg-slate-50 rounded-xl"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <div className="w-16 h-16 bg-slate-950 text-white rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl">
            <User className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              {isEditing ? 'Cập nhật hồ sơ' : 'Đăng ký Creator'}
            </h1>
            <p className="text-[12px] font-medium text-slate-400">
              {isEditing ? 'Cổng cập nhật thông tin bảo mật' : 'Thiết lập tài khoản Creator chuyên nghiệp của bạn'}
            </p>
          </div>
        </div>

        {error && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-6 bg-rose-50 border border-rose-100 text-rose-600 p-4 rounded-xl flex items-center gap-3 text-left"
          >
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p className="text-[12px] font-bold">{error}</p>
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
          <div className="space-y-6">
            <div className="bg-slate-50/50 p-6 rounded-2xl border border-slate-100">
              <h3 className="text-[11px] font-bold text-slate-400 mb-4 uppercase tracking-widest flex items-center gap-2">
                Thông tin cá nhân
              </h3>
              <div className="grid grid-cols-1 gap-5">
                <div className="space-y-2">
                  <label className="block text-[11px] font-bold text-slate-400 ml-1 uppercase">Họ và tên</label>
                  <div className="relative group">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 w-5 h-5 group-hover:text-indigo-500 transition-colors" />
                    <input
                      type="text"
                      required
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="w-full pl-12 pr-4 py-3.5 bg-white border border-slate-100 rounded-xl focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 outline-none transition-all text-[14px] font-medium text-slate-900"
                      placeholder="Nguyễn Văn A"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-[11px] font-bold text-slate-400 ml-1 uppercase">Ngày sinh</label>
                  <div className="grid grid-cols-3 gap-2">
                    <select
                      required
                      value={day}
                      onChange={(e) => setDay(e.target.value)}
                      className="w-full px-4 py-3.5 bg-white border border-slate-100 rounded-xl focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 outline-none transition-all text-[13px] font-medium text-slate-900"
                    >
                      <option value="">Ngày</option>
                      {Array.from({ length: 31 }, (_, i) => (
                        <option key={i + 1} value={i + 1}>{i + 1}</option>
                      ))}
                    </select>

                    <select
                      required
                      value={month}
                      onChange={(e) => setMonth(e.target.value)}
                      className="w-full px-4 py-3.5 bg-white border border-slate-100 rounded-xl focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 outline-none transition-all text-[13px] font-medium text-slate-900"
                    >
                      <option value="">Tháng</option>
                      {Array.from({ length: 12 }, (_, i) => (
                        <option key={i + 1} value={i + 1}>{i + 1}</option>
                      ))}
                    </select>

                    <select
                      required
                      value={year}
                      onChange={(e) => setYear(e.target.value)}
                      className="w-full px-4 py-3.5 bg-white border border-slate-100 rounded-xl focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 outline-none transition-all text-[13px] font-medium text-slate-900"
                    >
                      <option value="">Năm</option>
                      {Array.from({ length: 80 }, (_, i) => {
                        const y = new Date().getFullYear() - 10 - i;
                        return <option key={y} value={y}>{y}</option>;
                      })}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 bg-slate-900 rounded-2xl shadow-xl">
              <h3 className="text-[11px] font-bold text-indigo-400 mb-4 uppercase tracking-widest flex items-center gap-2">
                Nền tảng mạng xã hội
              </h3>
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-bold text-white/30 ml-1 uppercase">Shopee handle</label>
                  <input
                    type="text"
                    value={shopeeId}
                    onChange={(e) => setShopeeId(e.target.value)}
                    className="w-full px-4 py-3.5 bg-white/5 border border-white/10 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 focus:bg-white focus:text-slate-900 outline-none transition-all text-[14px] font-medium text-indigo-100"
                    placeholder="@shopee_user"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-bold text-white/30 ml-1 uppercase">TikTok handle</label>
                  <input
                    type="text"
                    value={tiktokId}
                    onChange={(e) => setTiktokId(e.target.value)}
                    className="w-full px-4 py-3.5 bg-white/5 border border-white/10 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 focus:bg-white focus:text-slate-900 outline-none transition-all text-[14px] font-medium text-indigo-100"
                    placeholder="@tiktok_user"
                  />
                </div>
              </div>
            </div>
          </div>

          <motion.button
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={loading}
            className="w-full bg-slate-950 text-white py-4 rounded-xl font-bold text-sm flex items-center justify-center gap-3 shadow-xl disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <Send className="w-4 h-4" />
                {isEditing ? 'Cập nhật ngay' : 'Hoàn tất đăng ký'}
              </>
            )}
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
}
