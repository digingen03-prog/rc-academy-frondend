import React, { useState, useEffect } from 'react';
import axios from '../../utils/axiosInstance';
import { 
    Users, 
    GraduationCap, 
    BookOpen, 
    DollarSign, 
    TrendingUp, 
    Calendar,
    ArrowUpRight,
    ArrowDownRight
} from 'lucide-react';
import { 
    BarChart, 
    Bar, 
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip, 
    ResponsiveContainer, 
    AreaChart, 
    Area 
} from 'recharts';

const Dashboard = () => {
    const [stats, setStats] = useState({
        totalStudents: 0,
        totalStaff: 0,
        totalCourses: 0,
        todayRevenue: 0
    });

    const [chartData, setChartData] = useState([
        { name: 'Jan', revenue: 4000, expenses: 2400 },
        { name: 'Feb', revenue: 3000, expenses: 1398 },
        { name: 'Mar', revenue: 2000, expenses: 9800 },
        { name: 'Apr', revenue: 2780, expenses: 3908 },
        { name: 'May', revenue: 1890, expenses: 4800 },
        { name: 'Jun', revenue: 2390, expenses: 3800 },
    ]);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            // Note: In a real app, you'd have an endpoint for this summary
            const students = await axios.get('/api/students');
            const staff = await axios.get('/api/staff');
            const courses = await axios.get('/api/courses');
            
            setStats({
                totalStudents: students.data.length,
                totalStaff: staff.data.length,
                totalCourses: courses.data.length,
                todayRevenue: 1250 // Mocked for now
            });
        } catch (err) {
            console.error('Failed to fetch dashboard stats');
        }
    };

    const StatCard = ({ title, value, icon: Icon, color, trend }) => (
        <div className="card flex items-center justify-between p-6">
            <div>
                <p className="text-gray-500 text-sm font-medium mb-1">{title}</p>
                <h3 className="text-2xl font-bold">{value}</h3>
                {trend && (
                    <p className={`text-xs mt-2 flex items-center gap-1 ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {trend > 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                        <span>{Math.abs(trend)}% from last month</span>
                    </p>
                )}
            </div>
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${color}`}>
                <Icon size={24} className="text-white" />
            </div>
        </div>
    );

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Welcome Back, Admin</h1>
                    <p className="text-gray-500 text-sm">Here's what's happening in your school today.</p>
                </div>
                <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl border border-border shadow-sm">
                    <Calendar size={18} className="text-gray-400" />
                    <span className="text-sm font-semibold">{new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                </div>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard 
                    title="Total Students" 
                    value={stats.totalStudents} 
                    icon={GraduationCap} 
                    color="bg-blue-500" 
                    trend={12} 
                />
                <StatCard 
                    title="Total Staff" 
                    value={stats.totalStaff} 
                    icon={Users} 
                    color="bg-orange-500" 
                    trend={4} 
                />
                <StatCard 
                    title="Active Courses" 
                    value={stats.totalCourses} 
                    icon={BookOpen} 
                    color="bg-purple-500" 
                />
                <StatCard 
                    title="Today's Revenue" 
                    value={`$${stats.todayRevenue}`} 
                    icon={DollarSign} 
                    color="bg-green-500" 
                    trend={-2} 
                />
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="card">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="font-bold">Financial Overview</h3>
                        <select className="text-sm bg-gray-50 border border-border rounded-lg px-2 py-1 outline-none">
                            <option>Last 6 Months</option>
                            <option>Last Year</option>
                        </select>
                    </div>
                    <div className="h-80 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0e6d0" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                                <YAxis axisLine={false} tickLine={false} />
                                <Tooltip 
                                    contentStyle={{ borderRadius: '12px', border: 'none', shadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} 
                                />
                                <Bar dataKey="revenue" fill="#ff9800" radius={[4, 4, 0, 0]} barSize={30} />
                                <Bar dataKey="expenses" fill="#f0e6d0" radius={[4, 4, 0, 0]} barSize={30} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="card">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="font-bold">Attendance Trends</h3>
                        <div className="flex items-center gap-4 text-xs font-bold uppercase tracking-wider">
                            <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-primary"></span> Students</div>
                            <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-blue-500"></span> Staff</div>
                        </div>
                    </div>
                    <div className="h-80 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData}>
                                <defs>
                                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#ff9800" stopOpacity={0.1}/>
                                        <stop offset="95%" stopColor="#ff9800" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <XAxis dataKey="name" hide />
                                <Tooltip />
                                <Area type="monotone" dataKey="revenue" stroke="#ff9800" fillOpacity={1} fill="url(#colorRevenue)" strokeWidth={3} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Recent Activity Placeholder */}
            <div className="card">
                <h3 className="font-bold mb-6">Recent Activity</h3>
                <div className="space-y-6">
                    {[
                        { text: 'New student registered: Alice Green', time: '2 hours ago', type: 'registration' },
                        { text: 'Salary disbursed for March 2024', time: '5 hours ago', type: 'finance' },
                        { text: 'New course added: Artificial Intelligence', time: '1 day ago', type: 'course' },
                    ].map((item, i) => (
                        <div key={i} className="flex gap-4">
                            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                                <TrendingUp size={18} className="text-gray-400" />
                            </div>
                            <div>
                                <p className="text-sm font-medium">{item.text}</p>
                                <p className="text-xs text-gray-400">{item.time}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
