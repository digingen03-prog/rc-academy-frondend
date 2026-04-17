import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import BottomNav from './BottomNav';
import { motion, AnimatePresence } from 'framer-motion';

const Layout = () => {
    const location = useLocation();

    return (
        <div className="flex h-screen bg-bg overflow-hidden font-sans select-none">
            <Sidebar />
            <div className="flex-1 flex flex-col h-full overflow-hidden relative">
                <Navbar />
                
                <main className="flex-1 overflow-y-auto p-4 md:p-8 pb-24 md:pb-8 bg-bg/50 custom-scrollbar">
                    <div className="max-w-7xl mx-auto">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={location.pathname}
                                initial={{ opacity: 0, y: 12, scale: 0.98 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: -12, scale: 0.98 }}
                                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                            >
                                <Outlet />
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </main>

                <BottomNav />
            </div>
        </div>
    );
};

export default Layout;
