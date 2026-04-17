import React, { useState, useEffect } from 'react';
import axios from '../../utils/axiosInstance';
import { useAuth } from '../../context/AuthContext';
import Table from '../../components/Table';
import Modal from '../../components/Modal';
import { Plus, GraduationCap, BookOpen, Search } from 'lucide-react';
import { toast } from 'react-toastify';

const MarksEntry = () => {
    const { user } = useAuth();
    const [subjects, setSubjects] = useState([]);
    const [students, setStudents] = useState([]);
    const [marks, setMarks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const [selectedCourse, setSelectedCourse] = useState('');
    const [formData, setFormData] = useState({
        studentId: '', courseId: '', examType: 'unit',
        maxMarks: 100, obtainedMarks: 0, remarks: ''
    });

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        if (selectedCourse) {
            fetchMarks(selectedCourse);
        }
    }, [selectedCourse]);

    const fetchData = async () => {
        try {
            const [subjectRes, studentRes] = await Promise.all([
                axios.get('/api/staff/subjects'),
                axios.get('/api/students')
            ]);
            
            setSubjects(subjectRes.data);
            setStudents(studentRes.data);
            
            if (subjectRes.data.length > 0) {
                setSelectedCourse(subjectRes.data[0]._id);
            }
        } catch (err) {
            toast.error('Failed to fetch data');
        } finally {
            setLoading(false);
        }
    };

    const fetchMarks = async (courseId) => {
        setLoading(true);
        try {
            const { data } = await axios.get(`/api/marks/course/${courseId}`);
            setMarks(data);
        } catch (err) {
            console.error('Failed to fetch marks');
        } finally {
            setLoading(false);
        }
    };

    const handleAddMark = async (e) => {
        e.preventDefault();
        try {
            await axios.post('/api/marks', { ...formData, courseId: selectedCourse });
            toast.success('Marks recorded successfully!');
            setIsModalOpen(false);
            fetchMarks(selectedCourse);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to record marks');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Examination Marks</h1>
                    <p className="text-gray-500 text-sm">Enter and manage student grades for your subjects.</p>
                </div>
                <button 
                    onClick={() => setIsModalOpen(true)}
                    className="btn-primary flex items-center gap-2"
                >
                    <Plus size={18} />
                    <span>Enter New Marks</span>
                </button>
            </div>

            <div className="card !p-4 flex items-center gap-4">
                <BookOpen size={20} className="text-primary" />
                <select 
                    value={selectedCourse}
                    onChange={(e) => setSelectedCourse(e.target.value)}
                    className="bg-transparent font-bold outline-none cursor-pointer"
                >
                    {subjects.map(s => <option key={s._id} value={s._id}>{s.courseName}</option>)}
                </select>
                <div className="flex-1"></div>
                <p className="text-xs font-bold text-gray-400 uppercase">Recent Assessments</p>
            </div>

            <div className="card !p-0 overflow-hidden">
                <Table headers={['Student Information', 'Assessment Type', 'Score', 'Grade', 'Date']}>
                    {marks.length > 0 ? (
                        marks.map((m) => (
                            <tr key={m._id} className="hover:bg-primary/5 transition-all group">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-black text-xs uppercase">
                                            {m.studentId?.name?.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="font-black text-sm uppercase tracking-tight">{m.studentId?.name}</p>
                                            <p className="text-[10px] text-gray-400 font-bold">{m.studentId?.email}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-lg font-black text-[9px] uppercase tracking-widest">
                                        {m.examType}
                                    </span>
                                </td>
                                <td className="px-6 py-4 font-black text-sm uppercase italic">
                                    {m.obtainedMarks} <span className="text-gray-300">/ {m.maxMarks}</span>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`w-8 h-8 flex items-center justify-center rounded-lg font-black text-sm ${
                                        m.grade === 'A+' || m.grade === 'A' ? 'bg-green-100 text-green-600' :
                                        m.grade === 'B' || m.grade === 'C' ? 'bg-blue-100 text-blue-600' :
                                        'bg-red-100 text-red-600'
                                    }`}>
                                        {m.grade}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-[10px] font-bold text-gray-400">
                                    {new Date(m.date).toLocaleDateString()}
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="5" className="px-6 py-12 text-center text-gray-400 italic">
                                {loading ? 'Synchronizing grade records...' : 'No marks recorded for this assessment segment.'}
                            </td>
                        </tr>
                    )}
                </Table>
            </div>

            {/* Entry Modal */}
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Record Assessment Marks">
                <form onSubmit={handleAddMark} className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Select Student</label>
                        <select required value={formData.studentId} onChange={(e) => setFormData({...formData, studentId: e.target.value})} className="w-full px-4 py-3 border border-border rounded-xl font-bold text-sm">
                            <option value="">Choose student from class list...</option>
                            {students.filter(s => s.courseIds?.some(c => c._id === selectedCourse)).map(s => (
                                <option key={s.user?._id} value={s.user?._id}>{s.user?.name} ({s.registerNumber})</option>
                            ))}
                        </select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Exam Type</label>
                            <select value={formData.examType} onChange={(e) => setFormData({...formData, examType: e.target.value})} className="w-full px-4 py-3 border border-border rounded-xl">
                                <option value="unit">Unit Test</option>
                                <option value="midterm">Mid Term</option>
                                <option value="final">Final Exam</option>
                                <option value="assignment">Assignment</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Max Marks</label>
                            <input type="number" value={formData.maxMarks} onChange={(e) => setFormData({...formData, maxMarks: e.target.value})} className="w-full px-4 py-3 border border-border rounded-xl" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Obtained Marks</label>
                        <input type="number" required value={formData.obtainedMarks} onChange={(e) => setFormData({...formData, obtainedMarks: e.target.value})} className="w-full px-4 py-3 border border-border rounded-xl" />
                    </div>
                    <button type="submit" className="w-full btn-primary py-4 mt-4 font-black">Submit Marks</button>
                </form>
            </Modal>
        </div>
    );
};

export default MarksEntry;
