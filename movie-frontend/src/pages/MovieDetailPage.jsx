import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';

// --- 資料區 ---
const theatresData = [
  { id: 1, name: '台北信義影城' },
  { id: 2, name: '台北中山影城' },
  { id: 3, name: '新北板橋影城' },
];

const mockTimes = ["10:30", "13:15", "15:40", "18:20", "21:00"];

// 🎯 輔助函數：解析資料庫中的預告片與劇照
const getMediaForMovie = (movie) => {
  if (!movie) return [];
  const mediaList = [];
  
  // 1. 加入預告片 (Video)
  let trailerSrc = movie.trailerUrl || '';
  if (trailerSrc.includes('watch?v=')) {
      trailerSrc = trailerSrc.replace('watch?v=', 'embed/');
  }
  if (trailerSrc) {
      mediaList.push({ type: 'video', src: trailerSrc });
  }

  // 2. 加入劇照 (Image)
  let images = [];
  try {
    if (movie.stills) {
      images = JSON.parse(movie.stills); 
    }
  } catch (e) {
    console.error("解析劇照 JSON 失敗:", e);
  }

  if (images.length > 0) {
    images.forEach(imgSrc => mediaList.push({ type: 'image', src: imgSrc }));
  } else {
    for (let i = 0; i < 4; i++) {
      mediaList.push({ type: 'image', src: movie.posterUrl });
    }
  }
  return mediaList;
};

function MovieDetailPage() {
  const { movieId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  // --- 初始化 State ---
  const initialTheatreId = location.state?.theatreId || theatresData[0].id;
  const initialTime = location.state?.selectedTime || null;
  const initialDateStr = location.state?.selectedDate;
  const initialDateObj = initialDateStr ? new Date(initialDateStr) : new Date();

  // --- Component State ---
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedTheatre, setSelectedTheatre] = useState(initialTheatreId);
  const [selectedTime, setSelectedTime] = useState(initialTime);

  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  const [mediaData, setMediaData] = useState([]);
  const itemsPerView = 3;

  // --- 日期選擇器邏輯 ---
  const today = new Date();
  const todayZero = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const maxAllowedDate = new Date(todayZero);
  maxAllowedDate.setDate(todayZero.getDate() + 30);

  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedDateObject, setSelectedDateObject] = useState(initialDateObj);
  const [viewYear, setViewYear] = useState(initialDateObj.getFullYear());
  const [viewMonth, setViewMonth] = useState(initialDateObj.getMonth());
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
    setSelectedTime(null); 
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

  // --- Fetch Data ---
  useEffect(() => {
    setLoading(true);
    axios.get(`https://vienna-cinema-online.onrender.com/api/movies/${movieId}`)
      .then(response => {
        const fetchedMovie = response.data;
        setMovie(fetchedMovie);
        setMediaData(getMediaForMovie(fetchedMovie));
        setLoading(false);
      })
      .catch(err => {
        console.error("抓取單一電影資料失敗:", err);
        setError("無法載入電影資料");
        setLoading(false);
      });
  }, [movieId]);

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

  const handleConfirm = () => {
    if (!selectedTime) return;

    const selectedTheatreObj = theatresData.find(t => t.id === selectedTheatre);
    navigate(`/ticket-meal/${movieId}`, {
      state: {
        movie,
        theater: selectedTheatreObj,
        date: formattedSelectedDate,
        time: selectedTime,
      }
    });
  };

  const nextSlide = () => {
    if (currentMediaIndex < mediaData.length - itemsPerView) {
      setCurrentMediaIndex(prev => prev + 1);
    }
  };

  const prevSlide = () => {
    if (currentMediaIndex > 0) {
      setCurrentMediaIndex(prev => prev - 1);
    }
  };

  if (loading) return <div className="min-h-screen bg-neutral-900"><Navbar /><p className="text-center text-gray-300 mt-10">載入中...</p></div>;
  if (error || !movie) return <div className="min-h-screen bg-neutral-900"><Navbar /><p className="text-center text-red-500 mt-10">{error || "找不到電影"}</p></div>;

  return (
    <div className="min-h-screen bg-neutral-900 text-gray-100 font-sans pb-20 overflow-x-hidden flex flex-col relative">
      
      <div className="relative z-50">
        <Navbar />
      </div>

      {/* Hero 區塊 */}
      <div className="relative w-full pt-8 pb-0">
        <div className="container mx-auto px-8 lg:px-20 relative z-10 w-full pt-6 pb-10">
            <button 
                onClick={() => navigate(-1)} 
                className="absolute top-6 left-8 lg:left-20 text-gray-300 hover:text-white transition flex items-center gap-2 bg-black/30 px-4 py-2 rounded-full backdrop-blur-sm border border-white/10 z-20"
            >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" /></svg>
                返回
            </button>

            <div className="flex flex-col-reverse lg:flex-row items-start gap-12 lg:gap-20">
                <div className="w-full lg:w-3/5 text-left mt-16">
                    <h1 className="text-4xl lg:text-7xl font-extrabold text-white mb-4 drop-shadow-2xl leading-tight">
                        {movie.movieName}
                    </h1>
                    <div className="flex flex-wrap items-center gap-3 text-gray-300 text-sm md:text-base font-medium mb-8">
                        <span className="border border-white/30 px-3 py-1 rounded bg-black/30 backdrop-blur-sm">{movie.movieType}</span>
                        <span className="flex items-center gap-1"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> {movie.movieDurationMinutes}</span>
                        <span>{movie.language || '英語'}</span>
                    </div>
                    <p className="text-gray-200 text-lg leading-relaxed drop-shadow-md max-w-2xl mb-10">
                        {movie.synopsis || "暫無簡介"}
                    </p>
                    <div className="space-y-4 max-w-lg text-gray-300 bg-neutral-800 p-6 rounded-xl border border-white/5 shadow-lg">
                        <div className="flex items-start gap-4">
                            <span className="text-purple-400 font-bold min-w-[4rem]">導演</span>
                            <span className="text-white">{movie.director || 'N/A'}</span>
                        </div>
                        <div className="flex items-start gap-4">
                            <span className="text-purple-400 font-bold min-w-[4rem]">上映</span>
                            <span className="text-white">{movie.releaseDate || 'N/A'}</span>
                        </div>
                        <div className="flex items-start gap-4">
                            <span className="text-purple-400 font-bold min-w-[4rem]">演員</span>
                            <span className="text-white leading-relaxed">{movie.actors || 'N/A'}</span>
                        </div>
                    </div>
                </div>
                <div className="w-full lg:w-2/5 flex justify-center lg:justify-end">
                    <div className="relative w-[300px] lg:w-[400px] aspect-[2/3] rounded-xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.8)] border border-neutral-700/50 group transform hover:scale-[1.02] transition-transform duration-500">
                        <img src={`${import.meta.env.BASE_URL}${movie.posterUrl}`} alt={movie.movieName} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 ring-1 ring-inset ring-white/10 rounded-xl pointer-events-none"></div>
                    </div>
                </div>
            </div>
        </div>
      </div>

      {/* 影音橫幅 */}
      <div className="container mx-auto px-4 lg:px-8 mt-12 mb-20 max-w-[90%] relative group">
         <div className="relative overflow-hidden rounded-xl"> 
            <div className="overflow-hidden rounded-2xl"> 
                <div 
                    className="flex transition-transform duration-500 ease-in-out" 
                    style={{ transform: `translateX(-${currentMediaIndex * (100 / itemsPerView)}%)` }}
                >
                    {mediaData.map((item, index) => (
                        <div key={index} className="min-w-[33.333%] px-3 box-border">
                            <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-neutral-900 shadow-lg cursor-pointer group/item hover:border hover:border-purple-500/50 transition-all">
                                {item.type === 'video' ? (
                                    <iframe src={item.src} title="Trailer" className="w-full h-full pointer-events-auto" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen></iframe>
                                ) : (
                                    <img src={`${import.meta.env.BASE_URL}${item.src}`} alt={`Still ${index}`} className="w-full h-full object-cover transition-transform duration-500 group-hover/item:scale-110" />
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
         </div>
         {currentMediaIndex > 0 && (
            <button onClick={prevSlide} className="absolute left-[-20px] top-1/2 -translate-y-1/2 z-30 bg-purple-600 hover:bg-purple-500 text-white rounded-full p-4 shadow-2xl transition-all transform hover:scale-110"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-8 h-8"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg></button>
         )}
         {currentMediaIndex < (mediaData.length - itemsPerView) && (
            <button onClick={nextSlide} className="absolute right-[-20px] top-1/2 -translate-y-1/2 z-30 bg-purple-600 hover:bg-purple-500 text-white rounded-full p-4 shadow-2xl transition-all transform hover:scale-110"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-8 h-8"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg></button>
         )}
      </div>

      {/* 場次預訂 */}
      <section className="container mx-auto px-6 md:px-20 mb-20">
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
            <span className="w-1.5 h-8 bg-purple-600 rounded-full"></span>
            場次預訂
        </h2>

        <div className="bg-neutral-800 p-8 rounded-xl border border-neutral-700 shadow-xl">
            <div className="flex flex-col lg:flex-row gap-8 mb-8">
                {/* 影城選擇 */}
                <div className="w-full lg:w-1/2">
                    <label className="block text-sm font-medium text-gray-400 mb-2 uppercase tracking-wider">1. 選擇影城</label>
                    <select 
                        value={selectedTheatre} 
                        onChange={(e) => setSelectedTheatre(Number(e.target.value))} 
                        className="w-full bg-neutral-900 border border-neutral-600 rounded-lg py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer"
                    >
                        {theatresData.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                    </select>
                </div>

                {/* 日期選擇 */}
                <div className="w-full lg:w-1/2 relative" ref={calendarRef}>
                    <label className="block text-sm font-medium text-gray-400 mb-2 uppercase tracking-wider">2. 選擇日期</label>
                    <button 
                        onClick={() => setShowCalendar(!showCalendar)}
                        className="w-full bg-neutral-900 border border-neutral-600 rounded-lg py-3 px-4 text-left text-white focus:outline-none focus:ring-2 focus:ring-purple-500 flex justify-between items-center"
                    >
                        <span className="font-bold">{formattedSelectedDate}</span>
                        <svg className={`h-5 w-5 text-gray-400 transition-transform ${showCalendar ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                    </button>
                    
                    {showCalendar && (
                        <div className="absolute top-full left-0 mt-2 w-full z-50 bg-neutral-800 border border-neutral-600 rounded-lg shadow-2xl p-4">
                            <div className="mb-4">
                                <select className="w-full bg-neutral-900 border border-neutral-600 rounded px-3 py-2 text-white" onChange={handleMonthChange} value={`${viewYear}-${viewMonth}`}>
                                    {monthOptions.map(opt => <option key={`${opt.year}-${opt.month}`} value={`${opt.year}-${opt.month}`}>{opt.label}</option>)}
                                </select>
                            </div>
                            <div className="grid grid-cols-7 gap-1 text-center mb-2">{['日', '一', '二', '三', '四', '五', '六'].map(d => <span key={d} className="text-xs text-gray-500 font-bold py-1">{d}</span>)}</div>
                            <div className="grid grid-cols-7 gap-1">
                                {blanks.map(b => <div key={`blank-${b}`} className="h-9 w-9"></div>)}
                                {daysArray.map(day => {
                                    const disabled = isDateDisabled(day);
                                    const selected = isSelected(day);
                                    return <button key={day} disabled={disabled} onClick={() => handleDateClick(day)} className={`h-9 w-9 mx-auto rounded-full flex items-center justify-center text-sm ${selected ? 'bg-purple-600 text-white font-bold' : disabled ? 'text-gray-500 opacity-20' : 'text-gray-300 hover:bg-neutral-700'}`}>{day}</button>;
                                })}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* 時段選擇 */}
            <div>
                <label className="block text-sm font-medium text-gray-400 mb-4 uppercase tracking-wider">3. 選擇時段</label>
                <div className="flex flex-wrap gap-4">
                    {mockTimes.map((time) => (
                        <button 
                            key={time} 
                            onClick={() => setSelectedTime(time)} 
                            className={`py-3 px-8 rounded-lg font-bold transition-all duration-200 border text-lg flex-grow sm:flex-grow-0
                                ${selectedTime === time 
                                    ? 'bg-purple-600 text-white border-purple-600 shadow-lg scale-105 ring-2 ring-purple-400 ring-offset-2 ring-offset-neutral-800' 
                                    : 'bg-transparent text-gray-300 border-gray-600 hover:border-purple-500 hover:text-purple-400'}`}
                        >
                            {time}
                        </button>
                    ))}
                </div>
            </div>

            {/* 🔥 修改處：確認按鈕與錯誤訊息區塊 */}
            {/* 外層維持 items-end (讓整個區塊靠畫面右邊) */}
            {/* 內層改成 items-start (讓文字跟按鈕的左邊對齊) */}
            <div className="mt-10 flex flex-col items-end border-t border-gray-700 pt-6">
                <div className="flex flex-col items-start w-full md:w-auto">
                    <button 
                        onClick={handleConfirm} 
                        disabled={!selectedTime} 
                        className={`w-full md:w-auto font-bold py-4 px-12 rounded-full transition duration-300 text-xl shadow-lg flex items-center justify-center gap-2
                            ${selectedTime 
                                ? 'bg-purple-600 hover:bg-purple-700 text-white hover:shadow-purple-500/50 cursor-pointer transform hover:-translate-y-1' 
                                : 'bg-neutral-700 text-gray-500 cursor-not-allowed'}`}
                    >
                        前往購票
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
                    </button>
                    {/* 錯誤訊息會自動靠左對齊按鈕 */}
                    {!selectedTime && <p className="text-sm text-red-400 mt-2 animate-pulse">* 請先選擇時段</p>}
                </div>
            </div>
        </div>
      </section>

    </div>
  );
}

export default MovieDetailPage;