/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from './lib/firebase';
import Navbar from './components/Navbar';
import Header from './components/Header';
import Home from './pages/Home';
import Login from './pages/Login';
import Onboarding from './pages/Onboarding';
import AddProduct from './pages/AddProduct';
import PublicPayouts from './pages/PublicPayouts';
import Profile from './pages/Profile';
import CreatePost from './pages/CreatePost';
import History from './pages/History';
import { doc } from 'firebase/firestore';
import { db } from './lib/firebase';
import { useDocument } from 'react-firebase-hooks/firestore';

export default function App() {
  const [user, loading] = useAuthState(auth);
  const [profileSnap, profileLoading] = useDocument(
    user ? doc(db, 'users', user.uid) : null
  );

  const profileData = profileSnap?.data();
  const profileComplete = !!profileData?.onboardingCompleted;

  if (loading || profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Header />
        
        <main className={`flex-1 overflow-x-hidden ${user ? 'pb-24 pt-4' : 'pb-12 pt-4'}`}>
          <div className="max-w-xl mx-auto px-4 h-full">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />
              <Route path="/onboarding" element={user ? <Onboarding /> : <Navigate to="/login" />} />
              <Route path="/add" element={user ? (profileComplete ? <AddProduct /> : <Navigate to="/onboarding" />) : <Navigate to="/login" />} />
              <Route path="/profile" element={user ? (profileComplete ? <Profile /> : <Navigate to="/onboarding" />) : <Navigate to="/login" />} />
              <Route path="/create-post" element={user && profileComplete ? <CreatePost /> : <Navigate to="/login" />} />
              <Route path="/history" element={user && profileComplete ? <History /> : <Navigate to="/login" />} />
              <Route path="/payouts" element={<PublicPayouts />} />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </div>
        </main>

        <Navbar />
      </div>
    </Router>
  );
}
