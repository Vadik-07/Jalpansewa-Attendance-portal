import React, { useState, useRef } from 'react';
import { Share2, Download, FileText, Calendar, ArrowRight } from 'lucide-react';
import { AttendanceRecord } from '../types';
import { format } from 'date-fns';
import { generatePDF, shareReport } from '../utils/reportUtils';

interface HistoryProps {
  allRecords: AttendanceRecord[];
}

export const History: React.FC<HistoryProps> = ({ allRecords }) => {
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const dateInputRef = useRef<HTMLInputElement>(null);

  const filteredRecords = allRecords.filter(r => r.date === selectedDate);
  const displayDate = selectedDate ? format(new Date(`${selectedDate}T00:00:00`), 'd MMMM yyyy') : 'Select Date';

  const handleContainerClick = () => {
    const input = dateInputRef.current;
    if (input) {
      if ('showPicker' in input) {
        (input as any).showPicker();
      } else {
        (input as HTMLInputElement).focus();
      }
    }
  };

  return (
    <div className="p-5 max-w-lg mx-auto w-full animate-in fade-in duration-500">
       <div className="flex justify-between items-center mb-6">
         <h2 className="text-2xl font-bold text-gray-900 tracking-tight">History</h2>
         <div className="bg-white p-2 rounded-xl border border-gray-100 shadow-sm text-gray-400">
            <Calendar size={20} />
         </div>
       </div>

       {/* Control Card */}
       <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-xl shadow-gray-200/50 mb-8 overflow-hidden relative">
         <div className="absolute top-0 right-0 w-32 h-32 bg-brand-50 rounded-full -mr-16 -mt-16 opacity-50"></div>
         
         <div className="flex items-center gap-3 mb-4 text-brand-600 relative z-10">
           <div className="p-2 bg-brand-100 rounded-lg"><FileText size={20} /></div>
           <h3 className="font-bold text-gray-900 text-lg">Duty Report Access</h3>
         </div>
         <p className="text-gray-500 text-sm mb-6 leading-relaxed relative z-10">
           Select any past date to review attendance logs, download PDF reports, or share summaries with the team.
         </p>
         
         {/* Date Picker */}
         <div className="relative mb-6 cursor-pointer group" onClick={handleContainerClick}>
           <input 
            ref={dateInputRef}
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-full p-4 pl-5 pr-12 bg-gray-50 border border-gray-200 rounded-2xl text-gray-900 font-bold focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all hover:bg-white hover:border-brand-200 cursor-pointer"
           />
           <div className="absolute right-4 top-1/2 -translate-y-1/2 text-brand-600 bg-white p-2 rounded-xl shadow-sm border border-gray-100 pointer-events-none">
             <Calendar size={18} />
           </div>
         </div>

         {/* Actions */}
         <div className="grid grid-cols-2 gap-4 relative z-10">
           <button 
            onClick={() => shareReport(selectedDate, filteredRecords)}
            className="flex flex-col items-center justify-center gap-2 bg-white border border-gray-200 text-gray-700 py-4 rounded-2xl hover:bg-gray-50 active:scale-95 transition-all font-bold text-sm shadow-sm"
           >
             <Share2 size={20} className="text-brand-500" />
             Share Report
           </button>
           <button 
            onClick={() => generatePDF(selectedDate, filteredRecords)}
            className="flex flex-col items-center justify-center gap-2 bg-brand-600 text-white py-4 rounded-2xl hover:bg-brand-700 active:scale-95 transition-all font-bold text-sm shadow-lg shadow-brand-100"
           >
             <Download size={20} />
             Download PDF
           </button>
         </div>
       </div>

       {/* Report Preview */}
       <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden mb-10">
         <div className="bg-brand-600 p-7 text-center text-white relative overflow-hidden">
           <div className="absolute top-0 right-0 p-4 opacity-10 transform translate-x-4 -translate-y-4">
             <FileText size={120} />
           </div>
           <h3 className="font-bold tracking-widest uppercase mb-1.5 text-xs opacity-70">Jalpan Sewa Record</h3>
           <p className="text-2xl font-black">{displayDate}</p>
         </div>
         
         <div className="p-0">
           {filteredRecords.length === 0 ? (
             <div className="text-center py-12 flex flex-col items-center justify-center text-gray-400">
               <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4 border border-gray-100 border-dashed">
                 <Calendar size={32} className="opacity-20" />
               </div>
               <p className="text-sm font-medium px-4">No sewa records found for this date.</p>
             </div>
           ) : (
            <div className="relative">
              {/* Desktop/Wide Tablet Tip */}
              <div className="flex justify-end px-4 py-2 bg-gray-50/50 border-b border-gray-100 sm:hidden">
                <span className="text-[10px] text-gray-400 flex items-center gap-1 font-bold">
                  SWIPE TO SEE FULL REPORT <ArrowRight size={10} />
                </span>
              </div>
              
              <div className="overflow-x-auto overflow-y-hidden no-scrollbar cursor-grab active:cursor-grabbing">
                <table className="w-full text-sm text-left border-collapse min-w-[500px]">
                  <thead>
                    <tr className="text-xs text-gray-400 font-extrabold uppercase tracking-widest border-b border-gray-100 bg-gray-50/30">
                      <th className="py-4 pl-6">Sewadar Name</th>
                      <th className="py-4">Sewa Spot</th>
                      <th className="py-4">Time In</th>
                      <th className="py-4 pr-6 text-right">Time Out</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {filteredRecords.map((r) => (
                      <tr key={r.id} className="group hover:bg-brand-50/30 transition-colors">
                        <td className="py-5 pl-6 font-bold text-gray-900 whitespace-nowrap">{r.sewadarName}</td>
                        <td className="py-5 text-gray-600 font-medium whitespace-nowrap pr-4">{r.counter}</td>
                        <td className="py-5 text-brand-600 font-black whitespace-nowrap">{r.startTime}</td>
                        <td className="py-5 pr-6 text-right whitespace-nowrap">
                          {r.endTime ? (
                            <span className="text-gray-900 font-bold">{r.endTime}</span>
                          ) : (
                            <span className="text-green-600 font-black text-[10px] bg-green-100 px-2 py-1 rounded-full border border-green-200">ACTIVE</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
           )}
         </div>
       </div>
    </div>
  );
};