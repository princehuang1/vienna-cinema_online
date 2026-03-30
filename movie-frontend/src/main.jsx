import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx' // <--- 就是這行不見了！
import { HashRouter } from 'react-router-dom'
import './index.css' // 你的全域樣式

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <HashRouter>
      <App />
    </HashRouter>
  </React.StrictMode>,
)