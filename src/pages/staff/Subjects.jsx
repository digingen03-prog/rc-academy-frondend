import React, { useState, useEffect } from 'react';
import axios from '../../utils/axiosInstance';
import { useAuth } from '../../context/AuthContext';
import { Book, Users, Clock, ArrowRight } from 'lucide-react';

const MySubjects = () => {
    const { user } = useAuth();
    const [subjects, setSubjects] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchSubjects();
    }, []);

    const fetchSubjects = async () => {
        try {
            const { data } = await axios.get('/api/staff/subjects');
            setSubjects(data);
        } catch (err) {
            console.error('Failed to fetch subjects');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold">My Assigned Subjects</h1>
                <p className="text-gray-500 text-sm">View and manage the courses assigned to you.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                    <div className="col-span-full py-12 text-center text-gray-500 font-bold">Loading subjects...</div>
                ) : subjects.length > 0 ? subjects.map((s) => (
                    <div key={s._id} className="card hover:shadow-lg transition-all border-l-4 border-l-primary">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                                <Book size={24} />
                            </div>
                            <div>
                                <h3 className="font-bold text-lg">{s.courseName}</h3>
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{s.courseCode}</p>
                            </div>
                        </div>
                        <div className="space-y-3 mb-6">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-500">Duration:</span>
                                <span className="font-bold">{s.duration}</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-500">Scheduled Days:</span>
                                <span className="font-bold text-primary">Mon, Wed, Fri</span>
                            </div>
                        </div>
                        <button className="w-full py-3 bg-gray-50 rounded-xl text-sm font-bold flex items-center justify-center gap-2 hover:bg-primary hover:text-white transition-all">
                            <span>Manage Content</span>
                            <ArrowRight size={16} />
                        </button>
                    </div>
                )) : (
                    <div className="col-span-full card p-12 text-center text-gray-400 italic">No subjects assigned yet.</div>
                )}
            </div>
        </div>
    );
};

export default MySubjects;
