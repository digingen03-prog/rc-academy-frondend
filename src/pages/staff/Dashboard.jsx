import React, { useState, useEffect } from 'react';
import axios from '../../utils/axiosInstance';
import { useAuth } from '../../context/AuthContext';
import { Book, Clock, Calendar, CheckCircle, GraduationCap } from 'lucide-react';
import { Link } from 'react-router-dom';

const StaffDashboard = () => {
    const { user } = useAuth();
    const [schedule, setSchedule] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            // Mocking logic for staff-specific data
            const [schedRes, courseRes] = await Promise.all([
                axios.get('/api/schedule'),
                axios.get('/api/courses')
            ]);
            
            // Filter schedules where this staff is assigned
            setSchedule(schedRes.data.filter(s => s.staffId?._id === user?._id));
            setSubjects(courseRes.data.filter(c => c.staffId?._id === user?._id));
        } catch (err) {
            console.error('Failed to fetch staff dashboard data');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-black">Hello, {user?.name}</h1>
                    <p className="text-gray-500 font-medium">Here's your schedule for today.</p>
                </div>
                <Link to="/staff/attendance" className="btn-primary flex items-center gap-2">
                    <CheckCircle size={18} />
                    <span>Mark Attendance</span>
                </Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Today's Schedule */}
                <div className="lg:col-span-2 space-y-4">
                    <h3 className="font-bold text-lg flex items-center gap-2">
                        <Clock size={20} className="text-primary" />
                        Today's Classes
                    </h3>
                    <div className="space-y-4">
                        {schedule.length > 0 ? schedule.map((item) => (
                            <div key={item._id} className="card flex items-center justify-between p-5 border-l-4 border-l-primary hover:translate-x-1 transition-transform">
                                <div>
                                    <h4 className="font-bold text-base">{item.courseId?.courseName}</h4>
                                    <p className="text-xs font-bold text-gray-400 capitalize">{item.topic || 'General Lecture'}</p>
                                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-500 font-medium">
                                        <span className="flex items-center gap-1"><Clock size={14} /> {item.startTime} - {item.endTime}</span>
                                        <span className="flex items-center gap-1"><Calendar size={14} /> Room {item.room}</span>
                                    </div>
                                </div>
                                <button className="px-4 py-2 bg-gray-50 border border-border rounded-xl text-xs font-bold hover:bg-gray-100 transition-all">
                                    Start Class
                                </button>
                            </div>
                        )) : (
                            <div className="card p-12 text-center text-gray-400 italic">No classes scheduled for you today.</div>
                        )}
                    </div>
                </div>

                {/* My Subjects & Quick Stats */}
                <div className="space-y-6">
                    <div className="card bg-card p-6 border-2 border-primary/10">
                        <h3 className="font-bold mb-4 flex items-center gap-2">
                            <Book size={20} className="text-primary" />
                            My Subjects
                        </h3>
                        <div className="space-y-3">
                            {subjects.map(s => (
                                <div key={s._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                                    <span className="text-sm font-bold">{s.courseName}</span>
                                    <span className="text-[10px] font-black bg-white px-2 py-1 rounded border border-border uppercase tracking-widest text-gray-400">{s.courseCode}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="card p-6 bg-blue-600 text-white">
                        <GraduationCap size={32} className="mb-4 text-white/50" />
                        <h4 className="text-sm font-bold opacity-80 uppercase tracking-widest">Pending Marks</h4>
                        <p className="text-3xl font-black mt-1">12 Assessments</p>
                        <p className="text-[10px] mt-2 opacity-70">Requires your attention this week.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StaffDashboard;
