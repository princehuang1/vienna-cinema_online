import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import ShowtimeMovieCard from '../components/ShowtimeMovieCard';

// --- 輔助資料 ---
const theatresData = [
  { id: 1, name: '台北信義影城' },
  { id: 2, name: '台北中山影城' },
  { id: 3, name: '新北板橋影城' },
];

function ShowtimePage() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alertMessage, setAlertMessage] = useState(null);
  
  // --- 搜尋相關狀態 ---
  const [searchTerm, setSearchTerm] = useState("");

  const handleSelectionError = () => {
    setAlertMessage("請先選擇時間");
    setTimeout(() => {
      setAlertMessage(null);
    }, 3000);
  };

  const [selectedTheatre, setSelectedTheatre] = useState(theatresData[0].id);
  const [selectedTime, setSelectedTime] = useState(null);

  // --- 日期選擇器邏輯 ---
  const today = new Date();
  const todayZero = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const maxAllowedDate = new Date(todayZero); 
  maxAllowedDate.setDate(todayZero.getDate() + 30); 

  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedDateObject, setSelectedDateObject] = useState(today);
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const calendarRef = useRef(null);

  const monthOptions = [];
  for (let i = 0; i < 2; i++) {
    const d = new Date(today.getFullYear(), today.getMonth() + i, 1);
    monthOptions.push({
      year: d.getFullYear(),
      month: d.getMonth(),
      label: `${d.getFullYear()}年 ${d.getMonth() + 1}月`
    });
  }

  const handleMonthChange = (e) => {
    const [y, m] = e.target.value.split('-');
    setViewYear(parseInt(y));
    setViewMonth(parseInt(m));
  };

  const handleDateClick = (day) => {
    const newDate = new Date(viewYear, viewMonth, day);
    if (isDateDisabled(day)) return;
    setSelectedDateObject(newDate);
    setShowCalendar(false); 
  };

  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay();
  const blanks = Array.from({ length: firstDayOfWeek }, (_, i) => i);
  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const isDateDisabled = (day) => {
    const checkDate = new Date(viewYear, viewMonth, day);
    return checkDate < todayZero || checkDate > maxAllowedDate;
  };

  const isSelected = (day) => {
    return (
      selectedDateObject.getDate() === day &&
      selectedDateObject.getMonth() === viewMonth &&
      selectedDateObject.getFullYear() === viewYear
    );
  };

  const formattedSelectedDate = `${selectedDateObject.getFullYear()}/${selectedDateObject.getMonth() + 1}/${selectedDateObject.getDate()}`;

  // --- API 呼叫 ---
  useEffect(() => {
    axios.get('https://vienna-cinema-online.onrender.com/api/movies?status=Now Playing')
      .then(response => {
        setMovies(response.data);
        setLoading(false);
      })
      .catch(err => {
        console.error("抓取電影資料失敗:", err);
        setLoading(false);
      });
  }, []);

  // --- 點擊日曆外部關閉下拉選單 ---
  useEffect(() => {
    function handleClickOutside(event) {
      if (calendarRef.current && !calendarRef.current.contains(event.target)) {
        setShowCalendar(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [calendarRef]);

  // --- 過濾邏輯 ---
  const filteredMovies = movies.filter(movie => {
    if (!searchTerm) return true;
    const title = movie.title || movie.name || movie.movieName || ""; 
    return title.toLowerCase().includes(searchTerm.toLowerCase());
  });

  // 🔥 取得目前選中的影城物件 (為了傳給下一頁)
  const currentTheatreObj = theatresData.find(t => t.id === selectedTheatre);

  return (
    <div className="min-h-screen bg-neutral-900 text-gray-100 font-sans relative">
      {alertMessage && (
        <div className="fixed top-0 left-0 w-full bg-red-600 text-white text-center py-4 z-[9999] font-bold shadow-lg animate-fade-in-down flex items-center justify-center gap-2">
           <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
           </svg>
           {alertMessage}
        </div>
      )}

      <Navbar />
      
      <main className="container mx-auto px-4 lg:px-20 py-8">
        
        <h1 className="text-4xl font-bold text-white mb-8">場次查詢</h1>

        {/* --- 三欄式控制列 --- */}
        <div className="flex flex-col lg:flex-row justify-between items-start mb-10 gap-6 bg-neutral-800 p-6 rounded-xl border border-neutral-700">
          
          {/* 1. 選擇影城 */}
          <div className="w-full lg:w-1/3">
            <label htmlFor="theatre-select" className="block text-sm font-medium text-purple-400 mb-3 uppercase tracking-wider flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              1. 選擇影城
            </label>
            <select
              id="theatre-select"
              value={selectedTheatre}
              onChange={(e) => setSelectedTheatre(Number(e.target.value))}
              className="w-full bg-neutral-900 border border-neutral-600 rounded-lg py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-shadow appearance-none cursor-pointer"
              style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: `right 0.5rem center`, backgroundRepeat: `no-repeat`, backgroundSize: `1.5em 1.5em` }}
            >
              {theatresData.map(theatre => (
                <option key={theatre.id} value={theatre.id}>
                  {theatre.name}
                </option>
              ))}
            </select>
          </div>

          {/* 2. 選擇日期 */}
          <div className="w-full lg:w-1/3 relative" ref={calendarRef}>
            <label className="block text-sm font-medium text-purple-400 mb-3 uppercase tracking-wider flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              2. 選擇日期
            </label>
            
            <button 
              onClick={() => setShowCalendar(!showCalendar)}
              className="w-full bg-neutral-900 border border-neutral-600 rounded-lg py-3 px-4 text-left text-white focus:outline-none focus:ring-2 focus:ring-purple-500 flex justify-between items-center"
            >
              <span>{formattedSelectedDate}</span>
              <svg className={`h-5 w-5 text-gray-400 transition-transform ${showCalendar ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>

            {showCalendar && (
              <div className="absolute top-full left-0 mt-2 w-full z-50 bg-neutral-800 border border-neutral-600 rounded-lg shadow-2xl p-4 animate-fade-in-down">
                <div className="mb-4">
                  <select 
                    className="w-full bg-neutral-900 border border-neutral-600 rounded px-3 py-2 text-white focus:ring-1 focus:ring-purple-500"
                    onChange={handleMonthChange}
                    value={`${viewYear}-${viewMonth}`}
                  >
                    {monthOptions.map(opt => (
                      <option key={`${opt.year}-${opt.month}`} value={`${opt.year}-${opt.month}`}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-7 gap-1 text-center mb-2">
                    {['日', '一', '二', '三', '四', '五', '六'].map(d => (
                      <span key={d} className="text-xs text-gray-500 font-bold py-1">{d}</span>
                    ))}
                </div>
                <div className="grid grid-cols-7 gap-1">
                  {blanks.map(blank => (
                    <div key={`blank-${blank}`} className="h-9 w-9"></div>
                  ))}
                  {daysArray.map(day => {
                    const disabled = isDateDisabled(day);
                    const selected = isSelected(day);
                    return (
                      <button
                        key={day}
                        disabled={disabled}
                        onClick={() => handleDateClick(day)}
                        className={`
                          h-9 w-9 mx-auto rounded-full flex items-center justify-center text-sm transition-all
                          ${selected 
                            ? 'bg-purple-600 text-white font-bold shadow-md' 
                            : disabled 
                              ? 'text-gray-500 opacity-20 cursor-default'
                              : 'text-gray-300 hover:bg-neutral-700 hover:text-white cursor-pointer'
                          }
                        `}
                      >
                        {day}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* 3. 搜尋電影 */}
          <div className="w-full lg:w-1/3">
            <label htmlFor="movie-search" className="block text-sm font-medium text-purple-400 mb-3 uppercase tracking-wider flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              3. 搜尋電影
            </label>
            
            <select
              id="movie-search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-neutral-900 border border-neutral-600 rounded-lg py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-shadow appearance-none cursor-pointer"
              style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: `right 0.5rem center`, backgroundRepeat: `no-repeat`, backgroundSize: `1.5em 1.5em` }}
            >
              <option value="">全部電影</option>
              {movies.map(movie => (
                <option key={movie.movieId} value={movie.movieName || movie.title}>
                  {movie.movieName || movie.title}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* --- 電影列表 --- */}
        <div className="space-y-6 max-w-5xl mx-auto">
          {loading ? (
            <p className="text-lg text-gray-400 text-center animate-pulse">正在載入電影資訊...</p>
          ) : (
            <>
              {filteredMovies.length > 0 ? (
                filteredMovies.map(movie => (
                  <ShowtimeMovieCard 
                    key={movie.movieId} 
                    movie={movie} 
                    // 🔥 修改處：傳入完整的影城物件 (currentTheatreObj)
                    theater={currentTheatreObj} 
                    selectedDate={formattedSelectedDate}
                    onError={handleSelectionError}
                  />
                ))
              ) : (
                <div className="text-center py-20 bg-neutral-800/50 rounded-xl border border-neutral-700 border-dashed">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
                  </svg>
                  <p className="text-xl text-gray-300 font-medium">找不到相關電影</p>
                  <p className="text-gray-500 mt-2">請嘗試搜尋其他關鍵字</p>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}

export default ShowtimePage;