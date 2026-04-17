import React from 'react';
import { NavLink } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { menuItems } from '../utils/menuConfig';

const Sidebar = () => {
    const { user, logout } = useAuth();
    const items = menuItems[user?.role] || [];

    return (
        <aside className="hidden md:flex w-72 h-screen bg-card border-r border-border flex-col sticky top-0 overflow-hidden">
            <div className="p-8 flex items-center gap-3">
                <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center text-white font-bold text-2xl shadow-lg shadow-primary/20">
                    RC
                </div>
                <div>
                    <h1 className="text-xl font-bold tracking-tighter italic uppercase">RC Academy</h1>
                    <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest leading-none">Management v1.0</p>
                </div>
            </div>

            <nav className="flex-1 px-6 py-4 space-y-1 overflow-y-auto custom-scrollbar">
                <p className="text-[10px] font-semibold uppercase text-gray-400 tracking-[0.2em] mb-4 ml-2">Main Navigation</p>
                {items.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) => `
                            flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-300 group
                            ${isActive 
                                ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                                : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'}
                        `}
                    >
                        {({ isActive }) => (
                            <>
                                <item.icon size={20} className={isActive ? 'animate-pulse' : 'group-hover:scale-110 transition-transform'} />
                                <span className="font-bold text-sm tracking-tight">{item.name}</span>
                            </>
                        )}
                    </NavLink>
                ))}
            </nav>

            <div className="p-6">
                <div className="bg-bg rounded-3xl p-4 border border-border">
                    <button 
                        onClick={logout}
                        className="flex items-center gap-3 px-4 py-3 w-full rounded-2xl text-red-600 hover:bg-red-50 transition-all font-bold text-sm"
                    >
                        <LogOut size={18} />
                        <span>Logout System</span>
                    </button>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
