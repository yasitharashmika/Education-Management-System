import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { Save } from 'lucide-react';
import { getCourseRoster, saveCourseGrades, getFacultyAssignments } from '../services/apiService';
import './FacultyGrades.css';
import './Dashboard.css';

const FacultyGrades = () => {
    const [roster, setRoster] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    
    // UI state for the success/error notice
    const [saveStatus, setSaveStatus] = useState({ type: '', message: '' });

    // --- Dynamic Filter Options arrays ---
    const [availableYears, setAvailableYears] = useState([]);
    const [availableSemesters, setAvailableSemesters] = useState([]);
    const [availableCourses, setAvailableCourses] = useState([]);

    // --- Selected Values ---
    const [academicYear, setAcademicYear] = useState('');
    const [semester, setSemester] = useState('');
    const [courseId, setCourseId] = use