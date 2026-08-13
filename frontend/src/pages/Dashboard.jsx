import React, { useState, useEffect, useCallback, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import InstructorDashboard from './InstructorDashboard';
import EmployeeDashboard from './EmployeeDashboard';

const Dashboard = () => {
  const navigate = useNavigate();
  const { logoutUser } = useContext(AuthContext);

  const [courses, setCourses] = useState([]);
  const [statsMap, setStatsMap] = useState({});
  const [userProfile, setUserProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [showAddForm, setShowAddForm] = useState(false);
  const [editingCourseId, setEditingCourseId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('');

  const [newCourse, setNewCourse] = useState({
    title: '',
    description: '',
    category: 'Frontend Web Development',
    difficulty: 'BEGINNER',
    price: 49.99,
    validity_days: 30,
    thumbnail: null
  });

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const res = await api.get('/api/auth/user/');
        setUserProfile(res.data);
      } catch (err) {
        console.error("Failed to load user profile");
      }
    };
    fetchUserProfile();
  }, []);

  const fetchCourses = useCallback(async () => {
    try {
      const queryParams = {
        page: currentPage,
        _t: new Date().getTime()
      };

      if (search) queryParams.search = search;
      if (category) queryParams.category = category;
      if (difficulty) queryParams.difficulty = difficulty;

      const res = await api.get('/api/courses/my_workspace/', { params: queryParams });

      let loadedCourses = [];
      if (res.data && res.data.results) {
        loadedCourses = res.data.results;
        const PAGE_SIZE = 6;
        setTotalPages(Math.ceil(res.data.count / PAGE_SIZE));
      } else if (Array.isArray(res.data)) {
        loadedCourses = res.data;
        setTotalPages(1);
      }

      setCourses(loadedCourses);
      setIsLoading(false);

      if (userProfile?.role?.toUpperCase() === 'EMPLOYEE') {
        const newStatsMap = {};
        await Promise.all(loadedCourses.map(async (c) => {
          try {
            const statRes = await api.get(`/api/courses/stats/${c.id}/`);
            newStatsMap[c.id] = {
              progress: statRes.data.percentage,
              days_remaining: statRes.data.days_remaining,
              is_expiring_soon: statRes.data.is_expiring_soon
            };
          } catch (e) {
            newStatsMap[c.id] = { progress: 0, days_remaining: 0, is_expiring_soon: false };
          }
        }));
        setStatsMap(newStatsMap);
      }

    } catch (err) {
      console.error("Failed to load courses.", err);
      toast.error("Failed to load courses");
      setIsLoading(false);
    }
  }, [search, category, difficulty, currentPage, userProfile]);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  const uploadMediaToCloudinary = async (file) => {
    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
    if (!cloudName || !uploadPreset) throw new Error("Cloudinary Environment Variables are missing in .env!");

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', uploadPreset);

    const res = await axios.post(`https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`, formData);
    return res.data.secure_url;
  };

  const handleSubmitCourse = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const coursePayload = {
        title: newCourse.title,
        description: newCourse.description,
        category: newCourse.category,
        difficulty: newCourse.difficulty,
        price: newCourse.price,
        validity_days: newCourse.validity_days,
      };

      if (newCourse.thumbnail && typeof newCourse.thumbnail !== 'string') {
        setUploadStatus('Uploading image to Cloudinary...');
        const secureUrl = await uploadMediaToCloudinary(newCourse.thumbnail);
        coursePayload.thumbnail = secureUrl;
      } else if (typeof newCourse.thumbnail === 'string') {
        coursePayload.thumbnail = newCourse.thumbnail;
      }

      setUploadStatus('Saving course...');

      if (editingCourseId) {
        await api.patch(`/api/courses/${editingCourseId}/`, coursePayload);
        toast.success("Course updated successfully");
        setNewCourse({ title: '', description: '', category: 'Frontend Web Development', difficulty: 'BEGINNER', price: 49.99, validity_days: 30, thumbnail: null });
        setEditingCourseId(null);
        setShowAddForm(false);
        fetchCourses();
      } else {
        const res = await api.post('/api/courses/', coursePayload);
        toast.success("Course created successfully");
        navigate(`/manage/course/${res.data.id}`);
      }
    } catch (err) {
      toast.error(err.message || "Failed to save the course module.");
    } finally {
      setIsSubmitting(false);
      setUploadStatus('');
    }
  };

  const handleEditClick = (course) => {
    setNewCourse({
      title: course.title,
      description: course.description,
      category: course.category,
      difficulty: course.difficulty,
      price: course.price || 49.99,
      validity_days: course.validity_days || 30,
      thumbnail: course.thumbnail
    });
    setEditingCourseId(course.id);
    setShowAddForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteCourse = async (courseId) => {
    if (!window.confirm("Are you absolutely sure you want to delete this course? This action cannot be undone.")) return;
    try {
      await api.delete(`/api/courses/${courseId}/`);
      setCourses(courses.filter(c => c.id !== courseId));
      toast.success("Course deleted successfully");
    } catch (err) {
      toast.error("Failed to delete the course.");
    }
  };

  const handleUnsubscribe = async (courseId) => {
    if (!window.confirm("Are you sure you want to drop this course?")) return;
    try {
      await api.delete(`/api/courses/${courseId}/unenroll/`);
      setCourses(courses.filter(c => c.id !== courseId));
      toast.success("Unenrolled successfully");
    } catch (err) {
      toast.error("Failed to unsubscribe.");
    }
  };

  const isAdminOrInstructor = userProfile && ['ADMIN', 'INSTRUCTOR'].includes(userProfile.role?.toUpperCase());

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Loader2 className="w-12 h-12 animate-spin text-blue-500 dark:text-[#8B5CF6]" />
      </div>
    );
  }

  const sharedProps = {
    search, setSearch,
    category, setCategory,
    difficulty, setDifficulty,
    currentPage, setCurrentPage,
    totalPages,
    courses
  };

  if (isAdminOrInstructor) {
    return (
      <InstructorDashboard
        {...sharedProps}
        showAddForm={showAddForm} setShowAddForm={setShowAddForm}
        editingCourseId={editingCourseId} setEditingCourseId={setEditingCourseId}
        handleSubmitCourse={handleSubmitCourse}
        newCourse={newCourse} setNewCourse={setNewCourse}
        isSubmitting={isSubmitting} uploadStatus={uploadStatus}
        handleEditClick={handleEditClick} handleDeleteCourse={handleDeleteCourse}
      />
    );
  }

  return (
    <EmployeeDashboard
      {...sharedProps}
      statsMap={statsMap}
      handleUnsubscribe={handleUnsubscribe}
    />
  );
};

export default Dashboard;