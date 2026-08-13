import React, { useContext } from 'react';
import AuthContext from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { Bell, Search, Menu, Sun, Moon } from 'lucide-react';

const TopNav = () => {
  const { userRole } = useContext(AuthContext);
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <header className="h-16 flex items-center justify-between px-6 border-b border-white/5 bg-background/50 backdrop-blur-sm z-10 sticky top-0">
      <div className="flex items-center flex-1">
        <button className="md:hidden p-2 -ml-2 mr-2 text-muted-foreground hover:text-white rounded-md">
          <Menu className="w-5 h-5" />
        </button>
        
        {/* Search removed as requested */}
      </div>

      <div className="flex items-center space-x-4">
        {/* Theme Toggle */}
        <button 
          onClick={toggleTheme}
          className="p-2 text-muted-foreground hover:text-white rounded-full hover:bg-white/5 transition-colors relative"
          title="Toggle Theme"
        >
          {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>

        {/* User Profile */}
        <div className="flex items-center space-x-3 pl-4 border-l border-white/10">
          <div className="flex flex-col items-end hidden sm:flex">
            <span className="text-sm font-medium leading-none">User</span>
            <span className="text-xs text-muted-foreground mt-1">{userRole || 'EMPLOYEE'}</span>
          </div>
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-indigo-600 flex items-center justify-center text-white text-sm font-bold shadow-md">
            U
          </div>
        </div>
      </div>
    </header>
  );
};

export default TopNav;
