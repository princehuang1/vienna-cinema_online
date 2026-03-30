import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';

function SignInPage() {
  const navigate = useNavigate();
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [resetData, setResetData] = useState({ email: '', newPassword: '' });
  
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('https://vienna-cinema-online.onrender.com/api/login', loginData);
      localStorage.setItem('user', JSON.stringify(res.data));
      alert('登入成功！');
      navigate('/');
    } catch (err) {
      setMessage({ type: 'error', text: '帳號或密碼錯誤' });
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('https://vienna-cinema-online.onrender.com/api/reset-password', resetData);
      setMessage({ type: 'success', text: res.data.message });
      setTimeout(() => {
        setIsForgotPassword(false);
        setMessage({ type: '', text: '' });
      }, 1500);
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.error || '重設失敗' });
    }
  };

  return (
    <div className="min-h-screen bg-neutral-900 text-gray-100 font-sans">
      <Navbar />
      
      {/* 🔥 CSS Hack: 強制覆蓋 Autofill 背景色 (與註冊頁相同) */}
      <style>{`
        input:-webkit-autofill,
        input:-webkit-autofill:hover, 
        input:-webkit-autofill:focus, 
        input:-webkit-autofill:active {
            -webkit-box-shadow: 0 0 0 30px #171717 inset !important;
            -webkit-text-fill-color: white !important;
            transition: background-color 5000s ease-in-out 0s;
            caret-color: white;
        }
      `}</style>

      <div className="container mx-auto px-6 py-12 flex justify-center">
        <div className="w-full max-w-md bg-neutral-800 p-8 rounded-xl shadow-lg border border-neutral-700">
          
          <h1 className="text-3xl font-bold text-white mb-6 text-center">
            {isForgotPassword ? '重設密碼' : '會員登入'}
          </h1>

          {message.text && (
            <div className={`p-3 rounded mb-4 text-sm ${message.type === 'error' ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'}`}>
              {message.text}
            </div>
          )}

          {!isForgotPassword ? (
            // === 登入表單 ===
            <form onSubmit={handleLogin} className="space-y-4" autoComplete="off">
              {/* 隱藏欄位騙過瀏覽器 */}
              <input type="text" style={{display: 'none'}} />
              <input type="password" style={{display: 'none'}} />

              <div>
                <label className="block text-gray-400 text-sm mb-1">電子信箱</label>
                {/* 🔥 修改重點：type="email" 改為 type="text" */}
                <input 
                  type="text" 
                  value={loginData.email}
                  onChange={(e) => setLoginData({...loginData, email: e.target.value})}
                  className="w-full bg-neutral-900 border border-neutral-600 rounded px-4 py-2 text-white focus:border-purple-500 outline-none" 
                  autoComplete="off"
                />
              </div>
              <div>
                <label className="block text-gray-400 text-sm mb-1">密碼</label>
                <input 
                  type="password" 
                  value={loginData.password}
                  onChange={(e) => setLoginData({...loginData, password: e.target.value})}
                  className="w-full bg-neutral-900 border border-neutral-600 rounded px-4 py-2 text-white focus:border-purple-500 outline-none" 
                  autoComplete="new-password"
                />
              </div>
              <button type="submit" className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded mt-4 transition">
                登入
              </button>
              <div className="text-center mt-4">
                <button type="button" onClick={() => { setIsForgotPassword(true); setMessage({type:'', text:''}); }} className="text-gray-400 hover:text-white text-sm underline">
                  忘記密碼？
                </button>
              </div>
            </form>
          ) : (
            // === 忘記密碼表單 ===
            <form onSubmit={handleResetPassword} className="space-y-4" autoComplete="off">
              <p className="text-gray-400 text-sm mb-4">請輸入您註冊的帳號(Email)以設定新密碼。</p>
              <div>
                <label className="block text-gray-400 text-sm mb-1">原有帳號 (Email)</label>
                {/* 🔥 修改重點：type="email" 改為 type="text" */}
                <input 
                  type="text" 
                  value={resetData.email}
                  onChange={(e) => setResetData({...resetData, email: e.target.value})}
                  className="w-full bg-neutral-900 border border-neutral-600 rounded px-4 py-2 text-white focus:border-purple-500 outline-none" 
                  autoComplete="off"
                />
              </div>
              <div>
                <label className="block text-gray-400 text-sm mb-1">新密碼</label>
                <input 
                  type="password" 
                  value={resetData.newPassword}
                  onChange={(e) => setResetData({...resetData, newPassword: e.target.value})}
                  className="w-full bg-neutral-900 border border-neutral-600 rounded px-4 py-2 text-white focus:border-purple-500 outline-none" 
                  autoComplete="new-password"
                />
              </div>
              <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded mt-4 transition">
                重設密碼
              </button>
              <div className="text-center mt-4">
                <button type="button" onClick={() => { setIsForgotPassword(false); setMessage({type:'', text:''}); }} className="text-gray-400 hover:text-white text-sm underline">
                  返回登入
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default SignInPage;