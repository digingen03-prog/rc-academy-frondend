import React, { useState, useEffect } from 'react';
import axios from '../../utils/axiosInstance';
import Table from '../../components/Table';
import Modal from '../../components/Modal';
import { DollarSign, TrendingUp, TrendingDown, Clock, Plus, Receipt, Eye, Download, ExternalLink } from 'lucide-react';
import { toast } from 'react-toastify';
import { generateReceipt } from '../../utils/receiptGenerator';

const Finance = () => {
    const [summary, setSummary] = useState({ totalIncome: 0, totalExpense: 0, netBalance: 0 });
    const [payments, setPayments] = useState([]);
    const [expenses, setExpenses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [viewedReceipt, setViewedReceipt] = useState(null);

    useEffect(() => {
        fetchFinanceData();
    }, []);

    const fetchFinanceData = async () => {
        try {
            const [summaryRes, paymentsRes, expensesRes] = await Promise.all([
                axios.get('/api/finance/summary'),
                axios.get('/api/payments'),
                axios.get('/api/finance/expenses')
            ]);
            setSummary(summaryRes.data);
            setPayments(paymentsRes.data);
            setExpenses(expensesRes.data);
        } catch (err) {
            toast.error('Failed to fetch financial data');
        } finally {
            setLoading(false);
        }
    };

    const SummaryCard = ({ title, amount, icon: Icon, color }) => (
        <div className="card p-6 flex items-center gap-6">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${color}`}>
                <Icon size={28} className="text-white" />
            </div>
            <div>
                <p className="text-gray-500 text-sm font-bold uppercase tracking-wider">{title}</p>
                <h3 className="text-3xl font-black">₹{amount.toLocaleString()}</h3>
            </div>
        </div>
    );

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Finance Management</h1>
                    <p className="text-gray-500 text-sm">Monitor revenue, track expenses, and manage salaries.</p>
                </div>
                <div className="flex gap-3">
                    <button className="flex items-center gap-2 px-4 py-2 bg-white border border-border rounded-xl font-bold text-sm hover:bg-gray-50">
                        <Plus size={18} />
                        <span>Add Expense</span>
                    </button>
                    <button className="btn-primary flex items-center gap-2">
                        <DollarSign size={18} />
                        <span>Manual Payment</span>
                    </button>
                </div>
            </div>

            {/* Summary Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <SummaryCard title="Total Collections" amount={summary.totalIncome} icon={TrendingUp} color="bg-green-500" />
                <SummaryCard title="Total Expenses" amount={summary.totalExpense} icon={TrendingDown} color="bg-red-500" />
                <SummaryCard title="Net Balance" amount={summary.netBalance} icon={DollarSign} color="bg-orange-500" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Recent Payments */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between px-2">
                        <h3 className="font-bold flex items-center gap-2">
                            <Clock size={20} className="text-primary" />
                            Recent Fee Collections
                        </h3>
                        <button className="text-sm font-bold text-primary hover:underline">View All</button>
                    </div>
                    <div className="card !p-0 overflow-hidden">
                    <Table headers={['Student', 'Amount', 'Type', 'Date', 'Actions']}>
                            {payments.slice(0, 5).map((p) => (
                                <tr key={p._id}>
                                    <td className="px-6 py-4">
                                        <p className="font-bold text-sm">{p.studentId?.name}</p>
                                        <p className="text-xs text-gray-500">{p.receiptNumber}</p>
                                    </td>
                                    <td className="px-6 py-4 font-black text-green-600">₹{p.amount}</td>
                                    <td className="px-6 py-4 capitalize text-sm">{p.feeType}</td>
                                    <td className="px-6 py-4 text-xs text-gray-500">{new Date(p.paymentDate).toLocaleDateString()}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            {p.proofOfPayment && (
                                                <button 
                                                    onClick={() => setViewedReceipt(`${axios.defaults.baseURL}/${p.proofOfPayment}`)}
                                                    className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-all border border-blue-100"
                                                    title="View Proof"
                                                >
                                                    <Eye size={14} />
                                                </button>
                                            )}
                                            <button 
                                                onClick={() => generateReceipt(p)}
                                                className="p-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-all border border-green-100"
                                                title="Download Receipt"
                                            >
                                                <Download size={14} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </Table>
                    </div>
                </div>

                {/* Recent Expenses */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between px-2">
                        <h3 className="font-bold flex items-center gap-2">
                            <Receipt size={20} className="text-red-500" />
                            Recent General Expenses
                        </h3>
                        <button className="text-sm font-bold text-primary hover:underline">View All</button>
                    </div>
                    <div className="card !p-0 overflow-hidden">
                        <Table headers={['Title', 'Category', 'Amount', 'Date', 'Actions']}>
                            {expenses.slice(0, 5).map((e) => (
                                <tr key={e._id}>
                                    <td className="px-6 py-4">
                                        <p className="font-bold text-sm">{e.title}</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="bg-gray-100 px-2 py-1 rounded text-[10px] font-bold uppercase">{e.category}</span>
                                    </td>
                                    <td className="px-6 py-4 font-black text-red-500">₹{e.amount}</td>
                                    <td className="px-6 py-4 text-xs text-gray-500">{new Date(e.date).toLocaleDateString()}</td>
                                    <td className="px-6 py-4">
                                        {e.receiptFile ? (
                                            <button 
                                                onClick={() => setViewedReceipt(e.receiptFile)}
                                                className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-all border border-blue-100"
                                                title="View Evidence"
                                            >
                                                <Eye size={14} />
                                            </button>
                                        ) : (
                                            <div className="p-2 text-gray-200" title="No Proof Attached">
                                                <Receipt size={14} />
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </Table>
                    </div>
                </div>
            </div>

            {/* Receipt Preview Modal */}
            <Modal isOpen={!!viewedReceipt} onClose={() => setViewedReceipt(null)} title="Audit Evidence Preview" size="lg">
                <div className="flex flex-col items-center gap-4 p-4 text-center">
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 italic mb-2">Authenticated Financial Transmission</p>
                    {viewedReceipt?.toLowerCase().endsWith('.pdf') ? (
                        <iframe src={viewedReceipt} className="w-full h-[65vh] rounded-[2rem] border-4 border-gray-50 bg-white shadow-inner" title="PDF Receipt Viewer"></iframe>
                    ) : (
                        <div className="relative group">
                            <img src={viewedReceipt} alt="Receipt Proof" className="max-w-full max-h-[65vh] object-contain rounded-[2rem] shadow-2xl border-4 border-white" />
                            <div className="absolute inset-0 bg-primary/5 rounded-[2rem] pointer-events-none group-hover:bg-transparent transition-colors"></div>
                        </div>
                    )}
                    <div className="flex gap-4 mt-4 w-full justify-center">
                        <a href={viewedReceipt} download className="flex items-center gap-3 bg-gray-900 text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl hover:scale-105 transition-all">
                            <ExternalLink size={14} />
                            <span>Download Original</span>
                        </a>
                        <button onClick={() => setViewedReceipt(null)} className="px-8 py-4 bg-gray-100 text-gray-400 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-gray-200 transition-all">
                            Close Preview
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default Finance;
