import React, { useState, useEffect } from 'react';
import axios from '../../utils/axiosInstance';
import { useAuth } from '../../context/AuthContext';
import Table from '../../components/Table';
import Modal from '../../components/Modal';
import { Plus, Calendar, Clock, MapPin, BookOpen, User } from 'lucide-react';
import { toast } from 'react-toastify';

const Schedule = () => {
    const { user } = useAuth();
    const [schedules, setSchedules] = useState([]);
    const [courses, setCourses] = useState([]);
    const [staff, setStaff] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const [formData, setFormData] = useState({
        courseId: '', staffId: '', classDate: '',
        startTime: '', endTime: '', topic: '', room: ''
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [schedRes, courseRes, staffRes] = await Promise.all([
                axios.get('/api/schedule'),
                user?.role === 'staff' ? axios.get('/api/staff/subjects') : axios.get('/api/courses'),
                axios.get('/api/staff')
            ]);
            
            let filteredSchedules = schedRes.data;
            if (user?.role === 'staff') {
                filteredSchedules = schedRes.data.filter(s => s.staffId?._id === user?._id);
            }

            setSchedules(filteredSchedules);
            setCourses(courseRes.data);
            setStaff(staffRes.data);
        } catch (err) {
            toast.error('Failed to fetch schedule data');
        } finally {
            setLoading(false);
        }
    };

    const handleAddSchedule = async (e) => {
        e.preventDefault();
        try {
            await axios.post('/api/schedule', formData);
            toast.success('Class scheduled successfully!');
            setIsModalOpen(false);
            fetchData();
            setFormData({ courseId: '', staffId: '', classDate: '', startTime: '', endTime: '', topic: '', room: '' });
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to schedule class');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold">Class Schedule</h1>
                    <p className="text-gray-500 text-sm">Organize and manage school timetables seamlessly.</p>
                </div>
                {(user?.role === 'superadmin' || user?.role === 'admin' || user?.role === 'staff') && (
                    <button 
                        onClick={() => setIsModalOpen(true)}
                        className="btn-primary flex items-center gap-2"
                    >
                        <Plus size={18} />
                        <span>Schedule New Class</span>
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                    <div className="col-span-full py-12 text-center text-gray-400 italic font-black uppercase tracking-widest animate-pulse">Synchronizing timetables...</div>
                ) : schedules.length > 0 ? schedules.map((item) => (
                    <div key={item._id} className="card border-l-4 border-l-primary hover:shadow-lg transition-all">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="font-black text-lg text-primary">{item.courseId?.courseName}</h3>
                                <p className="text-xs font-bold text-gray-400 uppercase">{item.courseId?.courseCode}</p>
                            </div>
                            <div className="bg-orange-50 text-primary px-3 py-1 rounded-full text-xs font-bold">
                                {new Date(item.classDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div className="flex items-center gap-3 text-sm font-medium">
                                <Clock size={16} className="text-gray-400" />
                                <span>{item.startTime} - {item.endTime}</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm font-medium">
                                <User size={16} className="text-gray-400" />
                                <span>Instructor: {item.staffId?.name}</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm font-medium">
                                <MapPin size={16} className="text-gray-400" />
                                <span>Room: {item.room || 'N/A'}</span>
                            </div>
                        </div>

                        <div className="mt-4 pt-4 border-t border-border">
                            <p className="text-xs font-bold text-gray-400 uppercase mb-1">Topic</p>
                            <p className="text-sm font-medium italic">"{item.topic || 'General Lecture'}"</p>
                        </div>
                    </div>
                )) : (
                    <div className="col-span-full py-24 text-center">
                        <Calendar className="mx-auto text-gray-200 mb-4" size={64}/>
                        <p className="text-gray-400 font-black uppercase italic tracking-tighter">No classes scheduled in this period.</p>
                        <p className="text-[10px] font-bold text-gray-300 mt-2 lowercase">Click the button above to register a new class slot.</p>
                    </div>
                )}
            </div>

            {/* Add Schedule Modal */}
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Schedule New Class">
                <form onSubmit={handleAddSchedule} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="col-span-full">
                        <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Select Course</label>
                        <select required value={formData.courseId} onChange={(e) => setFormData({...formData, courseId: e.target.value})} className="w-full px-4 py-2 border border-border rounded-xl outline-none focus:border-primary">
                            <option value="">Select Course</option>
                            {courses.map(c => <option key={c._id} value={c._id}>{c.courseName} ({c.courseCode})</option>)}
                        </select>
                    </div>
                    {user?.role !== 'staff' && (
                        <div className="col-span-full">
                            <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Select Instructor</label>
                            <select required={user?.role !== 'staff'} value={formData.staffId} onChange={(e) => setFormData({...formData, staffId: e.target.value})} className="w-full px-4 py-2 border border-border rounded-xl outline-none focus:border-primary">
                                <option value="">Select Staff</option>
                                {staff.map(s => <option key={s.user?._id} value={s.user?._id}>{s.user?.name}</option>)}
                            </select>
                        </div>
                    )}
                    <div>
                        <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Date</label>
                        <input type="date" required value={formData.classDate} onChange={(e) => setFormData({...formData, classDate: e.target.value})} className="w-full px-4 py-2 border border-border rounded-xl outline-none focus:border-primary" />
                    </div>
                    <div>
                        <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Room</label>
                        <input type="text" value={formData.room} onChange={(e) => setFormData({...formData, room: e.target.value})} className="w-full px-4 py-2 border border-border rounded-xl outline-none focus:border-primary" placeholder="e.g. Room 101" />
                    </div>
                    <div>
                        <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Start Time</label>
                        <input type="time" required value={formData.startTime} onChange={(e) => setFormData({...formData, startTime: e.target.value})} className="w-full px-4 py-2 border border-border rounded-xl outline-none focus:border-primary" />
                    </div>
                    <div>
                        <label className="block text-xs font-bold uppercase text-gray-500 mb-1">End Time</label>
                        <input type="time" required value={formData.endTime} onChange={(e) => setFormData({...formData, endTime: e.target.value})} className="w-full px-4 py-2 border border-border rounded-xl outline-none focus:border-primary" />
                    </div>
                    <div className="col-span-full">
                        <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Topic</label>
                        <input type="text" value={formData.topic} onChange={(e) => setFormData({...formData, topic: e.target.value})} className="w-full px-4 py-2 border border-border rounded-xl outline-none focus:border-primary" placeholder="e.g. Introduction to Calculus" />
                    </div>

                    <div className="col-span-full pt-4">
                        <button type="submit" className="w-full btn-primary py-3">Register Class Slot</button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default Schedule;
