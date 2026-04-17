import React, { useState, useEffect } from 'react';
import axios from '../../utils/axiosInstance';
import { useAuth } from '../../context/AuthContext';
import Table from '../../components/Table';
import { Wallet, TrendingUp, Calendar, ArrowDownCircle, ShieldCheck, DollarSign } from 'lucide-react';
import { toast } from 'react-toastify';

const StaffSalary = () => {
    const { user } = useAuth();
    const [salaries, setSalaries] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchSalaries();
    }, []);

    const fetchSalaries = async () => {
        try {
            const { data } = await axios.get('/api/finance/my-salary');
            setSalaries(data);
        } catch (err) {
            toast.error('Failed to load salary history');
        } finally {
            setLoading(false);
        }
    };

    const latestSalary = salaries.length > 0 ? salaries[0] : null;

    const getMonthName = (monthNum) => {
        return new Date(2000, monthNum - 1).toLocaleString('default', { month: 'long' });
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Header section with latest payment stats */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-3xl font-black italic uppercase tracking-tighter">Earnings & Remuneration</h1>
                    <p className="text-gray-500 text-sm italic">Detailed breakdown of your professional compensation and payout history.</p>
                </div>
                <div className="bg-black text-white px-8 py-4 rounded-[2rem] flex flex-col items-end shadow-2xl">
                    <span className="text-[10px] font-black uppercase opacity-60 tracking-[0.2em]">Total Net YTD</span>
                    <span className="text-2xl font-black tabular-nums">
                        ${salaries.reduce((acc, curr) => acc + curr.netSalary, 0).toLocaleString()}
                    </span>
                </div>
            </div>

            {/* Top Cards Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Latest Payout Card */}
                <div className="lg:col-span-2 card !p-8 bg-gradient-to-br from-primary to-primary/80 text-white relative overflow-hidden shadow-2xl shadow-primary/20">
                    <div className="absolute top-0 right-0 p-12 opacity-10">
                        <TrendingUp size={160} />
                    </div>
                    
                    <div className="relative z-10 flex flex-col h-full justify-between">
                        <div className="flex justify-between items-start">
                            <div className="space-y-1">
                                <p className="text-xs font-black uppercase tracking-widest opacity-80">Latest Remittance</p>
                                <h2 className="text-4xl font-black uppercase italic tracking-tighter">
                                    {latestSalary ? `${getMonthName(latestSalary.month)} ${latestSalary.year}` : 'N/A'}
                                </h2>
                            </div>
                            <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-md">
                                <Wallet size={24} />
                            </div>
                        </div>

                        <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-8">
                            <div>
                                <p className="text-[9px] font-black uppercase tracking-widest opacity-60">Net Disbursed</p>
                                <p className="text-2xl font-black tracking-tighter">${latestSalary?.netSalary?.toLocaleString() || '0.00'}</p>
                            </div>
                            <div>
                                <p className="text-[9px] font-black uppercase tracking-widest opacity-60">Status</p>
                                <div className="flex items-center gap-1 mt-1">
                                    <ShieldCheck size={14} className="text-green-300"/>
                                    <p className="font-black text-xs uppercase tracking-widest">VERIFIED</p>
                                </div>
                            </div>
                            <div className="col-span-2 hidden md:block">
                                <p className="text-[9px] font-black uppercase tracking-widest opacity-60">Reference Hash</p>
                                <p className="text-[10px] font-mono mt-1 opacity-80 truncate uppercase">PAY-{latestSalary?._id.slice(-8) || 'PENDING'}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Account Details / Stats Widget */}
                <div className="card !p-8 bg-gray-50 border-none flex flex-col justify-between">
                    <div>
                        <div className="flex items-center gap-2 text-primary mb-6">
                            <DollarSign size={20} strokeWidth={3}/>
                            <h3 className="font-black uppercase text-xs tracking-widest">Component Analysis</h3>
                        </div>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                                <span className="text-xs font-bold text-gray-400 uppercase">Base Salary</span>
                                <span className="font-black text-sm">${latestSalary?.basicSalary?.toLocaleString() || '0'}</span>
                            </div>
                            <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                                <span className="text-xs font-bold text-gray-400 uppercase">Allowances</span>
                                <span className="font-black text-sm text-green-500">+${latestSalary?.allowances?.toLocaleString() || '0'}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-xs font-bold text-gray-400 uppercase">Tax/Deductions</span>
                                <span className="font-black text-sm text-red-500">-${latestSalary?.deductions?.toLocaleString() || '0'}</span>
                            </div>
                        </div>
                    </div>
                    <div className="mt-8 p-4 bg-white rounded-2xl border-2 border-dashed border-gray-200 text-center">
                        <p className="text-[9px] font-black text-gray-300 uppercase italic">Next Scheduled Payout</p>
                        <p className="text-sm font-black mt-1">MAY 01, 2026</p>
                    </div>
                </div>
            </div>

            {/* History Table */}
            <div className="space-y-4">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-primary/10 rounded-2xl text-primary"><Calendar size={20}/></div>
                    <h3 className="text-xl font-black uppercase italic tracking-tight">Payment Ledger</h3>
                </div>

                <div className="card !p-0 overflow-hidden border-2 border-primary/5">
                    {loading ? (
                        <div className="p-32 text-center font-black text-gray-200 tracking-widest uppercase animate-pulse">Retrieving Secure Records...</div>
                    ) : (
                        <Table headers={['Billing Cycle', 'Date Issued', 'Breakdown', 'Net Amount', 'Receipt']}>
                            {salaries.map((s) => (
                                <tr key={s._id} className="hover:bg-primary/5 transition-all group">
                                    <td className="px-6 py-5">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-2xl bg-gray-50 flex items-center justify-center font-black text-xs text-primary group-hover:bg-primary group-hover:text-white transition-all shadow-sm">
                                                {getMonthName(s.month).slice(0, 3)}
                                            </div>
                                            <p className="font-black text-sm uppercase tracking-tight">{getMonthName(s.month)} {s.year}</p>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest italic font-mono">
                                            {new Date(s.paidOn).toLocaleDateString('en-US', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                                        </span>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-tighter opacity-70">
                                            <span className="text-gray-400">B: <span className="text-black">${s.basicSalary}</span></span>
                                            <span className="text-green-600">A: +${s.allowances}</span>
                                            <span className="text-red-500">D: -${s.deductions}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="flex items-center gap-2">
                                            <ArrowDownCircle size={14} className="text-green-500"/>
                                            <span className="font-black text-sm tabular-nums">${s.netSalary.toLocaleString()}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <button className="px-4 py-2 bg-gray-50 hover:bg-black hover:text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border border-gray-100 shadow-sm">
                                            Download
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {salaries.length === 0 && (
                                <tr>
                                    <td colSpan="5" className="px-6 py-20 text-center text-gray-300 font-bold uppercase italic tracking-widest">No payout records found in the current archive.</td>
                                </tr>
                            )}
                        </Table>
                    )}
                </div>
            </div>
        </div>
    );
};

export default StaffSalary;
