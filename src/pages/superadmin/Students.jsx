import React, { useState, useEffect, useMemo } from 'react';
import axios from '../../utils/axiosInstance';
import Table from '../../components/Table';
import Modal from '../../components/Modal';
import { Plus, Search, Filter, Edit2, Trash2, Eye, Upload, FileText, User, Users, BookOpen, ShieldCheck, ChevronRight, Download, Calendar, EyeOff, Copy } from 'lucide-react';
import { toast } from 'react-toastify';
import { getFileUrl } from '../../utils/fileHelper';

const Students = () => {
    const [students, setStudents] = useState([]);
    const [courses, setCourses] = useState([]);
    const [batches, setBatches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [viewModalOpen, setViewModalOpen] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [isEdit, setIsEdit] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCourseFilter, setSelectedCourseFilter] = useState('all');
    const [selectedBatchFilter, setSelectedBatchFilter] = useState('all');
    const [showPassword, setShowPassword] = useState(false);

    const [formData, setFormData] = useState({
        name: '', email: '', username: '', password: '',
        phone: '', address: '', registerNumber: '', 
        schoolInstitution: '', batch: '', dateOfBirth: '', 
        studentType: 'Regular', advanceBalance: '',
        fatherName: '', fatherPhone: '', fatherOccupation: '',
        motherName: '', motherPhone: '', motherOccupation: '',
        selectedCourses: []
    });

    const [files, setFiles] = useState({
        studentPhoto: null,
        applicationForm: null
    });

    useEffect(() => {
        fetchStudents();
        fetchCourses();
        fetchBatches();
    }, []);

    const fetchBatches = async () => {
        try {
            const { data } = await axios.get('/api/batches');
            setBatches(data);
        } catch (err) {
            console.error('Failed to fetch batches');
        }
    };

    const filteredStudents = useMemo(() => {
        return students.filter(s => {
            const matchesSearch = s.user?.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                                 s.registerNumber.toLowerCase().includes(searchTerm.toLowerCase());
            
            const matchesCourse = selectedCourseFilter === 'all' || 
                                 s.courseIds?.some(c => c._id === selectedCourseFilter);
            
            const matchesBatch = selectedBatchFilter === 'all' || s.batch === selectedBatchFilter;
            
            return matchesSearch && matchesCourse && matchesBatch;
        });
    }, [students, searchTerm, selectedCourseFilter, selectedBatchFilter]);

    const fetchStudents = async () => {
        try {
            const { data } = await axios.get('/api/students');
            setStudents(data);
        } catch (err) {
            toast.error('Failed to fetch students');
        } finally {
            setLoading(false);
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

    const generateRegisterNumber = () => {
        const year = new Date().getFullYear().toString().slice(-2);
        const random = Math.floor(1000 + Math.random() * 9000);
        return `RC${year}${random}`;
    };

    const handleOpenAddModal = () => {
        setIsEdit(false);
        resetForm();
        const newRegNumber = generateRegisterNumber();
        setFormData(prev => ({ 
            ...prev, 
            registerNumber: newRegNumber,
            username: newRegNumber,
            password: 'Pass@2026'
        }));
        setIsModalOpen(true);
    };

    const handleOpenEditModal = (student) => {
        setIsEdit(true);
        setSelectedStudent(student);
        setFormData({
            name: student.user?.name || '',
            email: student.user?.email || '',
            username: student.user?.username || '',
            phone: student.user?.phone?.replace(/^\+91\s?/, '') || '',
            address: student.address || '',
            registerNumber: student.registerNumber || '',
            schoolInstitution: student.schoolInstitution || '',
            batch: student.batch || '',
            dateOfBirth: student.dateOfBirth || '',
            studentType: student.studentType || 'Regular',
            advanceBalance: student.advanceBalance || '',
            fatherName: student.fatherName || '',
            fatherPhone: student.fatherPhone || '',
            fatherOccupation: student.fatherOccupation || '',
            motherName: student.motherName || '',
            motherPhone: student.motherPhone || '',
            motherOccupation: student.motherOccupation || '',
            selectedCourses: student.courseIds?.map(c => c._id) || []
        });
        setIsModalOpen(true);
    };

    const handleOpenViewModal = (student) => {
        setSelectedStudent(student);
        setViewModalOpen(true);
    };

    const handleDeleteStudent = async (id) => {
        if (window.confirm('Are you sure you want to delete this student record?')) {
            try {
                await axios.delete(`/api/students/${id}`);
                toast.success('Student record deleted');
                fetchStudents();
            } catch (err) {
                toast.error('Failed to delete student');
            }
        }
    };

    const handleFileChange = (e) => {
        setFiles({ ...files, [e.target.name]: e.target.files[0] });
    };



    const handleSubmit = async (e) => {
        e.preventDefault();
        const data = new FormData();
        
        Object.keys(formData).forEach(key => {
            if (key === 'selectedCourses') {
                data.append('courseIds', JSON.stringify(formData[key]));
            } else if (key === 'phone') {
                const formattedPhone = formData.phone ? `+91 ${formData.phone}` : '';
                data.append('phone', formattedPhone);
            } else {
                data.append(key, formData[key]);
            }
        });

        if (files.studentPhoto) data.append('studentPhoto', files.studentPhoto);
        if (files.applicationForm) data.append('applicationForm', files.applicationForm);

        try {
            if (isEdit) {
                await axios.put(`/api/students/${selectedStudent._id}`, data, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                toast.success('Student record updated!');
            } else {
                await axios.post('/api/students', data, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                toast.success('Student registered successfully!');
            }
            setIsModalOpen(false);
            fetchStudents();
            resetForm();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Operation failed');
        }
    };

    const resetForm = () => {
        setFormData({
            name: '', email: '', username: '', password: '',
            phone: '', address: '', registerNumber: '', 
            schoolInstitution: '', batch: '', dateOfBirth: '', 
            studentType: 'Regular', advanceBalance: '',
            fatherName: '', fatherPhone: '', fatherOccupation: '',
            motherName: '', motherPhone: '', motherOccupation: '',
            selectedCourses: []
        });
        setFiles({ studentPhoto: null, applicationForm: null });
        setSelectedStudent(null);
    };

    return (
        <div className="space-y-6 animate-slide-up">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black italic uppercase tracking-tighter">Student Registry</h1>
                    <p className="text-gray-500 text-sm font-medium">Manage student enrollment and institutional documentation.</p>
                </div>
                <button 
                    onClick={handleOpenAddModal}
                    className="btn-primary shadow-xl shadow-primary/20"
                >
                    <Plus size={18} />
                    <span>Onboard New Student</span>
                </button>
            </div>

            {/* Search & Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="md:col-span-3 card !p-2 flex items-center gap-3 bg-white/50">
                    <div className="p-3 bg-primary/5 rounded-2xl text-primary">
                        <Search size={20} />
                    </div>
                    <input 
                        type="text" 
                        placeholder="Search by name or register ID..."
                        className="flex-1 bg-transparent border-none outline-none font-bold text-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="card !p-4 flex items-center justify-between bg-dark text-white border-none shadow-xl shadow-black/5">
                    <span className="text-[10px] font-black uppercase opacity-60 tracking-[0.2em]">Total Records</span>
                    <span className="text-2xl font-black">{students.length}</span>
                </div>
            </div>

            {/* Filters Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="card !p-2 bg-white/50 flex items-center gap-2">
                    <span className="text-[9px] font-black uppercase text-gray-400 ml-2">Filter Course</span>
                    <select 
                        value={selectedCourseFilter} 
                        onChange={(e) => setSelectedCourseFilter(e.target.value)}
                        className="flex-1 bg-transparent border-none outline-none font-bold text-xs cursor-pointer"
                    >
                        <option value="all">All Courses</option>
                        {courses.map(c => <option key={c._id} value={c._id}>{c.courseName}</option>)}
                    </select>
                </div>
                <div className="card !p-2 bg-white/50 flex items-center gap-2">
                    <span className="text-[9px] font-black uppercase text-gray-400 ml-2">Filter Batch</span>
                    <select 
                        value={selectedBatchFilter} 
                        onChange={(e) => setSelectedBatchFilter(e.target.value)}
                        className="flex-1 bg-transparent border-none outline-none font-bold text-xs cursor-pointer"
                    >
                        <option value="all">All Batches</option>
                        {batches.map(b => <option key={b._id} value={b.name}>{b.name}</option>)}
                    </select>
                </div>
                <button 
                    onClick={() => { setSelectedCourseFilter('all'); setSelectedBatchFilter('all'); setSearchTerm(''); }}
                    className="p-3 bg-gray-50 text-gray-400 hover:text-red-500 rounded-2xl transition-all font-black text-[10px] uppercase tracking-widest border border-transparent hover:border-red-500/20 active:scale-95"
                >
                    Reset Filters
                </button>
            </div>

            {/* Table */}
            <div className="overflow-hidden">
                {loading ? (
                    <div className="p-20 text-center font-bold text-gray-400 italic animate-pulse">Synchronizing records...</div>
                ) : (
                    <Table headers={['S.No', 'Student Details', 'Identifier', 'Academic Info', 'Actions']}>
                        {filteredStudents.map((s, index) => (
                            <tr key={s._id} className="hover:bg-primary/5 transition-all group">
                                <td className="px-6 py-5 font-black text-xs text-gray-400">
                                    {index + 1}
                                </td>
                                <td className="px-6 py-5">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-gray-50 border-2 border-white shadow-sm overflow-hidden flex items-center justify-center shrink-0">
                                            {s.studentPhoto ? (
                                                <img src={getFileUrl(s.studentPhoto)} alt={s.user?.name} className="w-full h-full object-cover" />
                                            ) : <User className="text-gray-300" />}
                                        </div>
                                        <div>
                                            <p className="font-black text-sm uppercase tracking-tight group-hover:text-primary transition-colors">{s.user?.name}</p>
                                            <p className="text-[10px] font-bold text-gray-400">{s.user?.email}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-5">
                                    <span className="bg-primary/10 text-primary px-3 py-1.5 rounded-xl font-black text-[10px] tracking-widest border border-primary/20">
                                        {s.registerNumber}
                                    </span>
                                </td>
                                <td className="px-6 py-5">
                                    <p className="text-xs font-black uppercase text-gray-800">{s.batch || 'Unassigned'}</p>
                                    <p className="text-[9px] font-bold text-primary italic uppercase opacity-70 mb-1">{s.studentType}</p>
                                    <div className="flex flex-wrap gap-1 mt-1 max-w-[200px]">
                                        {s.courseIds && s.courseIds.length > 0 ? (
                                            s.courseIds.map(c => (
                                                <span key={c._id} className="bg-gray-100 text-[8px] font-black uppercase px-2 py-0.5 rounded-md text-gray-600 border border-gray-200/50">
                                                    {c.courseName}
                                                </span>
                                            ))
                                        ) : (
                                            <span className="text-[8px] font-bold text-gray-300 italic uppercase">No Courses</span>
                                        )}
                                    </div>
                                </td>
                                <td className="px-6 py-5 text-right">
                                    <div className="flex justify-end gap-2">
                                        <button onClick={() => handleOpenViewModal(s)} className="p-2.5 hover:bg-white rounded-xl text-gray-400 hover:text-primary transition-all border border-transparent hover:border-primary/20 shadow-sm"><Eye size={16}/></button>
                                        <button onClick={() => handleOpenEditModal(s)} className="p-2.5 hover:bg-white rounded-xl text-gray-400 hover:text-blue-500 transition-all border border-transparent hover:border-blue-500/20 shadow-sm"><Edit2 size={16}/></button>
                                        <button onClick={() => handleDeleteStudent(s._id)} className="p-2.5 hover:bg-white rounded-xl text-gray-400 hover:text-red-500 transition-all border border-transparent hover:border-red-500/20 shadow-sm"><Trash2 size={16}/></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </Table>
                )}
            </div>

            {/* Modal: Form */}
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={isEdit ? "Refine Student Data" : "Onboarding Protocol"} size="full">
                <form onSubmit={handleSubmit} className="space-y-12">
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                        {/* Photo Column */}
                        <div className="lg:col-span-1 space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">Identity Signature</label>
                                <label className="flex flex-col items-center justify-center border-4 border-dashed border-gray-100 rounded-[2.5rem] p-10 hover:border-primary hover:bg-primary/5 transition-all cursor-pointer group relative overflow-hidden h-72">
                                    {files.studentPhoto || (isEdit && selectedStudent?.studentPhoto) ? (
                                        <img src={files.studentPhoto ? URL.createObjectURL(files.studentPhoto) : getFileUrl(selectedStudent?.studentPhoto)} className="absolute inset-0 w-full h-full object-cover" alt="Preview" />
                                    ) : (
                                        <>
                                            <Upload className="text-gray-200 group-hover:text-primary mb-4" size={48} />
                                            <p className="text-xs font-black text-gray-400 group-hover:text-primary text-center">UPLOAD PHOTO</p>
                                        </>
                                    )}
                                    <input type="file" name="studentPhoto" className="hidden" accept="image/*" onChange={handleFileChange} />
                                </label>
                            </div>
                            
                            <div className="card !bg-gray-50/50 border-none space-y-4">
                                <div className="flex items-center gap-2 text-primary">
                                    <ShieldCheck size={18} />
                                    <h3 className="font-black uppercase text-xs">Security Context</h3>
                                </div>
                                <div className="space-y-4">
                                    <div className="space-y-1">
                                        <label className="text-[9px] font-black uppercase text-gray-400">Username</label>
                                        <input type="text" className="input-field" placeholder="Auto-generated" value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[9px] font-black uppercase text-gray-400">Secure Key</label>
                                        <div className="relative flex items-center">
                                            <input 
                                                type={showPassword ? "text" : "password"} 
                                                className="input-field pr-16" 
                                                placeholder="••••••••" 
                                                value={formData.password} 
                                                onChange={e => setFormData({...formData, password: e.target.value})} 
                                            />
                                            <div className="absolute right-3 flex items-center gap-1.5 text-gray-400">
                                                <button 
                                                    type="button" 
                                                    onClick={() => setShowPassword(!showPassword)} 
                                                    className="p-1 hover:text-primary transition-colors focus:outline-none"
                                                    title={showPassword ? "Hide password" : "Show password"}
                                                >
                                                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                                </button>
                                                <button 
                                                    type="button" 
                                                    onClick={() => {
                                                        if (formData.password) {
                                                            navigator.clipboard.writeText(formData.password);
                                                            toast.success("Secure Key copied to clipboard!");
                                                        } else {
                                                            toast.warning("Secure Key is empty");
                                                        }
                                                    }} 
                                                    className="p-1 hover:text-primary transition-colors focus:outline-none"
                                                    title="Copy secure key"
                                                >
                                                    <Copy size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Form Details Column */}
                        <div className="lg:col-span-3 space-y-10">
                            {/* Identity Section */}
                            <div className="card border-none bg-white p-0 shadow-none space-y-6">
                                <div className="flex items-center gap-3 pb-3 border-b-2 border-gray-50">
                                    <div className="p-2 bg-primary/10 rounded-xl text-primary"><User size={20}/></div>
                                    <h3 className="font-black uppercase text-sm tracking-widest text-gray-800">Legal Identity</h3>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    <div className="md:col-span-2 space-y-1">
                                        <label className="text-[9px] font-black uppercase text-gray-400 ml-1">Full Representative Name</label>
                                        <input required type="text" className="input-field" placeholder="Enter Legal Name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[9px] font-black uppercase text-gray-400 ml-1">Registration Identifier</label>
                                        <input readOnly type="text" className="input-field !bg-primary/5 !text-primary !border-primary/10 font-black tracking-widest cursor-not-allowed" value={formData.registerNumber} />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[9px] font-black uppercase text-gray-400 ml-1">Birth Timeline</label>
                                        <input type="date" className="input-field" value={formData.dateOfBirth} onChange={e => setFormData({...formData, dateOfBirth: e.target.value})} />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[9px] font-black uppercase text-gray-400 ml-1">Verified Contact</label>
                                        <div className="relative flex items-center">
                                            <span className="absolute left-4 text-sm font-bold text-gray-400">+91</span>
                                            <input 
                                                type="text" 
                                                className="input-field !pl-14" 
                                                placeholder="XXXXX XXXXX" 
                                                value={formData.phone} 
                                                onChange={e => {
                                                    const digits = e.target.value.replace(/\D/g, '').slice(0, 10);
                                                    setFormData({...formData, phone: digits});
                                                }} 
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[9px] font-black uppercase text-gray-400 ml-1">Digital Coordinates</label>
                                        <input type="email" className="input-field" placeholder="email@address.com" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                                    </div>
                                </div>
                            </div>

                            {/* Academic Section */}
                            <div className="card border-none bg-white p-0 shadow-none space-y-6">
                                <div className="flex items-center gap-3 pb-3 border-b-2 border-gray-50">
                                    <div className="p-2 bg-orange-500/10 rounded-xl text-orange-600"><BookOpen size={20}/></div>
                                    <h3 className="font-black uppercase text-sm tracking-widest text-gray-800">Academic Trajectory</h3>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="space-y-1">
                                        <label className="text-[9px] font-black uppercase text-gray-400 ml-1">Last Affiliation</label>
                                        <input type="text" className="input-field" placeholder="Institution Name" value={formData.schoolInstitution} onChange={e => setFormData({...formData, schoolInstitution: e.target.value})} />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[9px] font-black uppercase text-gray-400 ml-1">Operational Batch</label>
                                        <select className="input-field" value={formData.batch} onChange={e => setFormData({...formData, batch: e.target.value})}>
                                            <option value="">Select Batch</option>
                                            <option value="2024-25">2024-25 Academy</option>
                                            <option value="2025-26">2025-26 Academy</option>
                                            <option value="2026-27">2026-27 Academy</option>
                                            <option value="2026-2027">2026-2027 Academy</option>
                                        </select>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[9px] font-black uppercase text-gray-400 ml-1">Advance Amount (₹)</label>
                                        <input type="number" className="input-field" placeholder="0" value={formData.advanceBalance} onChange={e => setFormData({...formData, advanceBalance: e.target.value})} />
                                    </div>
                                </div>
                            </div>

                            {/* Curriculum Section */}
                            <div className="space-y-4">
                                <label className="text-[9px] font-black uppercase text-gray-400 ml-1">Curriculum Assignments</label>
                                <div className="flex flex-wrap gap-3">
                                    {courses.map(c => (
                                        <label key={c._id} className={`flex items-center gap-3 px-6 py-4 rounded-2xl border-2 transition-all cursor-pointer ${
                                            formData.selectedCourses.includes(c._id) ? 'bg-primary/10 border-primary text-primary shadow-lg shadow-primary/5' : 'bg-gray-50 border-transparent hover:border-gray-200'
                                        }`}>
                                            <input 
                                                type="checkbox" 
                                                className="hidden"
                                                checked={formData.selectedCourses.includes(c._id)}
                                                onChange={(e) => {
                                                    const updated = e.target.checked 
                                                        ? [...formData.selectedCourses, c._id]
                                                        : formData.selectedCourses.filter(id => id !== c._id);
                                                    setFormData({...formData, selectedCourses: updated});
                                                }}
                                            />
                                            <span className="text-xs font-black uppercase">{c.courseName}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Bottom Action Bar */}
                    <div className="flex justify-end pt-6">
                        <button type="submit" className="btn-primary !py-3.5 !px-8 !rounded-2xl !text-xs uppercase tracking-widest shadow-xl shadow-primary/20">
                            {isEdit ? 'Refine Database Record' : 'Commit Onboarding'}
                            <ChevronRight size={16} />
                        </button>
                    </div>
                </form>
            </Modal>

            {/* View Profile Modal - Refined */}
            <Modal isOpen={viewModalOpen} onClose={() => setViewModalOpen(false)} title="Comprehensive Profile View" size="full">
                {selectedStudent && (
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
                        {/* Sidebar Column */}
                        <div className="lg:col-span-1 space-y-6">
                            {/* Avatar Identity Card */}
                            <div className="card !bg-primary !text-white text-center !p-8 relative overflow-hidden shadow-xl shadow-primary/20">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full translate-x-12 -translate-y-12 shrink-0"></div>
                                <div className="w-36 h-36 rounded-[2.5rem] bg-white mx-auto overflow-hidden shadow-2xl mb-6 flex items-center justify-center border-4 border-white/20 shrink-0">
                                    {selectedStudent.studentPhoto ? (
                                        <img src={getFileUrl(selectedStudent.studentPhoto)} className="w-full h-full object-cover" alt="Student Avatar" />
                                    ) : <User size={48} className="text-primary" />}
                                </div>
                                <h2 className="text-xl font-black uppercase tracking-tight">{selectedStudent.user?.name}</h2>
                                <p className="text-[10px] font-black opacity-70 tracking-widest mt-2 uppercase">{selectedStudent.studentType} Classification</p>
                                
                                <div className="mt-8 pt-6 border-t border-white/20 grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-[8px] font-black uppercase opacity-60">Database ID</p>
                                        <p className="font-black text-xs tracking-wider">{selectedStudent.registerNumber}</p>
                                    </div>
                                    <div>
                                        <p className="text-[8px] font-black uppercase opacity-60">Status</p>
                                        <p className="font-black text-xs italic tracking-widest text-emerald-300">VERIFIED</p>
                                    </div>
                                </div>
                            </div>

                            {/* Financial Status Card */}
                            <div className="card border-none bg-emerald-50/50 p-6 flex items-center justify-between border-l-4 border-emerald-500">
                                <div>
                                    <p className="text-[8px] font-black text-emerald-600 uppercase tracking-widest">Advance Credit Balance</p>
                                    <p className="font-black text-2xl text-emerald-700 mt-1">₹{selectedStudent.advanceBalance || 0}</p>
                                </div>
                                <div className="p-3 bg-emerald-500/10 text-emerald-600 rounded-2xl">
                                    <ShieldCheck size={24} />
                                </div>
                            </div>

                            {/* Document Attachment Widget */}
                            <div className="space-y-2">
                                <span className="text-[9px] font-black uppercase text-gray-400 tracking-widest ml-1">Institutional Files</span>
                                {selectedStudent.applicationForm && selectedStudent.applicationForm.documentUrl ? (
                                    <a 
                                        href={getFileUrl(selectedStudent.applicationForm)} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="flex items-center justify-between p-4 bg-gray-50/50 hover:bg-primary/5 border border-dashed border-gray-200 hover:border-primary/30 rounded-2xl transition-all group"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="p-2.5 bg-primary/10 text-primary rounded-xl group-hover:bg-primary group-hover:text-white transition-all">
                                                <FileText size={18} />
                                            </div>
                                            <div className="text-left">
                                                <p className="text-xs font-black text-gray-800 uppercase tracking-tight">Application Form</p>
                                                <p className="text-[9px] font-bold text-gray-400 truncate max-w-[150px] mt-0.5">
                                                    {selectedStudent.applicationForm.fileName || 'Attached PDF'}
                                                </p>
                                            </div>
                                        </div>
                                        <Download size={16} className="text-gray-400 group-hover:text-primary transition-colors shrink-0" />
                                    </a>
                                ) : (
                                    <div className="p-4 bg-gray-50/50 border border-dashed border-gray-200 rounded-2xl text-center text-[10px] font-bold text-gray-400 uppercase italic">
                                        No attachment uploaded
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Details Details Details Column */}
                        <div className="lg:col-span-3 space-y-8">
                            {/* Section 1: Legal Identity */}
                            <div className="space-y-4">
                                <h3 className="font-black text-xs uppercase tracking-[0.2em] border-b-2 border-gray-50 pb-3 flex items-center gap-2">
                                    <User size={16} className="text-primary"/> Legal Profile & Contact coordinates
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    <div className="card !bg-gray-50 border-none !p-4">
                                        <p className="text-[8px] font-black text-gray-400 uppercase tracking-wider">Digital Username</p>
                                        <p className="font-bold text-sm text-gray-800 tracking-tight mt-1">{selectedStudent.user?.username || 'N/A'}</p>
                                    </div>
                                    <div className="card !bg-gray-50 border-none !p-4">
                                        <p className="text-[8px] font-black text-gray-400 uppercase tracking-wider">Verified Contact Phone</p>
                                        <p className="font-bold text-sm text-gray-800 tracking-tight mt-1">{selectedStudent.user?.phone || 'N/A'}</p>
                                    </div>
                                    <div className="card !bg-gray-50 border-none !p-4">
                                        <p className="text-[8px] font-black text-gray-400 uppercase tracking-wider">Timeline Birth Date</p>
                                        <p className="font-bold text-sm text-gray-800 tracking-tight mt-1">{selectedStudent.dateOfBirth || 'N/A'}</p>
                                    </div>
                                    <div className="card !bg-gray-50 border-none !p-4 lg:col-span-2">
                                        <p className="text-[8px] font-black text-gray-400 uppercase tracking-wider">Verified Email Coordinates</p>
                                        <p className="font-bold text-sm text-gray-800 tracking-tight mt-1 truncate">{selectedStudent.user?.email || 'N/A'}</p>
                                    </div>
                                    <div className="card !bg-gray-50 border-none !p-4 lg:col-span-3">
                                        <p className="text-[8px] font-black text-gray-400 uppercase tracking-wider">Current Residential Coordinates</p>
                                        <p className="font-bold text-xs text-gray-700 tracking-tight mt-1 leading-relaxed">{selectedStudent.address || 'N/A'}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Section 2: Academic Standings */}
                            <div className="space-y-4">
                                <h3 className="font-black text-xs uppercase tracking-[0.2em] border-b-2 border-gray-50 pb-3 flex items-center gap-2">
                                    <BookOpen size={16} className="text-orange-500"/> Institutional Standing & Curriculum
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="card !bg-gray-50 border-none !p-5">
                                        <p className="text-[8px] font-black text-gray-400 uppercase tracking-wider">Operational Academy Batch</p>
                                        <p className="font-black text-lg text-primary uppercase mt-1 italic">{selectedStudent.batch || 'Unassigned'}</p>
                                    </div>
                                    <div className="card !bg-gray-50 border-none !p-5">
                                        <p className="text-[8px] font-black text-gray-400 uppercase tracking-wider">Previous Affiliated Institution</p>
                                        <p className="font-bold text-sm text-gray-800 mt-1">{selectedStudent.schoolInstitution || 'N/A'}</p>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest ml-1">Assigned Modules</span>
                                    <div className="flex flex-wrap gap-3">
                                        {selectedStudent.courseIds && selectedStudent.courseIds.length > 0 ? (
                                            selectedStudent.courseIds.map(c => (
                                                <span key={c._id} className="bg-primary/5 text-primary border border-primary/10 px-4 py-2 rounded-2xl font-black text-xs uppercase tracking-tight flex items-center gap-2 shadow-sm">
                                                    <BookOpen size={14} className="opacity-75" />
                                                    <span>{c.courseName} <span className="opacity-50">({c.courseCode})</span></span>
                                                </span>
                                            ))
                                        ) : (
                                            <span className="text-xs text-gray-400 italic font-medium ml-1">No assigned curriculum courses.</span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Section 3: Parental Representatives */}
                            <div className="space-y-4">
                                <h3 className="font-black text-xs uppercase tracking-[0.2em] border-b-2 border-gray-50 pb-3 flex items-center gap-2">
                                    <Users size={16} className="text-blue-500"/> Verified Parental Representatives
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Father Context */}
                                    <div className="card border-none bg-blue-50/20 p-6 space-y-4 border-t-4 border-blue-400">
                                        <div className="flex items-center gap-2 text-blue-600">
                                            <User size={16} />
                                            <span className="font-black text-[10px] uppercase tracking-widest">Father Status</span>
                                        </div>
                                        <div className="grid grid-cols-1 gap-2">
                                            <div>
                                                <p className="text-[8px] font-black text-gray-400 uppercase">Full Name</p>
                                                <p className="font-bold text-sm text-gray-800 mt-0.5">{selectedStudent.fatherName || 'N/A'}</p>
                                            </div>
                                            <div className="grid grid-cols-2 gap-4 pt-1">
                                                <div>
                                                    <p className="text-[8px] font-black text-gray-400 uppercase">Contact Number</p>
                                                    <p className="font-bold text-xs text-gray-800 mt-0.5">{selectedStudent.fatherPhone || 'N/A'}</p>
                                                </div>
                                                <div>
                                                    <p className="text-[8px] font-black text-gray-400 uppercase">Occupation</p>
                                                    <p className="font-bold text-xs text-gray-800 mt-0.5">{selectedStudent.fatherOccupation || 'N/A'}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Mother Context */}
                                    <div className="card border-none bg-pink-50/10 p-6 space-y-4 border-t-4 border-pink-400">
                                        <div className="flex items-center gap-2 text-pink-600">
                                            <User size={16} />
                                            <span className="font-black text-[10px] uppercase tracking-widest">Mother Status</span>
                                        </div>
                                        <div className="grid grid-cols-1 gap-2">
                                            <div>
                                                <p className="text-[8px] font-black text-gray-400 uppercase">Full Name</p>
                                                <p className="font-bold text-sm text-gray-800 mt-0.5">{selectedStudent.motherName || 'N/A'}</p>
                                            </div>
                                            <div className="grid grid-cols-2 gap-4 pt-1">
                                                <div>
                                                    <p className="text-[8px] font-black text-gray-400 uppercase">Contact Number</p>
                                                    <p className="font-bold text-xs text-gray-800 mt-0.5">{selectedStudent.motherPhone || 'N/A'}</p>
                                                </div>
                                                <div>
                                                    <p className="text-[8px] font-black text-gray-400 uppercase">Occupation</p>
                                                    <p className="font-bold text-xs text-gray-800 mt-0.5">{selectedStudent.motherOccupation || 'N/A'}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Modal Close Action Footer */}
                            <div className="flex justify-end pt-4">
                                <button onClick={() => setViewModalOpen(false)} className="px-10 py-4 bg-gray-100 hover:bg-gray-200 active:scale-95 rounded-2xl font-black text-xs uppercase tracking-widest transition-all">Close Profile</button>
                            </div>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default Students;
