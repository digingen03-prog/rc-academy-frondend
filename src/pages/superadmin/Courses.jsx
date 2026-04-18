import React, { useState, useEffect } from 'react';
import axios from '../../utils/axiosInstance';
import Table from '../../components/Table';
import Modal from '../../components/Modal';
import { Plus, Book, BookOpen, Clock, Users, IndianRupee, Edit2, Trash2, GraduationCap, Layers, Sparkles } from 'lucide-react';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';

const Courses = () => {
    const [courses, setCourses] = useState([]);
    const [staff, setStaff] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEdit, setIsEdit] = useState(false);
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [activeTab, setActiveTab ] = useState('programs');
    const [batches, setBatches] = useState([]);
    const [newBatchName, setNewBatchName] = useState('');

    const [formData, setFormData] = useState({
        courseName: '', courseCode: '', description: '',
        staffId: '', duration: '', fees: ''
    });

    useEffect(() => {
        fetchCourses();
        fetchStaff();
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

    const fetchStaff = async () => {
        try {
            const { data } = await axios.get('/api/staff');
            setStaff(data.map(s => ({ _id: s._id, name: s.user?.name })));
        } catch (err) {
            console.error('Failed to fetch staff for course assignment');
        }
    };

    const fetchBatches = async () => {
        try {
            const { data } = await axios.get('/api/batches');
            setBatches(data);
        } catch (err) {
            console.error('Failed to fetch batches');
        }
    };

    const handleCreateBatch = async (e) => {
        e.preventDefault();
        try {
            await axios.post('/api/batches', { name: newBatchName });
            toast.success('Batch created successfully');
            setNewBatchName('');
            fetchBatches();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to create batch');
        }
    };

    const handleDeleteBatch = async (id) => {
        if (window.confirm('Delete this batch?')) {
            try {
                await axios.delete(`/api/batches/${id}`);
                toast.success('Batch deleted');
                fetchBatches();
            } catch (err) {
                toast.error('Failed to delete batch');
            }
        }
    };

    const handleOpenAddModal = () => {
        setIsEdit(false);
        setFormData({ courseName: '', courseCode: '', description: '', staffId: '', duration: '', fees: '' });
        setIsModalOpen(true);
    };

    const handleOpenEditModal = (course) => {
        setIsEdit(true);
        setSelectedCourse(course);
        setFormData({
            courseName: course.courseName,
            courseCode: course.courseCode,
            description: course.description,
            staffId: course.staffId?._id || '',
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
        <div className="space-y-8 animate-slide-up pb-10">
            {/* Header Section */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                <div className="space-y-1">
                    <div className="flex items-center gap-2 mb-1">
                        <div className="p-1.5 bg-primary/10 rounded-lg text-primary"><GraduationCap size={16}/></div>
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary italic">Academy Registry v2</span>
                    </div>
                    <h1 className="text-4xl font-black italic uppercase tracking-tighter text-gray-900 leading-none">Curriculum <span className="text-primary tracking-[-0.05em]">Vault</span></h1>
                    <p className="text-gray-500 text-sm font-bold mt-1 opacity-70">Architecting high-performance learning paths and faculty ecosystems.</p>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-4">
                    <div className="flex bg-gray-100/80 p-1.5 rounded-[2rem] border border-gray-200 shadow-inner backdrop-blur-md w-full sm:w-auto">
                        <button 
                            onClick={() => setActiveTab('programs')}
                            className={`flex-1 sm:flex-none px-8 py-3.5 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${
                                activeTab === 'programs' ? 'bg-white text-primary shadow-xl shadow-black/[0.05]' : 'text-gray-400 hover:text-gray-600'
                            }`}
                        >
                            <BookOpen size={14} />
                            Programs
                        </button>
                        <button 
                            onClick={() => setActiveTab('batches')}
                            className={`flex-1 sm:flex-none px-8 py-3.5 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${
                                activeTab === 'batches' ? 'bg-white text-primary shadow-xl shadow-black/[0.05]' : 'text-gray-400 hover:text-gray-600'
                            }`}
                        >
                            <Layers size={14} />
                            Cohorts
                        </button>
                    </div>

                    {activeTab === 'programs' && (
                        <button 
                            onClick={handleOpenAddModal}
                            className="w-full sm:w-auto btn-primary !py-4 px-8 !rounded-[1.5rem] !text-[10px] uppercase font-black tracking-[0.2em] shadow-2xl shadow-primary/20 hover:-translate-y-1 active:scale-95 transition-all"
                        >
                            <Plus size={18} />
                            <span>Establish Program</span>
                        </button>
                    )}
                </div>
            </div>

            <AnimatePresence mode="wait">
                {activeTab === 'programs' ? (
                    <motion.div 
                        key="programs"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                    >
                        {loading ? (
                            <div className="col-span-full py-32 flex flex-col items-center justify-center gap-6 bg-white/50 rounded-[3rem] border border-white">
                                <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin shadow-xl"></div>
                                <p className="font-black text-xs uppercase tracking-[0.3em] text-gray-900 italic">Syncing Curriculum Data...</p>
                            </div>
                        ) : courses.length > 0 ? (
                            courses.map((course, idx) => (
                                <motion.div 
                                    key={course._id} 
                                    initial={{ opacity: 0, y: 30 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.1 }}
                                    className="group relative"
                                >
                                    <div className="card h-full !p-8 hover:border-primary/40 transition-all duration-500 overflow-hidden bg-white/90 backdrop-blur-sm border-2 border-white shadow-xl shadow-black/[0.03] group-hover:shadow-primary/10 flex flex-col">
                                        {/* Abstract background accent */}
                                        <div className="absolute top-0 right-0 p-6 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity duration-500 scale-150 transform translate-x-12 -translate-y-12">
                                            <GraduationCap size={160}/>
                                        </div>
                                        
                                        <div className="flex items-start justify-between mb-8 relative">
                                            <div className="flex items-center gap-5">
                                                <div className="w-16 h-16 rounded-3xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all duration-500 shadow-inner">
                                                    <BookOpen size={28} />
                                                </div>
                                                <div className="max-w-[180px]">
                                                    <h3 className="font-black text-lg uppercase leading-tight tracking-tighter text-gray-900">{course.courseName}</h3>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <span className="text-[10px] font-black text-primary px-2 py-0.5 bg-primary/5 rounded-full tracking-widest">{course.courseCode}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <button onClick={() => handleOpenEditModal(course)} className="p-3 bg-white text-gray-400 hover:text-blue-500 rounded-2xl transition-all shadow-sm border border-gray-100 hover:border-blue-200 active:scale-90"><Edit2 size={16}/></button>
                                                <button onClick={() => handleDeleteCourse(course._id)} className="p-3 bg-white text-gray-400 hover:text-red-500 rounded-2xl transition-all shadow-sm border border-gray-100 hover:border-red-200 active:scale-90"><Trash2 size={16}/></button>
                                            </div>
                                        </div>

                                        <div className="space-y-4 mb-10 flex-grow">
                                            <div className="p-5 bg-gray-50/50 rounded-3xl border border-gray-100/80 group-hover:bg-white transition-colors">
                                                <div className="flex items-center justify-between mb-4">
                                                    <div className="flex items-center gap-2 text-[10px] text-gray-400 font-black uppercase tracking-widest italic">
                                                        <Clock size={12} className="text-primary" />
                                                        <span>Tempo</span>
                                                    </div>
                                                    <span className="text-xs font-black text-gray-900">{course.duration}</span>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2 text-[10px] text-gray-400 font-black uppercase tracking-widest italic">
                                                        <Users size={12} className="text-primary" />
                                                        <span>Facilitator</span>
                                                    </div>
                                                    <span className="text-xs font-black text-gray-900 text-right truncate max-w-[120px]">{course.staffId?.name || 'Open Req'}</span>
                                                </div>
                                            </div>
                                            <p className="text-[11px] font-medium text-gray-400 leading-relaxed line-clamp-2 px-1">
                                                {course.description || 'Program structural details are currently under review by the academic board.'}
                                            </p>
                                        </div>

                                        <div className="flex items-end justify-between pt-6 border-t border-dashed border-gray-100 mt-auto">
                                            <div className="space-y-1">
                                                <p className="text-[9px] font-black text-gray-300 uppercase tracking-widest">Financial Quote</p>
                                                <div className="flex items-center gap-1.5">
                                                    <IndianRupee size={16} className="text-green-600"/>
                                                    <span className="text-2xl font-black text-gray-900 tracking-tighter leading-none">{parseFloat(course.fees).toLocaleString()}</span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-1 bg-green-500/10 text-green-600 px-3 py-1.5 rounded-xl border border-green-500/20">
                                                <Sparkles size={12}/>
                                                <span className="text-[9px] font-black uppercase tracking-widest">Active</span>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))
                        ) : (
                            <div className="col-span-full py-32 text-center bg-white/50 rounded-[3rem] border border-dashed border-gray-200">
                                <Book size={48} className="mx-auto text-gray-200 mb-4"/>
                                <p className="font-black text-xs uppercase tracking-widest text-gray-400">Curriculum is Currently Vacant</p>
                            </div>
                        )}
                    </motion.div>
                ) : (
                    <motion.div 
                        key="batches"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                        className="grid grid-cols-1 lg:grid-cols-3 gap-10"
                    >
                        {/* Establish Batch Controller */}
                        <div className="lg:col-span-1">
                            <div className="card !p-10 border-2 border-primary/20 bg-primary/[0.01] sticky top-8 shadow-2xl shadow-primary/5 rounded-[3rem]">
                                <div className="flex items-center gap-5 mb-10">
                                    <div className="w-14 h-14 rounded-3xl bg-primary shadow-lg shadow-primary/20 flex items-center justify-center text-white">
                                        <Plus size={28} />
                                    </div>
                                    <div>
                                        <h3 className="font-black text-lg uppercase tracking-tight text-gray-900 leading-none">Birth New Cohort</h3>
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1 italic">Scaling Academy Throughput</p>
                                    </div>
                                </div>
                                <form onSubmit={handleCreateBatch} className="space-y-8">
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black uppercase text-gray-400 ml-2 italic tracking-widest">Cohort Descriptor</label>
                                        <input 
                                            type="text" 
                                            value={newBatchName}
                                            onChange={(e) => setNewBatchName(e.target.value)}
                                            placeholder="e.g. Q4-2024-LEADERS"
                                            className="input-field !text-base !py-6 !px-8 !rounded-3xl !bg-white/80 border-2 border-transparent focus:border-primary/30 shadow-inner"
                                            required
                                        />
                                    </div>
                                    <button type="submit" className="w-full btn-primary !py-6 !rounded-3xl font-black text-xs uppercase tracking-[0.3em] shadow-2xl shadow-primary/30 relative overflow-hidden group">
                                        <span className="relative z-10">Commit Cohort</span>
                                        <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                                    </button>
                                </form>
                            </div>
                        </div>

                        {/* Cohort Flow Ecosystem */}
                        <div className="lg:col-span-2">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {batches.length > 0 ? (
                                    batches.map((batch, idx) => (
                                        <motion.div 
                                            key={batch._id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: idx * 0.05 }}
                                            className="bg-white/70 backdrop-blur-sm p-8 rounded-[2.5rem] border border-gray-100 shadow-xl shadow-black/[0.02] flex items-center justify-between group hover:border-primary/40 hover:-translate-y-1 transition-all duration-300"
                                        >
                                            <div className="flex items-center gap-6">
                                                <div className="w-14 h-14 rounded-3xl bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-300 group-hover:bg-primary/10 group-hover:text-primary transition-all duration-500 shadow-inner">
                                                    <Users size={24} />
                                                </div>
                                                <div>
                                                    <p className="font-black text-base uppercase italic text-gray-900 leading-none tracking-tighter">{batch.name}</p>
                                                    <div className="flex items-center gap-2 mt-2">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                                                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em]">Operational Intake</p>
                                                    </div>
                                                </div>
                                            </div>
                                            <button 
                                                onClick={() => handleDeleteBatch(batch._id)}
                                                className="p-3 text-gray-300 hover:text-white hover:bg-red-500 rounded-2xl transition-all opacity-0 group-hover:opacity-100 shadow-sm active:scale-95"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </motion.div>
                                    ))
                                ) : (
                                    <div className="col-span-full py-40 flex flex-col items-center justify-center bg-gray-50/50 rounded-[3rem] border border-dashed border-gray-200">
                                        <Layers className="text-gray-200 mb-4" size={48}/>
                                        <p className="font-black text-xs uppercase tracking-widest text-gray-400 italic">No Active Cohorts Found</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Enhanced Program Deployment Interface */}
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={isEdit ? "Update Program Parameters" : "Establish Architectural Foundation"} size="lg">
                <form onSubmit={handleSubmit} className="space-y-10">
                    <div className="p-6 bg-primary/5 rounded-[2rem] flex items-center gap-4 border border-primary/10">
                        <div className="p-3 bg-primary rounded-2xl text-white shadow-lg shadow-primary/20"><Sparkles size={24}/></div>
                        <div>
                            <h4 className="font-black uppercase text-xs tracking-widest text-primary">Configuration Interface</h4>
                            <p className="text-[10px] font-bold text-gray-500 uppercase italic opacity-70 tracking-widest">Define the structural identity and economic quote of the program.</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="col-span-full space-y-2">
                            <label className="text-[10px] font-black uppercase text-gray-400 ml-2 italic tracking-widest">Program Identity Descriptor *</label>
                            <input 
                                type="text" 
                                required 
                                value={formData.courseName} 
                                onChange={(e) => setFormData({...formData, courseName: e.target.value})} 
                                className="input-field !py-6 !px-8 !text-lg !font-black !rounded-3xl !bg-gray-50/50 border-2 border-transparent focus:border-primary/20 transition-all shadow-inner" 
                                placeholder="e.g. Master of Neural Architectures" 
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-gray-400 ml-2 italic tracking-widest">Internal Protocol Code *</label>
                            <input 
                                type="text" 
                                required 
                                value={formData.courseCode} 
                                onChange={(e) => setFormData({...formData, courseCode: e.target.value})} 
                                className="input-field !py-5 !px-6 !font-black !text-primary !rounded-2xl !bg-gray-50/50 border-2 border-transparent focus:border-primary/20 transition-all shadow-inner uppercase tracking-widest text-sm" 
                                placeholder="PROG-2024" 
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-gray-400 ml-2 italic tracking-widest">Tuition Economic Quote (₹) *</label>
                            <input 
                                type="number" 
                                required 
                                value={formData.fees} 
                                onChange={(e) => setFormData({...formData, fees: e.target.value})} 
                                className="input-field !py-5 !px-6 !font-black !rounded-2xl !bg-gray-50/50 border-2 border-transparent focus:border-primary/20 transition-all shadow-inner text-sm" 
                                placeholder="0.00"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-gray-400 ml-2 italic tracking-widest">Temporal Cycle Duration *</label>
                            <input 
                                type="text" 
                                required 
                                value={formData.duration} 
                                onChange={(e) => setFormData({...formData, duration: e.target.value})} 
                                className="input-field !py-5 !px-6 !font-bold !rounded-2xl !bg-gray-50/50 border-2 border-transparent focus:border-primary/20 transition-all shadow-inner text-sm" 
                                placeholder="12 Months Intensive" 
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-gray-400 ml-2 italic tracking-widest">Principal Expert Assignment</label>
                            <div className="relative">
                                <select 
                                    value={formData.staffId} 
                                    onChange={(e) => setFormData({...formData, staffId: e.target.value})} 
                                    className="input-field !py-5 !px-6 !font-black !rounded-2xl !bg-gray-50/50 border-2 border-transparent focus:border-primary/20 transition-all shadow-inner text-sm appearance-none"
                                >
                                    <option value="">Draft Assignment (Pending)</option>
                                    {staff.map(s => (
                                        <option key={s._id} value={s._id}>{s.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div className="col-span-full space-y-2">
                            <label className="text-[10px] font-black uppercase text-gray-400 ml-2 italic tracking-widest">Curriculum Executive Synopsis</label>
                            <textarea 
                                value={formData.description} 
                                onChange={(e) => setFormData({...formData, description: e.target.value})} 
                                className="input-field !py-6 !px-8 !font-medium !rounded-3xl !bg-gray-50/50 border-2 border-transparent focus:border-primary/20 transition-all shadow-inner min-h-[140px] text-sm" 
                                placeholder="Outline the strategic learning objectives and program trajectory..."
                            ></textarea>
                        </div>
                    </div>
                    
                    <div className="flex gap-4">
                        <button 
                            type="button" 
                            onClick={() => setIsModalOpen(false)} 
                            className="flex-1 py-5 rounded-3xl font-black text-[10px] uppercase tracking-widest text-gray-400 hover:bg-gray-50 transition-all border border-transparent hover:border-gray-200"
                        >
                            Abort Configuration
                        </button>
                        <button 
                            type="submit" 
                            className="flex-[2] bg-primary hover:bg-dark text-white py-5 rounded-[2rem] font-black text-xs uppercase tracking-[0.3em] shadow-2xl shadow-primary/30 transition-all relative overflow-hidden group"
                        >
                            <span className="relative z-10">{isEdit ? 'OVERWRITE PARAMETERS' : 'COMMIT PROGRAM TO REGISTRY'}</span>
                            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default Courses;
