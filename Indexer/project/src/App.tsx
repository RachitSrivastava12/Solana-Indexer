import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { Analytics } from '@vercel/analytics/react';
import { PhantomWalletProvider } from './contexts/PhantomWalletContext';
import { UserDataProvider } from './contexts/UserDataContext';
import { ThemeProvider } from './contexts/ThemeContext';
import Layout from './components/Layout';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import SetupWizard from './pages/SetupWizard';
import NotFound from './pages/NotFound';
import './index.css';

function App() {
  return (
    <ThemeProvider>
      <PhantomWalletProvider>
        <UserDataProvider>
          <Router>
            <Routes>
              <Route path="/" element={<Layout />}>
                <Route path="/" element={<Home />} />
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="setup" element={<SetupWizard />} />
                <Route path="*" element={<NotFound />} />
              </Route>
            </Routes>
            {process.env.NODE_ENV === 'production' && <Analytics />}
          </Router>
        </UserDataProvider>
      </PhantomWalletProvider>
    </ThemeProvider>
  );
}

export default App;