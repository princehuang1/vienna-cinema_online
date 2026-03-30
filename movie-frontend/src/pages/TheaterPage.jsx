import React from 'react';
import Navbar from '../components/Navbar';

const theatersData = [
  {
    id: 1,
    name: '台北信義影城',
    address: '台北市, 信義區, 奧菲莉亞路 88 號',
    description: '坐落於星瀑區中心，信義影城像是由晨光與玻璃雕刻成的殿堂。影城外觀宛如垂直延伸的光柱，在夜晚會散發柔和金銀色光芒。內部以「流動的音樂」作為設計概念，所有迴廊都藏著會輕輕回響的弦樂。這裡是觀賞史詩電影與浪漫電影的最佳場域，被稱為「城市中最接近星空的劇院」。',
    image: '/posters/影城01.jpg',
  },
  {
    id: 2,
    name: '台北中山影城',
    address: '台北市, 中山區, 桂冠石道 55 號',
    description: '中山影城如同一座沉穩而典雅的古典宮殿，外牆由象牙白石材堆疊，屋頂上綴著金色桂冠紋章，因此被稱為「王冠劇場」。館內以溫暖的琥珀燈光與絲絨家具打造最舒適的觀影氛圍，適合欣賞藝術片、劇情片與經典修復電影。',
    image: '/posters/影城02.jpg',
  },
  {
    id: 3,
    name: '新北板橋影城',
    address: '新北市, 板橋區, 遠嶺光河街 101 號',
    description: '板橋影城以「地平線」為靈感打造，館體結構如同一條延伸至遠方的光之河流，牆面上有會緩慢流動的光紋，象徵電影帶來的無盡冒險。這裡擁有三座巨幕廳與最先進的沉浸式音場，是動作大片、奇幻電影、科幻鉅作的最佳舞台。',
    image: '/posters/影城03.jpg',
  }
];

function TheaterPage() {
  return (
    <div className="min-h-screen bg-neutral-900 text-gray-100 font-sans">
      <Navbar />

      <main className="container mx-auto px-20 py-8">
        <h1 className="text-4xl font-bold text-white mb-8">
            影城介紹
        </h1>

        {/* 影城列表 (垂直堆疊) */}
        <div className="flex flex-col space-y-12">
          {theatersData.map((theater) => (
            <section 
              key={theater.id} 
              // 卡片容器：深灰色背景、圓角、陰影
              className="bg-neutral-800 rounded-xl overflow-hidden shadow-xl flex flex-col md:flex-row border border-neutral-700/50 hover:border-purple-500/30 transition-all duration-300"
            >
              {/* 左側：圖片 (固定寬度 50% 或 45%) */}
              <div className="w-full md:w-5/12 h-64 md:h-auto relative group">
                {/* 🔥 修改處：加上 BASE_URL */}
                <img 
                  src={`${import.meta.env.BASE_URL}${theater.image}`} 
                  alt={theater.name} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </div>

              {/* 右側：文字內容 (垂直置中) */}
              <div className="w-full md:w-7/12 p-8 md:p-12 flex flex-col justify-center">
                
                {/* 名稱 */}
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
                  {theater.name}
                </h2>

                {/* 地址 (帶 Icon) */}
                <div className="flex items-center text-purple-400 font-medium mb-6">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                  </svg>
                  {theater.address}
                </div>

                {/* 介紹內文 */}
                <p className="text-gray-300 text-lg leading-relaxed text-justify">
                  {theater.description}
                </p>

              </div>
            </section>
          ))}
        </div>
      </main>

      <footer className="bg-neutral-800 py-8 mt-12">
        <div className="container mx-auto text-center text-gray-400">
          &copy; 2025 VIENNA CINEMA. All rights reserved.
        </div>
      </footer>
    </div>
  );
}

export default TheaterPage;