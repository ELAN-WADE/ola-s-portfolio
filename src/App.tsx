import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { CMSProvider } from './context/CMSContext';
import { HomePage } from './pages/HomePage';
import { BrandProjectDetailPage } from './pages/BrandProjectDetailPage';
import { TechnicalAnalysisCategoryPage } from './pages/TechnicalAnalysisCategoryPage';
import { TradeRecordDetailPage } from './pages/TradeRecordDetailPage';
import { AdminCMSPage } from './pages/AdminCMSPage';

export const App: React.FC = () => {
  return (
    <CMSProvider>
      <BrowserRouter>
        <Routes>
          {/* Main Homepage with Restructured Hero and Streamlined Previews */}
          <Route path="/" element={<HomePage />} />

          {/* Dedicated Brand Design Project Routes */}
          <Route
            path="/portfolio/brand-design/:slug"
            element={<BrandProjectDetailPage />}
          />

          {/* Video Editing uses inline 4-column clickable video grids (no detail pages) */}
          <Route
            path="/portfolio/video-editing/*"
            element={<Navigate to="/#video-editing" replace />}
          />

          {/* Dedicated Technical Analysis Category & Trade Record Routes */}
          <Route
            path="/portfolio/technical-analysis/:slug"
            element={<TechnicalAnalysisCategoryPage />}
          />
          <Route
            path="/portfolio/technical-analysis/:slug/:tradeId"
            element={<TradeRecordDetailPage />}
          />

          {/* Secure Drag-and-Drop Visual Editorial CMS */}
          <Route path="/admin" element={<AdminCMSPage />} />
          <Route path="/cms" element={<Navigate to="/admin" replace />} />

          {/* Catch-all redirect to Home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </CMSProvider>
  );
};

export default App;
