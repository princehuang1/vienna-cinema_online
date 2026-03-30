import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import MovieCard from '../components/MovieCard'; //  reusing the Home page's movie card

function MovieInfoPage() {
  // --- State ---
  const [allMovies, setAllMovies] = useState([]); // 儲存從 API 來的「所有」電影
  const [filteredMovies, setFilteredMovies] = useState([]); // 儲存「過濾後」要顯示的電影
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('All'); // 'All', 'Now Playing', 'Coming Soon'

  // --- Data Fetching Effect ---
  // 1. 頁面載入時，抓取「所有」電影 (13 部)
  useEffect(() => {
    axios.get('https://vienna-cinema-online.onrender.com/api/movies')
      .then(response => {
        setAllMovies(response.data);
        setFilteredMovies(response.data); // 預設顯示全部
        setLoading(false);
      })
      .catch(err => {
        console.error("抓取所有電影資料失敗:", err);
        setLoading(false);
      });
  }, []); // 空陣列確保只在載入時執行一次

  // --- Filtering Effect ---
  // 2. 當 "activeFilter" 或 "allMovies" 改變時，執行此過濾
  useEffect(() => {
    if (activeFilter === 'All') {
      setFilteredMovies(allMovies);
    } else {
      const filtered = allMovies.filter(movie => movie.status === activeFilter);
      setFilteredMovies(filtered);
    }
  }, [activeFilter, allMovies]);

  // --- Tab Button Component (for styling) ---
  const FilterButton = ({ label, status }) => (
    <button
      onClick={() => setActiveFilter(status)}
      className={`py-2 px-6 rounded-full font-semibold transition-colors duration-300
        ${activeFilter === status
          ? 'bg-purple-600 text-white' // 選中時
          : 'bg-neutral-700 text-gray-300 hover:bg-neutral-600' // 未選中
        }
      `}
    >
      {label}
    </button>
  );

  return (
    <div className="min-h-screen bg-neutral-900 text-gray-100 font-sans">
      <Navbar />
      
      <main className="container mx-auto px-20 py-8"> {/* 保持 px-20 的左右邊距 */}
        
        {/* 1. 標題 */}
        <h1 className="text-4xl font-bold text-white mb-8">電影資訊</h1>

        {/* 2. 篩選器 (Tabs) */}
        <div className="flex space-x-4 mb-10">
          <FilterButton label="全部顯示" status="All" />
          <FilterButton label="現正熱映" status="Now Playing" />
          <FilterButton label="即將推出" status="Coming Soon" />
        </div>

        {/* 3. 電影列表網格 (使用與首頁相同的樣式) */}
        {/* 🎯 修改：將 lg:grid-cols-4 改為 lg:grid-cols-5，並將 gap-12 改為 gap-8 以適應較密的佈局 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8">
          {loading ? (
            <p>資料載入中...</p>
          ) : (
            filteredMovies.map((movie) => (
              // 重複使用 MovieCard 元件
              <MovieCard key={movie.movieId} movie={{
                id: movie.movieId,
                title: movie.movieName,
                duration: movie.movieDurationMinutes,
                rating: 'N/A', 
                genre: movie.movieType,
                poster: movie.posterUrl,
                isShowing: movie.status === 'Now Playing'
              }} />
            ))
          )}
        </div>
      </main>
    </div>
  );
}

export default MovieInfoPage;