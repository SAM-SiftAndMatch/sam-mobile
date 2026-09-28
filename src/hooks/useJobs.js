import { useApp } from '../context/AppContext';

export const useJobs = () => {
  const {
    jobs,
    loading,
    error,
    refreshJobs,
    postJob,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
  } = useApp();

  return {
    jobs,
    loading,
    error,
    refreshJobs,
    postJob,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
  };
};

export default useJobs;
