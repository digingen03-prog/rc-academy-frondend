import React, { useState, useEffect } from 'react';
import axios from '../../utils/axiosInstance';
import Table from '../../components/Table';
import Modal from '../../components/Modal';
import { Plus, Search, Filter, Edit2, Trash2, Eye, Upload, FileText, User, Users, BookOpen, ShieldCheck, ChevronRight, Download, Calendar } from 'lucide-react';
import { toast } from 'react-toastify';
import { IndianRupee } from 'lucide-react';

const DetailCard = ({ icon: Icon, label, value }) => (
    <div className="card !bg-gray-50 border-none !p-4 flex items-center gap-4 group hover:bg-white hover:shadow-md transition-all">
        <div className="p-2 bg-white rounded-xl text-primary shadow-sm group-hover:bg-primary group-hover:text-white transition-colors">
            <Icon size={16} />
        </div>
        <div>
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">{label}</p>
            <p className="font-bold text-sm tracking-tight text-gray-800">{value || 'N/A'}</p>
        </div>
    </div>
);

const Students = () => {
    const [students, setStudents] = useState([]);
    const [courses, setCourses] = useState([]);
    const [batches, setBatches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEdit, setIsEdit] = useState(false);
    const [viewModalOpen, setViewModalOpen] = useState(false);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [studentToDelete, setStudentToDelete] = useState(null);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    const [formData, setFormData] = useState({
        name: '', email: '', username: '', password: '',
        phone: '', address: '', registerNumber: '', 
        schoolInstitution: '', batch: '', dateOfBirth: '', 
        studentType: 'Regular',
        fatherName: '', fatherPhone: '', fatherOccupation: '',
        motherName: '', motherPhone: '', motherOccupation: '',
        selectedCourses: [],
        advanceBalance: 0
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

    const fetchBatches = async () => {
        try {
            const { data } = await axios.get('/api/batches');
            setBatches(data);
        } catch (err) {
            console.error('Failed to fetch batches for selection');
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
            password: '', 
            phone: student.user?.phone || '',
            address: student.address || '',
            registerNumber: student.registerNumber || '',
            schoolInstitution: student.schoolInstitution || '',
            batch: student.batch || '',
            dateOfBirth: student.dateOfBirth || '',
            studentType: student.studentType || 'Regular',
            fatherName: student.fatherName || '',
            fatherPhone: student.fatherPhone || '',
            fatherOccupation: student.fatherOccupation || '',
            motherName: student.motherName || '',
            motherPhone: student.motherPhone || '',
            motherOccupation: student.motherOccupation || '',
            selectedCourses: student.courseIds?.map(c => c._id) || [],
            advanceBalance: student.advanceBalance || 0
        });
        setIsModalOpen(true);
    };

    const handleOpenViewModal = (student) => {
        setSelectedStudent(student);
        setViewModalOpen(true);
    };

    const handleDeleteStudent = (id) => {
        setStudentToDelete(id);
        setDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        try {
            await axios.delete(`/api/students/${studentToDelete}`);
            toast.success('Record purged successfully');
            setDeleteModalOpen(false);
            setStudentToDelete(null);
            fetchStudents();
        } catch (err) {
            toast.error('Failed to eliminate record');
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
            studentType: 'Regular',
            fatherName: '', fatherPhone: '', fatherOccupation: '',
            motherName: '', motherPhone: '', motherOccupation: '',
            selectedCourses: [],
            advanceBalance: 0
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

            {/* Table */}
            <div className="overflow-hidden">
                {loading ? (
                    <div className="p-20 text-center font-bold text-gray-400 italic animate-pulse">Synchronizing records...</div>
                ) : (
                    <Table headers={['Student Details', 'Identifier', 'Academic Info', 'Actions']}>
                        {students.filter(s => 
                            s.user?.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            s.registerNumber.toLowerCase().includes(searchTerm.toLowerCase())
                        ).map((s) => (
                            <tr key={s._id} className="hover:bg-primary/5 transition-all group">
                                <td className="px-6 py-5">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-gray-50 border-2 border-white shadow-sm overflow-hidden flex items-center justify-center shrink-0">
                                            {s.studentPhoto ? (
                                                <img src={s.studentPhoto} alt={s.user?.name} className="w-full h-full object-cover" />
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
                                    <p className="text-[9px] font-bold text-primary italic uppercase opacity-70">{s.studentType}</p>
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
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={isEdit ? "Refine Student Data" : "Onboarding Protocol"} size="screen">
                <form onSubmit={handleSubmit} className="space-y-12">
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                        {/* Photo Column */}
                        <div className="lg:col-span-1 space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">Identity Signature</label>
                                <label className="flex flex-col items-center justify-center border-4 border-dashed border-gray-100 rounded-[2.5rem] p-10 hover:border-primary hover:bg-primary/5 transition-all cursor-pointer group relative overflow-hidden h-72">
                                    {files.studentPhoto || (isEdit && selectedStudent?.studentPhoto) ? (
                                        <img src={files.studentPhoto ? URL.createObjectURL(files.studentPhoto) : selectedStudent?.studentPhoto} className="absolute inset-0 w-full h-full object-cover" alt="Preview" />
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
                                        <input type="password" className="input-field" placeholder="••••••••" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
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
                                        <input type="text" className="input-field" placeholder="DD-MM-YYYY" value={formData.dateOfBirth} onChange={e => setFormData({...formData, dateOfBirth: e.target.value})} />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[9px] font-black uppercase text-gray-400 ml-1">Verified Contact</label>
                                        <input type="text" className="input-field" placeholder="+..." value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[9px] font-black uppercase text-gray-400 ml-1">Academic Batch (Intake)</label>
                                        <select 
                                            className="input-field font-bold" 
                                            value={formData.batch} 
                                            onChange={e => setFormData({...formData, batch: e.target.value})}
                                            required
                                        >
                                            <option value="">Select Batch</option>
                                            {batches.map(b => (
                                                <option key={b._id} value={b.name}>{b.name}</option>
                                            ))}
                                            {/* Fallback for legacy data */}
                                            {formData.batch && !batches.find(b => b.name === formData.batch) && (
                                                <option value={formData.batch}>{formData.batch} (Legacy)</option>
                                            )}
                                        </select>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[9px] font-black uppercase text-gray-400 ml-1">Digital Coordinates</label>
                                        <input type="email" className="input-field" placeholder="email@address.com" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[9px] font-black uppercase text-primary ml-1 italic">Advance Payment (Credit Balance)</label>
                                        <input type="number" className="input-field !border-primary/30 font-black text-primary" placeholder="0.00" value={formData.advanceBalance} onChange={e => setFormData({...formData, advanceBalance: e.target.value})} />
                                    </div>
                                </div>
                            </div>

                            {/* Academic Section */}
                            <div className="card border-none bg-white p-0 shadow-none space-y-6">
                                <div className="flex items-center gap-3 pb-3 border-b-2 border-gray-50">
                                    <div className="p-2 bg-orange-500/10 rounded-xl text-orange-600"><BookOpen size={20}/></div>
                                    <h3 className="font-black uppercase text-sm tracking-widest text-gray-800">Academic Trajectory</h3>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-1 md:col-span-2">
                                        <label className="text-[9px] font-black uppercase text-gray-400 ml-1">Last Affiliation</label>
                                        <input type="text" className="input-field" placeholder="Institution Name" value={formData.schoolInstitution} onChange={e => setFormData({...formData, schoolInstitution: e.target.value})} />
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
                    <div className="sticky bottom-0 bg-white/80 backdrop-blur-xl -mx-8 -mb-8 p-8 border-t border-border">
                        <button type="submit" className="w-full btn-primary !py-6 !rounded-3xl !text-xl uppercase tracking-[0.2em] shadow-2xl shadow-primary/30">
                            {isEdit ? 'Refine Database Record' : 'Commit Onboarding'}
                            <ChevronRight size={28} />
                        </button>
                    </div>
                </form>
            </Modal>

            {/* View Profile Modal - Refined */}
            {/* Modal: View Profile - Premium Redesign */}
            <Modal isOpen={viewModalOpen} onClose={() => setViewModalOpen(false)} title="Student Digital Dossier" size="screen">
                {selectedStudent && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-6">
                        {/* Header Banner Section */}
                        <div className="relative h-48 rounded-[2.5rem] bg-black overflow-hidden group shadow-2xl">
                             <div className="absolute inset-0 bg-gradient-to-r from-primary/40 to-black/60 z-10"></div>
                             <div className="absolute inset-0 opacity-30 group-hover:scale-110 transition-transform duration-700 bg-[url('https://images.unsplash.com/photo-1523050853064-59f6f363a0a3?auto=format&fit=crop&q=80')] bg-cover bg-center"></div>
                             
                             <div className="absolute -bottom-12 left-10 z-20 flex items-end gap-10">
                                <div className="w-36 h-36 rounded-[2.5rem] border-8 border-white shadow-2xl overflow-hidden bg-white">
                                    {selectedStudent.studentPhoto ? (
                                        <img src={selectedStudent.studentPhoto} className="w-full h-full object-cover" alt={selectedStudent.user?.name} />
                                    ) : (
                                        <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-300">
                                            <User size={64} />
                                        </div>
                                    )}
                                </div>
                                <div className="pb-16">
                                    <h2 className="text-5xl font-bold text-white italic uppercase leading-none tracking-tighter drop-shadow-lg">{selectedStudent.user?.name}</h2>
                                    <div className="flex gap-2 mt-4">
                                        <span className="text-white font-semibold uppercase tracking-widest text-[10px] bg-primary px-3 py-1 rounded-lg">ID: {selectedStudent.registerNumber}</span>
                                        <span className="text-white font-bold uppercase tracking-widest text-[9px] bg-white/20 backdrop-blur-md px-3 py-1 rounded-lg italic">Verified Entity</span>
                                    </div>
                                </div>
                             </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 mt-16 px-4">
                            {/* Primary Details */}
                            <div className="lg:col-span-2 space-y-10">
                                <div className="grid grid-cols-2 gap-6">
                                    <DetailCard icon={Calendar} label="DOB Protocol" value={selectedStudent.dateOfBirth} />
                                    <DetailCard icon={Users} label="Social Standing" value={selectedStudent.studentType} />
                                    <DetailCard icon={Download} label="Email Protocol" value={selectedStudent.user?.email} />
                                    <DetailCard icon={FileText} label="Phone Coordinate" value={selectedStudent.user?.phone} />
                                </div>

                                <div className="card !bg-gray-50/50 border-none space-y-6 !p-8">
                                     <h3 className="font-semibold text-xs uppercase tracking-widest text-gray-400 flex items-center gap-2 border-b border-gray-100 pb-3"> <BookOpen size={16} className="text-primary" /> Program Trajectory</h3>
                                     <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">Active Batch</p>
                                            <p className="font-bold text-4xl text-primary italic uppercase tracking-tighter mt-1">{selectedStudent.batch}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">Enrollment Count</p>
                                            <p className="font-bold text-4xl tracking-tighter mt-1">{selectedStudent.courseIds?.length || 0} Modules</p>
                                        </div>
                                     </div>
                                </div>
                            </div>

                            {/* Secondary Information */}
                            <div className="space-y-8">
                                <div className="bg-green-50 p-8 rounded-[2rem] border border-green-100 shadow-sm">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="p-2.5 bg-green-100 text-green-600 rounded-2xl"><IndianRupee size={20} /></div>
                                        <span className="text-[11px] font-black uppercase text-green-700 tracking-wider">Safety Balance</span>
                                    </div>
                                    <p className="text-5xl font-bold text-green-700 tracking-tighter italic">₹{(selectedStudent.advanceBalance || 0).toLocaleString()}</p>
                                    <p className="text-[10px] font-semibold text-green-600/60 uppercase mt-2 tracking-widest">SECURE CREDIT AVAILABLE</p>
                                </div>

                                <div className="space-y-6">
                                    <h3 className="font-black text-xs uppercase tracking-[0.2em] text-gray-400 border-b border-gray-100 pb-3">Parental Guardians</h3>
                                    <div className="space-y-5">
                                        <div className="flex items-center gap-4 group">
                                            <div className="w-12 h-12 rounded-[1.2rem] bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-primary group-hover:text-white transition-all duration-300"> <User size={20} /> </div>
                                            <div>
                                                <p className="text-[10px] font-bold text-gray-400 uppercase">Father Signature</p>
                                                <p className="font-black text-sm italic uppercase tracking-tight">{selectedStudent.fatherName || 'Not Listed'}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4 group">
                                            <div className="w-12 h-12 rounded-[1.2rem] bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-primary group-hover:text-white transition-all duration-300"> <User size={20} /> </div>
                                            <div>
                                                <p className="text-[10px] font-bold text-gray-400 uppercase">Mother Signature</p>
                                                <p className="font-black text-sm italic uppercase tracking-tight">{selectedStudent.motherName || 'Not Listed'}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Footer actions in View */}
                        <div className="flex gap-4 pt-10 border-t border-gray-100 px-4">
                            <button className="flex-[2] btn-primary group !py-6 !rounded-3xl shadow-xl shadow-primary/20">
                                <FileText size={22} className="group-hover:rotate-12 transition-transform" />
                                <span className="font-black tracking-[0.2em] text-sm">GENERATE DIGITAL TRANSCRIPT</span>
                            </button>
                            <button onClick={() => setViewModalOpen(false)} className="flex-1 bg-gray-100 hover:bg-black hover:text-white transition-all rounded-3xl font-black text-xs uppercase tracking-[0.2em]">EXIT DOSSIER</button>
                        </div>
                    </div>
                )}
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal isOpen={deleteModalOpen} onClose={() => setDeleteModalOpen(false)} title="Security Protocol: Record Purge" size="sm">
                <div className="space-y-6 text-center">
                    <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto animate-bounce">
                        <Trash2 size={40} />
                    </div>
                    <div>
                        <h4 className="font-black uppercase text-lg text-gray-800 tracking-tight">Irreversible Deletion</h4>
                        <p className="text-xs font-bold text-gray-400 mt-2 leading-relaxed">
                            You are about to permanently eliminate a student identity from the central registry. This action cannot be undone.
                        </p>
                    </div>
                    <div className="flex flex-col gap-3">
                        <button onClick={confirmDelete} className="w-full bg-red-600 hover:bg-black text-white py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all shadow-lg shadow-red-100">
                            EXECUTE PURGE
                        </button>
                        <button onClick={() => setDeleteModalOpen(false)} className="w-full bg-gray-50 hover:bg-gray-100 text-gray-400 py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all">
                            ABORT PROTOCOL
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default Students;
