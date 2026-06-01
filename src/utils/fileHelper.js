import axios from './axiosInstance';

/**
 * Resolves the public URL for any file field.
 * Accommodates Supabase objects, absolute remote URLs, and legacy disk static file paths.
 * 
 * @param {string|Object} field - File field from database (string path or Supabase subdocument object).
 * @returns {string} The fully qualified public URL.
 */
export const getFileUrl = (field) => {
    if (!field) return '';
    
    // 1. Supabase subdocument object
    if (typeof field === 'object' && field.documentUrl) {
        return field.documentUrl;
    }
    
    // 2. Already an absolute URL
    if (typeof field === 'string' && (field.startsWith('http://') || field.startsWith('https://'))) {
        return field;
    }
    
    // 3. Legacy relative static upload path (e.g. '/uploads/image.png')
    const cleanPath = typeof field === 'string' ? field.replace(/^\//, '') : '';
    const base = axios.defaults.baseURL || '';
    
    return base ? `${base}/${cleanPath}` : `/${cleanPath}`;
};
