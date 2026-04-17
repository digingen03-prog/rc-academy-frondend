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
        totalRevenue: 0,
        todayRevenue: 0
    });

    const [chartData, setChartData] = useState([]);
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            setLoading(true);
            const { data } = await axios.get('/api/dashboard/stats');
            
            setStats(data.stats);
            setChartData(data.chartData);
            setActivities(data.activities);
        } catch (err) {
            console.error('Failed to fetch dashboard stats', err);
        } finally {
            setLoading(false);
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
                    <h1 className="text-3xl font-semibold tracking-tighter">Welcome Back, Admin</h1>
                    <p className="text-gray-500 text-sm font-medium">Here's the current pulse of your academic ecosystem.</p>
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
                    value={`₹${stats.todayRevenue.toLocaleString()}`} 
                    icon={DollarSign} 
                    color="bg-green-500" 
                    trend={0} 
                />
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="card lg:col-span-2">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-xl font-semibold tracking-tight uppercase italic">Attendance Analytics</h3>
                            <p className="text-[10px] font-medium text-gray-400 uppercase tracking-widest mt-1">Last 6 Months Participation Trends</p>
                        </div>
                        <div className="flex items-center gap-6 text-[10px] font-bold uppercase tracking-[0.2em]">
                            <div className="flex items-center gap-2">
                                <span className="w-3 h-3 rounded-full bg-primary shadow-lg shadow-primary/20"></span>
                                <span className="text-gray-600">Students</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="w-3 h-3 rounded-full bg-blue-500 shadow-lg shadow-blue-500/20"></span>
                                <span className="text-gray-600">Staff</span>
                            </div>
                        </div>
                    </div>
                    <div className="h-96 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            {chartData.length > 0 ? (
                                <AreaChart data={chartData}>
                                    <defs>
                                        <linearGradient id="colorStudent" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.15}/>
                                            <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                                        </linearGradient>
                                        <linearGradient id="colorStaff" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15}/>
                                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                    <XAxis 
                                        dataKey="name" 
                                        axisLine={false} 
                                        tickLine={false} 
                                        tick={{ fontSize: 10, fontWeight: 600, fill: '#94a3b8' }} 
                                        dy={10}
                                    />
                                    <YAxis 
                                        axisLine={false} 
                                        tickLine={false} 
                                        tick={{ fontSize: 10, fontWeight: 600, fill: '#94a3b8' }} 
                                        unit="%"
                                    />
                                    <Tooltip 
                                        contentStyle={{ 
                                            borderRadius: '20px', 
                                            border: 'none', 
                                            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)',
                                            padding: '12px 16px'
                                        }}
                                        itemStyle={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase' }}
                                    />
                                    <Area 
                                        type="monotone" 
                                        dataKey="studentAttendance" 
                                        name="Students"
                                        stroke="#f59e0b" 
                                        fillOpacity={1} 
                                        fill="url(#colorStudent)" 
                                        strokeWidth={4} 
                                    />
                                    <Area 
                                        type="monotone" 
                                        dataKey="staffAttendance" 
                                        name="Staff"
                                        stroke="#3b82f6" 
                                        fillOpacity={1} 
                                        fill="url(#colorStaff)" 
                                        strokeWidth={4} 
                                    />
                                </AreaChart>
                            ) : (
                                <div className="flex items-center justify-center h-full text-gray-400 font-semibold uppercase tracking-widest text-[10px]">Insufficient Activity Metadata</div>
                            )}
                        </ResponsiveContainer>
                    </div>
                </div>

            </div>

            {/* Recent Activity Placeholder */}
            <div className="card">
                <h3 className="font-bold mb-6">Recent Activity</h3>
                <div className="space-y-6">
                    {activities.length > 0 ? activities.map((item, i) => (
                        <div key={i} className="flex gap-4 group">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                                item.type === 'finance' ? 'bg-green-50 text-green-600' : 'bg-blue-50 text-blue-600'
                            }`}>
                                {item.type === 'finance' ? <DollarSign size={18} /> : <Users size={18} />}
                            </div>
                            <div>
                                <p className="text-sm font-semibold italic tracking-tight">{item.text}</p>
                                <p className="text-[10px] font-semibold uppercase text-gray-400">{new Date(item.time).toLocaleString()}</p>
                            </div>
                            <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
                                <ArrowUpRight size={16} className="text-gray-300" />
                            </div>
                        </div>
                    )) : (
                        <div className="py-12 text-center text-gray-400 blur-[0.5px]">
                             <TrendingUp size={32} className="mx-auto mb-4 opacity-20" />
                             <p className="text-[10px] font-semibold uppercase tracking-[0.2em]">Silence in the Halls of Learning</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
