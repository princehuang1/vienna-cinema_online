import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios'; // 記得引入 axios
import Navbar from '../components/Navbar';

function PaymentPage() {
  const navigate = useNavigate();
  const location = useLocation();

  // 1. 判斷是否為會員 (從 LocalStorage 讀取)
  const storedUser = localStorage.getItem('user');
  const currentUser = storedUser ? JSON.parse(storedUser) : null;
  const isMember = !!currentUser; // 如果有 currentUser 則為 true

  // 接收上一頁傳來的訂單資料
  const bookingData = location.state || {
    totalPrice: 0,
    movie: { movieName: '未知電影' },
    theater: { name: '' },
    date: '',
    time: '',
    tickets: [],
    meals: [],
    isStore: false
  };

  const [formData, setFormData] = useState({
    guestName: '',
    guestEmail: '',
    cardNumber: '',
    cardName: '',
    expiry: '',
    cvv: ''
  });

  const [errors, setErrors] = useState({});
  const [isProcessing, setIsProcessing] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  // 表單驗證邏輯
  const validateForm = () => {
    const newErrors = {};

    // 1. 如果「不是」會員，才需要驗證購買人資訊
    if (!isMember) {
      if (!formData.guestName || formData.guestName.trim().length === 0) {
        newErrors.guestName = '請輸入購買人姓名';
      }
      if (!formData.guestEmail || formData.guestEmail.trim().length === 0) {
        newErrors.guestEmail = '請輸入電子信箱';
      }
    }

    // 2. 驗證信用卡資訊 (簡易版)
    if (formData.cardNumber.length < 10) newErrors.cardNumber = '請輸入卡號';
    if (formData.cardName.length < 1) newErrors.cardName = '請輸入持卡人姓名';
    if (formData.expiry.length < 4) newErrors.expiry = '請輸入到期日';
    if (formData.cvv.length < 3) newErrors.cvv = '請輸入安全碼';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 🔥 核心：付款處理與資料庫寫入
  const handlePay = async (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      setIsProcessing(true);
      
      // --- 如果是會員，將訂單存入資料庫 ---
      if (isMember && currentUser) {
        
        // 準備要傳給後端的 payload
        const orderPayload = {
            userId: currentUser.userId,
            showtimeId: 0, // 簡化處理，先設為 0
            totalPrice: bookingData.totalPrice,
            // 將整個 bookingData 傳給後端，後端會轉成 JSON 字串存入 items 欄位
            items: bookingData, 
            type: bookingData.isStore ? 'Store' : 'Movie'
        };

        try {
            // 呼叫後端 API
            await axios.post('https://vienna-cinema-online.onrender.com/api/orders', orderPayload);
            console.log("訂單已成功儲存至資料庫");
        } catch (err) {
            console.error("訂單儲存失敗:", err);
            // 即使存檔失敗，為了 Demo 流暢度，我們通常還是讓它跳轉到成功頁面，或者也可以在這裡 return 阻擋
        }
      }
      // ------------------------------------------------

      // 模擬金流處理時間 (1.5秒)
      setTimeout(() => {
        setIsProcessing(false);
        navigate('/done'); 
      }, 1500);
    }
  };

  // 防呆：如果沒有訂單資料，顯示錯誤
  if (!location.state) {
    return (
        <div className="min-h-screen bg-neutral-900 text-white flex items-center justify-center flex-col">
            <Navbar />
            <h2 className="text-2xl mb-4 mt-20">無效的付款頁面</h2>
            <button onClick={() => navigate('/')} className="text-purple-400 underline">回首頁</button>
        </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-900 text-gray-100 font-sans flex flex-col">
      <Navbar />

      <main className="flex-grow container mx-auto px-6 md:px-20 py-12 flex flex-col items-center">
        <h1 className="text-3xl font-bold text-white mb-8">結帳付款</h1>

        <div className="w-full max-w-2xl">
          
          <div className="bg-neutral-800 p-8 rounded-2xl shadow-xl border border-neutral-700">
            {/* autoComplete="off" 減少瀏覽器自動填入干擾 */}
            <form onSubmit={handlePay} className="space-y-8" autoComplete="off">
              
              {/* ========================================================= */}
              {/* 區塊 1: 購買人資訊 (僅非會員顯示) */}
              {/* ========================================================= */}
              {!isMember ? (
                <div className="border-b border-neutral-700 pb-8 animate-fade-in">
                  <h2 className="text-xl font-bold text-white mb-6 flex items-center">
                    <span className="w-2 h-6 bg-purple-600 mr-3 rounded-full"></span>
                    購買人資訊
                  </h2>
                  <div className="space-y-6">
                    <div>
                      <label className="block text-gray-400 text-sm mb-2">購買人姓名 <span className="text-red-500">*</span></label>
                      <input
                        type="text"
                        name="guestName"
                        placeholder="請輸入購買人姓名"
                        value={formData.guestName}
                        onChange={handleChange}
                        className={`w-full bg-neutral-900 border ${errors.guestName ? 'border-red-500' : 'border-neutral-600'} rounded-lg py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all`}
                      />
                      {errors.guestName && <p className="text-red-500 text-xs mt-1">{errors.guestName}</p>}
                    </div>
                    <div>
                      <label className="block text-gray-400 text-sm mb-2">電子信箱 (接收票券用) <span className="text-red-500">*</span></label>
                      <input
                        type="text" 
                        name="guestEmail"
                        placeholder="example@email.com"
                        value={formData.guestEmail}
                        onChange={handleChange}
                        className={`w-full bg-neutral-900 border ${errors.guestEmail ? 'border-red-500' : 'border-neutral-600'} rounded-lg py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all`}
                      />
                      {errors.guestEmail && <p className="text-red-500 text-xs mt-1">{errors.guestEmail}</p>}
                    </div>
                  </div>
                </div>
              ) : (
                // 如果是會員，顯示簡單的歡迎訊息取代輸入框
                <div className="border-b border-neutral-700 pb-6 mb-6">
                    <h2 className="text-xl font-bold text-white flex items-center">
                        <span className="w-2 h-6 bg-purple-600 mr-3 rounded-full"></span>
                        會員結帳
                    </h2>
                    <p className="text-gray-400 mt-2 ml-5">
                        將使用您的會員資料：<span className="text-purple-400 font-bold">{currentUser.userName} ({currentUser.userEmail})</span>
                    </p>
                </div>
              )}

              {/* ========================================================= */}
              {/* 區塊 2: 信用卡資訊 */}
              {/* ========================================================= */}
              <div>
                <h2 className="text-xl font-bold text-white mb-6 flex items-center">
                  <span className="w-2 h-6 bg-purple-600 mr-3 rounded-full"></span>
                  信用卡資訊
                </h2>

                <div className="space-y-6">
                  <div>
                    <label className="block text-gray-400 text-sm mb-2">信用卡號碼</label>
                    <input
                      type="text"
                      name="cardNumber"
                      placeholder="0000 0000 0000 0000"
                      value={formData.cardNumber}
                      onChange={handleChange}
                      maxLength={19}
                      className={`w-full bg-neutral-900 border ${errors.cardNumber ? 'border-red-500' : 'border-neutral-600'} rounded-lg py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all`}
                    />
                    {errors.cardNumber && <p className="text-red-500 text-xs mt-1">{errors.cardNumber}</p>}
                  </div>

                  <div>
                    <label className="block text-gray-400 text-sm mb-2">持卡人姓名</label>
                    <input
                      type="text"
                      name="cardName"
                      placeholder="與卡片正面相同"
                      value={formData.cardName}
                      onChange={handleChange}
                      className={`w-full bg-neutral-900 border ${errors.cardName ? 'border-red-500' : 'border-neutral-600'} rounded-lg py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all`}
                    />
                    {errors.cardName && <p className="text-red-500 text-xs mt-1">{errors.cardName}</p>}
                  </div>

                  <div className="flex gap-4">
                    <div className="w-1/2">
                      <label className="block text-gray-400 text-sm mb-2">到期日 (MM/YY)</label>
                      <input
                        type="text"
                        name="expiry"
                        placeholder="MM/YY"
                        value={formData.expiry}
                        onChange={handleChange}
                        maxLength={5}
                        className={`w-full bg-neutral-900 border ${errors.expiry ? 'border-red-500' : 'border-neutral-600'} rounded-lg py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all`}
                      />
                      {errors.expiry && <p className="text-red-500 text-xs mt-1">{errors.expiry}</p>}
                    </div>

                    <div className="w-1/2">
                      <label className="block text-gray-400 text-sm mb-2">安全碼 (CVV)</label>
                      <input
                        type="text"
                        name="cvv"
                        placeholder="123"
                        value={formData.cvv}
                        onChange={handleChange}
                        maxLength={4}
                        className={`w-full bg-neutral-900 border ${errors.cvv ? 'border-red-500' : 'border-neutral-600'} rounded-lg py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all`}
                      />
                      {errors.cvv && <p className="text-red-500 text-xs mt-1">{errors.cvv}</p>}
                    </div>
                  </div>
                </div>
              </div>

              {/* 按鈕區 */}
              <div className="flex gap-4 mt-8 pt-4 border-t border-neutral-700">
                  <button 
                    type="button"
                    onClick={() => navigate(-1)}
                    className="w-1/3 bg-neutral-700 hover:bg-neutral-600 text-white font-bold py-4 rounded-full transition duration-300"
                  >
                    返回
                  </button>

                  <button 
                    type="submit"
                    disabled={isProcessing}
                    className={`w-2/3 font-bold py-4 rounded-full transition duration-300 text-lg shadow-lg flex justify-center items-center gap-2
                      ${isProcessing 
                        ? 'bg-neutral-600 text-gray-400 cursor-wait' 
                        : 'bg-purple-600 hover:bg-purple-700 text-white hover:shadow-purple-500/50 transform hover:-translate-y-1'
                      }`}
                  >
                    {isProcessing ? (
                      <>
                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        處理中...
                      </>
                    ) : (
                      `確認付款 $ ${bookingData.totalPrice}`
                    )}
                  </button>
              </div>

            </form>
          </div>

        </div>
      </main>
    </div>
  );
}

export default PaymentPage;