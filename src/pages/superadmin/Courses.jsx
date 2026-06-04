import React, { useState, useEffect } from 'react';
import axios from '../../utils/axiosInstance';
import Table from '../../components/Table';
import Modal from '../../components/Modal';
import { Plus, Book, BookOpen, Clock, Users, IndianRupee, Edit2, Trash2 } from 'lucide-react';
import { toast } from 'react-toastify';

const Courses = () => {
    const [courses, setCourses] = useState([]);
    const [batches, setBatches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
    const [isEdit, setIsEdit] = useState(false);
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [newBatchName, setNewBatchName] = useState('');

    const [formData, setFormData] = useState({
        courseName: '', courseCode: '', description: '',
        batch: '', duration: '', fees: ''
    });

    useEffect(() => {
        fetchCourses();
        fetchBatches();
    }, []);

    const fetchCourses = async () => {
        try {
            const { data } = await axios.get('/api/courses');
            setCourses(data);
        } catch (err) {
            toast.error('Failed to fetch courses');
        } finally {
            setLoading(false);
        }
    };

    const fetchBatches = async () => {
        try {
            const { data } = await axios.get('/api/batches');
            setBatches(data);
        } catch (err) {
            console.error('Failed to fetch batches for course assignment');
        }
    };

    const handleCreateBatch = async (e) => {
        e.preventDefault();
        if (!newBatchName.trim()) return;
        try {
            await axios.post('/api/batches', { name: newBatchName });
            toast.success('Batch created successfully!');
            setNewBatchName('');
            fetchBatches();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to create batch');
        }
    };

    const handleDeleteBatch = async (id) => {
        if (window.confirm('Are you sure you want to delete this batch?')) {
            try {
                await axios.delete(`/api/batches/${id}`);
                toast.success('Batch deleted successfully!');
                fetchBatches();
            } catch (err) {
                toast.error('Failed to delete batch');
            }
        }
    };

    const handleOpenAddModal = () => {
        setIsEdit(false);
        setFormData({ courseName: '', courseCode: '', description: '', batch: '', duration: '', fees: '' });
        setIsModalOpen(true);
    };

    const handleOpenEditModal = (course) => {
        setIsEdit(true);
        setSelectedCourse(course);
        setFormData({
            courseName: course.courseName,
            courseCode: course.courseCode,
            description: course.description,
            batch: course.batch || '',
            duration: course.duration,
            fees: course.fees
        });
        setIsModalOpen(true);
    };

    const handleDeleteCourse = async (id) => {
        if (window.confirm('Are you sure you want to delete this course?')) {
            try {
                await axios.delete(`/api/courses/${id}`);
                toast.success('Course deleted');
                fetchCourses();
            } catch (err) {
                toast.error('Failed to delete course');
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (isEdit) {
                await axios.put(`/api/courses/${selectedCourse._id}`, formData);
                toast.success('Course updated successfully!');
            } else {
                await axios.post('/api/courses', formData);
                toast.success('Course created successfully!');
            }
            setIsModalOpen(false);
            fetchCourses();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Operation failed');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black italic uppercase tracking-tighter">Academic Curriculum</h1>
                    <p className="text-gray-500 text-sm italic">Define learning paths, fee structures, and faculty assignments.</p>
                </div>
                <div className="flex gap-3">
                    <button 
                        onClick={() => setIsBatchModalOpen(true)}
                        className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-800 px-5 py-3 rounded-2xl font-bold text-sm transition-all"
                    >
                        <Users size={18} />
                        <span>Manage Batches</span>
                    </button>
                    <button 
                        onClick={handleOpenAddModal}
                        className="btn-primary flex items-center gap-2"
                    >
                        <Plus size={18} />
                        <span>Create New Program</span>
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                    <div className="col-span-full py-12 text-center text-gray-500 font-bold italic animate-pulse">Synchronizing curriculum...</div>
                ) : courses.map((course) => (
                    <div key={course._id} className="card hover:border-primary/30 transition-all group overflow-hidden relative border-2 border-primary/5">
                        {/* Decorative circle */}
                        <div className="absolute -top-6 -right-6 w-24 h-24 bg-primary/5 rounded-full group-hover:scale-150 transition-transform duration-500"></div>
                        
                        <div className="flex items-center justify-between mb-6 relative">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                                    <Book size={24} />
                                </div>
                                <div className="max-w-[150px]">
                                    <h3 className="font-black text-base uppercase leading-tight truncate">{course.courseName}</h3>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{course.courseCode}</p>
                                </div>
                            </div>
                            <div className="flex gap-1 z-10">
                                <button onClick={() => handleOpenEditModal(course)} className="p-2 hover:bg-white rounded-xl text-gray-400 hover:text-blue-500 transition-all border border-transparent hover:border-blue-100 shadow-sm"><Edit2 size={14}/></button>
                                <button onClick={() => handleDeleteCourse(course._id)} className="p-2 hover:bg-white rounded-xl text-gray-400 hover:text-red-500 transition-all border border-transparent hover:border-red-100 shadow-sm"><Trash2 size={14}/></button>
                            </div>
                        </div>

                        <div className="space-y-3 mb-6 relative">
                            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-2xl group-hover:bg-white transition-colors border border-transparent group-hover:border-gray-100">
                                <div className="flex items-center gap-2 text-xs text-gray-600 font-bold uppercase tracking-tighter">
                                    <Clock size={14} className="text-primary" />
                                    <span>Duration</span>
                                </div>
                                <span className="text-xs font-black">{course.duration}</span>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-2xl group-hover:bg-white transition-colors border border-transparent group-hover:border-gray-100">
                                <div className="flex items-center gap-2 text-xs text-gray-600 font-bold uppercase tracking-tighter">
                                    <Users size={14} className="text-primary" />
                                    <span>Batch</span>
                                </div>
                                <span className="text-xs font-black truncate max-w-[100px]">{course.batch || 'Unassigned'}</span>
                             </div>
                        </div>

                        <div className="flex items-center justify-between mt-auto">
                            <div className="flex items-baseline gap-1">
                                <span className="text-[10px] font-bold text-gray-400 uppercase">Cost</span>
                                <span className="text-lg font-black text-green-600 leading-none">₹{course.fees}</span>
                            </div>
                            <span className="text-[8px] font-black uppercase tracking-widest bg-green-100 text-green-600 px-2 py-1 rounded-lg">Verified Curriculum</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Course Modal */}
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={isEdit ? "Update Program Details" : "Establish New Course"}>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="col-span-full">
                            <label className="text-[10px] font-black uppercase text-gray-400 mb-1 ml-1">Program Title *</label>
                            <input type="text" required value={formData.courseName} onChange={(e) => setFormData({...formData, courseName: e.target.value})} className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent rounded-2xl outline-none focus:border-primary focus:bg-white font-black text-sm transition-all" placeholder="e.g. Full Stack Engineering" />
                        </div>
                        <div>
                            <label className="text-[10px] font-black uppercase text-gray-400 mb-1 ml-1">Internal Code *</label>
                            <input type="text" required value={formData.courseCode} onChange={(e) => setFormData({...formData, courseCode: e.target.value})} className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent rounded-2xl outline-none focus:border-primary focus:bg-white font-bold text-sm transition-all text-primary uppercase" placeholder="FSD2024" />
                        </div>
                        <div>
                            <label className="text-[10px] font-black uppercase text-gray-400 mb-1 ml-1">Tuition Fees (₹) *</label>
                            <input type="number" required value={formData.fees} onChange={(e) => setFormData({...formData, fees: e.target.value})} className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent rounded-2xl outline-none focus:border-primary focus:bg-white font-black text-sm transition-all" />
                        </div>
                        <div>
                            <label className="text-[10px] font-black uppercase text-gray-400 mb-1 ml-1">Program Duration *</label>
                            <input type="text" required value={formData.duration} onChange={(e) => setFormData({...formData, duration: e.target.value})} className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent rounded-2xl outline-none focus:border-primary focus:bg-white font-bold text-sm transition-all" placeholder="12 Months" />
                        </div>
                        <div>
                            <label className="text-[10px] font-black uppercase text-gray-400 mb-1 ml-1">Academic Batch *</label>
                            <select required value={formData.batch} onChange={(e) => setFormData({...formData, batch: e.target.value})} className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent rounded-2xl outline-none focus:border-primary focus:bg-white font-bold text-sm transition-all">
                                <option value="">Select Batch</option>
                                {batches.map(b => (
                                    <option key={b._id} value={b.name}>{b.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="col-span-full">
                            <label className="text-[10px] font-black uppercase text-gray-400 mb-1 ml-1">Program Synopsis</label>
                            <textarea value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent rounded-2xl outline-none focus:border-primary focus:bg-white font-medium text-sm transition-all" rows="3" placeholder="Explain the learning objectives..."></textarea>
                        </div>
                    </div>
                    <button type="submit" className="w-full bg-primary hover:bg-black text-white py-5 rounded-2xl font-black text-sm uppercase tracking-[0.2em] shadow-xl transition-all">
                        {isEdit ? 'OVERWRITE PROGRAM' : 'COMMIT PROGRAM TO REGISTRY'}
                    </button>
                </form>
            </Modal>

            {/* Batch Management Modal */}
            <Modal isOpen={isBatchModalOpen} onClose={() => setIsBatchModalOpen(false)} title="Batch Registry Management">
                <div className="space-y-6 text-gray-900">
                    {/* Create Batch Form */}
                    <form onSubmit={handleCreateBatch} className="flex gap-3 items-end">
                        <div className="flex-1">
                            <label className="text-[10px] font-black uppercase text-gray-400 mb-1 ml-1">New Batch Name *</label>
                            <input 
                                type="text" 
                                required 
                                value={newBatchName} 
                                onChange={(e) => setNewBatchName(e.target.value)} 
                                className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent rounded-2xl outline-none focus:border-primary focus:bg-white font-black text-sm transition-all" 
                                placeholder="e.g. 2026-2027" 
                            />
                        </div>
                        <button type="submit" className="btn-primary !py-4 px-6 !rounded-2xl text-xs uppercase tracking-widest shadow-xl">
                            Create
                        </button>
                    </form>

                    {/* Existing Batches List */}
                    <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase text-gray-400 ml-1">Existing Batches</label>
                        <div className="max-h-60 overflow-y-auto space-y-2 custom-scrollbar">
                            {batches.map(b => (
                                <div key={b._id} className="flex items-center justify-between p-3.5 bg-gray-50 rounded-2xl hover:bg-gray-100/50 transition-all border border-gray-100">
                                    <span className="text-sm font-black text-gray-800 uppercase">{b.name}</span>
                                    <button 
                                        type="button" 
                                        onClick={() => handleDeleteBatch(b._id)} 
                                        className="text-gray-400 hover:text-red-500 p-2 hover:bg-white rounded-xl transition-all"
                                        title="Delete Batch"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            ))}
                            {batches.length === 0 && (
                                <p className="text-xs text-gray-400 italic text-center py-6">No batches found.</p>
                            )}
                        </div>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default Courses;
