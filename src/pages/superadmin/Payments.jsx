import React, { useState, useEffect } from 'react';
import axios from '../../utils/axiosInstance';
import Table from '../../components/Table';
import Modal from '../../components/Modal';
import { Plus, CreditCard, Search, Calendar, FileText, User, TrendingUp, AlertCircle, CheckCircle, ChevronRight, Filter, Download, ChevronDown, Image as ImageIcon, Upload, Eye } from 'lucide-react';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';

const Payments = () => {
    const [activeTab, setActiveTab] = useState('tracker'); // 'tracker' or 'history'
    const [statusData, setStatusData] = useState([]);
    const [historyData, setHistoryData] = useState([]);
    const [students, setStudents] = useState([]);
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [proofFile, setProofFile] = useState(null);

    // Filter State
    const [filters, setFilters] = useState({
        month: new Date().getMonth(),
        year: new Date().getFullYear(),
        course: 'all',
        status: 'all',
        batch: 'all'
    });

    const [formData, setFormData] = useState({
        studentId: '', amount: '', paymentMode: 'cash',
        receiptNumber: '', feeType: 'tuition', term: 'Monthly Fee',
        remarks: '', status: 'paid'
    });

    useEffect(() => {
        fetchData();
        fetchStudents();
        fetchCourses();
    }, [activeTab, filters.month, filters.year]);

    const fetchData = async () => {
        setLoading(true);
        try {
            if (activeTab === 'tracker') {
                const { data } = await axios.get(`/api/payments/status?month=${filters.month}&year=${filters.year}`);
                setStatusData(data);
            } else {
                const { data } = await axios.get('/api/payments');
                setHistoryData(data);
            }
        } catch (err) {
            toast.error('Failed to synchronize payment records');
        } finally {
            setLoading(false);
        }
    };

    const fetchStudents = async () => {
        try {
            const { data } = await axios.get('/api/students');
            setStudents(data);
        } catch (err) {
            console.error('Failed to fetch students');
        }
    };

    const fetchCourses = async () => {
        try {
            const { data } = await axios.get('/api/courses');
            setCourses(data);
        } catch (err) {
            console.error('Failed to fetch courses');
        }
    };

    const handleAddPayment = async (e) => {
        e.preventDefault();
        const data = new FormData();
        Object.keys(formData).forEach(key => data.append(key, formData[key]));
        if (proofFile) data.append('proofOfPayment', proofFile);

        try {
            await axios.post('/api/payments', data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            toast.success('Transaction committed successfully');
            setIsModalOpen(false);
            fetchData();
            resetForm();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Transaction failed');
        }
    };

    const resetForm = () => {
        setSelectedStudent(null);
        setProofFile(null);
        setFormData({ 
            studentId: '', amount: '', paymentMode: 'cash', 
            receiptNumber: `REC-${Date.now().toString().slice(-6)}`, 
            feeType: 'tuition', term: 'Monthly Fee', remarks: '', status: 'paid' 
        });
    };

    const handleQuickPay = (student) => {
        setSelectedStudent(student);
        setFormData({
            ...formData,
            studentId: student.userId,
            amount: student.balance,
            receiptNumber: `REC-${Date.now().toString().slice(-6)}`,
            remarks: `Monthly fee for ${new Date(filters.year, filters.month).toLocaleString('default', { month: 'long' })}`
        });
        setIsModalOpen(true);
    };

    // Client-side filtering logic
    const filteredStatusData = statusData.filter(s => {
        const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                             s.registerNumber.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCourse = filters.course === 'all' || s.courses.includes(filters.course);
        const matchesStatus = filters.status === 'all' || s.status === filters.status;
        const matchesBatch = filters.batch === 'all' || s.batch === filters.batch;
        
        return matchesSearch && matchesCourse && matchesStatus && matchesBatch;
    });

    // Derived Stats from FILTERED data
    const stats = {
        totalCollected: filteredStatusData.reduce((sum, s) => sum + s.totalPaid, 0),
        pendingDues: filteredStatusData.reduce((sum, s) => sum + s.balance, 0),
        paidCount: filteredStatusData.filter(s => s.status === 'paid').length,
        partialCount: filteredStatusData.filter(s => s.status === 'partial').length,
    };

    // Extract unique batches for the filter
    const uniqueBatches = Array.from(new Set(statusData.map(s => s.batch).filter(Boolean)));

    const months = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    return (
        <div className="space-y-8 animate-slide-up pb-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black italic uppercase tracking-tighter text-gray-900 leading-none">Financial Matrix</h1>
                    <p className="text-gray-500 text-sm font-medium mt-1">Monitoring monthly revenue and student tuition trajectories.</p>
                </div>
                <div className="flex gap-3">
                    <button className="p-3 bg-white rounded-2xl border border-border text-gray-400 hover:text-primary transition-all shadow-sm">
                        <Download size={20} />
                    </button>
                    <button 
                        onClick={() => { resetForm(); setIsModalOpen(true); }}
                        className="btn-primary shadow-xl shadow-primary/20"
                    >
                        <Plus size={18} />
                        <span>Manual Entry</span>
                    </button>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="card !bg-primary text-white border-none shadow-2xl shadow-primary/20 overflow-hidden relative">
                    <div className="absolute top-0 right-0 p-4 opacity-10"><TrendingUp size={64}/></div>
                    <p className="text-[10px] font-black uppercase opacity-60 tracking-[0.2em] mb-2">Total Collected</p>
                    <h3 className="text-3xl font-black tracking-tighter">₹{stats.totalCollected.toLocaleString()}</h3>
                    <div className="mt-4 flex items-center gap-2 text-[10px] font-bold">
                        <span className="bg-white/20 px-2 py-0.5 rounded-full uppercase tracking-widest">{months[filters.month]} {filters.year}</span>
                    </div>
                </div>
                <div className="card !bg-dark text-white border-none shadow-xl shadow-black/10 overflow-hidden relative">
                    <div className="absolute top-0 right-0 p-4 opacity-5"><AlertCircle size={64}/></div>
                    <p className="text-[10px] font-black uppercase opacity-60 tracking-[0.2em] mb-2">Outstanding Dues</p>
                    <h3 className="text-3xl font-black tracking-tighter text-orange-400">₹{stats.pendingDues.toLocaleString()}</h3>
                    <div className="mt-4 flex items-center gap-2 text-[10px] font-bold">
                        <span className="bg-orange-500/20 text-orange-400 px-2 py-0.5 rounded-full uppercase tracking-widest">{filteredStatusData.length - stats.paidCount} Units Pending</span>
                    </div>
                </div>
                <div className="card border-none bg-white shadow-sm flex flex-col justify-between">
                    <div>
                        <p className="text-[10px] font-black uppercase text-gray-400 tracking-[0.2em] mb-1">Clearance Rate</p>
                        <h3 className="text-2xl font-black tracking-tight text-gray-900">{filteredStatusData.length > 0 ? Math.round((stats.paidCount / filteredStatusData.length) * 100) : 0}%</h3>
                    </div>
                    <div className="w-full bg-gray-100 h-1.5 rounded-full mt-4 overflow-hidden">
                        <div className="bg-green-500 h-full transition-all duration-1000" style={{ width: `${(stats.paidCount / filteredStatusData.length) * 100}%` }}></div>
                    </div>
                </div>
                <div className="card border-none bg-white shadow-sm flex flex-col justify-between">
                    <div>
                        <p className="text-[10px] font-black uppercase text-gray-400 tracking-[0.2em] mb-1">Partial Commits</p>
                        <h3 className="text-2xl font-black tracking-tight text-primary">{stats.partialCount}</h3>
                    </div>
                    <p className="text-[10px] font-medium text-gray-400 mt-4 italic">Action required for full clearance</p>
                </div>
            </div>

            {/* Filter Module */}
            <div className="card bg-white/40 backdrop-blur-xl border-white shadow-xl shadow-black/[0.03] space-y-6">
                <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
                    <div className="p-2 bg-primary/10 rounded-xl text-primary"><Filter size={18}/></div>
                    <h4 className="font-black text-xs uppercase tracking-widest text-gray-900">Advanced Filtering Suite</h4>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1 italic">Period Insight</label>
                        <div className="flex gap-2">
                            <div className="relative flex-1">
                                <select 
                                    value={filters.month} 
                                    onChange={(e) => setFilters({...filters, month: parseInt(e.target.value)})}
                                    className="w-full pl-4 pr-10 py-3.5 bg-gray-50 border-none rounded-2xl font-bold text-xs appearance-none focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer"
                                >
                                    {months.map((m, i) => <option key={i} value={i}>{m}</option>)}
                                </select>
                                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={14} />
                            </div>
                            <div className="relative w-24">
                                <select 
                                    value={filters.year} 
                                    onChange={(e) => setFilters({...filters, year: parseInt(e.target.value)})}
                                    className="w-full pl-4 pr-10 py-3.5 bg-gray-50 border-none rounded-2xl font-bold text-xs appearance-none focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer"
                                >
                                    {[2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
                                </select>
                                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={14} />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1 italic">Course Vector</label>
                        <div className="relative">
                            <select 
                                value={filters.course} 
                                onChange={(e) => setFilters({...filters, course: e.target.value})}
                                className="w-full pl-4 pr-10 py-3.5 bg-gray-50 border-none rounded-2xl font-bold text-xs appearance-none focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer"
                            >
                                <option value="all">All Disciplines</option>
                                {courses.map(c => <option key={c._id} value={c.courseName}>{c.courseName}</option>)}
                            </select>
                            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={14} />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1 italic">Settlement Status</label>
                        <div className="relative">
                            <select 
                                value={filters.status} 
                                onChange={(e) => setFilters({...filters, status: e.target.value})}
                                className="w-full pl-4 pr-10 py-3.5 bg-gray-50 border-none rounded-2xl font-bold text-xs appearance-none focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer"
                            >
                                <option value="all">All States</option>
                                <option value="paid">Fully Cleared</option>
                                <option value="partial">Partial Commit</option>
                                <option value="unpaid">Outstanding</option>
                            </select>
                            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={14} />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1 italic">Cohort/Batch</label>
                        <div className="relative">
                            <select 
                                value={filters.batch} 
                                onChange={(e) => setFilters({...filters, batch: e.target.value})}
                                className="w-full pl-4 pr-10 py-3.5 bg-gray-50 border-none rounded-2xl font-bold text-xs appearance-none focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer"
                            >
                                <option value="all">All Cohorts</option>
                                {uniqueBatches.map(b => <option key={b} value={b}>{b}</option>)}
                            </select>
                            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={14} />
                        </div>
                    </div>
                </div>

                <div className="pt-2 flex items-center justify-between">
                    <div className="flex-1 max-w-md relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                        <input 
                            type="text" 
                            placeholder="Search by identity or register #..."
                            className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border-none rounded-3xl font-bold text-xs focus:ring-2 focus:ring-primary/20 transition-all shadow-inner"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button 
                        onClick={() => setFilters({ month: new Date().getMonth(), year: new Date().getFullYear(), course: 'all', status: 'all', batch: 'all' })}
                        className="p-3.5 bg-gray-50 text-gray-400 hover:text-red-500 rounded-3xl transition-all font-black text-[10px] uppercase tracking-widest shadow-sm"
                    >
                        Reset Matrix
                    </button>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex p-1.5 bg-gray-100/50 backdrop-blur-md rounded-[2.5rem] w-fit border border-gray-200 shadow-inner">
                <button 
                    onClick={() => setActiveTab('tracker')}
                    className={`px-10 py-4 rounded-[2rem] font-black text-[10px] uppercase tracking-[0.2em] transition-all flex items-center gap-2 ${
                        activeTab === 'tracker' ? 'bg-white text-primary shadow-sm' : 'text-gray-400 hover:text-gray-600'
                    }`}
                >
                    <div className={`w-1.5 h-1.5 rounded-full ${activeTab === 'tracker' ? 'bg-primary' : 'bg-gray-300'}`}></div>
                    Current Tracker
                </button>
                <button 
                    onClick={() => setActiveTab('history')}
                    className={`px-10 py-4 rounded-[2rem] font-black text-[10px] uppercase tracking-[0.2em] transition-all flex items-center gap-2 ${
                        activeTab === 'history' ? 'bg-white text-primary shadow-sm' : 'text-gray-400 hover:text-gray-600'
                    }`}
                >
                    <div className={`w-1.5 h-1.5 rounded-full ${activeTab === 'history' ? 'bg-primary' : 'bg-gray-300'}`}></div>
                    Audit Trail
                </button>
            </div>

            {/* Content Area */}
            <div className="min-h-[400px]">
                {loading ? (
                    <div className="flex flex-col items-center justify-center p-32 gap-6 bg-white/50 rounded-[3rem] border border-white">
                        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin shadow-xl"></div>
                        <div className="text-center space-y-2">
                            <p className="font-black text-xs uppercase tracking-[0.3em] text-gray-900 italic">Syncing Matrix</p>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{months[filters.month]} Cycles Insight...</p>
                        </div>
                    </div>
                ) : (
                    <AnimatePresence mode="wait">
                        {activeTab === 'tracker' ? (
                            <motion.div
                                key="tracker"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.3 }}
                            >
                                <Table headers={['Student Identity', 'Course Vector', 'Advance Credit', 'Financial Quote', 'Execution Status', 'Actions']}>
                                    {filteredStatusData.map((s) => (
                                        <tr key={s.studentId} className="hover:bg-primary/[0.02] transition-colors group">
                                            <td className="px-6 py-6">
                                                <div className="flex items-center gap-5">
                                                    <div className="w-12 h-12 rounded-3xl bg-gray-50 border border-gray-100 flex items-center justify-center text-primary font-black uppercase text-sm tracking-tighter shadow-sm group-hover:scale-110 transition-transform">
                                                        {s.name.split(' ').map(n => n[0]).join('')}
                                                    </div>
                                                    <div>
                                                        <p className="font-black text-sm uppercase tracking-tight text-gray-900 transition-colors">{s.name}</p>
                                                        <div className="flex items-center gap-2">
                                                            <p className="text-[10px] font-bold text-gray-400 tracking-widest">{s.registerNumber}</p>
                                                            <div className="w-1 h-1 rounded-full bg-gray-200"></div>
                                                            <p className="text-[10px] font-black text-primary/60 uppercase">{s.batch}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-6">
                                                <div className="flex flex-wrap gap-1.5">
                                                    {s.courses.map((c, i) => (
                                                        <span key={i} className="bg-gray-50 border border-gray-100 text-[9px] font-black uppercase px-2 py-1 rounded-lg text-gray-500 shadow-xs">{c}</span>
                                                    ))}
                                                </div>
                                            </td>
                                            <td className="px-6 py-6">
                                                <div className="space-y-1">
                                                    <p className="text-[10px] font-black text-primary uppercase italic">Credit Balance</p>
                                                    <p className="font-black text-sm text-primary">₹{(s.advanceBalance || 0).toLocaleString()}</p>
                                                </div>
                                            </td>
                                            <td className="px-6 py-6">
                                                <div className="space-y-1.5">
                                                    <div className="flex items-center justify-between gap-6 max-w-[140px]">
                                                        <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Paid</span>
                                                        <span className="text-sm font-black text-green-600">₹{s.totalPaid.toLocaleString()}</span>
                                                    </div>
                                                    <div className="flex items-center justify-between gap-6 max-w-[140px]">
                                                        <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Target</span>
                                                        <span className="text-sm font-black text-gray-900 opacity-30">₹{s.totalDue.toLocaleString()}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-6">
                                                <div className="flex flex-col gap-2">
                                                    <span className={`px-5 py-2 rounded-2xl text-[10px] font-black uppercase tracking-[0.15em] border w-fit text-center shadow-xs transition-all ${
                                                        s.status === 'paid' ? 'bg-green-500/10 text-green-600 border-green-500/20' :
                                                        s.status === 'partial' ? 'bg-orange-500/10 text-orange-600 border-orange-500/20' :
                                                        'bg-red-500/10 text-red-600 border-red-500/20'
                                                    }`}>
                                                        {s.status}
                                                    </span>
                                                    {s.balance > 0 && (
                                                        <p className="text-[10px] font-black italic text-gray-400 ml-1">Balance: ₹{s.balance.toLocaleString()}</p>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-6 text-right">
                                                <button 
                                                    onClick={() => handleQuickPay(s)}
                                                    disabled={s.status === 'paid'}
                                                    className={`p-4 rounded-2xl transition-all ${
                                                        s.status === 'paid' 
                                                            ? 'bg-gray-50 text-gray-200 cursor-not-allowed opacity-50' 
                                                            : 'bg-primary/10 text-primary hover:bg-primary hover:text-white shadow-[0_10px_20px_-10px_rgba(245,158,11,0.5)] active:scale-90 hover:-translate-y-1'
                                                    }`}
                                                >
                                                    <CreditCard size={20} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </Table>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="history"
                                initial={{ opacity: 0, scale: 0.98 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.98 }}
                                transition={{ duration: 0.3 }}
                            >
                                <Table headers={['Receipt Vector', 'Beneficiary Identity', 'Commit Details', 'Execution Timeline', 'Verified Status']}>
                                    {historyData.filter(h => h.receiptNumber.toLowerCase().includes(searchTerm.toLowerCase())).map((p) => (
                                        <tr key={p._id} className="hover:bg-primary/[0.02] transition-colors group">
                                            <td className="px-6 py-6">
                                                <div className="flex items-center gap-4">
                                                    <div className="p-3 bg-gray-100 rounded-2xl text-gray-400 shadow-inner group-hover:text-primary transition-colors"><FileText size={18}/></div>
                                                    <span className="font-black text-sm tracking-widest text-gray-800">{p.receiptNumber}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-6">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-black text-[11px] uppercase border-2 border-white shadow-md">
                                                        {p.studentId?.name[0]}
                                                    </div>
                                                    <p className="font-black text-sm tracking-tight text-gray-900">{p.studentId?.name}</p>
                                                </div>
                                            </td>
                                            <td className="px-6 py-6">
                                                <div className="space-y-1">
                                                    <p className="font-black text-sm text-green-600">₹{p.amount.toLocaleString()}</p>
                                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{p.paymentMode} Protocol</p>
                                                </div>
                                            </td>
                                            <td className="px-6 py-6">
                                                <p className="text-xs font-black text-gray-800 uppercase tracking-tighter">{new Date(p.paymentDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                                                <p className="text-[9px] font-black text-gray-300 uppercase italic tracking-widest">{p.term}</p>
                                            </td>
                                            <td className="px-6 py-6">
                                                <div className="flex items-center gap-3">
                                                    {p.proofOfPayment ? (
                                                        <a 
                                                            href={`${axios.defaults.baseURL}/${p.proofOfPayment}`} 
                                                            target="_blank" 
                                                            rel="noopener noreferrer"
                                                            className="flex items-center gap-2 px-3 py-1.5 bg-green-500/10 text-green-600 rounded-lg text-[10px] font-black uppercase hover:bg-green-500 hover:text-white transition-all shadow-sm"
                                                        >
                                                            <Eye size={14}/>
                                                            View Proof
                                                        </a>
                                                    ) : (
                                                        <span className="text-[10px] font-black uppercase text-gray-400 tracking-[0.1em] italic">No Proof</span>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </Table>
                            </motion.div>
                        )}
                    </AnimatePresence>
                )}
            </div>

            {/* Enhanced Entry Modal */}
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Financial Commit Interface" size="full">
                <form onSubmit={handleAddPayment} className="h-full flex flex-col">
                    <div className="flex-1 overflow-y-auto space-y-10 pr-4">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                            {/* Left Panel: Context & Dynamic Balance */}
                            <div className="lg:col-span-1 space-y-8">
                                <div className="card bg-primary/5 border-primary/10 space-y-6">
                                    <div className="flex items-center gap-4">
                                        <div className="p-4 bg-primary rounded-2xl text-white shadow-lg"><User size={32}/></div>
                                        <div>
                                            <h4 className="font-black uppercase text-xs tracking-widest text-primary">Context Selection</h4>
                                            <p className="font-bold text-sm italic text-gray-900">Identifying Subject...</p>
                                        </div>
                                    </div>

                                    {selectedStudent ? (
                                        <div className="p-6 bg-white rounded-3xl border border-primary/20 space-y-4">
                                            <div className="flex items-center justify-between">
                                                <span className="text-[10px] font-black uppercase text-gray-400">Student</span>
                                                <span className="font-black text-sm">{selectedStudent.name}</span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-[10px] font-black uppercase text-gray-400">Total Dues</span>
                                                <span className="font-black text-sm">₹{selectedStudent.totalDue.toLocaleString()}</span>
                                            </div>
                                            <div className="flex items-center justify-between py-2 border-y border-dashed border-gray-100">
                                                <span className="text-[10px] font-black uppercase text-gray-400">Already Paid</span>
                                                <span className="font-black text-sm text-green-600">₹{selectedStudent.totalPaid.toLocaleString()}</span>
                                            </div>
                                            <div className="flex items-center justify-between pb-2">
                                                <span className="text-[10px] font-black uppercase text-gray-400">Advance Credit</span>
                                                <span className="font-black text-sm text-primary italic">₹{(selectedStudent.advanceBalance || 0).toLocaleString()}</span>
                                            </div>
                                            <div className="flex items-center justify-between pt-2 border-t border-dashed border-gray-100">
                                                <span className="text-[10px] font-black uppercase text-primary font-bold">Outstanding Dues</span>
                                                <span className="font-black text-lg text-primary">₹{selectedStudent.balance.toLocaleString()}</span>
                                            </div>
                                        </div>
                                    ) : (
                                        <select 
                                            required 
                                            value={formData.studentId} 
                                            onChange={(e) => {
                                                const student = students.find(s => s.user?._id === e.target.value);
                                                setFormData({...formData, studentId: e.target.value});
                                                const details = statusData.find(sd => sd.userId === e.target.value);
                                                if (details) setSelectedStudent(details);
                                            }} 
                                            className="input-field"
                                        >
                                            <option value="">Select Target Entity...</option>
                                            {students.map(s => (
                                                <option key={s.user?._id} value={s.user?._id}>
                                                    {s.user?.name} — {s.registerNumber}
                                                </option>
                                            ))}
                                        </select>
                                    )}

                                    <AnimatePresence>
                                        {formData.amount > 0 && selectedStudent && (
                                            <motion.div 
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className="p-6 bg-dark text-white rounded-3xl border-none shadow-2xl space-y-4"
                                            >
                                                <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Post-Commit Projection</p>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-xs font-bold italic">New Balance</span>
                                                    <h3 className={`text-2xl font-black ${(selectedStudent.balance - formData.amount) <= 0 ? 'text-green-400' : 'text-orange-400'}`}>
                                                        ₹{Math.max(0, selectedStudent.balance - formData.amount).toLocaleString()}
                                                    </h3>
                                                </div>
                                                {(selectedStudent.balance - formData.amount) <= 0 ? (
                                                    <div className="flex items-center gap-2 text-[10px] font-black text-green-400 bg-green-400/10 p-2 rounded-xl">
                                                        <CheckCircle size={14}/>
                                                        FULL SETTLEMENT ACHIEVED
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center gap-2 text-[10px] font-black text-orange-400 bg-orange-400/10 p-2 rounded-xl">
                                                        <AlertCircle size={14}/>
                                                        PARTIAL COMMIT DETECTED
                                                    </div>
                                                )}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </div>

                            <div className="lg:col-span-2 space-y-10">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest ml-1 italic">Commit Amount (₹)</label>
                                        <div className="relative group">
                                            <div className="absolute left-6 top-1/2 -translate-y-1/2 font-black text-primary text-xl">₹</div>
                                            <input 
                                                type="number" 
                                                required 
                                                value={formData.amount} 
                                                onChange={(e) => setFormData({...formData, amount: parseFloat(e.target.value) || ''})} 
                                                className="input-field !pl-12 !py-6 !text-2xl font-black text-gray-900 bg-gray-50/50" 
                                                placeholder="0.00" 
                                            />
                                        </div>
                                    </div>
                                    
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest ml-1 italic">Protocol Receipt Number</label>
                                        <input type="text" required value={formData.receiptNumber} onChange={(e) => setFormData({...formData, receiptNumber: e.target.value})} className="input-field !py-6 font-mono text-lg font-bold" placeholder="REC-XXXXXX" />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest ml-1 italic">Execution status</label>
                                        <div className="flex gap-2">
                                            {['paid', 'partial'].map(s => (
                                                <button
                                                    key={s}
                                                    type="button"
                                                    onClick={() => setFormData({...formData, status: s})}
                                                    className={`flex-1 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest border-2 transition-all ${
                                                        formData.status === s 
                                                            ? 'bg-primary border-primary text-white shadow-xl shadow-primary/30' 
                                                            : 'bg-white border-gray-100 text-gray-400 hover:border-gray-200'
                                                    }`}
                                                >
                                                    {s}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest ml-1 italic">Payment Protocol</label>
                                        <select value={formData.paymentMode} onChange={(e) => setFormData({...formData, paymentMode: e.target.value})} className="input-field !py-5 font-bold">
                                            <option value="cash">Cash Settlement</option>
                                            <option value="upi">UPI Digital Transfer</option>
                                            <option value="cash + upi">Hybrid (Cash + UPI)</option>
                                            <option value="advance">Advance Balance (Deduct)</option>
                                        </select>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest ml-1 italic">Asset Allocation</label>
                                        <select value={formData.feeType} onChange={(e) => setFormData({...formData, feeType: e.target.value})} className="input-field !py-5 font-bold">
                                            <option value="tuition">Institutional Tuition</option>
                                            <option value="exam">Examination Dues</option>
                                            <option value="transport">Logistic Fees</option>
                                            <option value="misc">Miscellaneous</option>
                                        </select>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest ml-1 italic">Term / Cycle</label>
                                        <input type="text" value={formData.term} onChange={(e) => setFormData({...formData, term: e.target.value})} className="input-field !py-5 font-bold" placeholder="e.g. Current Month" />
                                    </div>
                                    
                                    {formData.paymentMode === 'advance' && selectedStudent && (
                                        <div className="md:col-span-2 p-6 bg-orange-50 border-2 border-dashed border-orange-200 rounded-[2rem] flex items-center gap-4 text-orange-700">
                                            <AlertCircle className="shrink-0" size={24} />
                                            <div>
                                                <p className="font-black text-xs uppercase tracking-widest">Advance Deduction Protocol</p>
                                                <p className="text-[10px] font-bold mt-1 uppercase opacity-80">
                                                    This transaction will deduct ₹{formData.amount || 0} from the current credit (₹{selectedStudent.advanceBalance || 0}).
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-4 py-8 px-8 bg-gray-50/50 rounded-[2.5rem] border border-dashed border-gray-200">
                                    <div className="flex items-center justify-between">
                                        <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest italic flex items-center gap-2">
                                            <Upload size={14} className="text-primary"/>
                                            Proof of Execution (Image/PDF)
                                        </label>
                                        {proofFile && (
                                            <button type="button" onClick={() => setProofFile(null)} className="text-[10px] font-bold text-red-500 hover:underline">Clear Attachment</button>
                                        )}
                                    </div>
                                    <div className="relative group">
                                        <input 
                                            type="file" 
                                            accept="image/*,.pdf"
                                            onChange={(e) => setProofFile(e.target.files[0])}
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                        />
                                        <div className={`p-10 border-2 border-dashed rounded-[2rem] flex flex-col items-center justify-center gap-4 transition-all ${proofFile ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200 group-hover:border-primary/50 group-hover:bg-primary/[0.02]'}`}>
                                            <div className={`p-4 rounded-2xl ${proofFile ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-400 group-hover:text-primary transition-colors'}`}>
                                                {proofFile ? <CheckCircle size={32}/> : <ImageIcon size={32}/>}
                                            </div>
                                            <div className="text-center">
                                                <p className={`font-black text-xs uppercase tracking-widest ${proofFile ? 'text-green-600' : 'text-gray-900'}`}>
                                                    {proofFile ? proofFile.name : 'Select or Drop Proof'}
                                                </p>
                                                <p className="text-[10px] font-medium text-gray-400 mt-1">Transaction evidence required for auditing</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest ml-1 italic">Transaction Annotations</label>
                                    <textarea value={formData.remarks} onChange={(e) => setFormData({...formData, remarks: e.target.value})} className="input-field min-h-[140px] py-6 text-lg font-medium" placeholder="Enter ledger notes..."></textarea>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="pt-10 mt-10 border-t border-gray-100 flex items-center justify-between">
                        <div className="hidden md:block">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest italic">Digital Integrity Verified</p>
                            <p className="text-xs font-bold text-gray-900 mt-1 uppercase">Ready for Central Synchronization</p>
                        </div>
                        <div className="flex gap-4 w-full md:w-auto">
                            <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-10 py-5 rounded-3xl font-black text-xs uppercase tracking-widest text-gray-400 hover:bg-gray-50 transition-all border border-transparent hover:border-gray-200">Abort Protocol</button>
                            <button type="submit" className="flex-[2] md:w-72 btn-primary !py-5 !rounded-3xl !text-xs uppercase tracking-[0.3em] shadow-2xl shadow-primary/40 relative overflow-hidden group">
                                <span className="relative z-10 flex items-center justify-center gap-3">
                                    Commit to Ledger
                                    <ChevronRight size={20} className="group-hover:translate-x-2 transition-transform"/>
                                </span>
                                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                            </button>
                        </div>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default Payments;
