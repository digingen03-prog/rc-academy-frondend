import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Bell, Search, User } from 'lucide-react';

const Navbar = () => {
    const { user } = useAuth();

    return (
        <header className="h-20 glass px-4 md:px-8 flex items-center justify-between sticky top-0 z-30">
            {/* Mobile Branding */}
            <div className="flex md:hidden items-center gap-2">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-primary/20">
                    RC
                </div>
                <h1 className="text-lg font-bold tracking-tighter italic uppercase">RC Academy</h1>
            </div>

            {/* Search - Hidden on Small Mobile */}
            <div className="hidden sm:flex items-center gap-4 bg-gray-100/50 px-4 py-2.5 rounded-2xl w-64 lg:w-96 border border-transparent focus-within:border-primary/20 focus-within:bg-white transition-all">
                <Search size={18} className="text-gray-400" />
                <input 
                    type="text" 
                    placeholder="Search anything..." 
                    className="bg-transparent border-none outline-none text-sm w-full font-medium"
                />
            </div>

            <div className="flex items-center gap-3 md:gap-6">
                <button className="relative p-2 text-gray-500 hover:text-primary hover:bg-primary/5 rounded-xl transition-all">
                    <Bell size={20} />
                    <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 border-2 border-white rounded-full"></span>
                </button>

                <div className="flex items-center gap-3 pl-3 md:pl-4 border-l border-border">
                    <div className="hidden md:block text-right">
                        <p className="text-xs font-semibold uppercase tracking-tight">{user?.name}</p>
                        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">{user?.role}</p>
                    </div>
                    <div className="w-10 h-10 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary overflow-hidden shadow-sm">
                        {user?.profilePhoto ? (
                            <img src={user.profilePhoto} alt={user.name} className="w-full h-full object-cover" />
                        ) : (
                            <User size={20} />
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Navbar;
