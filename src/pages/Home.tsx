import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { collection, query, orderBy, onSnapshot, doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { Clock, Plus, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';

interface Post {
  id: string;
  title: string;
  content: string;
  imageUrl?: string;
  createdAt: string;
  authorId: string;
}

export default function Home() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    async function checkAdmin() {
      if (auth.currentUser) {
        const docRef = doc(db, 'users', auth.currentUser.uid);
        const docSnap = await getDoc(docRef);
        if (auth.currentUser.email === 'truongthanh.nongtruong@gmail.com' || (docSnap.exists() && docSnap.data().role === 'admin')) {
          setIsAdmin(true);
        }
      }
    }
    checkAdmin();
  }, []);

  useEffect(() => {
    setLoading(true);
    const qPosts = query(collection(db, 'posts'), orderBy('createdAt', 'desc'));
    const unsubscribePosts = onSnapshot(qPosts, (snapshot) => {
      const docs = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Post[];
      setPosts(docs);
      setLoading(false);
    });

    return () => {
      unsubscribePosts();
    };
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Posts Section */}
      <section className="space-y-5">
        <div className="flex items-center justify-between px-2">
           <div className="flex flex-col -space-y-0.5">
             <h2 className="text-xl font-bold text-slate-900 tracking-tight">Hệ thống</h2>
             <span className="text-[10px] font-medium text-slate-400">Tin tức & Thông báo mới nhất</span>
           </div>
           {isAdmin && (
             <Link 
              to="/create-post"
              className="flex items-center gap-1.5 bg-slate-950 text-white px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-md active:scale-95 transition-all hover:bg-slate-800"
             >
               <Plus className="w-3 h-3" strokeWidth={3} />
               Đăng bài
             </Link>
           )}
        </div>

        {posts.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 shadow-sm">
             <p className="text-slate-400 text-[11px] font-medium tracking-wide">Hiện chưa có cập nhật nào</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5">
            {posts.map((post, idx) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="group elegant-card rounded-[24px] overflow-hidden"
              >
                {post.imageUrl && (
                  <div className="w-full aspect-[16/9] overflow-hidden border-b border-slate-50">
                    <img 
                       src={post.imageUrl} 
                       alt={post.title} 
                       className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                    />
                  </div>
                )}
                <div className="p-5 space-y-3">
                  <div className="flex items-center gap-2 text-[10px] font-medium text-indigo-500 bg-indigo-50 w-fit px-2 py-0.5 rounded-full">
                    <Clock className="w-3 h-3" />
                    {new Date(post.createdAt).toLocaleDateString('vi-VN')}
                  </div>
                  
                  <div className="space-y-1.5">
                    <h3 className="text-lg font-bold text-slate-900 leading-tight group-hover:text-indigo-600 transition-colors">
                      {post.title}
                    </h3>
                    <p className="text-slate-500 text-[13px] leading-relaxed line-clamp-2">
                      {post.content}
                    </p>
                  </div>

                  <div className="pt-2 flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-950 flex items-center gap-1 group-hover:gap-2 transition-all">
                      Xem chi tiết
                      <Plus className="w-3 h-3" />
                    </span>
                    <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full group-hover:scale-150 transition-transform" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
