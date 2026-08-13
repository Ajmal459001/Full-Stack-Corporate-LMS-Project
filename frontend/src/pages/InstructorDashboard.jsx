import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Plus, X, Edit, Trash2, BookOpen, Clock, Image as ImageIcon, BarChart, Loader2, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { CustomSelect } from '../components/DashboardShared';

const staggerContainer = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.15, delayChildren: 0.1 } }
};

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

const InstructorDashboard = ({
  search, setSearch,
  category, setCategory,
  difficulty, setDifficulty,
  currentPage, setCurrentPage,
  totalPages,
  courses,
  showAddForm, setShowAddForm,
  editingCourseId, setEditingCourseId,
  handleSubmitCourse,
  newCourse, setNewCourse,
  isSubmitting, uploadStatus,
  handleEditClick, handleDeleteCourse
}) => {
  const navigate = useNavigate();
  const [openDropdown, setOpenDropdown] = useState(null);

  const handleCloseForm = () => {
    setShowAddForm(false);
    setEditingCourseId(null);
    setNewCourse({
      title: '',
      description: '',
      category: 'Frontend Web Development',
      difficulty: 'BEGINNER',
      price: '',
      validity_days: '',
      thumbnail: null
    });
  };

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

        <div className="flex flex-wrap items-center gap-4">
          <button
            onClick={() => navigate('/analytics')}
            className="!rounded-tl-2xl !rounded-br-2xl !rounded-tr-md !rounded-bl-md px-6 py-2.5 bg-[#FFFFFF] dark:bg-[#11161F] border border-gray-200 dark:border-white/10 text-foreground dark:text-slate-50 font-bold hover:border-gray-300 dark:hover:border-white/20 transition-colors flex items-center gap-2"
          >
            <BarChart className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            Analytics Dashboard
          </button>
          <button
            onClick={() => {
              if (showAddForm) {
                handleCloseForm();
              } else {
                handleCloseForm();
                setShowAddForm(true);
              }
            }}
            className="!rounded-tl-2xl !rounded-br-2xl !rounded-tr-md !rounded-bl-md px-6 py-2.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-blue-500 dark:from-[#4F46E5] dark:via-[#8B5CF6] dark:to-[#3B82F6] text-white font-bold transition-all hover:opacity-90 shadow-[0_0_30px_rgba(79,70,229,0.3)] hover:shadow-[0_0_40px_rgba(79,70,229,0.5)] flex items-center gap-2"
          >
            {showAddForm ? <X className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
            {showAddForm ? "Cancel Form" : "Create New Course"}
          </button>
        </div>
      </div>

      {/* Creation Form Modal/Inline */}
      <AnimatePresence>
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0, height: 0, y: -20 }}
            animate={{ opacity: 1, height: 'auto', y: 0 }}
            exit={{ opacity: 0, height: 0, y: -20 }}
            className="overflow-hidden"
          >
            <div className="bg-[#FFFFFF] dark:bg-[#151B26] rounded-[2rem] p-6 lg:p-8 mb-8 border border-gray-100 dark:border-white/10 shadow-lg relative">
              <button
                onClick={handleCloseForm}
                className="absolute top-6 right-6 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5 text-gray-500 dark:text-slate-400" />
              </button>

              <h2 className="text-2xl font-bold mb-8 flex items-center gap-3 border-b border-gray-100 dark:border-white/10 pb-4 text-foreground dark:text-slate-50">
                {editingCourseId ? <Edit className="w-6 h-6 text-yellow-500" /> : <Plus className="w-6 h-6 text-indigo-600 dark:text-[#8B5CF6]" />}
                {editingCourseId ? "Update Training Module" : "Publish New Module"}
              </h2>

              <form onSubmit={handleSubmitCourse} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="md:col-span-2 lg:col-span-2">
                    <label className="block text-sm font-semibold text-gray-500 dark:text-slate-400 mb-2">Course Title</label>
                    <input
                      type="text" required value={newCourse.title}
                      onChange={e => setNewCourse({ ...newCourse, title: e.target.value })}
                      className="w-full bg-[#F6F8FD] dark:bg-[#07090D] border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-foreground dark:text-slate-50 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                      placeholder="e.g. Advanced React Architecture"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-500 dark:text-slate-400 mb-2">Category</label>
                    <div className="relative">
                      <select
                        value={newCourse.category} onChange={e => setNewCourse({ ...newCourse, category: e.target.value })}
                        className="w-full bg-[#F6F8FD] dark:bg-[#07090D] border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-foreground dark:text-slate-50 outline-none appearance-none cursor-pointer focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="Frontend Web Development">Frontend Web Dev</option>
                        <option value="Backend Development">Backend Dev</option>
                        <option value="Data Science">Data Science</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-500 dark:text-slate-400 mb-2">Difficulty</label>
                    <select
                      value={newCourse.difficulty} onChange={e => setNewCourse({ ...newCourse, difficulty: e.target.value })}
                      className="w-full bg-[#F6F8FD] dark:bg-[#07090D] border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-foreground dark:text-slate-50 outline-none appearance-none cursor-pointer focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="BEGINNER">Beginner</option>
                      <option value="INTERMEDIATE">Intermediate</option>
                      <option value="ADVANCED">Advanced</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-500 dark:text-slate-400 mb-2">Price ($)</label>
                    <input
                      type="number" step="0.01" min="0" required value={newCourse.price}
                      onChange={e => setNewCourse({ ...newCourse, price: e.target.value })}
                      className="w-full bg-[#F6F8FD] dark:bg-[#07090D] border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-foreground dark:text-slate-50 outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-500 dark:text-slate-400 mb-2">Access (Days)</label>
                    <input
                      type="number" min="1" required value={newCourse.validity_days}
                      onChange={e => setNewCourse({ ...newCourse, validity_days: e.target.value })}
                      className="w-full bg-[#F6F8FD] dark:bg-[#07090D] border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-foreground dark:text-slate-50 outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="md:col-span-2 lg:col-span-2">
                    <label className="block text-sm font-semibold text-gray-500 dark:text-slate-400 mb-2">Course Thumbnail</label>
                    <div className="flex items-center gap-4 bg-[#F6F8FD] dark:bg-[#07090D] border border-gray-200 dark:border-white/10 rounded-xl px-4 py-2 border-dashed">
                      <ImageIcon className="w-6 h-6 text-gray-400 dark:text-slate-500" />
                      <input
                        type="file" accept="image/*"
                        onChange={e => setNewCourse({ ...newCourse, thumbnail: e.target.files[0] })}
                        className="w-full text-sm text-foreground dark:text-slate-50 file:mr-4 file:py-2.5 file:px-6 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-indigo-50 file:text-indigo-600 dark:file:bg-indigo-500/15 dark:file:text-indigo-400 cursor-pointer transition-colors"
                      />
                    </div>
                  </div>

                  <div className="md:col-span-4 lg:col-span-4">
                    <label className="block text-sm font-semibold text-gray-500 dark:text-slate-400 mb-2">Description</label>
                    <textarea
                      rows={3} required value={newCourse.description}
                      onChange={e => setNewCourse({ ...newCourse, description: e.target.value })}
                      className="w-full bg-[#F6F8FD] dark:bg-[#07090D] border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-foreground dark:text-slate-50 outline-none resize-none focus:ring-2 focus:ring-indigo-500 transition-all"
                      placeholder="Describe what the students will learn..."
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-6 border-t border-gray-100 dark:border-white/10 mt-8 gap-4">
                  <button
                    type="button"
                    onClick={handleCloseForm}
                    className="!rounded-tl-2xl !rounded-br-2xl !rounded-tr-md !rounded-bl-md px-6 py-2.5 bg-gray-100 hover:bg-gray-200 dark:bg-white/5 dark:hover:bg-white/10 text-foreground dark:text-slate-50 font-bold transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit" disabled={isSubmitting}
                    className="flex items-center gap-2 !rounded-tl-2xl !rounded-br-2xl !rounded-tr-md !rounded-bl-md px-8 py-3 bg-gradient-to-r from-indigo-500 via-purple-500 to-blue-500 dark:from-[#4F46E5] dark:via-[#8B5CF6] dark:to-[#3B82F6] text-white font-bold transition-all shadow-[0_0_30px_rgba(79,70,229,0.3)] hover:shadow-[0_0_40px_rgba(79,70,229,0.5)] disabled:opacity-50"
                  >
                    {isSubmitting && <Loader2 className="w-5 h-5 animate-spin" />}
                    {isSubmitting ? (uploadStatus || 'Processing...') : (editingCourseId ? "Save Changes" : "Commit & Publish")}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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
            return (
              <motion.div
                key={course.id}
                variants={fadeUp}
                whileHover={{ y: -4, boxShadow: "0 20px 25px -5px rgba(0,0,0,0.05), 0 8px 10px -6px rgba(0,0,0,0.01)" }}
                className="bg-[#FFFFFF] dark:bg-[#11161F] flex flex-col overflow-hidden relative shadow-sm border border-gray-100 dark:border-white/10 transition-all duration-300 rounded-[2rem]"
              >
                {/* Image Area */}
                <div className="relative h-56 overflow-hidden bg-gray-100 dark:bg-black/40 border-b border-gray-100 dark:border-white/10">
                  {course.thumbnail ? (
                    <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover transition-transform duration-700 hover:scale-105" />
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

                  <div className="absolute top-4 right-4 flex gap-2 transition-opacity duration-200 z-10">
                    <button
                      onClick={() => handleEditClick(course)}
                      className="w-9 h-9 flex items-center justify-center !rounded-tl-xl !rounded-br-xl !rounded-tr-sm !rounded-bl-sm bg-black/40 backdrop-blur-md text-white hover:bg-gradient-to-r hover:from-indigo-500 hover:via-purple-500 hover:to-blue-500 transition-all shadow-sm"
                      title="Edit Course"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteCourse(course.id)}
                      className="w-9 h-9 flex items-center justify-center !rounded-tl-xl !rounded-br-xl !rounded-tr-sm !rounded-bl-sm bg-black/40 backdrop-blur-md text-white hover:bg-gradient-to-r hover:from-red-500 hover:to-orange-500 transition-all shadow-sm"
                      title="Delete Course"
                    >
                      <Trash2 className="w-4 h-4" />
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
                  <div className="flex items-center justify-between mb-8">
                    <span className="text-sm text-gray-500 dark:text-slate-400 font-medium flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-gray-400 dark:text-slate-500" />
                      {course.validity_days} Days Access
                    </span>
                    <span className="text-xs font-bold px-3 py-1 rounded-md bg-gray-100 text-gray-600 dark:bg-white/5 dark:text-slate-300 border border-gray-200 dark:border-white/10 uppercase tracking-wider">
                      {course.difficulty}
                    </span>
                  </div>

                  <button
                    onClick={() => navigate(`/manage/course/${course.id}`)}
                    className="w-full flex items-center justify-center gap-2 !rounded-tl-2xl !rounded-br-2xl !rounded-tr-md !rounded-bl-md py-3 bg-gradient-to-r from-indigo-500 via-purple-500 to-blue-500 dark:from-[#4F46E5] dark:via-[#8B5CF6] dark:to-[#3B82F6] text-white font-bold text-sm transition-all hover:opacity-90 shadow-[0_0_30px_rgba(79,70,229,0.2)] hover:shadow-[0_0_40px_rgba(79,70,229,0.4)] mt-auto uppercase tracking-wide"
                  >
                    Manage Modules
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

export default InstructorDashboard;