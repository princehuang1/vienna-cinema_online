import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';

// 商城頁面的篩選類別
const storeCategories = [
    { label: '遊戲商城', status: 'Game' },
    { label: '電影周邊', status: 'Merchandise' },
    { label: '餐飲', status: 'Concession' },
];

// 🎯 橫幅新聞資料 (10筆)
const newsData = [
    { 
        id: 1, 
        title: '《GTA6》罪惡之城的浪潮再度席捲', 
        desc: '《GTA6》將玩家帶回充滿霓虹與危險的罪惡之城。全新角色、更加真實的城市生態與犯罪生存系統即將重塑玩家對開放世界的想像。這一次，你不只是闖蕩，你是要在城市的混亂浪潮中生存、反擊，並建立自己的傳奇。',
        image: '/posters/GTA6.jpg', 
        link: 'https://www.4gamers.com.tw/news/detail/71567/gta6-delayed-to-2026'
    },
    { 
        id: 2, 
        title: '《Steam Machine》回歸：開啟玩家客廳的硬派 PC 革命', 
        desc: '以 PC 強度打造的 Steam Machine，再度以更精簡的設計、更強大效能回歸玩家視野。結合 SteamOS 與龐大遊戲庫，它將客廳娛樂提升到新高度，跨平台遊玩從未如此順暢自在。',
        image: '/posters/steam.jpg', 
        link: 'https://www.supermoto8.com/articles/16511'
    },
    { 
        id: 3, 
        title: '《艾爾登法環:黑夜君臨》在暗影中誕生的王者試煉', 
        desc: '這片土地深藏著梅瑟莫的力量、詛咒與過往真相。強大的全新 Boss、反抗命運的角色，以及更殘酷的挑戰，等待褪色者踏入黑夜、點燃自己的光。',
        image: '/posters/黑夜君臨.jpg', 
        link: 'https://gnn.gamer.com.tw/detail.php?sn=296393'
    },
    { 
        id: 4, 
        title: '《羊蹄山戰鬼》深山怨火下的生死輪迴', 
        desc: '傳說在北海道羊蹄山深處，戰鬼的哀號從未停歇。《羊蹄山戰鬼》讓玩家踏入霧深林暗的禁忌山域，追尋百年前的戰亂真相。面對怨魂、古道與被遺忘的儀式，你必須在恐懼與戰鬥之間找到活下去的路。',
        image: '/posters/羊蹄山戰鬼.jpg', 
        link: 'https://gnn.gamer.com.tw/detail.php?sn=286563'
    },
    { 
        id: 5, 
        title: '《惡靈古堡 9》黑霧侵蝕下的最後倖存者', 
        desc: '未知的感染源在孤島蔓延，曾經的組織秘密逐漸浮現。玩家必須在變異體、陰影與背叛中找到逃出生天的道路。黑霧籠罩之處，沒有任何真相能長久隱藏。',
        image: '/posters/惡靈古堡9.jpg', 
        link: 'https://gnn.gamer.com.tw/detail.php?sn=294797'
    },
    { 
        id: 6, 
        title: '《虛實幻象》當現實裂縫中浮現另一個世界', 
        desc: '在《虛實幻象》中，玩家將在虛擬與現實交錯的世界裡揭開真相。城市的表象逐漸扭曲，數據殘影侵入日常，讓你在判斷、探索與選擇中面對多層次的巨大幻境。你看到的，未必是真相。',
        image: '/posters/虛實幻象.jpg', 
        link: 'https://blog.zh-hant.playstation.com/2025/06/05/20250605-pragmata/'
    },
    { 
        id: 7, 
        title: '《FF7》重製版最終章玩法將有大改動！', 
        desc: 'Square Enix 從 2020 年開始的《Final Fantasy 7》（FF7）重製計畫，如今最終第三部曲正在開發中，讓全球無數粉絲都非常期待。而近日，巴西電玩展 Brasil Game Show 2025 上，《FF7》重製版三部曲的遊戲總監濱口直樹透露了系列最終章的一些細節。',
        image: '/posters/FF703.jpg', 
        link: 'https://www.4gamers.com.tw/news/detail/53744/square-enix-confirms-final-fantasy-vii-remake-will-be-a-trilogy'
    },
    { 
        id: 8, 
        title: '《劍星》為PlayStation最暢銷PC單機遊戲', 
        desc: '韓國開發商 Shift Up 於 11 月 24 日公開財報（投資者報告）並在近期徵才公告中揭露，《劍星》（Stellar Blade）自推出以來刷新多項紀錄，不僅 PS5 版大獲成功，更成為 PlayStation 歷來發行最暢銷的 PC 單機遊戲，而續作《劍星 2》（代稱）極可能改採多平台首發策略。',
        image: '/posters/劍星消息.jpg', 
        link: 'https://www.4gamers.com.tw/news/detail/75449/shift-up-stellar-blade-playstation-best-selling-pc-stellar-blade-2-multiplatform'
    },
    { 
        id: 9, 
        title: 'Nintendo Switch 2', 
        desc: '全新的 Switch 2 帶來更強大的性能、更清晰的畫面與更靈活的遊玩方式。從家用到外出、從單人到多人，這台主機將任天堂的創意理念推向下一個世代，帶來更純粹、流暢的遊戲魅力。',
        image: '/posters/switch2.jpg', 
        link: 'https://gnn.gamer.com.tw/detail.php?sn=279653'
    },
    { 
        id: 10, 
        title: '《空洞騎士:絲之歌》命運之線即將織起', 
        desc: '《空洞騎士:絲之歌》揭開了黃蜂（Hornet）的故事篇章。她將穿越陌生的國度、攀上危險的高塔，用速度與優雅擊敗潛伏在暗處的敵人。全新的世界、節奏更快的戰鬥與神秘劇情，將帶來前所未有的蜂刺之旅...',
        image: '/posters/絲之歌.jpg', 
        link: 'https://gnn.gamer.com.tw/detail.php?sn=283580'
    },
];

// ----------------------------------------------------------------------
// 🎯 元件：新聞輪播橫幅 (完美版：3張全顯 + 2張露邊)
// ----------------------------------------------------------------------
const NewsCarousel = () => {
    const [activeIndex, setActiveIndex] = useState(0);
    const totalItems = newsData.length;

    const handleNext = () => {
        setActiveIndex((prev) => (prev + 1) % totalItems);
    };

    const handlePrev = () => {
        setActiveIndex((prev) => (prev - 1 + totalItems) % totalItems);
    };

    const getDistance = (index) => {
        let diff = index - activeIndex;
        if (diff > totalItems / 2) diff -= totalItems;
        if (diff < -totalItems / 2) diff += totalItems;
        return diff;
    };

    return (
        <div className="relative w-full overflow-hidden py-16 pb-24 bg-neutral-900/50">
            
            <h2 className="text-5xl text-white text-center mb-12 font-bold tracking-wider">
                《最新消息》
            </h2>

            <div className="relative w-full h-[400px] flex justify-center items-center perspective-1000">
                
                {newsData.map((item, index) => {
                    const distance = getDistance(index);
                    
                    // 顯示範圍：中間(0) + 左右(1) + 更外側預覽(2)
                    const isVisible = Math.abs(distance) <= 2;
                    if (!isVisible) return null;

                    // 樣式變數
                    let xOffset = '0%';
                    let scale = 1;
                    let opacity = 1;
                    let zIndex = 0;
                    let pointerEvents = 'none';

                    // 🎯 距離間距設定：106% (讓卡片稍微緊湊一點，留空間給邊緣)
                    const spacing = 106; 

                    if (distance === 0) {
                        // === 中間 (Active) ===
                        xOffset = '0%'; 
                        scale = 1; 
                        opacity = 1;
                        zIndex = 10;
                        pointerEvents = 'auto';
                    } else if (distance === -1) {
                        // === 左邊 (Active) ===
                        xOffset = `-${spacing}%`; 
                        scale = 1; 
                        opacity = 1;
                        zIndex = 10;
                        pointerEvents = 'auto';
                    } else if (distance === 1) {
                        // === 右邊 (Active) ===
                        xOffset = `${spacing}%`; 
                        scale = 1;
                        opacity = 1;
                        zIndex = 10;
                        pointerEvents = 'auto';
                    } else if (distance === -2) {
                        // === 左邊緣預覽 (Peek) ===
                        xOffset = `-${spacing * 2}%`; 
                        scale = 0.9; 
                        opacity = 0.5; 
                        zIndex = 0;
                    } else if (distance === 2) {
                        // === 右邊緣預覽 (Peek) ===
                        xOffset = `${spacing * 2}%`; 
                        scale = 0.9;
                        opacity = 0.5;
                        zIndex = 0;
                    }

                    return (
                        <div 
                            key={item.id}
                            className="absolute transition-all duration-500 ease-[cubic-bezier(0.25,1,0.5,1)]"
                            style={{
                                transform: `translateX(${xOffset}) scale(${scale})`,
                                opacity: opacity,
                                zIndex: zIndex,
                                pointerEvents: pointerEvents,
                                // 🎯 寬度改為 28%：這樣 3 張佔 84%，左右各留 8% 給預覽卡片露出
                                width: '28%', 
                                minWidth: '320px', 
                                maxWidth: '430px', 
                                height: '100%',
                                left: '0', 
                                right: '0',
                                margin: '0 auto', 
                            }}
                        >
                            <div className="w-full h-full rounded-2xl overflow-hidden bg-neutral-800 shadow-2xl border border-neutral-700/50 relative group">
                                {/* 圖片區 */}
                                <div className="h-[60%] overflow-hidden relative">
                                    {/* 🔥 修改處：加上 BASE_URL */}
                                    <img 
                                        src={`${import.meta.env.BASE_URL}${item.image}`} 
                                        alt={item.title} 
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                                    />
                                    {/* 只有最邊緣的預覽卡片才加深色遮罩，中間三張不加 */}
                                    <div className={`absolute inset-0 bg-black transition-opacity duration-500 ${Math.abs(distance) <= 1 ? 'opacity-0' : 'opacity-50'}`}></div>
                                </div>

                                {/* 文字區 */}
                                <div className="p-6 flex flex-col h-[40%] relative">
                                    <h3 className="text-white font-bold text-xl mb-3 leading-tight line-clamp-2">
                                        {item.title}
                                    </h3>
                                    <p className="text-gray-400 text-sm leading-relaxed line-clamp-2">
                                        {item.desc}
                                    </p>
                                    
                                    {/* 🎯 修改：將 button 改為 a 連結 */}
                                    <a 
                                        href={item.link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="absolute bottom-4 right-4 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold py-2 px-5 rounded-full transition-colors shadow-lg flex items-center justify-center cursor-pointer"
                                    >
                                        了解更多
                                    </a>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* 左箭頭 */}
            <button onClick={handlePrev} className="absolute left-4 md:left-10 top-1/2 -translate-y-1/2 z-20 bg-black/60 hover:bg-purple-600 text-white p-4 rounded-full backdrop-blur-sm border border-white/10 shadow-lg group transition-all hover:scale-110">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6 group-hover:-translate-x-0.5 transition-transform"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>
            </button>

            {/* 右箭頭 */}
            <button onClick={handleNext} className="absolute right-4 md:right-10 top-1/2 -translate-y-1/2 z-20 bg-black/60 hover:bg-purple-600 text-white p-4 rounded-full backdrop-blur-sm border border-white/10 shadow-lg group transition-all hover:scale-110">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6 group-hover:translate-x-0.5 transition-transform"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg>
            </button>

        </div>
    );
};

// ----------------------------------------------------------------------
// 遊戲卡片元件
// ----------------------------------------------------------------------
const GameItemCard = ({ item }) => (
  <Link to={`/store/game/${item.gameId}`} className="block h-full">
    <div className="group cursor-pointer relative rounded-xl overflow-hidden shadow-lg hover:shadow-purple-500/50 transition-all duration-300 transform hover:-translate-y-1 h-full">
      {/* 🔥 修改處：安全的條件判斷並加上 BASE_URL */}
      <img
          src={item.image ? `${import.meta.env.BASE_URL}${item.image}` : 'https://via.placeholder.com/400x400?text=Game'}
          alt={item.name}
          className="w-full aspect-square object-cover group-hover:scale-105 transition-transform duration-500" 
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent flex flex-col justify-end p-4">
        <h3 className="text-white text-sm md:text-base font-bold truncate group-hover:text-purple-400 transition-colors text-left">
          {item.name}
        </h3>
        <p className="text-gray-300 text-xs mt-1 text-left">$ {item.price}</p>
      </div>
    </div>
  </Link>
);

// ----------------------------------------------------------------------
// StoreItemCard：一般商品卡片 (周邊 & 餐飲) - 包含購買邏輯 🔥
// ----------------------------------------------------------------------
const StoreItemCard = ({ item }) => {
  const navigate = useNavigate();

  // 🔥 點擊立即購買 -> 跳轉到 BookingConfirmationPage
  const handleBuy = () => {
    const bookingData = {
        movie: { movieName: item.name }, // 借用欄位
        theater: { name: '線上商城' },   // 來源標記
        date: new Date().toLocaleDateString(),
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        selectedSeats: [], // 商城無座位
        tickets: [],
        meals: [{ name: item.name, price: item.price, count: 1 }], // 將商品視為餐飲/物品
        totalPrice: item.price,
        isStore: true // 🔥 關鍵標記
    };

    navigate(`/booking-confirmation/store-${item.id}`, { state: bookingData });
  };

  return (
    <div className="bg-neutral-800 rounded-xl overflow-hidden shadow-xl hover:shadow-purple-500/30 transition-all duration-300 h-full flex flex-col">
      {/* 🔥 修改處：安全的條件判斷並加上 BASE_URL */}
      <img
        src={item.image ? `${import.meta.env.BASE_URL}${item.image}` : 'https://via.placeholder.com/400x400?text=Item'}
        alt={item.name}
        className="w-full aspect-square object-cover" 
      />
      <div className="p-4 flex flex-col flex-grow">
        <h3 className="text-white text-lg font-bold mb-1 truncate">{item.name}</h3>
        {item.content && <p className="text-gray-400 text-xs mb-2 truncate">{item.content}</p>}
        <p className="text-purple-400 text-base mb-3 mt-auto">$ {item.price}</p>
        <button 
            onClick={handleBuy}
            className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-full w-full transition duration-300 text-sm"
        >
          立即購買
        </button>
      </div>
    </div>
  );
};

// ----------------------------------------------------------------------
// 主頁面 StorePage
// ----------------------------------------------------------------------
function StorePage() {
  const [activeFilter, setActiveFilter] = useState(storeCategories[0].status); 
  const [filteredItems, setFilteredItems] = useState([]);
  
  // 1. 資料 State：分別存放遊戲和其他商品
  const [games, setGames] = useState([]); 
  const [others, setOthers] = useState([]); // 存放周邊與餐飲
  const [loading, setLoading] = useState(true);

  // 2. 一次抓取所有資料 (API)
  useEffect(() => {
    const fetchGames = axios.get('https://vienna-cinema-online.onrender.com/api/games');
    const fetchOthers = axios.get('https://vienna-cinema-online.onrender.com/api/concessions'); // 假設此 API 回傳所有非遊戲商品

    Promise.all([fetchGames, fetchOthers])
      .then(([gamesRes, othersRes]) => {
        setGames(gamesRes.data);
        setOthers(othersRes.data);
        setLoading(false);
      })
      .catch(err => {
        console.error("抓取資料失敗:", err);
        setLoading(false);
      });
  }, []);

  // 3. 篩選邏輯
  useEffect(() => {
    if (activeFilter === 'Game') {
      setFilteredItems(games);
    } else {
      // 從後端抓回來的 others 資料中篩選
      // 若資料庫無 category 欄位，預設視為 'Concession'
      const filtered = others.filter(item => {
        const cat = item.category || 'Concession'; 
        return cat === activeFilter;
      });
      
      // 餐飲特殊排序 (可選)
      if (activeFilter === 'Concession') {
        const priority = ['基本套餐', '高級套餐', '豪華套餐'];
        filtered.sort((a, b) => {
          const indexA = priority.indexOf(a.name);
          const indexB = priority.indexOf(b.name);
          if (indexA !== -1 && indexB !== -1) return indexA - indexB;
          if (indexA !== -1) return -1;
          if (indexB !== -1) return 1;
          return 0; 
        });
      }
      
      setFilteredItems(filtered);
    }
  }, [activeFilter, games, others]);

  const FilterButton = ({ label, status }) => (
    <button
      onClick={() => setActiveFilter(status)}
      className={`py-2 px-6 rounded-full font-semibold transition-colors duration-300
        ${activeFilter === status
          ? 'bg-purple-600 text-white' 
          : 'bg-neutral-700 text-gray-300 hover:bg-neutral-600' 
        }
      `}
    >
      {label}
    </button>
  );

  return (
    <div className="min-h-screen bg-neutral-900 text-gray-100 font-sans overflow-x-hidden">
      <Navbar />
      
      <main className="container mx-auto px-20 py-8"> 
        
        <h1 className="text-4xl font-bold text-white mb-8">商城</h1>

        <div className="flex space-x-4 mb-10">
          {storeCategories.map(cat => (
              <FilterButton key={cat.status} label={cat.label} status={cat.status} />
          ))}
        </div>

        {/* 商品列表網格 */}
        <div className="grid gap-6 grid-cols-2 md:grid-cols-3 lg:grid-cols-5 mb-16">
          {loading ? (
             <p className="col-span-full text-gray-400 text-center">載入中...</p>
          ) : filteredItems.length > 0 ? (
            filteredItems.map((item) => (
                activeFilter === 'Game' 
                ? <GameItemCard key={item.gameId} item={item} />
                : <StoreItemCard key={item.id} item={item} />
            ))
          ) : (
            <p className="col-span-full text-gray-400 text-center">此分類暫無商品。</p>
          )}
        </div>
        
      </main>

      {/* 只有在「遊戲商城」分類時，才顯示底部的超帥新聞輪播 */}
      {activeFilter === 'Game' && (
          <NewsCarousel />
      )}
    </div>
  );
}

export default StorePage;