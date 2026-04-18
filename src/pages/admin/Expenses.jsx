import React, { useState, useEffect } from 'react';
import axios from '../../utils/axiosInstance';
import Table from '../../components/Table';
import Modal from '../../components/Modal';
import { Plus, Receipt, ExternalLink, CheckCircle, XCircle, Clock, Wallet, DollarSign } from 'lucide-react';
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
            
            toast.success('Expense submitted for approval!');
            setIsModalOpen(false);
            fetchExpenses();
            setFormData({ 
                title: '', category: 'supplies', amount: '', 
                date: new Date().toISOString().split('T')[0], 
                description: '', paidTo: '', receipt: null 
            });
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to submit expense');
        }
    };

    // Calculate pending vs approved for the dashboard cards
    const approvedTotal = expenses
        .filter(e => e.status === 'Approved')
        .reduce((acc, curr) => acc + curr.amount, 0);
    
    const pendingTotal = expenses
        .filter(e => e.status === 'Pending')
        .reduce((acc, curr) => acc + curr.amount, 0);

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black italic uppercase tracking-tighter">Budget Requisitions</h1>
                    <p className="text-gray-500 text-sm italic">Submit and track your academic expenditure requests.</p>
                </div>
                <button 
                    onClick={() => setIsModalOpen(true)}
                    className="btn-primary flex items-center gap-2 shadow-xl shadow-primary/20"
                >
                    <Plus size={18} />
                    <span>Request New Expense</span>
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="card bg-primary text-white p-8 overflow-hidden relative group">
                    <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
                        <CheckCircle size={100}/>
                    </div>
                    <p className="text-white/70 text-[10px] font-black uppercase tracking-[0.2em]">Authorized Spendings</p>
                    <h3 className="text-4xl font-black mt-2 tracking-tighter italic">₹{approvedTotal.toLocaleString()}</h3>
                </div>
                <div className="card p-8 border-2 border-orange-100 bg-orange-50/30 group">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-orange-600/60 text-[10px] font-black uppercase tracking-[0.2em]">Awaiting Authorization</p>
                            <h3 className="text-3xl font-black mt-2 tracking-tighter text-orange-600">₹{pendingTotal.toLocaleString()}</h3>
                        </div>
                        <div className="w-16 h-16 bg-orange-100 rounded-3xl flex items-center justify-center text-orange-600 shadow-inner group-hover:rotate-12 transition-transform">
                            <Clock size={32} />
                        </div>
                    </div>
                </div>
            </div>

            <div className="card !p-0 overflow-hidden border-2 border-white shadow-2xl shadow-black/[0.03] bg-white/80 backdrop-blur-md">
                {loading ? (
                    <div className="p-20 text-center flex flex-col items-center gap-4">
                        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                        <p className="font-black text-xs uppercase tracking-widest text-gray-400">Syncing Ledger...</p>
                    </div>
                ) : (
                    <Table headers={['Title', 'Category', 'Amount', 'Date', 'Status', 'File']}>
                        {expenses.map((e) => (
                            <tr key={e._id} className="hover:bg-gray-50/50 transition-colors">
                                <td className="px-6 py-5">
                                    <p className="font-black text-sm text-gray-900 leading-tight uppercase tracking-tight">{e.title}</p>
                                    <p className="text-[10px] text-gray-400 mt-1 line-clamp-1 italic max-w-xs">{e.description || 'No requisition summary provided.'}</p>
                                </td>
                                <td className="px-6 py-5">
                                    <span className="bg-gray-100 text-gray-500 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border border-gray-200/50">{e.category}</span>
                                </td>
                                <td className="px-6 py-5 font-black text-gray-900 text-sm">
                                    ₹{parseFloat(e.amount).toLocaleString()}
                                </td>
                                <td className="px-6 py-5 text-[11px] font-bold text-gray-400 uppercase">{new Date(e.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                                <td className="px-6 py-5">
                                    <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-2xl border text-[9px] font-black uppercase tracking-[0.1em] w-fit ${
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
                                <td className="px-6 py-5">
                                    {e.receiptFile ? (
                                        <button 
                                            onClick={() => setViewedReceipt(e.receiptFile)}
                                            className="w-10 h-10 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center hover:bg-blue-100 transition-all border border-blue-100" 
                                            title="View Evidence"
                                        >
                                            <ExternalLink size={16} />
                                        </button>
                                    ) : (
                                        <div className="w-10 h-10 bg-gray-50 text-gray-200 rounded-2xl flex items-center justify-center border border-gray-100" title="No Document">
                                            <Receipt size={16} />
                                        </div>
                                    )}
                                </td>
                            </tr>
                        ))}
                        {expenses.length === 0 && (
                            <tr>
                                <td colSpan="6" className="px-6 py-20 text-center">
                                    <Wallet size={48} className="mx-auto text-gray-100 mb-4" />
                                    <p className="font-black text-xs uppercase tracking-widest text-gray-300">Your Requisition Ledger is Vacant</p>
                                </td>
                            </tr>
                        )}
                    </Table>
                )}
            </div>

            {/* Receipt Preview Modal */}
            <Modal isOpen={!!viewedReceipt} onClose={() => setViewedReceipt(null)} title="Financial Evidence Preview" size="lg">
                <div className="flex flex-col items-center gap-4 p-4 text-center">
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 italic mb-2">Original Document Transmission</p>
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
                            <span>Download Receipt</span>
                        </a>
                        <button onClick={() => setViewedReceipt(null)} className="px-8 py-4 bg-gray-100 text-gray-400 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-gray-200 transition-all">
                            Close Preview
                        </button>
                    </div>
                </div>
            </Modal>

            {/* Request Modal */}
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="New Resource Requisition" size="xl">
                <form onSubmit={handleAddExpense} className="p-2">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Left Column: Basic Info */}
                        <div className="md:col-span-2 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="col-span-full">
                                    <label className="block text-[10px] font-black uppercase text-gray-400 mb-2 italic tracking-widest ml-1">Requisition Title *</label>
                                    <input type="text" required value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent focus:border-primary/20 rounded-2xl outline-none transition-all font-bold text-sm shadow-sm" placeholder="e.g. Laboratory Infrastructure Upgrade" />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black uppercase text-gray-400 mb-2 italic tracking-widest ml-1">Classification *</label>
                                    <select required value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent focus:border-primary/20 rounded-2xl outline-none font-bold text-sm appearance-none shadow-sm cursor-pointer">
                                        <option value="salary">Faculty Remuneration</option>
                                        <option value="utilities">Infrastructure Utilities</option>
                                        <option value="maintenance">Facility Maintenance</option>
                                        <option value="supplies">Academic Supplies</option>
                                        <option value="misc">Miscellaneous Capital</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black uppercase text-gray-400 mb-2 italic tracking-widest ml-1">Financial Quote (₹) *</label>
                                    <div className="relative shadow-sm rounded-2xl">
                                        <span className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 font-bold">₹</span>
                                        <input type="number" required value={formData.amount} onChange={(e) => setFormData({...formData, amount: e.target.value})} className="w-full pl-10 pr-5 py-4 bg-gray-50 border-2 border-transparent focus:border-primary/20 rounded-2xl outline-none font-black text-sm" placeholder="0" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black uppercase text-gray-400 mb-2 italic tracking-widest ml-1">Payee / Vendor</label>
                                    <input type="text" value={formData.paidTo} onChange={(e) => setFormData({...formData, paidTo: e.target.value})} className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent focus:border-primary/20 rounded-2xl outline-none font-bold text-sm shadow-sm" placeholder="e.g. Apex Scientific Labs" />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black uppercase text-gray-400 mb-2 italic tracking-widest ml-1">Temporal Date *</label>
                                    <input type="date" required value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})} className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent focus:border-primary/20 rounded-2xl outline-none font-bold text-sm shadow-sm" />
                                </div>
                                <div className="col-span-full">
                                    <label className="block text-[10px] font-black uppercase text-gray-400 mb-2 italic tracking-widest ml-1">Strategic Justification</label>
                                    <textarea value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent focus:border-primary/20 rounded-2xl outline-none font-medium text-sm min-h-[120px] shadow-sm" placeholder="Briefly outline the objective of this expenditure..."></textarea>
                                </div>
                            </div>
                        </div>

                        {/* Right Column: Evidence Upload */}
                        <div className="flex flex-col gap-6">
                            <div className="flex-1 border-4 border-dashed border-gray-100 rounded-[2.5rem] bg-gray-50/50 p-8 flex flex-col items-center justify-center text-center group hover:border-primary/20 hover:bg-primary/[0.02] transition-all cursor-pointer relative overflow-hidden">
                                <input 
                                    type="file" 
                                    onChange={handleFileChange}
                                    className="absolute inset-0 opacity-0 cursor-pointer z-10"
                                    accept="image/*,.pdf"
                                />
                                <div className="w-20 h-20 bg-white rounded-3xl shadow-xl flex items-center justify-center text-primary group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300">
                                    <Receipt size={32} />
                                </div>
                                <div className="mt-6 space-y-2">
                                    <p className="font-black text-xs uppercase tracking-widest text-gray-900 leading-tight">Proof of Expense</p>
                                    <p className="text-[10px] text-gray-400 font-bold max-w-[140px] leading-relaxed italic">Click or drag receipt evidence to attach (PDF/JPG)</p>
                                </div>
                                {formData.receipt && (
                                    <div className="mt-6 p-3 bg-green-500 text-white rounded-2xl flex items-center gap-2 animate-in slide-in-from-bottom-2 duration-300">
                                        <CheckCircle size={14} />
                                        <span className="text-[10px] font-black uppercase tracking-widest truncate max-w-[120px]">{formData.receipt.name}</span>
                                    </div>
                                )}
                            </div>

                            <button type="submit" className="w-full bg-primary hover:bg-dark text-white py-6 rounded-3xl font-black text-[11px] uppercase tracking-[0.3em] shadow-2xl shadow-primary/30 transition-all active:scale-[0.98] relative overflow-hidden group border-4 border-white">
                                <span className="relative z-10">Commit Requisition</span>
                                <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                            </button>
                            <p className="text-[9px] text-gray-400 font-bold text-center uppercase tracking-widest italic animate-pulse">Ready for Authorization Cycle</p>
                        </div>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default Expenses;
