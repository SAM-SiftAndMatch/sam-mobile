import { useApp } from '../context/AppContext';

export const useApplications = () => {
  const {
    applications,
    loading,
    error,
    submitApplication,
    changeAppStatus,
    fetchUserApplications,
  } = useApp();

  return {
    applications,
    loading,
    error,
    submitApplication,
    changeAppStatus,
    fetchUserApplications,
  };
};

export default useApplications;
