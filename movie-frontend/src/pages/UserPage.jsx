import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';

// --- 子元件：單筆訂單 ---
const OrderHistoryItem = ({ order, onCancel }) => {
  const [isOpen, setIsOpen] = useState(false);

  // 日期解析 (不顯示時間)
  let displayDate = 'Unknown Date';
  if (order.createdAt) {
      displayDate = order.createdAt.split(/[\sT]/)[0];
  } else if (order.items && order.items.date) {
      displayDate = order.items.date.split(' ')[0]; 
  }

  const isCancelled = order.bookingStatus === 'Cancelled';

  return (
    <div className={`rounded-xl border transition overflow-hidden mb-4
        ${isCancelled ? 'bg-neutral-800/50 border-neutral-700 opacity-60' : 'bg-neutral-800 border-neutral-700 hover:border-purple-500/50'}
    `}>
      
      {/* 標頭 */}
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="p-6 flex justify-between items-center cursor-pointer select-none bg-neutral-800/50 hover:bg-neutral-700/30"
      >
        <div className="flex items-center gap-4">
          {/* 🎯 修改：商城購物改成 寶石綠 (Emerald) */}
          <span className={`px-3 py-1 text-xs rounded font-bold ${order.type === 'Store' ? 'bg-emerald-600' : 'bg-purple-600'} text-white`}>
            {order.type === 'Store' ? '商城購物' : '電影訂票'}
          </span>
          
          <div className="flex flex-col md:flex-row md:items-center md:gap-4 text-sm">
            <span className="text-gray-400">訂單 #{order.bookingId}</span>
            <span className="text-gray-600 hidden md:inline">|</span>
            <span className="text-gray-200">{displayDate}</span>
          </div>
        </div>

        <div className="flex items-center gap-6">
          {isCancelled ? (
             <span className="text-red-500 font-bold text-sm border border-red-500/30 px-3 py-1 rounded bg-red-500/10">已取消購買</span>
          ) : (
             <span className="text-xl font-bold text-white">$ {order.totalPrice}</span>
          )}
          
          <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 text-gray-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {/* 詳細內容 */}
      <div className={`transition-all duration-300 ease-in-out border-t border-neutral-700/50 bg-neutral-900/30 ${isOpen ? 'max-h-[600px] opacity-100 py-6 px-6' : 'max-h-0 opacity-0 py-0 px-6 overflow-hidden'}`}>
        <div className="space-y-3 pl-2">
          
          {/* 明細列表 */}
          {order.items && Array.isArray(order.items.tickets) && order.items.tickets.map((t, idx) => (
             <div key={`t-${idx}`} className="flex justify-between text-gray-300 text-sm border-b border-gray-700/50 pb-2">
                <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-yellow-500 rounded-full"></span>
                    <span>{t.name} x {t.count}</span>
                </div>
                <span>$ {t.price * t.count}</span>
             </div>
          ))}
          {order.items && Array.isArray(order.items.meals) && order.items.meals.map((m, idx) => (
             <div key={`m-${idx}`} className="flex justify-between text-gray-300 text-sm border-b border-gray-700/50 pb-2">
                <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-orange-500 rounded-full"></span>
                    <span>{m.name} x {m.count}</span>
                </div>
                <span>$ {m.price * m.count}</span>
             </div>
          ))}
          {order.items && Array.isArray(order.items) && !order.items.tickets && order.items.map((item, idx) => (
              <div key={`i-${idx}`} className="flex justify-between text-gray-300 text-sm border-b border-gray-700/50 pb-2">
                <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-blue-400 rounded-full"></span>
                    <span>{item.name} x {item.count}</span>
                </div>
                <span>$ {item.price * item.count}</span>
             </div>
          ))}
          
          {/* 電影資訊 */}
          {order.type !== 'Store' && order.items && order.items.movie && (
              <div className="mt-4 pt-2 text-xs text-gray-500 space-y-1">
                  <p>電影：{order.items.movie.movieName}</p>
                  <p>影城：{order.items.theater?.name}</p>
                  <p>座位：{order.items.selectedSeats ? order.items.selectedSeats.join(', ') : '無'}</p>
              </div>
          )}

          {!isCancelled && (
              <div className="mt-6 text-right">
                 <button 
                    onClick={(e) => {
                        e.stopPropagation(); 
                        onCancel(order.bookingId);
                    }}
                    className="text-red-400 hover:text-white border border-red-500/50 hover:bg-red-600 px-4 py-2 rounded text-sm transition duration-300"
                 >
                    取消購買
                 </button>
              </div>
          )}
        </div>
      </div>
    </div>
  );
};

// --- 主頁面 ---
function UserPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // 編輯模式
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ userName: '', userPhone: '' });

  // 信用卡 State
  const [cardData, setCardData] = useState({ number: '', name: '', expiry: '', cvv: '' });
  const [showCardInput, setShowCardInput] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      navigate('/signin'); 
      return;
    }
    const parsedUser = JSON.parse(storedUser);
    setUser(parsedUser);
    setEditForm({ userName: parsedUser.userName, userPhone: parsedUser.userPhone });

    axios.get(`https://vienna-cinema-online.onrender.com/api/users/${parsedUser.userId}/orders`)
      .then(res => {
        setOrders(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error("無法取得訂單", err);
        setLoading(false);
      });
  }, [navigate]);

  // 修改會員資料 (只更新名字與電話)
  const handleEditToggle = () => {
      if (isEditing) setEditForm({ userName: user.userName, userPhone: user.userPhone });
      setIsEditing(!isEditing);
  };

  const handleSaveProfile = async () => {
      try {
          const res = await axios.put(`https://vienna-cinema-online.onrender.com/api/users/${user.userId}`, {
              userName: editForm.userName,
              userPhone: editForm.userPhone, // 信箱不傳送，後端也不更新
              savedCard: user.savedCard
          });
          const updatedUser = { ...user, ...res.data };
          setUser(updatedUser);
          localStorage.setItem('user', JSON.stringify(updatedUser));
          setIsEditing(false);
          alert("資料修改成功！");
      } catch (err) {
          alert("修改失敗");
      }
  };

  // 信用卡相關處理
  const handleCardChange = (e) => {
    setCardData({ ...cardData, [e.target.name]: e.target.value });
  };

  const handleSaveCard = async () => {
      if (!cardData.number || !cardData.name || !cardData.expiry || !cardData.cvv) {
          alert("請填寫所有信用卡欄位");
          return;
      }
      if (cardData.number.length < 10) {
          alert("請輸入有效的卡號");
          return;
      }

      try {
          const res = await axios.put(`https://vienna-cinema-online.onrender.com/api/users/${user.userId}`, {
              userName: user.userName,
              userPhone: user.userPhone,
              savedCard: cardData.number
          });
          const updatedUser = { ...user, ...res.data };
          setUser(updatedUser);
          localStorage.setItem('user', JSON.stringify(updatedUser));
          setShowCardInput(false);
          setCardData({ number: '', name: '', expiry: '', cvv: '' }); 
          alert("信用卡綁定成功！");
      } catch (err) {
          alert("綁定失敗");
      }
  };

  const handleDeleteCard = async () => {
      if(!window.confirm("確定要解除綁定嗎？")) return;
      try {
        const res = await axios.put(`https://vienna-cinema-online.onrender.com/api/users/${user.userId}`, {
            userName: user.userName,
            userPhone: user.userPhone,
            savedCard: null
        });
        const updatedUser = { ...user, ...res.data };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
      } catch(err) {
          console.error(err);
      }
  };

  const handleCancelOrder = async (orderId) => {
      if (!window.confirm("確定要取消這筆訂單嗎？")) return;
      try {
          await axios.patch(`https://vienna-cinema-online.onrender.com/api/orders/${orderId}/cancel`);
          setOrders(prev => prev.map(order => 
              order.bookingId === orderId ? { ...order, bookingStatus: 'Cancelled' } : order
          ));
      } catch (err) {
          alert("取消失敗，請稍後再試");
      }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/');
  };

  if (loading || !user) return <div className="min-h-screen bg-neutral-900 text-white p-10">載入中...</div>;

  return (
    <div className="min-h-screen bg-neutral-900 text-gray-100 font-sans">
      <Navbar />
      <div className="container mx-auto px-6 md:px-20 py-12">
        
        {/* === A. 會員資料區塊 === */}
        <div className="bg-neutral-800 p-8 rounded-2xl shadow-xl border border-neutral-700 mb-12 relative overflow-hidden">
          
          <div className="flex justify-between items-start relative z-10 gap-8">
            
            {/* 左側：資料列表 */}
            <div className="flex-grow space-y-6">
                
                {/* 1. 名稱 (標題 + 數值/輸入框) */}
                <div className="flex items-center gap-6">
                    <span className="text-gray-500 font-bold text-lg w-16">名稱</span>
                    {isEditing ? (
                        <input 
                            type="text" 
                            value={editForm.userName} 
                            onChange={(e) => setEditForm({...editForm, userName: e.target.value})}
                            className="bg-neutral-900 border border-purple-500 text-white text-xl font-bold rounded px-4 py-2 w-full md:w-1/2 focus:outline-none"
                        />
                    ) : (
                        <h1 className="text-2xl font-bold text-white tracking-wide">
                            {user.userName}
                        </h1>
                    )}
                </div>

                {/* 2. 信箱 (純文字，不可修改) */}
                <div className="flex items-center gap-6">
                    <span className="text-gray-500 font-bold text-lg w-16">信箱</span>
                    <span className="text-lg tracking-wide text-gray-300">{user.userEmail}</span>
                </div>

                {/* 3. 電話 (可修改) */}
                <div className="flex items-center gap-6">
                    <span className="text-gray-500 font-bold text-lg w-16">電話</span>
                    {isEditing ? (
                        <input 
                            type="text" 
                            value={editForm.userPhone} 
                            onChange={(e) => setEditForm({...editForm, userPhone: e.target.value})}
                            className="bg-neutral-900 border border-purple-500 text-white text-lg rounded px-4 py-2 w-full md:w-1/2 focus:outline-none"
                        />
                    ) : (
                        <span className="text-lg tracking-wide text-gray-300">{user.userPhone}</span>
                    )}
                </div>

                {/* 編輯模式下的按鈕 */}
                {isEditing && (
                    <div className="mt-4 flex gap-3 pl-[5.5rem]">
                        <button onClick={handleSaveProfile} className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-full transition text-sm font-bold">
                            儲存
                        </button>
                        <button onClick={handleEditToggle} className="bg-neutral-700 hover:bg-neutral-600 text-white px-6 py-2 rounded-full transition text-sm">
                            取消
                        </button>
                    </div>
                )}
            </div>
            
            {/* 右側：動作按鈕 */}
            <div className="flex flex-col items-end gap-4">
                <button 
                  onClick={handleLogout}
                  className="bg-neutral-700 hover:bg-red-600 text-white px-6 py-2 rounded-full transition duration-300 border border-neutral-600 hover:border-red-600 text-sm"
                >
                  登出
                </button>

                {/* 🎯 修改資料按鈕 (那支筆/文字) - 放在登出下方 */}
                {!isEditing && (
                    <button 
                        onClick={handleEditToggle} 
                        className="flex items-center gap-2 text-gray-400 hover:text-purple-400 transition text-sm"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                        修改資料
                    </button>
                )}
            </div>
          </div>
        </div>

        {/* === B. 信用卡綁定區塊 (紫色系完整表單) === */}
        <div className="bg-neutral-800 p-8 rounded-2xl shadow-xl border border-neutral-700 mb-12">
            <h2 className="text-xl font-bold text-white mb-6 border-l-4 border-purple-500 pl-3">
                信用卡綁定
            </h2>
            
            {user.savedCard ? (
                <div className="flex items-center justify-between bg-neutral-900/50 p-6 rounded-xl border border-neutral-700 group hover:border-purple-500/30 transition">
                    <div className="flex items-center gap-6">
                        <div className="w-16 h-10 bg-gradient-to-br from-purple-600 to-blue-600 rounded-md shadow-lg flex items-center justify-center">
                            <div className="w-8 h-5 border border-white/20 rounded-sm"></div>
                        </div>
                        <div>
                            <p className="text-gray-400 text-xs mb-1">已綁定的信用卡</p>
                            <p className="text-white font-mono text-xl tracking-widest">
                                **** **** **** {user.savedCard.slice(-4)}
                            </p>
                        </div>
                    </div>
                    <button onClick={handleDeleteCard} className="text-red-400 hover:text-white text-sm hover:underline px-4 py-2">
                        解除綁定
                    </button>
                </div>
            ) : (
                <>
                    {!showCardInput ? (
                        <button 
                            onClick={() => setShowCardInput(true)} 
                            className="flex items-center gap-2 text-purple-400 hover:text-purple-300 transition font-bold py-2"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                            新增信用卡
                        </button>
                    ) : (
                        <div className="bg-neutral-900/50 p-6 rounded-xl border border-neutral-700 space-y-4 animate-fade-in">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="md:col-span-2">
                                    <label className="block text-xs text-purple-300 mb-1 ml-1">信用卡號碼</label>
                                    <input 
                                        type="text" 
                                        name="number"
                                        placeholder="0000 0000 0000 0000" 
                                        value={cardData.number}
                                        onChange={handleCardChange}
                                        maxLength={19}
                                        className="w-full bg-neutral-800 border border-neutral-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs text-purple-300 mb-1 ml-1">持卡人姓名</label>
                                    <input 
                                        type="text" 
                                        name="name"
                                        placeholder="NAME ON CARD" 
                                        value={cardData.name}
                                        onChange={handleCardChange}
                                        className="w-full bg-neutral-800 border border-neutral-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
                                    />
                                </div>
                                <div className="flex gap-4">
                                    <div className="w-1/2">
                                        <label className="block text-xs text-purple-300 mb-1 ml-1">到期日</label>
                                        <input 
                                            type="text" 
                                            name="expiry"
                                            placeholder="MM/YY" 
                                            value={cardData.expiry}
                                            onChange={handleCardChange}
                                            maxLength={5}
                                            className="w-full bg-neutral-800 border border-neutral-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
                                        />
                                    </div>
                                    <div className="w-1/2">
                                        <label className="block text-xs text-purple-300 mb-1 ml-1">CVV</label>
                                        <input 
                                            type="text" 
                                            name="cvv"
                                            placeholder="123" 
                                            value={cardData.cvv}
                                            onChange={handleCardChange}
                                            maxLength={4}
                                            className="w-full bg-neutral-800 border border-neutral-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
                                        />
                                    </div>
                                </div>
                            </div>
                            
                            <div className="flex justify-end gap-3 pt-2">
                                <button onClick={() => setShowCardInput(false)} className="text-gray-400 hover:text-white px-4 py-2 text-sm transition">取消</button>
                                <button onClick={handleSaveCard} className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg text-sm font-bold shadow-lg shadow-purple-600/20 transition">
                                    確認綁定
                                </button>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>

        {/* === C. 歷史訂單區塊 === */}
        <h2 className="text-2xl font-bold text-white mb-6 pl-3 border-l-4 border-purple-600">
            歷史訂單
        </h2>
        
        <div className="space-y-4">
          {orders.length === 0 ? (
            <div className="text-center py-12 bg-neutral-800 rounded-xl border border-neutral-700 border-dashed">
                <p className="text-gray-500 text-lg">目前沒有訂單紀錄</p>
            </div>
          ) : (
            orders.map(order => (
              <OrderHistoryItem 
                key={order.bookingId} 
                order={order} 
                onCancel={handleCancelOrder} 
              />
            ))
          )}
        </div>

      </div>
    </div>
  );
}

export default UserPage;