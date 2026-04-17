import React, { useState, useEffect } from 'react';
import axios from '../../utils/axiosInstance';
import { useAuth } from '../../context/AuthContext';
import Table from '../../components/Table';
import { Calendar, Users, GraduationCap, CheckCircle, XCircle, AlertCircle, BookOpen } from 'lucide-react';
import { toast } from 'react-toastify';

const Attendance = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('students');
    const [students, setStudents] = useState([]);
    const [staff, setStaff] = useState([]);
    const [courses, setCourses] = useState([]);
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [selectedCourse, setSelectedCourse] = useState('All');
    const [loading, setLoading] = useState(true);
    const [localAttendance, setLocalAttendance] = useState({}); // { id: status }
    const [isSaving, setIsSaving] = useState(false);
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
    const [alreadyCommittedCount, setAlreadyCommittedCount] = useState(0);

    useEffect(() => {
        const init = async () => {
            await fetchCourses();
        };
        init();
    }, []);

    useEffect(() => {
        // For staff, wait until courses are loaded before fetching students
        // to ensure the filtering logic has the necessary IDs.
        if (user?.role === 'staff' && courses.length === 0) {
            return;
        }

        const loadData = async () => {
            if (activeTab === 'students') await fetchStudents();
            else await fetchStaff();
            await fetchExistingAttendance();
        };
        loadData();
    }, [activeTab, selectedCourse, courses, user?.role, selectedDate]);

    const fetchExistingAttendance = async () => {
        try {
            const type = activeTab === 'students' ? 'student' : 'staff';
            const { data } = await axios.get(`/api/attendance/report?type=${type}&startDate=${selectedDate}&endDate=${selectedDate}`);
            
            const existing = {};
            const currentList = activeTab === 'students' ? students : staff;

            data.forEach(record => {
                // record.referenceId is populated, it refers to a User
                const userId = record.referenceId?._id || record.referenceId;
                
                // Map the User ID back to the Student/Staff record ID for UI consistency
                const match = currentList.find(item => 
                    (item.user?._id === userId) || (item.user === userId)
                );
                
                if (match) {
                    existing[match._id] = record.status;
                }
            });
            setLocalAttendance(existing);
            setAlreadyCommittedCount(Object.keys(existing).length);
            setHasUnsavedChanges(false);
        } catch (err) {
            console.error('Failed to sync existing attendance', err);
        }
    };

    const fetchCourses = async () => {
        try {
            if (user?.role === 'staff') {
                const { data } = await axios.get('/api/staff/subjects');
                setCourses(data);
            } else {
                const { data } = await axios.get('/api/courses');
                setCourses(data);
            }
        } catch (err) {
            console.error('Failed to fetch courses');
        }
    };

    const fetchStudents = async () => {
        setLoading(true);
        try {
            const { data } = await axios.get('/api/students');
            let filtered = data;

            // Role-based filtering for staff
            if (user?.role === 'staff') {
                // Get course IDs assigned to this staff
                const staffCourseIds = courses.map(c => c._id);
                
                // If specific course selected, use that (standard filter below handles it)
                // If 'All' selected, filter students by ALL courses this staff teaches
                if (selectedCourse === 'All') {
                    filtered = data.filter(s => s.courseIds?.some(c => staffCourseIds.includes(c._id)));
                } else {
                    // Standard filter will apply to the 'data' which is already all students
                    // But we should ensure the selectedCourse is actually one of the staff's courses
                    if (staffCourseIds.includes(selectedCourse)) {
                        filtered = data.filter(s => s.courseIds?.some(c => c._id === selectedCourse));
                    } else if (staffCourseIds.length > 0) {
                        // Security fallback: if they somehow selected a course not theirs
                        filtered = [];
                    }
                }
            } else if (selectedCourse !== 'All') {
                filtered = data.filter(s => s.courseIds?.some(c => c._id === selectedCourse));
            }
            
            setStudents(filtered);
        } catch (err) {
            toast.error('Failed to fetch students');
        } finally {
            setLoading(false);
        }
    };

    const fetchStaff = async () => {
        setLoading(true);
        try {
            const { data } = await axios.get('/api/staff');
            setStaff(data);
        } catch (err) {
            toast.error('Failed to fetch staff');
        } finally {
            setLoading(false);
        }
    };

    const handleMarkLocal = (id, status) => {
        setLocalAttendance(prev => ({
            ...prev,
            [id]: prev[id] === status ? null : status
        }));
        setHasUnsavedChanges(true);
    };

    const markAllPresent = () => {
        const currentList = activeTab === 'students' ? students : staff;
        const newMarks = {};
        currentList.forEach(item => {
            newMarks[item._id] = 'present';
        });
        setLocalAttendance(newMarks);
        setHasUnsavedChanges(true);
    };

    const handleSaveAll = async () => {
        // Only gather the records that actually have a status in local state
        const records = Object.entries(localAttendance)
            .filter(([_, status]) => status)
            .map(([id, status]) => {
                // Find the student or staff record by its _id
                const item = [...students, ...staff].find(i => i._id === id);
                
                // Use the associated User ID for the attendance record
                const targetUserId = item?.user?._id || item?.user || id;
                
                return {
                    referenceId: targetUserId,
                    status
                };
            });

        if (records.length === 0) {
            return toast.info('No attendance marks selected');
        }

        setIsSaving(true);
        try {
            const response = await axios.post('/api/attendance/bulk-mark', {
                type: activeTab === 'students' ? 'student' : 'staff',
                date: selectedDate,
                attendanceRecords: records
            });
            toast.success(response.data.message || 'Attendance saved successfully');
            // Re-fetch to ensure UI is in sync with server state
            await fetchExistingAttendance();
            setHasUnsavedChanges(false);
        } catch (err) {
            console.error('Save error:', err);
            const errorMsg = err.response?.data?.message || 'Failed to save attendance';
            toast.error(errorMsg);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black uppercase italic tracking-tighter">Attendance Control</h1>
                    <p className="text-gray-500 text-sm italic underline decoration-primary/30">Verify presence, manage records, and ensure academic accountability.</p>
                </div>
                <div className="flex items-center gap-3 bg-white p-2 rounded-2xl border-2 border-primary/5 shadow-sm">
                    <button 
                        onClick={() => setActiveTab('students')}
                        className={`px-6 py-2.5 rounded-xl text-xs font-black transition-all uppercase tracking-widest ${activeTab === 'students' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-gray-400 hover:bg-gray-50'}`}
                    >
                        <Users className="inline-block mr-2" size={14} />
                        Student Base
                    </button>
                    {(user?.role === 'superadmin' || user?.role === 'admin') && (
                        <button 
                            onClick={() => setActiveTab('staff')}
                            className={`px-6 py-2.5 rounded-xl text-xs font-black transition-all uppercase tracking-widest ${activeTab === 'staff' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-gray-400 hover:bg-gray-50'}`}
                        >
                            <GraduationCap className="inline-block mr-2" size={14} />
                            Faculty Hub
                        </button>
                    )}
                </div>
            </div>

            <div className="card !p-4 flex flex-col md:flex-row gap-4 items-center bg-gray-50/50 border-2 border-white shadow-xl">
                <div className="relative group">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-primary group-focus-within:animate-pulse" size={18} />
                    <input 
                        type="date" 
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="pl-11 pr-4 py-3 bg-white border-2 border-gray-100 rounded-2xl outline-none focus:border-primary text-xs font-black uppercase transition-all"
                    />
                </div>
                {activeTab === 'students' && (
                    <div className="relative group flex-1 max-w-xs">
                        <BookOpen size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-orange-500"/>
                        <select 
                            value={selectedCourse}
                            onChange={(e) => setSelectedCourse(e.target.value)}
                            className="w-full pl-11 pr-4 py-3 bg-white border-2 border-gray-100 rounded-2xl outline-none focus:border-primary text-[10px] font-black uppercase appearance-none"
                        >
                            <option value="All">All Active Courses</option>
                            {courses.map(c => (
                                <option key={c._id} value={c._id}>{c.courseName} ({c.courseCode})</option>
                            ))}
                        </select>
                    </div>
                )}
                <div className="flex-1"></div>
                <div className="flex items-center gap-3">
                    <button 
                        onClick={markAllPresent} 
                        className="px-5 py-3 text-[10px] font-black uppercase tracking-widest text-primary hover:bg-primary/10 rounded-2xl transition-all"
                    >
                        Mark All Present
                    </button>
                    <button 
                        onClick={handleSaveAll}
                        disabled={isSaving || !hasUnsavedChanges}
                        className={`px-8 py-3 text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl shadow-xl transition-all ${isSaving || !hasUnsavedChanges ? 'bg-gray-200 text-gray-400 cursor-not-allowed transform-none' : 'bg-black text-white hover:scale-105 active:scale-95'}`}
                    >
                        {isSaving ? 'Processing...' : (!hasUnsavedChanges && alreadyCommittedCount > 0 ? 'Changes Synchronized' : 'Commit All Records')}
                    </button>
                </div>
            </div>

            <div className="card !p-0 overflow-hidden border-2 border-primary/5">
                {loading ? (
                    <div className="p-32 text-center font-black text-gray-300 italic tracking-widest text-xs uppercase animate-pulse">Accessing Authentication Nodes...</div>
                ) : (
                    <Table headers={['Personnel Identity', 'Registry ID', 'Assignment', 'Status Selector']}>
                        {(activeTab === 'students' ? students : staff).map((item) => (
                            <tr key={item._id} className="hover:bg-primary/5 transition-all group">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-white font-black text-xs uppercase shadow-sm ${activeTab === 'students' ? 'bg-blue-500' : 'bg-orange-500'}`}>
                                            {item.user?.name.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="font-black text-sm uppercase group-hover:text-primary transition-colors">{item.user?.name}</p>
                                            <p className="text-[10px] font-bold text-gray-400 lowercase">{item.user?.email}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="font-mono text-[10px] font-black text-gray-400 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
                                        {activeTab === 'students' ? item.studentId : item.staffId}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                     <p className="text-[10px] font-black uppercase text-gray-700 italic">
                                        {activeTab === 'students' ? (item.batch || 'Regular Batch') : item.designation}
                                    </p>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2">
                                        <button 
                                            onClick={() => handleMarkLocal(item._id, 'present')}
                                            className={`w-10 h-10 rounded-xl border-2 transition-all flex items-center justify-center ${localAttendance[item._id] === 'present' ? 'bg-green-500 border-green-500 text-white shadow-lg shadow-green-200' : 'border-gray-50 bg-white text-gray-300 hover:border-green-200 hover:text-green-500'}`}
                                            title="Present"
                                        >
                                            <CheckCircle size={20} strokeWidth={2.5} />
                                        </button>
                                        <button 
                                            onClick={() => handleMarkLocal(item._id, 'absent')}
                                            className={`w-10 h-10 rounded-xl border-2 transition-all flex items-center justify-center ${localAttendance[item._id] === 'absent' ? 'bg-red-500 border-red-500 text-white shadow-lg shadow-red-200' : 'border-gray-50 bg-white text-gray-300 hover:border-red-200 hover:text-red-500'}`}
                                            title="Absent"
                                        >
                                            <XCircle size={20} strokeWidth={2.5} />
                                        </button>
                                        <button 
                                            onClick={() => handleMarkLocal(item._id, 'late')}
                                            className={`w-10 h-10 rounded-xl border-2 transition-all flex items-center justify-center ${localAttendance[item._id] === 'late' ? 'bg-yellow-500 border-yellow-500 text-white shadow-lg shadow-yellow-200' : 'border-gray-50 bg-white text-gray-300 hover:border-yellow-200 hover:text-yellow-500'}`}
                                            title="Late"
                                        >
                                            <AlertCircle size={20} strokeWidth={2.5} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </Table>
                )}
            </div>
        </div>
    );
};

export default Attendance;
