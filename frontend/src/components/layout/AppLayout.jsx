import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopNav from './TopNav';
import { motion } from 'motion/react';

const AppLayout = () => {
  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      {/* Fixed Sidebar */}
      <Sidebar />
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <TopNav />
        
        {/* Animated Page Content */}
        <motion.main 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="flex-1 overflow-y-auto p-6 md:p-8"
        >
          <div className="mx-auto max-w-7xl">
            <Outlet />
          </div>
        </motion.main>
      </div>
    </div>
  );
};

export default AppLayout;
