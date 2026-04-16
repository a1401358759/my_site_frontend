import { Navigate, Route, Routes } from 'react-router-dom';
import HomePage from './pages/HomePage.jsx';
import ArticlePage from './pages/ArticlePage.jsx';
import ArchivePage from './pages/ArchivePage.jsx';
import LinksPage from './pages/LinksPage.jsx';
import AboutPage from './pages/AboutPage.jsx';

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/archive" element={<ArchivePage />} />
      <Route path="/links" element={<LinksPage />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/articles/:articleId" element={<ArticlePage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
