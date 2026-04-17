import React, { useState, useEffect } from 'react';
import axios from '../../utils/axiosInstance';
import { useAuth } from '../../context/AuthContext';
import Table from '../../components/Table';
import { Trophy, Book, TrendingUp, Filter, GraduationCap, Award, CheckCircle2, AlertCircle } from 'lucide-react';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';

const StudentMarks = () => {
    const { user } = useAuth();
    const [marks, setMarks] = useState([]);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadAcademicData = async () => {
            setLoading(true);
            try {
                const [marksRes, profileRes] = await Promise.all([
                    axios.get(`/api/marks/student/${user?._id}`),
                    axios.get('/api/students/profile')
                ]);
                setMarks(marksRes.data);
                setProfile(profileRes.data);
            } catch (err) {
                toast.error('Failed to synchronize academic records.');
            } finally {
                setLoading(false);
            }
        };
        loadAcademicData();
    }, [user?._id]);

    // Helper to calculate average or latest grade for a subject
    const getSubjectPerformance = (courseId) => {
        const subjectMarks = marks.filter(m => m.courseId?._id === courseId);
        if (subjectMarks.length === 0) return { grade: 'N/A', count: 0 };
        
        // Return latest grade as performance indicator
        const latest = subjectMarks[0]; // Assuming sorted by date/createdAt descending
        return { 
            grade: latest.grade, 
            count: subjectMarks.length,
            percentage: (latest.obtainedMarks / latest.maxMarks) * 100
        };
    };

    const calculateGPA = () => {
        if (marks.length === 0) return '0.0';
        const gradePoints = { 'A+': 4.0, 'A': 4.0, 'B': 3.0, 'C': 2.0, 'D': 1.0, 'F': 0.0 };
        const totalPoints = marks.reduce((acc, m) => acc + (gradePoints[m.grade] || 0), 0);
        return (totalPoints / marks.length).toFixed(1);
    };

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black italic uppercase tracking-tighter">Academic Transcript</h1>
                    <p className="text-gray-500 text-sm font-medium italic opacity-80">Real-time performance tracking and grade segment analysis.</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="bg-black text-white px-8 py-5 rounded-[2.5rem] shadow-2xl flex flex-col items-center">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60">Global GPA</span>
                        <div className="flex items-baseline gap-1">
                            <span className="text-3xl font-black italic">{calculateGPA()}</span>
                            <span className="text-xs font-bold opacity-40">/ 4.0</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Performance Cards - Dynamic based on Course IDs */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {profile?.courseIds?.map((course) => {
                    const perf = getSubjectPerformance(course._id);
                    return (
                        <motion.div 
                            key={course._id}
                            whileHover={{ y: -5 }}
                            className="card !p-6 border-none bg-gradient-to-br from-white to-gray-50/50 shadow-xl shadow-primary/5 hover:shadow-primary/10 transition-all group"
                        >
                            <div className="flex justify-between items-start mb-6">
                                <div className="p-3 bg-primary/5 rounded-2xl text-primary group-hover:bg-primary group-hover:text-white transition-all">
                                    <Book size={20} />
                                </div>
                                <span className={`text-[10px] font-black px-2 py-1 rounded-lg uppercase tracking-widest ${
                                    perf.grade === 'A+' ? 'bg-green-100 text-green-600' : 
                                    perf.grade === 'N/A' ? 'bg-gray-100 text-gray-400' : 'bg-primary/10 text-primary'
                                }`}>
                                    {perf.grade}
                                </span>
                            </div>
                            <h4 className="font-black text-xs uppercase tracking-widest text-gray-400 mb-1">{course.courseCode}</h4>
                            <p className="font-black text-sm uppercase tracking-tight text-gray-800 line-clamp-1">{course.courseName}</p>
                            
                            <div className="mt-8 pt-4 border-t border-gray-100 flex justify-between items-center">
                                <span className="text-[9px] font-black text-gray-300 uppercase italic">{perf.count} Assessments</span>
                                {perf.percentage && (
                                    <div className="h-1.5 w-16 bg-gray-100 rounded-full overflow-hidden">
                                        <div className="h-full bg-primary" style={{ width: `${perf.percentage}%` }}></div>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    );
                })}
                {!loading && profile?.courseIds?.length === 0 && (
                  <div className="col-span-full card !p-12 text-center border-2 border-dashed border-gray-100">
                      <AlertCircle className="mx-auto text-gray-200 mb-4" size={48} />
                      <p className="text-gray-400 font-black uppercase italic tracking-widest">No Enrolled Courses Found</p>
                  </div>
                )}
            </div>

            {/* Detailed Ledger Section */}
            <div className="space-y-4">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-primary/10 rounded-2xl text-primary shadow-lg shadow-primary/20">
                        <Award size={24} />
                    </div>
                    <div>
                        <h3 className="text-xl font-black uppercase italic tracking-tighter">Detailed Assessment Ledger</h3>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Authenticated Examination Records</p>
                    </div>
                </div>

                <div className="card !p-0 overflow-hidden border-none shadow-2xl">
                    <Table headers={['Subject Mapping', 'Assessment Segment', 'Scoring Info', 'Grade Verification', 'Status']}>
                        {loading ? (
                            <tr><td colSpan="5" className="px-6 py-32 text-center">
                                <TrendingUp className="mx-auto text-primary/20 animate-bounce mb-4" size={64}/>
                                <p className="font-black text-gray-400 uppercase tracking-[0.3em] blink">Synchronizing Ledger...</p>
                            </td></tr>
                        ) : marks.length > 0 ? marks.map((m) => (
                            <tr key={m._id} className="hover:bg-primary/5 transition-all group border-b border-gray-50 last:border-none">
                                <td className="px-6 py-6">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-2xl bg-gray-50 flex items-center justify-center font-black text-xs text-primary group-hover:bg-primary group-hover:text-white transition-all shadow-sm">
                                            {m.courseId?.courseCode?.slice(0, 2)}
                                        </div>
                                        <div>
                                            <p className="font-black text-sm uppercase tracking-tight">{m.courseId?.courseName}</p>
                                            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{m.courseId?.courseCode}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-6">
                                    <span className="bg-gray-100 text-gray-600 px-4 py-1.5 rounded-xl font-black text-[9px] uppercase tracking-[0.2em] group-hover:bg-white transition-all">
                                        {m.examType}
                                    </span>
                                </td>
                                <td className="px-6 py-6">
                                    <div>
                                        <p className="font-black text-base italic tracking-tighter">
                                          {m.obtainedMarks} <span className="text-gray-300">/ {m.maxMarks}</span>
                                        </p>
                                        <div className="w-full h-1 bg-gray-100 rounded-full mt-2 overflow-hidden">
                                            <div 
                                                className="h-full bg-primary" 
                                                style={{ width: `${(m.obtainedMarks / m.maxMarks) * 100}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-6 text-center">
                                    <div className={`w-12 h-12 mx-auto flex items-center justify-center rounded-2xl font-black text-lg ${
                                        m.grade === 'A+' || m.grade === 'A' ? 'bg-green-100 text-green-600 rotate-3 group-hover:rotate-0 transition-transform shadow-lg shadow-green-500/10' : 
                                        m.grade === 'B' || m.grade === 'C' ? 'bg-blue-100 text-blue-600' : 'bg-red-100 text-red-600'
                                    }`}>
                                        {m.grade}
                                    </div>
                                </td>
                                <td className="px-6 py-6">
                                    <div className="flex flex-col items-end">
                                      <div className="flex items-center gap-1.5 text-green-500 mb-1">
                                          <CheckCircle2 size={14} />
                                          <span className="text-[10px] font-black uppercase tracking-widest">Verified</span>
                                      </div>
                                      <span className="text-[9px] font-bold text-gray-400 uppercase font-mono italic">
                                          {new Date(m.date).toLocaleDateString()}
                                      </span>
                                    </div>
                                </td>
                            </tr>
                        )) : (
                            <tr><td colSpan="5" className="px-6 py-32 text-center text-gray-300 font-black uppercase italic tracking-widest bg-gray-50/30">Academic record archive is currently empty.</td></tr>
                        )}
                    </Table>
                </div>
            </div>
        </div>
    );
};

export default StudentMarks;
