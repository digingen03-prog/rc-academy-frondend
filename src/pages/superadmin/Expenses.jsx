import React, { useState, useEffect } from 'react';
import axios from '../../utils/axiosInstance';
import Table from '../../components/Table';
import Modal from '../../components/Modal';
import { Plus, Receipt, Search, Filter, Calendar, DollarSign, ExternalLink, CheckCircle, XCircle, Clock, User } from 'lucide-react';
import { toast } from 'react-toastify';

const Expenses = () => {
    const [expenses, setExpenses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [viewedReceipt, setViewedReceipt] = useState(null);

    const [formData, setFormData] = useState({
        title: '', category: 'supplies', amount: '',
        date: new Date().toISOString().split('T')[0],
        description: '', paidTo: '',
        receipt: null
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

    const handleFileChange = (e) => {
        setFormData({ ...formData, receipt: e.target.files[0] });
    };

    const handleAddExpense = async (e) => {
        e.preventDefault();
        try {
            const data = new FormData();
            Object.keys(formData).forEach(key => {
                if (formData[key] !== null) {
                    data.append(key, formData[key]);
                }
            });

            await axios.post('/api/finance/expenses', data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            
            toast.success('Expense recorded successfully!');
            setIsModalOpen(false);
            fetchExpenses();
            setFormData({ 
                title: '', category: 'supplies', amount: '', 
                date: new Date().toISOString().split('T')[0], 
                description: '', paidTo: '', receipt: null 
            });
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to record expense');
        }
    };

    const handleStatusUpdate = async (id, status) => {
        try {
            await axios.patch(`/api/finance/expenses/${id}/status`, { status });
            toast.success(`Expense ${status.toLowerCase()} successfully`);
            fetchExpenses();
        } catch (err) {
            toast.error('Failed to update status');
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
                    <Table headers={['Title', 'Category', 'Amount', 'Date', 'Submitted By', 'Status', 'Proof', 'Actions']}>
                        {expenses.map((e) => (
                            <tr key={e._id}>
                                <td className="px-6 py-4">
                                    <p className="font-bold text-sm text-gray-900 leading-tight">{e.title}</p>
                                    <p className="text-[10px] text-gray-400 mt-0.5 line-clamp-1 italic">{e.description || 'No detailed brief provided.'}</p>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">{e.category}</span>
                                </td>
                                <td className="px-6 py-4 font-black text-gray-900 italic">
                                    ₹{parseFloat(e.amount).toLocaleString()}
                                </td>
                                <td className="px-6 py-4 text-xs font-bold text-gray-500">{new Date(e.date).toLocaleDateString()}</td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2">
                                        <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
                                            <User size={12} />
                                        </div>
                                        <span className="text-xs font-bold text-gray-700">{e.submittedBy?.name || 'Super Admin'}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full border text-[10px] font-black uppercase tracking-tighter w-fit ${
                                        e.status === 'Approved' ? 'bg-green-50 text-green-600 border-green-100' :
                                        e.status === 'Rejected' ? 'bg-red-50 text-red-600 border-red-100' :
                                        'bg-orange-50 text-orange-600 border-orange-100 animate-pulse'
                                    }`}>
                                        {e.status === 'Approved' ? <CheckCircle size={10}/> : 
                                         e.status === 'Rejected' ? <XCircle size={10}/> : 
                                         <Clock size={10}/>}
                                        {e.status}
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-center">
                                    {e.receiptFile ? (
                                        <button 
                                            onClick={() => setViewedReceipt(e.receiptFile)}
                                            className="w-10 h-10 mx-auto bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center hover:bg-blue-100 transition-all border border-blue-100" 
                                            title="View Requisition Proof"
                                        >
                                            <ExternalLink size={16} />
                                        </button>
                                    ) : (
                                        <div className="w-10 h-10 mx-auto bg-gray-50 text-gray-200 rounded-2xl flex items-center justify-center border border-gray-100" title="No Evidence Provided">
                                            <Receipt size={16} />
                                        </div>
                                    )}
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2">
                                        {e.status === 'Pending' && (
                                            <>
                                                <button 
                                                    onClick={() => handleStatusUpdate(e._id, 'Approved')}
                                                    className="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all shadow-lg shadow-green-500/20 active:scale-95"
                                                    title="Approve"
                                                >
                                                    <CheckCircle size={14} />
                                                </button>
                                                <button 
                                                    onClick={() => handleStatusUpdate(e._id, 'Rejected')}
                                                    className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all shadow-lg shadow-red-500/20 active:scale-95"
                                                    title="Reject"
                                                >
                                                    <XCircle size={14} />
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </Table>
                )}
            </div>

            {/* Receipt Preview Modal */}
            <Modal isOpen={!!viewedReceipt} onClose={() => setViewedReceipt(null)} title="Financial Evidence Preview" size="lg">
                <div className="flex flex-col items-center gap-4 p-4 text-center">
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 italic mb-2">Original Document Transmission</p>
                    {viewedReceipt?.toLowerCase().endsWith('.pdf') ? (
                        <iframe src={viewedReceipt} className="w-full h-[65vh] rounded-[2rem] border-4 border-gray-50 bg-white" title="PDF Receipt Viewer"></iframe>
                    ) : (
                        <div className="relative group">
                            <img src={viewedReceipt} alt="Receipt Proof" className="max-w-full max-h-[65vh] object-contain rounded-[2rem] shadow-2xl border-4 border-white" />
                            <div className="absolute inset-0 bg-primary/5 rounded-[2rem] pointer-events-none group-hover:bg-transparent transition-colors"></div>
                        </div>
                    )}
                    <a href={viewedReceipt} download className="mt-4 flex items-center gap-3 bg-gray-900 text-white px-10 py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl hover:scale-105 transition-all">
                        <ExternalLink size={16} />
                        <span>Download Authentic Copy</span>
                    </a>
                </div>
            </Modal>

            {/* Add Expense Modal */}
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Record New School Expense" size="xl">
                <form onSubmit={handleAddExpense} className="p-2">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Main Info */}
                        <div className="md:col-span-2 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="col-span-full">
                                    <label className="block text-xs font-bold uppercase text-gray-500 mb-2">Expense Title</label>
                                    <input type="text" required value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} className="w-full px-4 py-3 border border-border rounded-xl outline-none focus:ring-2 focus:ring-primary/20" placeholder="e.g. Lab Chemicals Purchase" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold uppercase text-gray-500 mb-2">Category</label>
                                    <select required value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} className="w-full px-4 py-3 border border-border rounded-xl">
                                        <option value="salary">Salaries</option>
                                        <option value="utilities">Utilities (Power/Water)</option>
                                        <option value="maintenance">Maintenance</option>
                                        <option value="supplies">Supplies & Material</option>
                                        <option value="misc">Miscellaneous</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold uppercase text-gray-500 mb-2">Amount (₹)</label>
                                    <input type="number" required value={formData.amount} onChange={(e) => setFormData({...formData, amount: e.target.value})} className="w-full px-4 py-3 border border-border rounded-xl outline-none" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold uppercase text-gray-500 mb-2">Paid To / Vendor</label>
                                    <input type="text" value={formData.paidTo} onChange={(e) => setFormData({...formData, paidTo: e.target.value})} className="w-full px-4 py-3 border border-border rounded-xl" placeholder="e.g. Science Supplies Co." />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold uppercase text-gray-500 mb-2">Date</label>
                                    <input type="date" required value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})} className="w-full px-4 py-3 border border-border rounded-xl" />
                                </div>
                                <div className="col-span-full">
                                    <label className="block text-xs font-bold uppercase text-gray-500 mb-2">Description</label>
                                    <textarea value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} className="w-full px-4 py-3 border border-border rounded-xl" rows="3"></textarea>
                                </div>
                            </div>
                        </div>

                        {/* File Upload Column */}
                        <div className="flex flex-col gap-6">
                            <label className="block text-xs font-bold uppercase text-gray-500 mb-2">Receipt Proof</label>
                            <div className="flex-1 border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50 flex flex-col items-center justify-center p-6 text-center group hover:border-primary/50 transition-all relative">
                                <input 
                                    type="file" 
                                    onChange={handleFileChange}
                                    className="absolute inset-0 opacity-0 cursor-pointer z-10"
                                    accept="image/*,.pdf"
                                />
                                <Receipt className="text-gray-400 group-hover:text-primary transition-colors mb-4" size={40} />
                                <p className="text-xs font-bold text-gray-900 uppercase tracking-widest">Upload Receipt</p>
                                <p className="text-[10px] text-gray-500 mt-2 italic">PDF, JPG, PNG smaller than 5MB</p>
                                
                                {formData.receipt && (
                                    <div className="mt-4 p-2 bg-primary/10 text-primary rounded-lg flex items-center gap-2">
                                        <CheckCircle size={14} />
                                        <span className="text-[10px] font-bold truncate max-w-[150px]">{formData.receipt.name}</span>
                                    </div>
                                )}
                            </div>

                            <button type="submit" className="w-full btn-primary py-4 font-black uppercase text-sm tracking-widest shadow-xl shadow-primary/20">Post Expense Record</button>
                        </div>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default Expenses;
