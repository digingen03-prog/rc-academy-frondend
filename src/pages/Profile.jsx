import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Phone, MapPin, Shield, Camera, Lock, Save } from 'lucide-react';
import { toast } from 'react-toastify';
import axios from '../utils/axiosInstance';

const Profile = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        // Placeholder for password change logic
        toast.info('Password change functionality coming soon!');
    };

    return (
        <div className="space-y-8 max-w-5xl mx-auto">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-black italic uppercase tracking-tighter">Account Profile</h1>
                    <p className="text-gray-500 text-sm">Manage your personal information and security settings.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left: Avatar & Basic Info */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="card text-center p-8 bg-white border-2 border-primary/5 relative">
                        <div className="relative inline-block mb-6">
                            <div className="w-32 h-32 rounded-3xl bg-gray-100 border-4 border-white shadow-xl overflow-hidden flex items-center justify-center text-primary mx-auto">
                                {user?.profilePhoto ? (
                                    <img src={user.profilePhoto} alt={user.name} className="w-full h-full object-cover" />
                                ) : (
                                    <User size={48} />
                                )}
                            </div>
                            <button className="absolute -bottom-2 -right-2 p-3 bg-primary text-white rounded-2xl shadow-lg hover:scale-110 transition-transform">
                                <Camera size={20} />
                            </button>
                        </div>
                        <h2 className="text-2xl font-black">{user?.name}</h2>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">{user?.role}</p>
                        
                        <div className="mt-8 pt-6 border-t border-border space-y-4">
                            <div className="flex items-center gap-3 text-sm font-medium text-gray-600 justify-center">
                                <Shield size={18} className="text-primary/50" />
                                <span>Employee ID: {user?._id.slice(-6).toUpperCase()}</span>
                            </div>
                        </div>
                    </div>

                    <div className="card p-6 bg-primary text-white overflow-hidden relative">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full translate-x-8 -translate-y-8"></div>
                        <h4 className="font-bold mb-2">Security Tip</h4>
                        <p className="text-sm opacity-80">Enable Two-Factor Authentication to add an extra layer of security to your account.</p>
                    </div>
                </div>

                {/* Right: Detailed Edit Forms */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Personal Information */}
                    <div className="card">
                        <div className="flex items-center justify-between mb-8 pb-4 border-b border-border">
                            <h3 className="font-black text-lg flex items-center gap-2">
                                <User size={20} className="text-primary" />
                                Personal Information
                            </h3>
                            <button className="text-xs font-bold text-primary hover:underline">Edit Info</button>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-1">
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Full Name</p>
                                <p className="font-bold text-sm flex items-center gap-2">
                                    <User size={14} className="text-gray-300" />
                                    {user?.name}
                                </p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Email Address</p>
                                <p className="font-bold text-sm flex items-center gap-2">
                                    <Mail size={14} className="text-gray-300" />
                                    {user?.email}
                                </p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Phone Number</p>
                                <p className="font-bold text-sm flex items-center gap-2">
                                    <Phone size={14} className="text-gray-300" />
                                    {user?.phone || '+1 234 567 890'}
                                </p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Home Address</p>
                                <p className="font-bold text-sm flex items-center gap-2">
                                    <MapPin size={14} className="text-gray-300" />
                                    {user?.address || 'Not specified'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Change Password */}
                    <div className="card bg-gray-50/50">
                        <div className="flex items-center justify-between mb-8 pb-4 border-b border-border">
                            <h3 className="font-black text-lg flex items-center gap-2">
                                <Lock size={20} className="text-orange-500" />
                                Security Settings
                            </h3>
                        </div>
                        
                        <form onSubmit={handlePasswordChange} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-[10px] font-bold uppercase text-gray-500 mb-2 tracking-widest">New Password</label>
                                    <input 
                                        type="password" 
                                        className="w-full px-4 py-3 bg-white border border-border rounded-xl focus:ring-2 focus:ring-primary/20 outline-none"
                                        placeholder="••••••••"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold uppercase text-gray-500 mb-2 tracking-widest">Confirm Password</label>
                                    <input 
                                        type="password" 
                                        className="w-full px-4 py-3 bg-white border border-border rounded-xl focus:ring-2 focus:ring-primary/20 outline-none"
                                        placeholder="••••••••"
                                    />
                                </div>
                            </div>
                            <button type="submit" className="flex items-center gap-2 px-6 py-3 bg-text text-white rounded-xl font-bold text-sm hover:opacity-90 transition-all">
                                <Save size={18} />
                                Update Security Details
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
