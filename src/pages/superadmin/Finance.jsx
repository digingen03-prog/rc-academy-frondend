import React, { useState, useEffect } from 'react';
import axios from '../../utils/axiosInstance';
import Table from '../../components/Table';
import Modal from '../../components/Modal';
import { DollarSign, TrendingUp, TrendingDown, Clock, Plus, Receipt } from 'lucide-react';
import { toast } from 'react-toastify';

const Finance = () => {
    const [summary, setSummary] = useState({ totalIncome: 0, totalExpense: 0, netBalance: 0 });
    const [payments, setPayments] = useState([]);
    const [expenses, setExpenses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

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
                        <Table headers={['Student', 'Amount', 'Type', 'Date']}>
                            {payments.slice(0, 5).map((p) => (
                                <tr key={p._id}>
                                    <td className="px-6 py-4">
                                        <p className="font-bold text-sm">{p.studentId?.name}</p>
                                        <p className="text-xs text-gray-500">{p.receiptNumber}</p>
                                    </td>
                                    <td className="px-6 py-4 font-black text-green-600">₹{p.amount}</td>
                                    <td className="px-6 py-4 capitalize text-sm">{p.feeType}</td>
                                    <td className="px-6 py-4 text-xs text-gray-500">{new Date(p.paymentDate).toLocaleDateString()}</td>
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
                        <Table headers={['Title', 'Category', 'Amount', 'Date']}>
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
                                </tr>
                            ))}
                        </Table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Finance;
