export const isBackendEnabled = () => import.meta.env.VITE_ENABLE_BACKEND === 'true';

export const getBackendUrl = () => import.meta.env.VITE_API_URL || 'http://localhost:5000';
