import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { loginUser, registerUser, updateUser } from '../services/mockService';
import { mockUsers } from '../data/users';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // Default to first freelancer user for easy prototype preview
  const [user, setUser] = useState(mockUsers[0]);
  const [role, setRole] = useState(mockUsers[0].role);
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState(null);

  useEffect(() => {
    loadStoredAuth();
  }, []);

  const loadStoredAuth = async () => {
    try {
      const storedUser = await AsyncStorage.getItem('user_session');
      if (storedUser) {
        const parsed = JSON.parse(storedUser);
        setUser(parsed);
        setRole(parsed.role || 'freelancer');
      }
    } catch (e) {
      console.log('Error loading auth session from storage:', e);
    }
  };

  const login = async (email, password) => {
    setIsLoading(true);
    setAuthError(null);
    try {
      const loggedUser = await loginUser(email, password);
      setUser(loggedUser);
      setRole(loggedUser.role);
      await AsyncStorage.setItem('user_session', JSON.stringify(loggedUser));
      setIsLoading(false);
      return loggedUser;
    } catch (err) {
      setIsLoading(false);
      setAuthError(err.message || 'Login failed');
      throw err;
    }
  };

  const register = async (userData) => {
    setIsLoading(true);
    setAuthError(null);
    try {
      const newUser = await registerUser(userData);
      setUser(newUser);
      setRole(newUser.role);
      await AsyncStorage.setItem('user_session', JSON.stringify(newUser));
      setIsLoading(false);
      return newUser;
    } catch (err) {
      setIsLoading(false);
      setAuthError(err.message || 'Registration failed');
      throw err;
    }
  };

  const logout = async () => {
    setUser(null);
    setRole('freelancer');
    await AsyncStorage.removeItem('user_session');
  };

  const updateProfile = async (updateData) => {
    if (!user) return;
    try {
      const updated = await updateUser(user.id, updateData);
      setUser(updated);
      await AsyncStorage.setItem('user_session', JSON.stringify(updated));
      return updated;
    } catch (err) {
      console.log('Error updating profile:', err);
      throw err;
    }
  };

  // Helper for quick prototype role switching (Freelancer <-> Customer)
  const switchRole = (newRole) => {
    if (newRole === role) return;
    setRole(newRole);
    // Find matching user for demo
    const matchingUser = mockUsers.find((u) => u.role === newRole) || {
      ...user,
      role: newRole,
    };
    setUser(matchingUser);
    AsyncStorage.setItem('user_session', JSON.stringify(matchingUser));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        isLoading,
        authError,
        login,
        register,
        logout,
        updateProfile,
        switchRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
