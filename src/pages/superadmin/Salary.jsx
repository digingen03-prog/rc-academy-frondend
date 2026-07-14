import React, { useState, useEffect } from 'react';
import axios from '../../utils/axiosInstance';
import Table from '../../components/Table';
import Modal from '../../components/Modal';
import { Wallet, Search, Calendar, AlertCircle, CheckCircle, ChevronDown, Filter, DollarSign, HandCoins, ReceiptText, User, ArrowDownCircle } from 'lucide-react';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';

const SuperAdminSalary = () => {
    const [activeTab, setActiveTab] = useState('tracker'); // 'tracker' or 'history'
    const [statusData, setStatusData] = useState([]);
    const [historyData, setHistoryData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedStaff, setSelectedStaff] = useState(null);

    // Filter State
    const [filters, setFilters] = useState({
        month: new Date().getMonth(),
        year: new Date().getFullYear(),
    });

    // Form State
    const [formData, setFormData] = useState({
        totalAmount: '',
        amountPaid: '',
        paymentMode: 'bank transfer',
        remarks: ''
    });

    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        fetchData();
    }, [activeTab, filters.month, filters.year]);

    const fetchData = async () => {
        setLoading(true);
        try {
            if (activeTab === 'tracker') {
                const { data } = await axios.get(`/api/salaries/status?month=${filters.month}&year=${filters.year}`);
                setStatusData(data);
            } else {
                const { data } = await axios.get('/api/salaries/history');
                setHistoryData(data);
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to load salary ledger');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenPayModal = (staff) => {
        setSelectedStaff(staff);
        setFormData({
            totalAmount: staff.salaryRecordId ? staff.totalAmount : staff.defaultSalary,
            amountPaid: staff.salaryRecordId ? staff.balance : staff.defaultSalary,
            paymentMode: staff.paymentMode || 'bank transfer',
            remarks: staff.remarks || ''
        });
        setIsModalOpen(true);
    };

    const handlePaySalarySubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const payload = {
                userId: selectedStaff.userId,
                month: filters.month,
                year: filters.year,
                totalAmount: parseFloat(formData.totalAmount),
                amountPaid: parseFloat(formData.amountPaid),
                paymentMode: formData.paymentMode,
                remarks: formData.remarks
            };

            await axios.post('/api/salaries/pay', payload);
            toast.success('Salary transaction committed successfully');
            setIsModalOpen(false);
            fetchData();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Transaction failed');
        } finally {
            setIsSubmitting(false);
        }
    };

    const filteredStatusData = statusData.filter(s => 
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.designation.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.department.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredHistoryData = historyData.filter(h => 
        h.staffId?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const months = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    const stats = {
        totalDisbursed: statusData.reduce((sum, s) => sum + s.amountPaid, 0),
        pendingBalance: statusData.reduce((sum, s) => sum + s.balance, 0),
        paidCount: statusData.filter(s => s.status === 'paid').length,
        partialCount: statusData.filter(s => s.status === 'partial').length,
    };

    return (
        <div className="space-y-8 animate-slide-up pb-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black italic uppercase tracking-tighter text-gray-900 leading-none">Remuneration Portal</h1>
                    <p className="text-gray-500 text-sm font-medium mt-1 font-sans">Manage, adjust and disburse staff compensation logs.</p>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="card !bg-primary text-white border-none shadow-2xl shadow-primary/20 overflow-hidden relative">
                    <div className="absolute top-0 right-0 p-4 opacity-10"><DollarSign size={64}/></div>
                    <p className="text-[10px] font-black uppercase opacity-60 tracking-[0.2em] mb-2">Total Disbursed</p>
                    <h3 className="text-3xl font-black tracking-tighter">₹{stats.totalDisbursed.toLocaleString()}</h3>
                    <div className="mt-4 flex items-center gap-2 text-[10px] font-bold">
                        <span className="bg-white/20 px-2 py-0.5 rounded-full uppercase tracking-widest">{months[filters.month]} {filters.year}</span>
                    </div>
                </div>
                <div className="card !bg-dark text-white border-none shadow-xl shadow-black/10 overflow-hidden relative">
                    <div className="absolute top-0 right-0 p-4 opacity-5"><AlertCircle size={64}/></div>
                    <p className="text-[10px] font-black uppercase opacity-60 tracking-[0.2em] mb-2">Pending Balance</p>
                    <h3 className="text-3xl font-black tracking-tighter text-orange-400">₹{stats.pendingBalance.toLocaleString()}</h3>
                    <div className="mt-4 flex items-center gap-2 text-[10px] font-bold">
                        <span className="bg-orange-500/20 text-orange-400 px-2 py-0.5 rounded-full uppercase tracking-widest">{statusData.length - stats.paidCount} Units Pending</span>
                    </div>
                </div>
                <div className="card border-none bg-white shadow-sm flex flex-col justify-between">
                    <div>
                        <p className="text-[10px] font-black uppercase text-gray-400 tracking-[0.2em] mb-1">Clearance Rate</p>
                        <h3 className="text-2xl font-black tracking-tight text-gray-900">{statusData.length > 0 ? Math.round((stats.paidCount / statusData.length) * 100) : 0}%</h3>
                    </div>
                    <div className="w-full bg-gray-100 h-1.5 rounded-full mt-4 overflow-hidden">
                        <div className="bg-green-500 h-full transition-all duration-1000" style={{ width: `${(stats.paidCount / statusData.length) * 100}%` }}></div>
                    </div>
                </div>
                <div className="card border-none bg-white shadow-sm flex flex-col justify-between">
                    <div>
                        <p className="text-[10px] font-black uppercase text-gray-400 tracking-[0.2em] mb-1 font-sans">Partial Payouts</p>
                        <h3 className="text-2xl font-black tracking-tight text-primary">{stats.partialCount}</h3>
                    </div>
                    <p className="text-[10px] font-medium text-gray-400 mt-4 italic">Partial commitments awaiting full closure</p>
                </div>
            </div>

            {/* Filter Module */}
            <div className="card bg-white/40 backdrop-blur-xl border-white shadow-xl shadow-black/[0.03] space-y-6">
                <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
                    <div className="p-2 bg-primary/10 rounded-xl text-primary"><Filter size={18}/></div>
                    <h4 className="font-black text-xs uppercase tracking-widest text-gray-900">Search & Filtering</h4>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1 italic">Period Month</label>
                        <div className="relative">
                            <select 
                                value={filters.month} 
                                onChange={(e) => setFilters({...filters, month: parseInt(e.target.value)})}
                                className="w-full pl-4 pr-10 py-3.5 bg-gray-50 border-none rounded-2xl font-bold text-xs appearance-none focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer"
                            >
                                {months.map((m, i) => <option key={i} value={i}>{m}</option>)}
                            </select>
                            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={14} />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1 italic">Period Year</label>
                        <div className="relative">
                            <select 
                                value={filters.year} 
                                onChange={(e) => setFilters({...filters, year: parseInt(e.target.value)})}
                                className="w-full pl-4 pr-10 py-3.5 bg-gray-50 border-none rounded-2xl font-bold text-xs appearance-none focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer"
                            >
                                {[2024, 2025, 2026, 2027].map(y => <option key={y} value={y}>{y}</option>)}
                            </select>
                            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={14} />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1 italic">Staff Name/Designation</label>
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                            <input 
                                type="text" 
                                placeholder="Search identity..."
                                className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border-none rounded-2xl font-bold text-xs focus:ring-2 focus:ring-primary/20 transition-all shadow-inner"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
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
                    Current Payouts
                </button>
                <button 
                    onClick={() => setActiveTab('history')}
                    className={`px-10 py-4 rounded-[2rem] font-black text-[10px] uppercase tracking-[0.2em] transition-all flex items-center gap-2 ${
                        activeTab === 'history' ? 'bg-white text-primary shadow-sm' : 'text-gray-400 hover:text-gray-600'
                    }`}
                >
                    <div className={`w-1.5 h-1.5 rounded-full ${activeTab === 'history' ? 'bg-primary' : 'bg-gray-300'}`}></div>
                    Remittance Ledger
                </button>
            </div>

            {/* Content Area */}
            <div className="min-h-[400px]">
                {loading ? (
                    <div className="flex flex-col items-center justify-center p-32 gap-6 bg-white/50 rounded-[3rem] border border-white">
                        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin shadow-xl"></div>
                        <div className="text-center space-y-2">
                            <p className="font-black text-xs uppercase tracking-[0.3em] text-gray-900 italic">Syncing Ledger</p>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Compiling Records...</p>
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
                                <Table headers={['Staff Identity', 'Designation / Dept', 'Financial Breakdown', 'Settlement Status', 'Actions']}>
                                    {filteredStatusData.map((s) => (
                                        <tr key={s.staffId} className="hover:bg-primary/[0.02] transition-colors group">
                                            <td className="px-6 py-6">
                                                <div className="flex items-center gap-5">
                                                    <div className="w-12 h-12 rounded-3xl bg-gray-50 border border-gray-100 flex items-center justify-center text-primary font-black uppercase text-sm tracking-tighter shadow-sm group-hover:scale-110 transition-transform">
                                                        {s.name.split(' ').map(n => n[0]).join('')}
                                                    </div>
                                                    <div>
                                                        <p className="font-black text-sm uppercase tracking-tight text-gray-900">{s.name}</p>
                                                        <div className="flex items-center gap-2">
                                                            <p className="text-[10px] font-bold text-gray-400 tracking-widest">{s.email}</p>
                                                            <div className="w-1 h-1 rounded-full bg-gray-200"></div>
                                                            <p className="text-[10px] font-bold text-gray-400 tracking-widest">{s.phone}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-6">
                                                <div className="space-y-1">
                                                    <p className="font-black text-xs text-gray-800 uppercase tracking-wide">{s.designation}</p>
                                                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{s.department}</p>
                                                </div>
                                            </td>
                                            <td className="px-6 py-6">
                                                <div className="space-y-1.5">
                                                    <div className="flex items-center justify-between gap-6 max-w-[150px]">
                                                        <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Base default</span>
                                                        <span className="text-xs font-black text-gray-700">₹{s.defaultSalary.toLocaleString()}</span>
                                                    </div>
                                                    <div className="flex items-center justify-between gap-6 max-w-[150px]">
                                                        <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">total due</span>
                                                        <span className="text-xs font-black text-gray-950">₹{s.totalAmount.toLocaleString()}</span>
                                                    </div>
                                                    <div className="flex items-center justify-between gap-6 max-w-[150px] border-t border-dashed border-gray-100 pt-1">
                                                        <span className="text-[9px] font-black text-green-600 uppercase tracking-widest">Paid so far</span>
                                                        <span className="text-xs font-black text-green-600">₹{s.amountPaid.toLocaleString()}</span>
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
                                                        <p className="text-[10px] font-black italic text-gray-400 ml-1">Balance Due: ₹{s.balance.toLocaleString()}</p>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-6 text-right">
                                                <button 
                                                    onClick={() => handleOpenPayModal(s)}
                                                    disabled={s.status === 'paid'}
                                                    className={`px-5 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${
                                                        s.status === 'paid' 
                                                            ? 'bg-gray-50 text-gray-200 cursor-not-allowed opacity-50' 
                                                            : 'bg-primary/10 text-primary hover:bg-primary hover:text-white shadow-sm active:scale-95'
                                                    }`}
                                                >
                                                    {s.status === 'pending' ? 'Disburse Salary' : s.status === 'partial' ? 'Pay Balance' : 'Fully Paid'}
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {filteredStatusData.length === 0 && (
                                        <tr>
                                            <td colSpan="5" className="px-6 py-20 text-center text-gray-300 font-bold uppercase italic tracking-widest">No staff records found for this period.</td>
                                        </tr>
                                    )}
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
                                <Table headers={['Billing Cycle', 'Staff Identity', 'Disbursement details', 'Timeline', 'Payment Mode', 'Remarks']}>
                                    {filteredHistoryData.map((p) => (
                                        <tr key={p._id} className="hover:bg-primary/[0.02] transition-colors group">
                                            <td className="px-6 py-6">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-2xl bg-gray-50 flex items-center justify-center font-black text-xs text-primary group-hover:bg-primary group-hover:text-white transition-all shadow-sm">
                                                        {months[p.month]?.slice(0, 3)}
                                                    </div>
                                                    <p className="font-black text-sm uppercase tracking-tight">{months[p.month]} {p.year}</p>
                                                </div>
                                            </td>
                                            <td className="px-6 py-6">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-black text-[11px] uppercase border-2 border-white shadow-md">
                                                        {p.staffId?.name ? p.staffId.name[0] : 'S'}
                                                    </div>
                                                    <p className="font-black text-sm tracking-tight text-gray-900">{p.staffId?.name || 'N/A'}</p>
                                                </div>
                                            </td>
                                            <td className="px-6 py-6">
                                                <div className="space-y-1">
                                                    <div className="flex gap-4 text-[10px] font-bold uppercase tracking-tighter opacity-70">
                                                        <span>Due: <span className="text-black">₹{p.totalAmount}</span></span>
                                                        <span className="text-green-600">Paid: ₹{p.amountPaid}</span>
                                                    </div>
                                                    {p.balance > 0 ? (
                                                        <p className="text-[9px] font-black text-red-500 uppercase">Outstanding: ₹{p.balance}</p>
                                                    ) : (
                                                        <p className="text-[9px] font-black text-green-600 uppercase flex items-center gap-1"><CheckCircle size={10}/> Fully Paid</p>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-6">
                                                <p className="text-xs font-black text-gray-800 uppercase tracking-tighter">
                                                    {new Date(p.paidOn).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                                </p>
                                                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">By {p.paidBy?.name || 'SuperAdmin'}</p>
                                            </td>
                                            <td className="px-6 py-6">
                                                <span className="text-xs font-black uppercase text-gray-700 bg-gray-50 border border-gray-100 px-3 py-1.5 rounded-lg shadow-2xs">{p.paymentMode}</span>
                                            </td>
                                            <td className="px-6 py-6 text-xs text-gray-500 italic max-w-[200px] truncate">
                                                {p.remarks || 'No remarks'}
                                            </td>
                                        </tr>
                                    ))}
                                    {filteredHistoryData.length === 0 && (
                                        <tr>
                                            <td colSpan="6" className="px-6 py-20 text-center text-gray-300 font-bold uppercase italic tracking-widest">No salary payment records found in history.</td>
                                        </tr>
                                    )}
                                </Table>
                            </motion.div>
                        )}
                    </AnimatePresence>
                )}
            </div>

            {/* Pay Salary Modal */}
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Salary Disbursement Interface" size="full">
                {selectedStaff && (
                    <form onSubmit={handlePaySalarySubmit} className="h-full flex flex-col">
                        <div className="flex-1 overflow-y-auto space-y-10 pr-4">
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                                {/* Left Panel: Context & Projections */}
                                <div className="lg:col-span-1 space-y-8">
                                    <div className="card bg-primary/5 border-primary/10 space-y-6">
                                        <div className="flex items-center gap-4">
                                            <div className="p-4 bg-primary rounded-2xl text-white shadow-lg"><User size={32}/></div>
                                            <div>
                                                <h4 className="font-black uppercase text-xs tracking-widest text-primary">Recipient Context</h4>
                                                <p className="font-bold text-sm italic text-gray-900">{selectedStaff.name}</p>
                                            </div>
                                        </div>

                                        <div className="p-6 bg-white rounded-3xl border border-primary/20 space-y-4 text-xs font-medium">
                                            <div className="flex justify-between items-center">
                                                <span className="text-[10px] font-black uppercase text-gray-400">Designation</span>
                                                <span className="font-bold text-gray-800">{selectedStaff.designation}</span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-[10px] font-black uppercase text-gray-400">Department</span>
                                                <span className="font-bold text-gray-800">{selectedStaff.department || 'N/A'}</span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-[10px] font-black uppercase text-gray-400">Default Base Salary</span>
                                                <span className="font-black text-gray-900">₹{selectedStaff.defaultSalary.toLocaleString()}</span>
                                            </div>
                                            {selectedStaff.salaryRecordId && (
                                                <div className="flex justify-between items-center border-t border-dashed border-primary/10 pt-3 mt-1">
                                                    <span className="text-[10px] font-black uppercase text-emerald-600">Already Paid</span>
                                                    <span className="font-black text-emerald-600">₹{selectedStaff.amountPaid.toLocaleString()}</span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Payment Projections */}
                                        {formData.totalAmount !== '' && formData.amountPaid !== '' && (
                                            <div className="p-6 bg-white rounded-3xl border border-gray-200 space-y-4">
                                                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Post-Payment Calculation</p>
                                                <div className="flex justify-between items-center">
                                                    <span className="text-xs font-bold italic text-gray-700">Remaining Balance</span>
                                                    <h3 className={`text-2xl font-black ${(parseFloat(formData.totalAmount) - (selectedStaff.amountPaid || 0) - parseFloat(formData.amountPaid)) <= 0 ? 'text-green-600' : 'text-orange-600'}`}>
                                                        ₹{Math.max(0, parseFloat(formData.totalAmount) - (selectedStaff.amountPaid || 0) - parseFloat(formData.amountPaid)).toLocaleString()}
                                                    </h3>
                                                </div>
                                                {(parseFloat(formData.totalAmount) - (selectedStaff.amountPaid || 0) - parseFloat(formData.amountPaid)) <= 0 ? (
                                                    <div className="flex items-center gap-1.5 text-[9px] font-black text-green-600 uppercase bg-green-50 p-2.5 rounded-xl">
                                                        <CheckCircle size={14}/> Full Payment Settlement
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center gap-1.5 text-[9px] font-black text-orange-600 uppercase bg-orange-50 p-2.5 rounded-xl">
                                                        <AlertCircle size={14}/> Partial Remittance Committed
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Right Panel: Input Fields */}
                                <div className="lg:col-span-2 space-y-10">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest ml-1 italic">Total Salary Due (₹)</label>
                                            <div className="relative">
                                                <div className="absolute left-6 top-1/2 -translate-y-1/2 font-black text-primary text-xl">₹</div>
                                                <input 
                                                    type="number" 
                                                    required
                                                    value={formData.totalAmount} 
                                                    onChange={(e) => {
                                                        const total = parseFloat(e.target.value) || 0;
                                                        setFormData({
                                                            ...formData, 
                                                            totalAmount: e.target.value,
                                                            amountPaid: Math.min(parseFloat(formData.amountPaid) || 0, total)
                                                        });
                                                    }} 
                                                    className="input-field !pl-12 !py-6 !text-2xl font-black text-gray-900 bg-gray-50/50" 
                                                    placeholder="0.00" 
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest ml-1 italic">Amount to Pay now (₹)</label>
                                            <div className="relative">
                                                <div className="absolute left-6 top-1/2 -translate-y-1/2 font-black text-primary text-xl">₹</div>
                                                <input 
                                                    type="number" 
                                                    required
                                                    value={formData.amountPaid} 
                                                    onChange={(e) => setFormData({...formData, amountPaid: e.target.value})} 
                                                    className="input-field !pl-12 !py-6 !text-2xl font-black text-gray-900 bg-gray-50/50" 
                                                    placeholder="0.00" 
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest ml-1 italic">Payment Protocol</label>
                                            <div className="relative">
                                                <select 
                                                    value={formData.paymentMode} 
                                                    onChange={(e) => setFormData({...formData, paymentMode: e.target.value})}
                                                    className="w-full pl-4 pr-10 py-5 bg-gray-50 border-none rounded-2xl font-bold text-sm appearance-none focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer"
                                                >
                                                    <option value="bank transfer">Bank Transfer</option>
                                                    <option value="cash">Cash</option>
                                                    <option value="upi">UPI Protocol</option>
                                                    <option value="cheque">Cheque</option>
                                                </select>
                                                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={14} />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest ml-1 italic">Remarks / Reference</label>
                                            <textarea 
                                                value={formData.remarks} 
                                                onChange={(e) => setFormData({...formData, remarks: e.target.value})} 
                                                className="input-field !py-4 font-medium text-gray-800 bg-gray-50/50" 
                                                placeholder="Ref hash, bank detail remarks..."
                                                rows="2"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Form Buttons */}
                        <div className="pt-6 border-t border-gray-150 flex gap-4 justify-end">
                            <button 
                                type="button" 
                                onClick={() => setIsModalOpen(false)} 
                                className="px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest text-gray-400 hover:bg-gray-50 transition-all border border-transparent hover:border-gray-200"
                            >
                                Cancel
                            </button>
                            <button 
                                type="submit" 
                                disabled={isSubmitting}
                                className="px-8 py-4 btn-primary !rounded-2xl !text-xs uppercase tracking-widest shadow-lg shadow-primary/20"
                            >
                                {isSubmitting ? 'Recording...' : 'Commit Disbursal'}
                            </button>
                        </div>
                    </form>
                )}
            </Modal>
        </div>
    );
};

export default SuperAdminSalary;
