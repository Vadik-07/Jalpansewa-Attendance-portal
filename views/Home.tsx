import React, { useState, useRef, useEffect } from 'react';
import { Plus, X, Clock, MapPin, Search, Calendar, ChevronDown, LogOut } from 'lucide-react';
import { AttendanceRecord, Sewadar } from '../types';
import { format } from 'date-fns';

interface HomeProps {
  todayRecords: AttendanceRecord[];
  allSewadars: Sewadar[];
  onAddEntry: (sewadarId: string, counter: string, startTime: string, endTime?: string) => void;
  onMarkOut: (recordId: string, endTime: string) => void;
  currentDate: string;
  setCurrentDate: (date: string) => void;
}

const COUNTERS = [
  "Roti, Dal / Subzi",
  "Special Counter",
  "Dessert",
  "Chole Bhature",
  "Kadi / Rajma Chawal",
  "Bread Pakoda",
  "Tea",
  "Coffee / Cold Drink",
  "Chips Counter",
  "Sweets Counter",
  "Main office - Coupon Counters",
  "Main Office - Card Counter",
  "Main Office - Admin"
];

// Helper to convert 12h time to 24h
const convertTo24Hour = (hour: string, minute: string, period: string) => {
  let h = parseInt(hour, 10);
  if (isNaN(h)) h = 0;
  if (period === 'PM' && h < 12) h += 12;
  if (period === 'AM' && h === 12) h = 0;
  return `${h.toString().padStart(2, '0')}:${minute.padStart(2, '0')}`;
};

// Custom Time Picker Component with Upward Vertical Scroll Lists
const TimePicker = ({ 
  label, 
  value, 
  onChange 
}: { 
  label: string; 
  value: { hour: string, minute: string, period: string };
  onChange: (val: { hour: string, minute: string, period: string }) => void;
}) => {
  const [activeField, setActiveField] = useState<'hour' | 'minute' | 'period' | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const hourListRef = useRef<HTMLDivElement>(null);
  const minuteListRef = useRef<HTMLDivElement>(null);

  // Close popup when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setActiveField(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Scroll to selected value when popup opens
  useEffect(() => {
    if (activeField === 'hour' && hourListRef.current) {
        const selectedEl = hourListRef.current.querySelector(`[data-value="${value.hour}"]`);
        if (selectedEl) selectedEl.scrollIntoView({ block: 'center' });
    }
    if (activeField === 'minute' && minuteListRef.current) {
        const selectedEl = minuteListRef.current.querySelector(`[data-value="${value.minute}"]`);
        if (selectedEl) selectedEl.scrollIntoView({ block: 'center' });
    }
  }, [activeField, value.hour, value.minute]);

  const handleBlur = (field: 'hour' | 'minute') => {
    let val = parseInt(value[field], 10);
    if (isNaN(val)) return; 
    
    if (field === 'hour') {
      if (val < 1) val = 1;
      if (val > 12) val = 12;
    } else {
      if (val < 0) val = 0;
      if (val > 59) val = 59;
    }
    
    onChange({
      ...value,
      [field]: val.toString().padStart(2, '0')
    });
  };

  const hours = Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, '0'));
  const minutes = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0'));

  return (
    <div className="mb-5 relative" ref={containerRef}>
      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">{label}</label>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            inputMode="numeric"
            value={value.hour}
            onClick={() => setActiveField('hour')}
            onChange={(e) => {
              const val = e.target.value.replace(/\D/g, '').slice(0, 2);
              onChange({ ...value, hour: val });
            }}
            onBlur={() => handleBlur('hour')}
            className={`w-full p-3 bg-white border rounded-xl outline-none font-bold text-xl text-center transition-all ${
              activeField === 'hour' ? 'border-brand-500 ring-2 ring-brand-100 shadow-lg' : 'border-gray-200 text-gray-900'
            }`}
            placeholder="HH"
            readOnly
          />
          {activeField === 'hour' && (
            <div className="absolute bottom-full mb-2 left-0 w-full bg-white rounded-xl shadow-2xl border border-gray-100 z-50 overflow-hidden animate-in slide-in-from-bottom-2 fade-in duration-200">
               <div ref={hourListRef} className="max-h-48 overflow-y-auto no-scrollbar scroll-smooth bg-white">
                 {hours.map(h => (
                   <button
                    key={h}
                    data-value={h}
                    onClick={(e) => {
                      e.stopPropagation();
                      onChange({ ...value, hour: h });
                      setActiveField(null);
                    }}
                    className={`w-full p-3 text-sm font-bold transition-colors border-b border-gray-50 last:border-0 ${
                      value.hour === h ? 'bg-brand-600 text-white' : 'hover:bg-gray-50 text-gray-900'
                    }`}
                   >
                     {h}
                   </button>
                 ))}
               </div>
            </div>
          )}
        </div>

        <div className="self-center font-bold text-gray-300 text-xl pb-3">:</div>

        <div className="relative flex-1">
          <input
            type="text"
            inputMode="numeric"
            value={value.minute}
            onClick={() => setActiveField('minute')}
            onChange={(e) => {
              const val = e.target.value.replace(/\D/g, '').slice(0, 2);
              onChange({ ...value, minute: val });
            }}
            onBlur={() => handleBlur('minute')}
            className={`w-full p-3 bg-white border rounded-xl outline-none font-bold text-xl text-center transition-all ${
              activeField === 'minute' ? 'border-brand-500 ring-2 ring-brand-100 shadow-lg' : 'border-gray-200 text-gray-900'
            }`}
            placeholder="MM"
            readOnly
          />
          {activeField === 'minute' && (
            <div className="absolute bottom-full mb-2 left-0 w-full bg-white rounded-xl shadow-2xl border border-gray-100 z-50 overflow-hidden animate-in slide-in-from-bottom-2 fade-in duration-200">
               <div ref={minuteListRef} className="max-h-48 overflow-y-auto no-scrollbar scroll-smooth bg-white">
                 {minutes.map(m => (
                   <button
                    key={m}
                    data-value={m}
                    onClick={(e) => {
                      e.stopPropagation();
                      onChange({ ...value, minute: m });
                      setActiveField(null);
                    }}
                    className={`w-full p-3 text-sm font-bold transition-colors border-b border-gray-50 last:border-0 ${
                      value.minute === m ? 'bg-brand-600 text-white' : 'hover:bg-gray-50 text-gray-900'
                    }`}
                   >
                     {m}
                   </button>
                 ))}
               </div>
            </div>
          )}
        </div>

        <div className="relative w-24">
          <button
            onClick={() => setActiveField(activeField === 'period' ? null : 'period')}
            className="w-full p-3 bg-brand-600 text-white border border-brand-600 rounded-xl outline-none focus:ring-2 focus:ring-brand-400 font-bold text-xl text-center flex items-center justify-center gap-2 shadow-md"
          >
            {value.period} <ChevronDown size={14} />
          </button>
          {activeField === 'period' && (
            <div className="absolute bottom-full mb-2 right-0 w-full bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden z-50 animate-in slide-in-from-bottom-2 fade-in duration-200">
              {['AM', 'PM'].map(p => (
                <button
                  key={p}
                  onClick={(e) => {
                    e.stopPropagation();
                    onChange({ ...value, period: p });
                    setActiveField(null);
                  }}
                  className={`w-full p-3 text-sm font-bold text-center hover:bg-gray-50 transition-colors ${
                    value.period === p ? 'bg-brand-50 text-brand-600' : 'text-gray-900'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export const Home: React.FC<HomeProps> = ({ 
  todayRecords, 
  allSewadars, 
  onAddEntry, 
  onMarkOut,
  currentDate, 
  setCurrentDate
}) => {
  const [showModal, setShowModal] = useState(false);
  const dateInputRef = useRef<HTMLInputElement>(null);

  // New Entry Modal State
  const [selectedSewadarId, setSelectedSewadarId] = useState('');
  
  // Location State
  const [selectedCounter, setSelectedCounter] = useState('');
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false);

  const [sewadarSearch, setSewadarSearch] = useState('');
  const [inTime, setInTime] = useState({ hour: '09', minute: '00', period: 'AM' });
  const [outTime, setOutTime] = useState({ hour: '05', minute: '00', period: 'PM' });
  const [hasOutTime, setHasOutTime] = useState(false);

  // Mark Out Modal State
  const [markOutRecordId, setMarkOutRecordId] = useState<string | null>(null);
  const [manualOutTime, setManualOutTime] = useState({ hour: '05', minute: '00', period: 'PM' });

  const activeCount = todayRecords.filter(r => !r.endTime).length;

  const handleConfirmEntry = () => {
    if (selectedSewadarId && selectedCounter) {
      const formattedInTime = convertTo24Hour(inTime.hour, inTime.minute, inTime.period);
      const formattedOutTime = hasOutTime 
        ? convertTo24Hour(outTime.hour, outTime.minute, outTime.period) 
        : undefined;

      onAddEntry(selectedSewadarId, selectedCounter, formattedInTime, formattedOutTime);
      setShowModal(false);
      
      // Reset
      setSelectedSewadarId('');
      setSelectedCounter('');
      setSewadarSearch('');
      setInTime({ hour: '09', minute: '00', period: 'AM' });
      setHasOutTime(false);
    }
  };

  const handleMarkOutClick = (id: string) => {
    const now = new Date();
    let h = now.getHours();
    const m = now.getMinutes();
    const period = h >= 12 ? 'PM' : 'AM';
    if (h > 12) h -= 12;
    if (h === 0) h = 12;
    const roundedM = Math.floor(m / 5) * 5;

    setManualOutTime({
      hour: h.toString().padStart(2, '0'),
      minute: roundedM.toString().padStart(2, '0'),
      period
    });
    setMarkOutRecordId(id);
  };

  const handleConfirmMarkOut = () => {
    if (markOutRecordId) {
      const formatted = convertTo24Hour(manualOutTime.hour, manualOutTime.minute, manualOutTime.period);
      onMarkOut(markOutRecordId, formatted);
      setMarkOutRecordId(null);
    }
  };

  const handleDateClick = () => {
    const input = dateInputRef.current;
    if (input) {
      if ('showPicker' in input) {
        (input as any).showPicker();
      } else {
        (input as HTMLInputElement).focus();
        (input as HTMLInputElement).click();
      }
    }
  };

  const filteredSewadarsForModal = allSewadars.filter(s => 
    s.name.toLowerCase().includes(sewadarSearch.toLowerCase())
  );
  
  const filteredCounters = COUNTERS.filter(c => 
    c.toLowerCase().includes(selectedCounter.toLowerCase())
  );

  const displayDate = new Date(`${currentDate}T00:00:00`);

  const formatTimeDisplay = (time24: string | undefined) => {
    if (!time24) return '';
    const [h, m] = time24.split(':');
    const date = new Date();
    date.setHours(parseInt(h));
    date.setMinutes(parseInt(m));
    return format(date, 'h:mm a');
  };

  const recordToMarkOut = todayRecords.find(r => r.id === markOutRecordId);

  return (
    <div className="p-4 pb-4 max-w-lg mx-auto w-full">
      {/* Header Date */}
      <div className="mb-6 flex justify-between items-end">
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Daily Overview</p>
          <div className="relative group cursor-pointer inline-block" onClick={handleDateClick}>
            <h2 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              {format(displayDate, 'MMM d')}
              <ChevronDown size={20} className="text-gray-400 group-hover:text-brand-600 transition-colors" />
            </h2>
            <div className="absolute -bottom-1 left-0 h-1.5 bg-brand-600 w-0 group-hover:w-full transition-all duration-300 rounded-full"></div>
            <input 
              ref={dateInputRef}
              type="date" 
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              value={currentDate}
              onChange={(e) => setCurrentDate(e.target.value)}
            />
          </div>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="w-12 h-12 bg-brand-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-brand-200 active:scale-95 transition-transform hover:bg-brand-700"
        >
          <Plus size={24} />
        </button>
      </div>

      {/* Hero Card */}
      <div className="bg-brand-600 rounded-3xl p-6 text-white shadow-xl shadow-brand-200 mb-8 relative overflow-hidden transition-all duration-500 hover:shadow-brand-300">
        <div className="absolute -right-4 -bottom-8 opacity-20">
          <svg width="150" height="150" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M50 0L61.8 38.2L100 50L61.8 61.8L50 100L38.2 61.8L0 50L38.2 38.2L50 0Z" fill="white"/>
          </svg>
        </div>
        <p className="text-brand-100 text-sm font-medium mb-1">Active Sewadars</p>
        <div className="flex items-baseline gap-2">
          <span className="text-5xl font-bold">{activeCount}</span>
          <span className="text-brand-200">/ {allSewadars.length} total team</span>
        </div>
      </div>

      {/* Activity Feed */}
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold text-gray-900">Activity Feed</h3>
        <span className="text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded-md">{format(displayDate, 'EEEE')}</span>
      </div>
      
      <div className="space-y-4">
        {todayRecords.length === 0 ? (
           <div className="text-center py-10 text-gray-400 bg-white rounded-2xl border border-gray-100 border-dashed">
            No entries for {format(displayDate, 'MMM d')} yet.
          </div>
        ) : (
          [...todayRecords].reverse().map((record) => (
            <div key={record.id} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
              <div className="flex gap-4 items-center">
                 <div className="w-12 h-12 bg-brand-50 rounded-2xl flex items-center justify-center text-brand-600 font-bold text-lg">
                  {record.sewadarName.substring(0,1).toUpperCase()}
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 leading-tight">{record.sewadarName}</h4>
                  <p className="text-[10px] text-gray-500 font-medium">{record.counter}</p>
                </div>
              </div>
              <div className="flex flex-col items-end gap-1.5">
                 <div className="flex items-center gap-1 text-[10px] font-bold text-brand-700 bg-brand-50 px-2 py-1 rounded-lg border border-brand-100 whitespace-nowrap">
                   <Clock size={10} /> {formatTimeDisplay(record.startTime)}
                 </div>
                 {!record.endTime ? (
                   <button 
                    onClick={() => handleMarkOutClick(record.id)}
                    className="text-[10px] bg-brand-600 text-white px-2.5 py-1 rounded-lg font-bold hover:bg-brand-700 transition-colors"
                   >
                     Mark Out
                   </button>
                 ) : (
                   <div className="text-[10px] text-gray-400 font-bold bg-gray-50 px-2 py-1 rounded border border-gray-100 whitespace-nowrap">
                     Out: {formatTimeDisplay(record.endTime)}
                   </div>
                 )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Entry Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm transition-opacity" onClick={() => setShowModal(false)} />
          <div 
            className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl p-6 relative z-10 shadow-2xl max-h-[90vh] flex flex-col animate-in slide-in-from-bottom-10 duration-300"
            onClick={(e) => e.stopPropagation()} 
          >
            <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-6 sm:hidden opacity-80" />
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900">Mark Attendance</h3>
              <button onClick={() => setShowModal(false)} className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100">
                <X size={20} />
              </button>
            </div>
            <div className="overflow-y-auto no-scrollbar flex-1 pb-4">
              <div className="mb-4 relative">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Sewadar Name</label>
                {selectedSewadarId ? (
                  <div className="flex items-center justify-between p-3 border border-gray-200 rounded-xl bg-white shadow-sm ring-1 ring-gray-100">
                    <span className="font-bold text-gray-900">{allSewadars.find(s => s.id === selectedSewadarId)?.name}</span>
                    <button onClick={() => { setSelectedSewadarId(''); setSewadarSearch(''); }} className="text-gray-400 hover:text-red-500">
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <div className="relative">
                    <Search className="absolute left-3 top-3.5 text-gray-400" size={16} />
                    <input 
                      type="text"
                      className="w-full p-3 pl-10 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none text-gray-900 bg-white placeholder-gray-400 font-medium"
                      placeholder="Names of Sewadar"
                      value={sewadarSearch}
                      onChange={(e) => setSewadarSearch(e.target.value)}
                    />
                    {sewadarSearch && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-gray-100 rounded-xl shadow-lg max-h-40 overflow-auto">
                        {filteredSewadarsForModal.map(s => (
                          <button
                            key={s.id}
                            className="w-full text-left p-3 hover:bg-brand-50 hover:text-brand-700 text-sm font-medium text-gray-700 border-b border-gray-50 last:border-0"
                            onClick={() => { setSelectedSewadarId(s.id); setSewadarSearch(''); }}
                          >
                            {s.name}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
              <div className="mb-4 relative">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Location</label>
                <div className="relative">
                  <input 
                    type="text"
                    className={`w-full p-3 border rounded-xl outline-none font-bold text-gray-900 transition-all ${
                      showLocationSuggestions ? 'border-brand-500 ring-2 ring-brand-100 shadow-lg' : 'border-gray-200 bg-white'
                    }`}
                    value={selectedCounter}
                    onChange={(e) => {
                      setSelectedCounter(e.target.value);
                      setShowLocationSuggestions(true);
                    }}
                    onFocus={() => setShowLocationSuggestions(true)}
                    onBlur={() => setTimeout(() => setShowLocationSuggestions(false), 200)}
                    placeholder="Enter or select location"
                  />
                  <MapPin className="absolute right-3 top-3.5 text-gray-400 pointer-events-none" size={18} />
                  {showLocationSuggestions && (
                    <div className="absolute top-full mt-2 left-0 z-50 w-full bg-white border border-gray-100 rounded-xl shadow-2xl overflow-hidden animate-in slide-in-from-top-2 fade-in duration-200">
                      <div className="max-h-48 overflow-y-auto no-scrollbar scroll-smooth bg-white">
                        {filteredCounters.map(c => (
                          <button
                            key={c}
                            className={`w-full text-left p-3 hover:bg-gray-50 text-sm font-medium transition-colors border-b border-gray-50 last:border-0 ${
                              c === selectedCounter ? 'bg-brand-600 text-white hover:bg-brand-700' : 'text-gray-700'
                            }`}
                            onClick={() => { setSelectedCounter(c); setShowLocationSuggestions(false); }}
                          >
                            {c}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <TimePicker label="In Time" value={inTime} onChange={setInTime} />
              <div className="mb-4">
                 <label className="flex items-center gap-2 cursor-pointer">
                   <input 
                    type="checkbox" 
                    checked={hasOutTime} 
                    onChange={(e) => setHasOutTime(e.target.checked)}
                    className="w-5 h-5 rounded border-gray-300 text-brand-600 focus:ring-brand-500"
                   />
                   <span className="text-sm font-medium text-gray-700">Mark Out Time Immediately</span>
                 </label>
              </div>
              {hasOutTime && (
                <div className="animate-fade-in">
                  <TimePicker label="Out Time" value={outTime} onChange={setOutTime} />
                </div>
              )}
              <button 
                disabled={!selectedSewadarId || !selectedCounter}
                onClick={handleConfirmEntry}
                className="w-full bg-brand-600 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-brand-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-4"
              >
                Confirm Entry <ArrowRightIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mark Out Modal */}
      {markOutRecordId && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm transition-opacity" onClick={() => setMarkOutRecordId(null)} />
          <div 
             className="bg-white w-full max-w-sm rounded-t-3xl sm:rounded-3xl p-6 relative z-10 shadow-2xl animate-in slide-in-from-bottom-10 duration-300"
             onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-6 sm:hidden opacity-80" />
            <div className="flex justify-between items-center mb-6">
              <div>
                 <h3 className="text-xl font-bold text-gray-900">Mark Out</h3>
                 <p className="text-sm text-gray-500">{recordToMarkOut?.sewadarName}</p>
              </div>
              <button onClick={() => setMarkOutRecordId(null)} className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100">
                <X size={20} />
              </button>
            </div>
            <TimePicker label="Out Time" value={manualOutTime} onChange={setManualOutTime} />
            <button 
              onClick={handleConfirmMarkOut}
              className="w-full bg-red-600 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-red-700 transition-colors mt-4"
            >
              <LogOut size={18} /> Confirm Mark Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const ArrowRightIcon = ({ className }: { className?: string }) => (
  <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M12 5L19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);