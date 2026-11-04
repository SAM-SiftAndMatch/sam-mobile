import React from 'react';
import { Redirect } from 'expo-router';
import { useAuth } from '../context/AuthContext';
export default function Index() { const { user, role } = useAuth(); return <Redirect href={user ? (role === 'freelancer' ? '/jobs' : '/home') : '/welcome'} />; }
