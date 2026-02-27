import React, { lazy, Suspense } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ToastProvider } from './components/ui/Toast';
import App from './App';

// Lazy load heavy routes for better performance
const Admin = lazy(() => import('./pages/Admin'));
const ListingDetailPage = lazy(() => import('./pages/ListingDetailPage'));

// Loading component for Suspense fallback
const PageLoader = () => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
      <p className="text-gray-600">Loading...</p>
    </div>
  </div>
);

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <ToastProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<App />} />
          <Route
            path="/admin"
            element={
              <Suspense fallback={<PageLoader />}>
                <Admin />
              </Suspense>
            }
          />
          <Route
            path="/listing/:id"
            element={
              <Suspense fallback={<PageLoader />}>
                <ListingDetailPage />
              </Suspense>
            }
          />
        </Routes>
      </BrowserRouter>
    </ToastProvider>
  </React.StrictMode>
);
