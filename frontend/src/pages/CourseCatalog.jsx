import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Loader2, BookOpen, Star, User, ArrowRight, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';

const CourseCatalog = () => {
  const [courses, setCourses] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  const [selectedCourse, setSelectedCourse] = useState(null);
  
  const navigate = useNavigate();

  useEffect(() => {
    fetchCourses(searchQuery, currentPage);
  }, [currentPage]); 

  const fetchCourses = async (search = '', page = 1) => {
    setIsLoading(true);
    try {
      const url = `/api/courses/?search=${search}&page=${page}`;
      const res = await api.get(url);

      if (res.data && res.data.results) {
        setCourses(res.data.results);
        const PAGE_SIZE = 6; 
        setTotalPages(Math.ceil(res.data.count / PAGE_SIZE));
      } else {
        setCourses(Array.isArray(res.data) ? res.data : []);
        setTotalPages(1);
      }
    } catch (error) {
      console.error("Failed to load catalog:", error);
      toast.error("Failed to load course catalog");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1); 
    fetchCourses(searchQuery, 1);
  };

  return (
    <div className="space-y-8 pb-10">
      {/* Header Area */}
      <div className="text-center max-w-2xl mx-auto pt-4 pb-8">
        <h1 className="text-4xl font-extrabold tracking-tight mb-4">Corporate Learning Catalog</h1>
        <p className="text-lg text-muted-foreground mb-8">Browse and enroll in high-fidelity training modules to upskill your career path.</p>

        <form onSubmit={handleSearch} className="relative max-w-xl mx-auto flex items-center">
          <Search className="w-5 h-5 absolute left-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search courses by title, category, or instructor..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#F6F8FD] dark:bg-[#151B26] border border-gray-200 dark:border-white/10 rounded-full py-4 pl-12 pr-32 text-foreground dark:text-slate-50 placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all shadow-sm"
          />
          <button 
            type="submit" 
            className="absolute right-2 px-6 py-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-blue-500 hover:opacity-90 text-white !rounded-tl-2xl !rounded-br-2xl !rounded-tr-md !rounded-bl-md font-bold transition-all shadow-sm"
          >
            Search
          </button>
        </form>
      </div>

      {/* Loading State */}
      {isLoading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
        </div>
      ) : courses.length === 0 ? (
        /* Empty State */
        <div className="text-center py-20 border border-dashed border-gray-200 dark:border-white/10 rounded-2xl bg-[#FFFFFF] dark:bg-[#11161F] max-w-3xl mx-auto shadow-sm">
          <BookOpen className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold text-foreground dark:text-slate-50 mb-2">No modules found</h3>
          <p className="text-muted-foreground">Try adjusting your search criteria to find relevant courses.</p>
        </div>
      ) : (
        /* Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course, idx) => (
            <motion.div
              key={course.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="bg-[#FFFFFF] dark:bg-[#11161F] border border-gray-100 dark:border-white/5 rounded-2xl shadow-sm hover:shadow-xl hover:border-gray-200 dark:hover:border-white/10 flex flex-col overflow-hidden group transition-all"
            >
              <div className="relative h-48 overflow-hidden bg-black/40">
                {course.thumbnail ? (
                  <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-primary/50 font-bold tracking-widest text-xl">SKILLSTREAM</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                
                <div className="absolute top-4 left-4">
                  <span className="px-3 py-1.5 rounded-full bg-indigo-50 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-400 text-xs font-bold backdrop-blur-md shadow-sm">
                    {course.category}
                  </span>
                </div>
                
                <div className="absolute top-4 right-4">
                  <button 
                    onClick={() => setSelectedCourse(course)}
                    className="flex items-center gap-1.5 px-3 py-1.5 !rounded-tl-xl !rounded-br-xl !rounded-tr-sm !rounded-bl-sm bg-black/40 backdrop-blur-md text-xs font-bold text-white hover:bg-gradient-to-r hover:from-indigo-500 hover:via-purple-500 hover:to-blue-500 transition-all shadow-sm"
                  >
                    <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                    {course.average_rating > 0 ? course.average_rating : 'New'} ({course.reviews?.length || 0})
                  </button>
                </div>
              </div>

              <div className="p-5 flex flex-col flex-1">
                <h3 className="text-xl font-bold text-foreground dark:text-slate-50 line-clamp-1 mb-2">{course.title}</h3>
                <p className="text-sm text-muted-foreground line-clamp-2 mb-4 flex-grow">{course.description}</p>
                
                <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100 dark:border-white/5">
                  <span className="text-xs font-medium flex items-center gap-2 text-muted-foreground">
                    <User className="w-4 h-4 text-gray-400 dark:text-slate-500" />
                    By {course.instructor_username}
                  </span>
                  <button 
                    onClick={() => navigate(`/checkout/${course.id}`)}
                    className="flex items-center gap-2 px-4 py-2 !rounded-tl-xl !rounded-br-xl !rounded-tr-sm !rounded-bl-sm bg-gradient-to-r from-indigo-500 via-purple-500 to-blue-500 text-white text-sm font-bold hover:opacity-90 transition-all shadow-sm"
                  >
                    Enroll Now <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-12">
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
              className={`w-10 h-10 flex items-center justify-center rounded-xl text-sm font-bold transition-colors ${
                currentPage === i + 1 
                  ? 'bg-gradient-to-r from-indigo-500 via-purple-500 to-blue-500 text-white shadow-sm' 
                  : 'text-foreground dark:text-slate-50 hover:bg-gray-50 dark:hover:bg-white/5 border border-gray-200 dark:border-white/10'
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

      {/* Reviews Modal */}
      <AnimatePresence>
        {selectedCourse && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#FFFFFF] dark:bg-[#11161F] w-full max-w-lg rounded-2xl border border-gray-200 dark:border-white/10 overflow-hidden shadow-2xl flex flex-col max-h-[80vh]"
            >
              <div className="p-5 border-b border-gray-100 dark:border-white/5 flex justify-between items-center bg-[#F6F8FD] dark:bg-[#07090D]">
                <h3 className="text-lg font-bold text-foreground dark:text-slate-50">Reviews for {selectedCourse.title}</h3>
                <button onClick={() => setSelectedCourse(null)} className="p-1 rounded-md text-muted-foreground hover:text-foreground dark:hover:text-slate-50 hover:bg-gray-200 dark:hover:bg-white/10 transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="p-5 overflow-y-auto flex-1">
                {selectedCourse.reviews?.length > 0 ? (
                  <div className="space-y-4">
                    {selectedCourse.reviews.map(r => (
                      <div key={r.id} className="p-4 rounded-xl bg-[#F6F8FD] dark:bg-[#07090D] border border-gray-100 dark:border-white/5">
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-bold text-indigo-600 dark:text-indigo-400 text-sm">{r.username}</span>
                          <span className="flex items-center gap-1 text-xs font-bold text-yellow-400">
                            {r.rating} <Star className="w-3.5 h-3.5 fill-yellow-400" />
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">{r.comment}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10">
                    <Star className="w-10 h-10 mx-auto text-muted-foreground opacity-50 mb-3" />
                    <p className="text-muted-foreground">No community feedback yet for this course.</p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CourseCatalog;