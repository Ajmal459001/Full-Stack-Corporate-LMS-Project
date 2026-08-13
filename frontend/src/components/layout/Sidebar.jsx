import React, { useContext } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import AuthContext from '../../context/AuthContext';
import { 
  LayoutDashboard, 
  BookOpen, 
  GraduationCap, 
  Settings, 
  LogOut, 
  Library,
  BarChart3,
  Users
} from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Helper for shadcn-style dynamic class merging
function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const Sidebar = () => {
  const { userRole, logoutUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logoutUser();
    navigate('/login');
  };

  const role = userRole || 'EMPLOYEE';

  const employeeLinks = [
    { name: 'My Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Course Catalog', path: '/catalog', icon: Library },
  ];

  const instructorLinks = [
    { name: 'Instructor Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Analytics', path: '/analytics', icon: BarChart3 },
  ];

  const adminLinks = [
    { name: 'Admin Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Manage Courses', path: '/catalog', icon: BookOpen },
    { name: 'Manage Users', path: '/admin/users', icon: Users },
    { name: 'Analytics', path: '/analytics', icon: BarChart3 },
  ];

  let navLinks = employeeLinks;
  if (role === 'INSTRUCTOR') navLinks = instructorLinks;
  if (role === 'ADMIN') navLinks = adminLinks;

  return (
    <aside className="w-60 flex-shrink-0 hidden md:flex flex-col border-r border-gray-100 dark:border-white/10 bg-[#FFFFFF] dark:bg-[#090C12] z-10 h-full relative">
      <div className="p-5 flex items-center space-x-3 mb-2">
        <img src="/skillstream-logo.png" alt="SkillStream Logo" className="h-8 w-auto drop-shadow-md" />
        <span className="font-extrabold text-xl tracking-tight text-foreground dark:text-slate-50">SkillStream</span>
      </div>

      <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
        {navLinks.map((link) => (
          <NavLink
            key={link.name}
            to={link.path}
            className={({ isActive }) =>
              cn(
                "flex items-center space-x-3 px-4 py-2.5 rounded-full text-sm font-bold no-underline transition-all duration-200",
                isActive 
                  ? "bg-gradient-to-r from-gray-100 to-transparent dark:from-white/5 dark:to-transparent text-blue-600 dark:text-blue-400" 
                  : "text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-slate-50 hover:bg-gray-100 dark:hover:bg-white/5"
              )
            }
            style={{ textDecoration: 'none' }}
          >
            <link.icon className="w-4 h-4" />
            <span>{link.name}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-3 border-t border-gray-100 dark:border-white/10 space-y-1">
        <button 
          onClick={handleLogout}
          className="flex w-full items-center space-x-3 px-4 py-2.5 rounded-full text-sm font-bold no-underline text-red-500 dark:text-red-400 hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-500/10 transition-all duration-200"
        >
          <LogOut className="w-4 h-4" />
          <span>Log out</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
