import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Menu, X, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { menuItems } from '../utils/menuConfig';
import { motion, AnimatePresence } from 'framer-motion';

const BottomNav = () => {
    const { user, logout } = useAuth();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const fullItems = menuItems[user?.role] || [];
    
    // Show first 4 items, then a "Menu" item
    const primaryItems = fullItems.length > 5 ? fullItems.slice(0, 4) : fullItems;
    const extraItems = fullItems.length > 5 ? fullItems.slice(4) : [];

    const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

    return (
        <>
            <nav className="native-bottom-nav md:hidden">
                {primaryItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) => `
                            flex flex-col items-center justify-center gap-1 transition-all duration-300
                            ${isActive ? 'text-primary scale-110' : 'text-gray-400'}
                        `}
                    >
                        {({ isActive }) => (
                            <>
                                <item.icon size={24} strokeWidth={isActive ? 2.5 : 2} />
                                <span className="text-[10px] font-bold uppercase tracking-wider">{item.name}</span>
                            </>
                        )}
                    </NavLink>
                ))}

                {fullItems.length > 5 && (
                    <button
                        onClick={toggleMenu}
                        className={`flex flex-col items-center justify-center gap-1 transition-all duration-300 ${isMenuOpen ? 'text-primary' : 'text-gray-400'}`}
                    >
                        {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                        <span className="text-[10px] font-bold uppercase tracking-wider">More</span>
                    </button>
                )}
            </nav>

            {/* Mobile Menu Overlay */}
            <AnimatePresence>
                {isMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 100 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 100 }}
                        className="fixed inset-0 z-40 md:hidden bg-bg/95 backdrop-blur-xl p-6 pb-24 flex flex-col"
                    >
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-xl font-black uppercase italic tracking-tighter">More Options</h2>
                            <button onClick={toggleMenu} className="p-2 bg-gray-100 rounded-full">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="grid grid-cols-2 gap-4 flex-1 overflow-y-auto">
                            {extraItems.map((item) => (
                                <NavLink
                                    key={item.path}
                                    to={item.path}
                                    onClick={() => setIsMenuOpen(false)}
                                    className={({ isActive }) => `
                                        card !p-4 flex flex-col items-start gap-3 transition-all
                                        ${isActive ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20' : 'bg-white'}
                                    `}
                                >
                                    {({ isActive }) => (
                                        <>
                                            <div className={`p-2 rounded-xl shrink-0 ${isActive ? 'bg-white/20' : 'bg-primary/10 text-primary'}`}>
                                                <item.icon size={20} />
                                            </div>
                                            <span className="font-bold text-sm tracking-tight">{item.name}</span>
                                        </>
                                    )}
                                </NavLink>
                            ))}
                        </div>

                        <button 
                            onClick={logout}
                            className="w-full mt-6 py-4 bg-red-50 text-red-600 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-red-100 transition-all"
                        >
                            <LogOut size={20} />
                            <span>Logout Session</span>
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default BottomNav;
