import React, { useState, useEffect } from 'react';
import axios from '../../utils/axiosInstance';
import { useAuth } from '../../context/AuthContext';
import { 
    Calendar, 
    CheckCircle, 
    BookOpen, 
    Trophy, 
    Clock, 
    ArrowRight 
} from 'lucide-react';
import { 
    PieChart, 
    Pie, 
    Cell, 
    ResponsiveContainer,
    Tooltip
} from 'recharts';

const StudentDashboard = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState({
        attendance: 85,
        marks: [],
        schedule: []
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [schedRes, markRes] = await Promise.all([
                axios.get('/api/schedule'),
                axios.get(`/api/marks/student/${user?._id}`)
            ]);
            
            setStats({
                attendance: 88, // Mocked overall attendance
                marks: markRes.data,
                schedule: schedRes.data.slice(0, 3)
            });
        } catch (err) {
            console.error('Failed to fetch student dashboard data');
        } finally {
            setLoading(false);
        }
    };

    const attendanceData = [
        { name: 'Present', value: stats.attendance },
        { name: 'Absent', value: 100 - stats.attendance },
    ];
    const COLORS = ['#ff9800', '#f0e6d0'];

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-black">Welcome, {user?.name}</h1>
                    <p className="text-gray-500 font-medium">Here's your academic progress overview.</p>
                </div>
                <div className="bg-white px-4 py-2 rounded-xl border border-border shadow-sm flex items-center gap-2">
                    <Calendar size={18} className="text-gray-400" />
                    <span className="text-sm font-bold">Class 10-A</span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Attendance Widget */}
                <div className="card flex flex-col items-center justify-center p-8 bg-white border-2 border-primary/5">
                    <h3 className="font-bold text-sm uppercase tracking-widest text-gray-400 mb-6 text-center">Attendance</h3>
                    <div className="w-full h-48 relative">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={attendanceData}
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {attendanceData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-2xl font-black text-primary">{stats.attendance}%</span>
                            <span className="text-[10px] font-bold text-gray-400 uppercase">Present</span>
                        </div>
                    </div>
                </div>

                {/* Upcoming Classes */}
                <div className="lg:col-span-3 space-y-4">
                    <div className="flex items-center justify-between px-2">
                        <h3 className="font-bold text-lg flex items-center gap-2">
                            <Clock size={20} className="text-blue-500" />
                            Next Classes
                        </h3>
                        <button className="text-xs font-bold text-primary flex items-center gap-1">View Full Timetable <ArrowRight size={14} /></button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {stats.schedule.length > 0 ? stats.schedule.map((item) => (
                            <div key={item._id} className="card p-5 border-l-4 border-l-blue-500 hover:shadow-md transition-all">
                                <h4 className="font-bold text-sm mb-2">{item.courseId?.courseName}</h4>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">{item.room || 'Room 101'}</p>
                                <div className="flex items-center gap-2 text-xs font-bold text-primary">
                                    <Clock size={14} />
                                    <span>{item.startTime}</span>
                                </div>
                            </div>
                        )) : (
                            <div className="col-span-full card p-8 text-center text-gray-400 italic">No classes scheduled.</div>
                        )}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Recent Marks */}
                <div className="space-y-4">
                    <h3 className="font-bold text-lg flex items-center gap-2">
                        <Trophy size={20} className="text-orange-500" />
                        Recent Performance
                    </h3>
                    <div className="card space-y-4">
                        {stats.marks.length > 0 ? stats.marks.slice(0, 4).map((m) => (
                            <div key={m._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center text-primary font-black text-xs">A</div>
                                    <div>
                                        <p className="text-sm font-bold">{m.courseId?.courseName}</p>
                                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{m.examType}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="font-black text-sm text-primary">{m.obtainedMarks}/{m.maxMarks}</p>
                                    <p className="text-[10px] text-green-600 font-bold uppercase">Grade: {m.grade}</p>
                                </div>
                            </div>
                        )) : (
                            <div className="text-center py-6 text-gray-400 italic text-sm">No exam records available yet.</div>
                        )}
                    </div>
                </div>

                {/* Quick Info / Announcements */}
                <div className="space-y-4">
                    <h3 className="font-bold text-lg flex items-center gap-2">
                        <BookOpen size={20} className="text-purple-500" />
                        Library & Study Updates
                    </h3>
                    <div className="card p-6 bg-primary text-white relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full translate-x-10 -translate-y-10"></div>
                        <h4 className="text-lg font-black mb-2">Upcoming Exam Season</h4>
                        <p className="text-sm opacity-90 leading-relaxed mb-6">
                            Midterm assessments start next Monday. Make sure to download your hall tickets from the profile section.
                        </p>
                        <button className="px-6 py-2 bg-white text-primary rounded-xl font-bold text-sm shadow-xl shadow-black/5 hover:scale-105 transition-transform">
                            View Syllabus
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudentDashboard;
