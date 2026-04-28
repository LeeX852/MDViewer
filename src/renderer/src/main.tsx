import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import 'katex/dist/katex.min.css'
import './styles/global.css'
import './styles/editor.css'
import './styles/sidebar.css'
import './styles/menubar.css'
import './styles/git-panel.css'
import './styles/search-panel.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
