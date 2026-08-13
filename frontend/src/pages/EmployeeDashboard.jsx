import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Search, BookOpen, Clock, CheckCircle2, ArrowRight, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { CustomSelect } from '../components/DashboardShared';

const staggerContainer = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.15, delayChildren: 0.1 } }
};

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

const EmployeeDashboard = ({
  search, setSearch,
  category, setCategory,
  difficulty, setDifficulty,
  currentPage, setCurrentPage,
  totalPages,
  courses,
  statsMap,
  handleUnsubscribe
}) => {
  const navigate = useNavigate();
  const [openDropdown, setOpenDropdown] = useState(null);

  useEffect(() => {
    const handleClickOutside = () => setOpenDropdown(null);
    if (openDropdown) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [openDropdown]);

  return (
    <div className="space-y-8 pb-10 relative">
      {/* Background Cinematic Glow */}
      <div className="absolute right-0 top-0 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[100px] pointer-events-none -z-10" />
      <div className="absolute left-0 bottom-0 w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-[100px] pointer-events-none -z-10" />

      {/* Header Area */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-foreground dark:text-slate-50">Your Workspace</h1>
          <p className="text-gray-500 dark:text-slate-400 mt-2 text-lg">Manage and track your learning progress seamlessly.</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-[#FFFFFF] dark:bg-[#11161F] p-2 rounded-2xl flex flex-col md:flex-row gap-2 border border-gray-100 dark:border-white/10 shadow-sm relative z-50">
        <div className="relative flex-1">
          <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500" />
          <input
            type="text" placeholder="Search your courses..." value={search}
            onChange={e => { setSearch(e.target.value); setCurrentPage(1); }}
            className="w-full bg-transparent border-none pl-12 pr-4 py-3 text-foreground dark:text-slate-50 focus:outline-none focus:ring-0 placeholder:text-gray-400 dark:placeholder:text-slate-500"
          />
        </div>
        <div className="w-px bg-gray-200 dark:bg-white/10 hidden md:block my-2"></div>
        <CustomSelect
          value={category}
          onChange={(val) => { setCategory(val); setCurrentPage(1); }}
          isOpen={openDropdown === 'category'}
          onToggle={() => setOpenDropdown(openDropdown === 'category' ? null : 'category')}
          placeholder="All Categories"
          options={[
            { label: "All Categories", value: "" },
            { label: "Frontend Development", value: "Frontend Development" },
            { label: "Backend Development", value: "Backend Development" }
          ]}
        />
        <div className="w-px bg-gray-200 dark:bg-white/10 hidden md:block my-2"></div>
        <CustomSelect
          value={difficulty}
          onChange={(val) => { setDifficulty(val); setCurrentPage(1); }}
          isOpen={openDropdown === 'difficulty'}
          onToggle={() => setOpenDropdown(openDropdown === 'difficulty' ? null : 'difficulty')}
          placeholder="All Levels"
          options={[
            { label: "All Levels", value: "" },
            { label: "Beginner", value: "BEGINNER" },
            { label: "Intermediate", value: "INTERMEDIATE" },
            { label: "Advanced", value: "ADVANCED" }
          ]}
        />
      </div>

      {/* Grid */}
      {courses.length === 0 ? (
        <div className="text-center py-24 border border-dashed border-gray-200 dark:border-white/10 rounded-[2rem] bg-[#FFFFFF] dark:bg-[#11161F] max-w-3xl mx-auto shadow-sm">
          <div className="w-20 h-20 rounded-full bg-gray-50 dark:bg-white/5 flex items-center justify-center mx-auto mb-6">
            <BookOpen className="w-10 h-10 text-gray-400 dark:text-slate-500" />
          </div>
          <h3 className="text-2xl font-bold text-foreground dark:text-slate-50 mb-3">No modules found</h3>
          <p className="text-gray-500 dark:text-slate-400 text-lg">Adjust your filters or enroll in new courses from the catalog.</p>
        </div>
      ) : (
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {courses.map((course) => {
            const stat = statsMap[course.id];
            return (
              <motion.div
                key={course.id}
                variants={fadeUp}
                whileHover={{ y: -4, boxShadow: "0 20px 25px -5px rgba(0,0,0,0.05), 0 8px 10px -6px rgba(0,0,0,0.01)" }}
                className="bg-[#FFFFFF] dark:bg-[#11161F] group flex flex-col overflow-hidden relative shadow-sm hover:border-gray-300 dark:hover:border-white/20 border border-gray-100 dark:border-white/10 transition-all duration-300 rounded-[2rem]"
              >
                {/* Image Area */}
                <div className="relative h-56 overflow-hidden bg-gray-100 dark:bg-black/40 border-b border-gray-100 dark:border-white/10">
                  {course.thumbnail ? (
                    <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-gray-300 dark:text-white/10 font-black tracking-widest text-2xl">SKILLSTREAM</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-80"></div>

                  <div className="absolute top-6 left-6 flex gap-2">
                    <span className="px-4 py-1.5 rounded-full bg-indigo-50 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-400 text-xs font-bold backdrop-blur-md">
                      {course.category}
                    </span>
                  </div>

                  <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleUnsubscribe(course.id)}
                      className="w-10 h-10 rounded-full bg-[#FFFFFF] dark:bg-[#151B26] flex items-center justify-center text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/20 transition-all border border-gray-200 dark:border-white/10 shadow-sm"
                      title="Drop Course"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="absolute bottom-6 left-6 right-6">
                    <h3 className="text-xl font-extrabold text-white line-clamp-2 leading-tight">
                      {course.title}
                    </h3>
                  </div>
                </div>

                {/* Content Area */}
                <div className="p-8 flex flex-col flex-1">
                  <div className="flex items-center justify-between mb-6">
                    <span className="text-sm text-gray-500 dark:text-slate-400 font-medium flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-gray-400 dark:text-slate-500" />
                      {course.validity_days} Days Access
                    </span>
                    <span className="text-xs font-bold px-3 py-1 rounded-md bg-gray-100 text-gray-600 dark:bg-white/5 dark:text-slate-300 border border-gray-200 dark:border-white/10 uppercase tracking-wider">
                      {course.difficulty}
                    </span>
                  </div>

                  {stat && (
                    <div className="bg-[#F6F8FD] dark:bg-[#151B26] rounded-xl p-3 border border-gray-100 dark:border-white/5 mb-5">
                      <div className="flex justify-between items-center mb-2">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wide ${stat.is_expiring_soon ? 'bg-red-50 text-red-600 dark:bg-red-500/15 dark:text-red-400' : 'bg-indigo-50 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-400'}`}>
                          {stat.is_expiring_soon ? 'Expiring Soon' : `${stat.days_remaining} Days Left`}
                        </span>
                        <span className="text-xs font-black text-foreground dark:text-slate-50 flex items-center gap-1.5">
                          {stat.progress === 100 && <CheckCircle2 className="w-3.5 h-3.5 text-indigo-500" />}
                          {stat.progress}%
                        </span>
                      </div>
                      <div className="h-1.5 w-full bg-gray-200 dark:bg-white/10 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${stat.progress}%` }}
                          transition={{ duration: 1.2, ease: "easeOut" }}
                          className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-blue-500 dark:from-[#4F46E5] dark:via-[#8B5CF6] dark:to-[#3B82F6]"
                        />
                      </div>
                    </div>
                  )}

                  <button
                    onClick={() => navigate(`/course/${course.id}`)}
                    className="w-full flex items-center justify-center gap-2 !rounded-tl-2xl !rounded-br-2xl !rounded-tr-md !rounded-bl-md py-3 bg-gradient-to-r from-indigo-500 via-purple-500 to-blue-500 dark:from-[#4F46E5] dark:via-[#8B5CF6] dark:to-[#3B82F6] text-white font-bold text-sm transition-all hover:opacity-90 shadow-[0_0_30px_rgba(79,70,229,0.2)] hover:shadow-[0_0_40px_rgba(79,70,229,0.4)] mt-auto uppercase tracking-wide"
                  >
                    Resume Learning
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-3 mt-12">
          <button
            onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
            disabled={currentPage === 1}
            className="w-10 h-10 flex items-center justify-center rounded-xl border border-gray-200 dark:border-white/10 text-foreground dark:text-slate-50 disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          {[...Array(totalPages)].map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentPage(i + 1)}
              className={`w-10 h-10 flex items-center justify-center rounded-xl text-sm font-bold transition-all ${currentPage === i + 1
                ? 'bg-gradient-to-r from-indigo-500 via-purple-500 to-blue-500 text-white shadow-md scale-105'
                : 'text-foreground dark:text-slate-50 hover:bg-gray-100 dark:hover:bg-white/10 border border-transparent'
                }`}
            >
              {i + 1}
            </button>
          ))}
          <button
            onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="w-10 h-10 flex items-center justify-center rounded-xl border border-gray-200 dark:border-white/10 text-foreground dark:text-slate-50 disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
};

export default EmployeeDashboard;