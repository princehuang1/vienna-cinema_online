import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';

function SignUpPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');

    // 🔥 移除所有驗證邏輯 (Demo 用)
    
    try {
      const res = await axios.post('https://vienna-cinema-online.onrender.com/api/register', {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password
      });

      localStorage.setItem('user', JSON.stringify(res.data));
      alert('註冊成功！');
      navigate('/'); 
    } catch (err) {
      setError(err.response?.data?.error || '註冊失敗，請稍後再試');
    }
  };

  return (
    <div className="min-h-screen bg-neutral-900 text-gray-100 font-sans">
      {/* 🔥 1. 加入這段 Style 來強制覆蓋瀏覽器的 Autofill 背景色 */}
      <style>{`
        /* 使用內陰影蓋掉瀏覽器預設的黃色/藍色背景 */
        input:-webkit-autofill,
        input:-webkit-autofill:hover, 
        input:-webkit-autofill:focus, 
        input:-webkit-autofill:active {
            -webkit-box-shadow: 0 0 0 30px #171717 inset !important; /* #171717 是 Tailwind bg-neutral-900 的顏色 */
            -webkit-text-fill-color: white !important;
            transition: background-color 5000s ease-in-out 0s;
            caret-color: white; /* 游標顏色 */
        }
      `}</style>

      <Navbar />
      <div className="container mx-auto px-6 py-12 flex justify-center">
        <div className="w-full max-w-md bg-neutral-800 p-8 rounded-xl shadow-lg border border-neutral-700">
          <h1 className="text-3xl font-bold text-white mb-6 text-center">註冊會員</h1>
          
          {error && <div className="bg-red-500/20 text-red-400 p-3 rounded mb-4 text-sm">{error}</div>}

          {/* 🔥 2. Form 加上 autoComplete="off" */}
          <form onSubmit={handleRegister} className="space-y-4" autoComplete="off">
            
            {/* 隱藏的 input，用來騙過瀏覽器的自動填入機制 */}
            <input type="text" style={{display: 'none'}} />
            <input type="password" style={{display: 'none'}} />

            <div>
              <label className="block text-gray-400 text-sm mb-1">姓名</label>
              <input 
                type="text" 
                name="name" 
                onChange={handleChange} 
                className="w-full bg-neutral-900 border border-neutral-600 rounded px-4 py-2 text-white focus:border-purple-500 outline-none" 
                autoComplete="off" // 關閉提示
              />
            </div>
            <div>
              <label className="block text-gray-400 text-sm mb-1">電子信箱 (帳號)</label>
              <input 
                type="text" // 保持 text 避免瀏覽器格式檢查
                name="email" 
                onChange={handleChange} 
                className="w-full bg-neutral-900 border border-neutral-600 rounded px-4 py-2 text-white focus:border-purple-500 outline-none" 
                autoComplete="off" // 關閉提示
              />
            </div>
            <div>
              <label className="block text-gray-400 text-sm mb-1">手機號碼</label>
              <input 
                type="text" 
                name="phone" 
                onChange={handleChange} 
                className="w-full bg-neutral-900 border border-neutral-600 rounded px-4 py-2 text-white focus:border-purple-500 outline-none" 
                autoComplete="off" // 關閉提示
              />
            </div>
            <div>
              <label className="block text-gray-400 text-sm mb-1">密碼</label>
              <input 
                type="password" 
                name="password" 
                onChange={handleChange} 
                className="w-full bg-neutral-900 border border-neutral-600 rounded px-4 py-2 text-white focus:border-purple-500 outline-none" 
                autoComplete="new-password" // 🔥 使用 new-password 強制瀏覽器不跳出舊密碼
              />
            </div>
            <div>
              <label className="block text-gray-400 text-sm mb-1">確認密碼</label>
              <input 
                type="password" 
                name="confirmPassword" 
                onChange={handleChange} 
                className="w-full bg-neutral-900 border border-neutral-600 rounded px-4 py-2 text-white focus:border-purple-500 outline-none" 
                autoComplete="new-password" // 🔥 使用 new-password
              />
            </div>

            <button type="submit" className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded mt-4 transition">
              立即註冊
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default SignUpPage;