import React from 'react';
import { Link } from 'react-router-dom';

function MovieCard({ movie }) {
  if (!movie) {
    return null;
  }

  // 現在 100% 使用從 API 傳來的 'movie.poster' 路徑就是正確的路徑。
  const posterUrl = movie.poster; 
  // ----------------------------------------------------

  return (
    <div className="bg-neutral-800 rounded-xl overflow-hidden shadow-xl hover:shadow-purple-500/30 transition-all duration-300">
      
      {/* 使用縱橫比樣式 (aspect-[2/3]) 保持海報比例 */}
      <img
        src={`${import.meta.env.BASE_URL}${posterUrl}`}
        alt={movie.title}
        className="w-full aspect-[2/3] object-cover" 
        onError={(e) => { 
          e.target.onerror = null; 
          e.target.src = 'https://via.placeholder.com/400x600?text=Image+Not+Found'; 
        }}
      />
      
      <div className="p-4">
        <h3 className="text-white text-xl font-bold mb-2 truncate" title={movie.title}>{movie.title}</h3>
        
        {/* 🔥 修改處：將原本的 N/A 替換為 movie.genre，並加上 '分鐘' 單位 (視資料而定，若原本已有單位可移除) */}
        {/* 同時移除了下方原本獨立顯示 genre 的 <p>，讓版面更清爽 */}
        <p className="text-gray-400 text-sm mb-4">
            {movie.duration}  |  {movie.genre}
        </p>
        
        {movie.isShowing ? (
          <Link 
            to={`/movie/${movie.id}`} 
            className="block text-center bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-full w-full transition duration-300"
          >
            取得門票
          </Link>
        ) : (
          <button className="bg-gray-700 text-gray-400 font-bold py-2 px-4 rounded-full w-full cursor-not-allowed">
            即將推出
          </button>
        )}
      </div>
    </div>
  );
}

export default MovieCard;