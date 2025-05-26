import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './Navbar';

import { usePhantomWallet } from '../contexts/PhantomWalletContext';

const Layout: React.FC = () => {
  const location = useLocation();
  const { connected } = usePhantomWallet();
  
  const showNavbar = connected || location.pathname !== '/';
  
  return (
    <div className="flex flex-col min-h-screen bg-purple-950">
      {showNavbar && <Navbar />}
      <main className="flex-grow">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;