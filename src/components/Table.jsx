import React from 'react';

const Table = ({ headers, children }) => {
    return (
        <div className="relative overflow-hidden card !p-0">
            <div className="overflow-x-auto custom-scrollbar">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50/80 border-b border-border">
                            {headers.map((header, index) => (
                                <th key={index} className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                                    {header}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border/50 bg-white">
                        {children}
                    </tbody>
                </table>
            </div>
            {/* Horizontal Scroll Shadow Indicator */}
            <div className="md:hidden absolute top-0 bottom-0 right-0 w-8 bg-gradient-to-l from-white/20 to-transparent pointer-events-none"></div>
        </div>
    );
};

export default Table;
