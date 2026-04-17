import React, { useState, useEffect } from 'react';
import axios from '../../utils/axiosInstance';
import Table from '../../components/Table';
import Modal from '../../components/Modal';
import { Plus, Search, Filter, Edit2, Trash2, Eye, Upload, FileText, User, Users, BookOpen, ShieldCheck, ChevronRight, Briefcase, GraduationCap } from 'lucide-react';
import { toast } from 'react-toastify';

const Staff = () => {
    const [staff, setStaff] = useState([]);
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [viewModalOpen, setViewModalOpen] = useState(false);
    const [selectedStaff, setSelectedStaff] = useState(null);
    const [isEdit, setIsEdit] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const [formData, setFormData] = useState({
        name: '', email: '', username: '', password: '',
        phone: '', address: '', 
        qualification: '', experience: '',
        designation: 'Staff', department: '', salary: '',
        selectedCourses: []
    });

    const [file, setFile] = useState(null);

    useEffect(() => {
        fetchStaff();
        fetchCourses();
    }, []);

    const fetchStaff = async () => {
        try {
            const { data } = await axios.get('/api/staff');
            setStaff(data);
        } catch (err) {
            toast.error('Failed to fetch staff records');
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

    const handleOpenAddModal = () => {
        setIsEdit(false);
        resetForm();
        setIsModalOpen(true);
    };

    const handleOpenEditModal = (s) => {
        setIsEdit(true);
        setSelectedStaff(s);
        setFormData({
            name: s.user?.name || '',
            email: s.user?.email || '',
            username: s.user?.username || '',
            password: '', 
            phone: s.user?.phone || '',
            address: s.user?.address || '',
            qualification: s.qualification || '',
            experience: s.experience || '',
            designation: s.designation || 'Staff',
            department: s.department || '',
            salary: s.salary || '',
            selectedCourses: s.subjectIds?.filter(Boolean).map(c => c._id) || []
        });
        setIsModalOpen(true);
    };

    const handleOpenViewModal = (s) => {
        setSelectedStaff(s);
        setViewModalOpen(true);
    };

    const handleDeleteStaff = async (id) => {
        if (window.confirm('Delete this staff record permanently?')) {
            try {
                await axios.delete(`/api/staff/${id}`);
                toast.success('Staff record removed');
                fetchStaff();
            } catch (err) {
                toast.error('Deletion failed');
            }
        }
    };

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
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

        if (file) data.append('staffImage', file);

        try {
            if (isEdit) {
                await axios.put(`/api/staff/${selectedStaff._id}`, data, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                toast.success('Staff updated successfully!');
            } else {
                await axios.post('/api/staff', data, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                toast.success('Staff onboarded successfully!');
            }
            setIsModalOpen(false);
            fetchStaff();
            resetForm();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Operation failed');
        }
    };

    const resetForm = () => {
        setFormData({
            name: '', email: '', username: '', password: '',
            phone: '', address: '', 
            qualification: '', experience: '',
            designation: 'Staff', department: '', salary: '',
            selectedCourses: []
        });
        setFile(null);
        setSelectedStaff(null);
    };

    const filteredStaff = staff.filter(s => 
        s.user?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.staffId.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black italic uppercase tracking-tighter">Academic Faculty</h1>
                    <p className="text-gray-500 text-sm italic">Organize expertise, manage profiles, and assign academic responsibilities.</p>
                </div>
                <button 
                    onClick={handleOpenAddModal}
                    className="btn-primary"
                >
                    <Plus size={18} />
                    <span>Onboard New Faculty</span>
                </button>
            </div>

            {/* Search & Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="md:col-span-3 card !p-4 flex items-center gap-3 border-2 border-primary/10">
                    <Search className="text-gray-400 focus-within:text-primary" size={20} />
                    <input 
                        type="text" 
                        placeholder="Search faculty by name, ID, or qualification..."
                        className="flex-1 bg-transparent border-none outline-none font-bold text-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="card !p-4 flex items-center justify-between bg-black text-white shadow-xl">
                    <span className="text-xs font-bold uppercase tracking-widest opacity-60">Verified Assets</span>
                    <span className="text-2xl font-black">{staff.length}</span>
                </div>
            </div>

            {/* Faculty Table */}
            <div className="card !p-0 overflow-hidden border-2 border-primary/5">
                {loading ? (
                    <div className="p-20 text-center font-bold text-gray-400 italic animate-pulse tracking-widest uppercase text-xs">Accessing Personnel Directory...</div>
                ) : (
                    <Table headers={['Faculty Profile', 'Expertise', 'Assignment', 'Status', 'Actions']}>
                        {filteredStaff.map((s) => (
                            <tr key={s._id} className="hover:bg-primary/5 transition-all group">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-gray-50 border-2 border-white shadow-sm overflow-hidden flex items-center justify-center shrink-0">
                                            {s.staffImage ? (
                                                <img src={s.staffImage} alt={s.user?.name} className="w-full h-full object-cover" />
                                            ) : <User className="text-gray-300" />}
                                        </div>
                                        <div>
                                            <p className="font-black text-sm uppercase tracking-tight group-hover:text-primary transition-colors">{s.user?.name}</p>
                                            <p className="text-[10px] font-bold text-gray-400">{s.user?.email}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black uppercase text-text">{s.qualification || 'N/A'}</p>
                                        <p className="text-[9px] font-bold text-gray-400 italic">{s.experience} Exp.</p>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex flex-wrap gap-1 max-w-[200px]">
                                        {s.subjectIds && s.subjectIds.filter(Boolean).length > 0 ? (
                                            s.subjectIds.filter(Boolean).slice(0, 2).map(c => (
                                                <span key={c._id} className="bg-gray-100 text-[8px] font-black uppercase px-2 py-1 rounded-md">{c.courseName}</span>
                                            ))
                                        ) : <span className="text-[9px] font-bold text-gray-300 italic uppercase">Unassigned</span>}
                                        {s.subjectIds?.filter(Boolean).length > 2 && <span className="text-[8px] font-black text-primary">+{s.subjectIds.filter(Boolean).length - 2}</span>}
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="bg-green-100 text-green-600 px-3 py-1 rounded-full font-black uppercase text-[8px] tracking-widest border border-green-200">ACTIVE</span>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex gap-2">
                                        <button onClick={() => handleOpenViewModal(s)} className="p-2 hover:bg-white rounded-xl text-gray-400 hover:text-primary transition-all border border-transparent shadow-sm"><Eye size={16}/></button>
                                        <button onClick={() => handleOpenEditModal(s)} className="p-2 hover:bg-white rounded-xl text-gray-400 hover:text-blue-500 transition-all border border-transparent shadow-sm"><Edit2 size={16}/></button>
                                        <button onClick={() => handleDeleteStaff(s._id)} className="p-2 hover:bg-white rounded-xl text-gray-400 hover:text-red-500 transition-all border border-transparent shadow-sm"><Trash2 size={16}/></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </Table>
                )}
            </div>

            {/* Full-width Registration Modal */}
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={isEdit ? "Update Faculty Profile" : "Staff Onboarding Form"} size="full">
                <form onSubmit={handleSubmit} className="space-y-12">
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
                        {/* Photo Sidebar */}
                        <div className="lg:col-span-1 space-y-8">
                            <div className="space-y-4">
                                <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Faculty Portrait</label>
                                <label className="flex flex-col items-center justify-center border-4 border-dashed border-gray-100 rounded-[3rem] p-10 hover:border-primary hover:bg-primary/5 transition-all cursor-pointer group relative overflow-hidden h-64 shadow-inner">
                                    {file || (isEdit && selectedStaff?.staffImage) ? (
                                        <img src={file ? URL.createObjectURL(file) : selectedStaff?.staffImage} className="absolute inset-0 w-full h-full object-cover" alt="Preview" />
                                    ) : (
                                        <>
                                            <Upload className="text-gray-200 group-hover:text-primary mb-4" size={48} />
                                            <p className="text-xs font-black text-gray-400 group-hover:text-primary text-center leading-tight">DRAG & DROP<br/>IMAGE</p>
                                        </>
                                    )}
                                    <input type="file" name="staffImage" className="hidden" accept="image/*" onChange={handleFileChange} />
                                </label>
                            </div>
                            
                            <div className="card !bg-gray-50 border-none space-y-4">
                                <div className="flex items-center gap-2 text-primary">
                                    <ShieldCheck size={18} />
                                    <h3 className="font-black uppercase text-xs">Auth Layer</h3>
                                </div>
                                <div className="space-y-4">
                                    <div className="space-y-1">
                                        <label className="text-[9px] font-black uppercase text-gray-400">Username *</label>
                                        <input required type="text" className="w-full px-4 py-3 bg-white border-2 border-gray-100 rounded-2xl focus:border-primary outline-none font-bold text-sm" placeholder="john.doe" value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[9px] font-black uppercase text-gray-400">Password *</label>
                                        <input required={!isEdit} type="password" className="w-full px-4 py-3 bg-white border-2 border-gray-100 rounded-2xl focus:border-primary outline-none font-bold text-sm" placeholder="••••••••" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Main Body */}
                        <div className="lg:col-span-3 space-y-12">
                            {/* Personal */}
                            <div className="space-y-6">
                                <div className="flex items-center gap-3 pb-2 border-b-2 border-gray-50">
                                    <div className="p-2 bg-primary/10 rounded-xl text-primary"><User size={20}/></div>
                                    <h3 className="font-black uppercase text-sm tracking-widest text-gray-800">Faculty Identity</h3>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    <div className="space-y-1 lg:col-span-2">
                                        <label className="text-[9px] font-black uppercase text-gray-400 ml-1">Full Name *</label>
                                        <input required type="text" className="w-full px-5 py-4 bg-gray-50/50 border-2 border-transparent rounded-2xl focus:border-primary focus:bg-white outline-none font-black text-sm transition-all" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[9px] font-black uppercase text-gray-400 ml-1">Work Email *</label>
                                        <input required type="email" className="w-full px-5 py-4 bg-gray-50/50 border-2 border-transparent rounded-2xl focus:border-primary focus:bg-white outline-none font-bold text-sm transition-all text-primary" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[9px] font-black uppercase text-gray-400 ml-1">Contact Number *</label>
                                        <input required type="text" className="w-full px-5 py-4 bg-gray-50/50 border-2 border-transparent rounded-2xl focus:border-primary focus:bg-white outline-none font-bold text-sm transition-all" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                                    </div>
                                    <div className="space-y-1 lg:col-span-2">
                                        <label className="text-[9px] font-black uppercase text-gray-400 ml-1">Staff Home Address *</label>
                                        <input required type="text" className="w-full px-5 py-4 bg-gray-50/50 border-2 border-transparent rounded-2xl focus:border-primary focus:bg-white outline-none font-bold text-sm transition-all" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
                                    </div>
                                </div>
                            </div>

                            {/* Professional */}
                            <div className="space-y-6">
                                <div className="flex items-center gap-3 pb-2 border-b-2 border-gray-50">
                                    <div className="p-2 bg-orange-500/10 rounded-xl text-orange-600"><GraduationCap size={20}/></div>
                                    <h3 className="font-black uppercase text-sm tracking-widest text-gray-800">Professional Background</h3>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    <div className="space-y-1">
                                        <label className="text-[9px] font-black uppercase text-gray-400 ml-1">Qualification *</label>
                                        <input required type="text" className="w-full px-5 py-4 bg-gray-50/50 border-2 border-transparent rounded-2xl focus:border-primary focus:bg-white outline-none font-bold text-sm transition-all" placeholder="e.g. M.Sc. Mathematics" value={formData.qualification} onChange={e => setFormData({...formData, qualification: e.target.value})} />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[9px] font-black uppercase text-gray-400 ml-1">Years of Experience *</label>
                                        <input required type="text" className="w-full px-5 py-4 bg-gray-50/50 border-2 border-transparent rounded-2xl focus:border-primary focus:bg-white outline-none font-bold text-sm transition-all" placeholder="e.g. 5+ Years" value={formData.experience} onChange={e => setFormData({...formData, experience: e.target.value})} />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[9px] font-black uppercase text-gray-400 ml-1">Base Designation</label>
                                        <input type="text" className="w-full px-5 py-4 bg-gray-50/50 border-2 border-transparent rounded-2xl focus:border-primary focus:bg-white outline-none font-bold text-sm transition-all opacity-50" value={formData.designation} onChange={e => setFormData({...formData, designation: e.target.value})} />
                                    </div>
                                </div>
                            </div>

                            {/* Assignments */}
                            <div className="space-y-6">
                                <div className="flex items-center gap-3 pb-2 border-b-2 border-gray-50">
                                    <div className="p-2 bg-blue-500/10 rounded-xl text-blue-600"><BookOpen size={20}/></div>
                                    <h3 className="font-black uppercase text-sm tracking-widest text-gray-800">Academic Assignments</h3>
                                </div>
                                <div className="space-y-3">
                                    <p className="text-[9px] font-black uppercase text-gray-400 ml-1">Select one or more courses for this staff member.</p>
                                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
                                        {courses.map(c => (
                                            <label key={c._id} className={`flex flex-col p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                                                formData.selectedCourses.includes(c._id) ? 'bg-primary/10 border-primary text-primary shadow-lg shadow-primary/10' : 'bg-white border-gray-100 hover:border-gray-200'
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
                                                <span className="text-[10px] font-black uppercase leading-tight">{c.courseName}</span>
                                                <span className="text-[8px] font-bold opacity-50 mt-1 uppercase tracking-tighter">{c.courseCode}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="fixed bottom-0 left-0 right-0 p-8 pt-0 bg-gradient-to-t from-white via-white pointer-events-none">
                        <div className="max-w-[96vw] mx-auto pointer-events-auto">
                            <button type="submit" className="w-full bg-primary hover:bg-black text-white py-6 rounded-3xl font-black text-lg uppercase tracking-[0.2em] shadow-2xl transition-all flex items-center justify-center gap-4">
                                {isEdit ? 'OVERWRITE FACULTY DATA' : 'COMMIT STAFF ONBOARDING'}
                                <ChevronRight size={24} />
                            </button>
                        </div>
                    </div>
                </form>
            </Modal>

            {/* Profile View Modal */}
            <Modal isOpen={viewModalOpen} onClose={() => setViewModalOpen(false)} title="Faculty Comprehensive Dossier" size="full">
                {selectedStaff && (
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-12 p-4">
                        <div className="lg:col-span-1 space-y-6">
                            <div className="card text-center !p-10 !bg-primary !text-white relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full translate-x-12 -translate-y-12"></div>
                                <div className="w-40 h-40 rounded-[3.5rem] bg-white mx-auto overflow-hidden shadow-2xl mb-8 flex items-center justify-center border-4 border-white/20">
                                    {selectedStaff.staffImage ? (
                                        <img src={selectedStaff.staffImage} className="w-full h-full object-cover" />
                                    ) : <User size={48} className="text-primary" />}
                                </div>
                                <h2 className="text-2xl font-black uppercase tracking-tight leading-none mb-2">{selectedStaff.user?.name}</h2>
                                <p className="text-[10px] font-bold opacity-60 tracking-widest uppercase italic">{selectedStaff.designation}</p>
                                
                                <div className="mt-10 pt-8 border-t border-white/20 grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-[8px] font-black uppercase tracking-widest opacity-60">Staff ID</p>
                                        <p className="text-xs font-black">{selectedStaff.staffId}</p>
                                    </div>
                                    <div>
                                        <p className="text-[8px] font-black uppercase tracking-widest opacity-60">Exp.</p>
                                        <p className="text-xs font-black">{selectedStaff.experience}</p>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="card space-y-4">
                                <h4 className="text-[10px] font-black uppercase text-gray-400">Security Details</h4>
                                <div className="bg-gray-50 p-4 rounded-2xl">
                                    <p className="text-[8px] font-black text-gray-400 uppercase">Username</p>
                                    <p className="text-xs font-bold text-primary">{selectedStaff.user?.username}</p>
                                </div>
                            </div>
                        </div>

                        <div className="lg:col-span-3 space-y-12">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                                <div className="space-y-6">
                                    <h3 className="font-black text-sm uppercase tracking-widest border-b-2 border-gray-50 pb-2 flex items-center gap-2">
                                        <User size={16} className="text-primary"/> Personal & Contact
                                    </h3>
                                    <div className="grid grid-cols-2 gap-y-6 text-sm">
                                        <div className="col-span-2 italic text-gray-500 font-medium">"{selectedStaff.user?.name} is a verified academic asset in the {selectedStaff.department || 'General'} department."</div>
                                        <div><p className="text-[9px] font-black text-gray-400 uppercase">Phone</p><p className="font-bold">{selectedStaff.user?.phone}</p></div>
                                        <div><p className="text-[9px] font-black text-gray-400 uppercase">Work Email</p><p className="font-bold">{selectedStaff.user?.email}</p></div>
                                        <div className="col-span-2"><p className="text-[9px] font-black text-gray-400 uppercase">Residential Address</p><p className="font-bold text-xs">{selectedStaff.user?.address}</p></div>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <h3 className="font-black text-sm uppercase tracking-widest border-b-2 border-gray-50 pb-2 flex items-center gap-2">
                                        <Briefcase size={16} className="text-orange-500"/> Expertise Portfolio
                                    </h3>
                                    <div className="grid grid-cols-2 gap-y-6 text-sm">
                                        <div><p className="text-[9px] font-black text-gray-400 uppercase">Qualification</p><p className="font-black text-primary text-xs uppercase tracking-tight">{selectedStaff.qualification}</p></div>
                                        <div><p className="text-[9px] font-black text-gray-400 uppercase">Experience</p><p className="font-bold text-xs">{selectedStaff.experience}</p></div>
                                        <div className="col-span-2 space-y-3">
                                            <p className="text-[9px] font-black text-gray-400 uppercase mb-2">Subject Assignments</p>
                                            <div className="flex flex-wrap gap-2">
                                                {selectedStaff.subjectIds?.filter(Boolean).map(c => (
                                                    <div key={c._id} className="group relative">
                                                        <span className="px-3 py-1.5 bg-gray-50 border border-gray-100 rounded-xl font-black text-[9px] uppercase hover:bg-primary/5 transition-all flex flex-col">
                                                            <span>{c.courseName}</span>
                                                            <span className="text-[7px] opacity-40">{c.courseCode}</span>
                                                        </span>
                                                    </div>
                                                ))}
                                                {(!selectedStaff.subjectIds || selectedStaff.subjectIds.length === 0) && <p className="text-[10px] font-bold text-gray-300 italic">No courses currently assigned.</p>}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default Staff;
