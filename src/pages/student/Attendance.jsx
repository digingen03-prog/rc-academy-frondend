import React, { useState, useEffect } from 'react';
import axios from '../../utils/axiosInstance';
import { useAuth } from '../../context/AuthContext';
import { Calendar as CalendarIcon, CheckCircle, XCircle, AlertCircle, PieChart as PieChartIcon } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const StudentAttendance = () => {
    const { user } = useAuth();
    const [attendance, setAttendance] = useState([]);
    const [stats, setStats] = useState({ present: 0, absent: 0, late: 0, percentage: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAttendance();
    }, []);

    const fetchAttendance = async () => {
        try {
            const { data } = await axios.get(`/api/attendance/report?type=student&referenceId=${user?._id}`);
            setAttendance(data);
            
            const p = data.filter(a => a.status === 'present').length;
            const a = data.filter(a => a.status === 'absent').length;
            const l = data.filter(a => a.status === 'late').length;
            const total = data.length || 1;

            setStats({
                present: p,
                absent: a,
                late: l,
                percentage: Math.round(((p + l) / total) * 100)
            });
        } catch (err) {
            console.error('Failed to fetch attendance');
        } finally {
            setLoading(false);
        }
    };

    const data = [
        { name: 'Present', value: stats.present + stats.late },
        { name: 'Absent', value: stats.absent },
    ];
    const COLORS = ['#ff9800', '#f0e6d0'];

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold">My Attendance Records</h1>
                    <p className="text-gray-500 text-sm">Monitor your daily presence and attendance percentage.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="card p-6 flex flex-col items-center justify-center">
                    <h3 className="font-bold text-gray-400 uppercase text-xs mb-4">Overall Presence</h3>
                    <div className="h-48 w-full relative">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={data} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                                    {data.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-3xl font-black text-primary">{stats.percentage}%</span>
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="card !bg-green-50 !border-green-100 p-6 flex flex-col items-center justify-center">
                        <CheckCircle size={32} className="text-green-600 mb-2" />
                        <h4 className="text-3xl font-black text-green-600">{stats.present}</h4>
                        <p className="text-xs font-bold text-green-700 uppercase">Days Present</p>
                    </div>
                    <div className="card !bg-red-50 !border-red-100 p-6 flex flex-col items-center justify-center">
                        <XCircle size={32} className="text-red-600 mb-2" />
                        <h4 className="text-3xl font-black text-red-600">{stats.absent}</h4>
                        <p className="text-xs font-bold text-red-700 uppercase">Days Absent</p>
                    </div>
                    <div className="card !bg-yellow-50 !border-yellow-100 p-6 flex flex-col items-center justify-center">
                        <AlertCircle size={32} className="text-yellow-600 mb-2" />
                        <h4 className="text-3xl font-black text-yellow-600">{stats.late}</h4>
                        <p className="text-xs font-bold text-yellow-700 uppercase">Days Late</p>
                    </div>
                </div>
            </div>

            <div className="card !p-0 overflow-hidden">
                <div className="p-6 border-b border-border flex items-center gap-2">
                    <CalendarIcon size={20} className="text-primary" />
                    <h3 className="font-bold">Recent History</h3>
                </div>
                {loading ? (
                    <div className="p-12 text-center text-gray-500 font-bold">Loading records...</div>
                ) : attendance.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 p-6">
                        {attendance.map((a, i) => (
                            <div key={i} className={`p-4 rounded-2xl flex flex-col items-center justify-center border transition-all hover:scale-105 ${
                                a.status === 'present' ? 'bg-green-50 border-green-100 text-green-600' :
                                a.status === 'absent' ? 'bg-red-50 border-red-100 text-red-600' : 'bg-yellow-50 border-yellow-100 text-yellow-600'
                            }`}>
                                <p className="text-[10px] font-black uppercase mb-1">{new Date(a.date).toLocaleDateString('en-US', { weekday: 'short' })}</p>
                                <p className="text-lg font-black">{new Date(a.date).getDate()}</p>
                                <p className="text-[8px] font-bold uppercase mt-1">{a.status}</p>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="p-12 text-center text-gray-400 italic">No attendance records found for you yet.</div>
                )}
            </div>
        </div>
    );
};

export default StudentAttendance;
