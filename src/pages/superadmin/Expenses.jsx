import React, { useState, useEffect } from 'react';
import axios from '../../utils/axiosInstance';
import Table from '../../components/Table';
import Modal from '../../components/Modal';
import { Plus, Receipt, Search, Filter, Calendar, DollarSign, ExternalLink } from 'lucide-react';
import { toast } from 'react-toastify';

const Expenses = () => {
    const [expenses, setExpenses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const [formData, setFormData] = useState({
        title: '', category: 'supplies', amount: '',
        date: new Date().toISOString().split('T')[0],
        description: '', paidTo: ''
    });

    useEffect(() => {
        fetchExpenses();
    }, []);

    const fetchExpenses = async () => {
        try {
            const { data } = await axios.get('/api/finance/expenses');
            setExpenses(data);
        } catch (err) {
            toast.error('Failed to fetch expenses');
        } finally {
            setLoading(false);
        }
    };

    const handleAddExpense = async (e) => {
        e.preventDefault();
        try {
            await axios.post('/api/finance/expenses', formData);
            toast.success('Expense recorded successfully!');
            setIsModalOpen(false);
            fetchExpenses();
            setFormData({ title: '', category: 'supplies', amount: '', date: new Date().toISOString().split('T')[0], description: '', paidTo: '' });
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to record expense');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold">Expense Management</h1>
                    <p className="text-gray-500 text-sm">Track and monitor all school-related expenditures.</p>
                </div>
                <button 
                    onClick={() => setIsModalOpen(true)}
                    className="btn-primary flex items-center gap-2"
                >
                    <Plus size={18} />
                    <span>Record New Expense</span>
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="card bg-primary text-white p-6">
                    <p className="text-white/70 text-sm font-bold uppercase">This Month's Spending</p>
                    <h3 className="text-4xl font-black mt-2">₹{expenses.reduce((acc, curr) => acc + curr.amount, 0).toLocaleString()}</h3>
                </div>
                <div className="card p-6 flex items-center justify-between">
                    <div>
                        <p className="text-gray-500 text-xs font-bold uppercase">Largest Category</p>
                        <h3 className="text-xl font-bold mt-1">Supplies & Material</h3>
                    </div>
                    <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center text-primary">
                        <Receipt size={24} />
                    </div>
                </div>
                <div className="card p-6 flex items-center justify-between">
                    <div>
                        <p className="text-gray-500 text-xs font-bold uppercase">Total Transactions</p>
                        <h3 className="text-xl font-bold mt-1">{expenses.length} Records</h3>
                    </div>
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600">
                        <DollarSign size={24} />
                    </div>
                </div>
            </div>

            <div className="card !p-0 overflow-hidden">
                {loading ? (
                    <div className="p-12 text-center text-gray-500 font-bold">Loading expenses...</div>
                ) : (
                    <Table headers={['Title', 'Category', 'Amount', 'Paid To', 'Date', 'Receipt']}>
                        {expenses.map((e) => (
                            <tr key={e._id}>
                                <td className="px-6 py-4">
                                    <p className="font-bold text-sm">{e.title}</p>
                                    <p className="text-xs text-gray-400 truncate max-w-[200px]">{e.description}</p>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="bg-gray-100 px-2 py-1 rounded text-[10px] font-black uppercase tracking-widest text-gray-600">{e.category}</span>
                                </td>
                                <td className="px-6 py-4 font-black text-red-500">-${e.amount}</td>
                                <td className="px-6 py-4 text-sm font-medium">{e.paidTo || 'N/A'}</td>
                                <td className="px-6 py-4 text-xs font-bold text-gray-400">{new Date(e.date).toLocaleDateString()}</td>
                                <td className="px-6 py-4">
                                    {e.receiptFile ? (
                                        <a href={e.receiptFile} target="_blank" rel="noreferrer" className="text-primary flex items-center gap-1 text-xs font-bold hover:underline">
                                            <ExternalLink size={14} /> View
                                        </a>
                                    ) : (
                                        <span className="text-gray-300 text-xs italic">No Receipt</span>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </Table>
                )}
            </div>

            {/* Add Expense Modal */}
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Record New School Expense">
                <form onSubmit={handleAddExpense} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="col-span-full">
                        <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Expense Title</label>
                        <input type="text" required value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} className="w-full px-4 py-3 border border-border rounded-xl outline-none focus:ring-2 focus:ring-primary/20" placeholder="e.g. Lab Chemicals Purchase" />
                    </div>
                    <div>
                        <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Category</label>
                        <select required value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} className="w-full px-4 py-3 border border-border rounded-xl">
                            <option value="salary">Salaries</option>
                            <option value="utilities">Utilities (Power/Water)</option>
                            <option value="maintenance">Maintenance</option>
                            <option value="supplies">Supplies & Material</option>
                            <option value="misc">Miscellaneous</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Amount ($)</label>
                        <input type="number" required value={formData.amount} onChange={(e) => setFormData({...formData, amount: e.target.value})} className="w-full px-4 py-3 border border-border rounded-xl outline-none" />
                    </div>
                    <div>
                        <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Paid To / Vendor</label>
                        <input type="text" value={formData.paidTo} onChange={(e) => setFormData({...formData, paidTo: e.target.value})} className="w-full px-4 py-3 border border-border rounded-xl" placeholder="e.g. Science Supplies Co." />
                    </div>
                    <div>
                        <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Date</label>
                        <input type="date" required value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})} className="w-full px-4 py-3 border border-border rounded-xl" />
                    </div>
                    <div className="col-span-full">
                        <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Description</label>
                        <textarea value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} className="w-full px-4 py-3 border border-border rounded-xl" rows="3"></textarea>
                    </div>

                    <div className="col-span-full pt-4">
                        <button type="submit" className="w-full btn-primary py-4 font-black uppercase text-sm tracking-widest">Post Expense Record</button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default Expenses;
