const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const API_ENDPOINTS = {
    AUTH: {
        LOGIN: `${API_URL}/auth/login`,
        SIGNUP: `${API_URL}/auth/signup`,
        USER: `${API_URL}/auth/user`,
    },
    TEACHERS: `${API_URL}/teachers`,
    STUDENTS: `${API_URL}/students`,
    DOUBTS: {
        BASE: `${API_URL}/doubts`,
        TEACHER: `${API_URL}/doubts/teacher`,
        STUDENT: `${API_URL}/doubts/student`,
        STATUS: (id) => `${API_URL}/doubts/${id}/status`,
        REPLY: (id) => `${API_URL}/doubts/${id}/reply`,
    },
    DASHBOARD: {
        TEACHER: `${API_URL}/dashboard/teacher`,
        STUDENT: `${API_URL}/dashboard/student`,
    }
}; 