import React from 'react';
import Card from '../components/Card';
import Badge from '../components/Badge';
import { Calendar as CalendarIcon, Clock, MapPin, Plus } from 'lucide-react';
import Button from '../components/Button';

export const Calendar: React.FC = () => {
  const events = [
    { id: '1', date: '2026-07-08', time: '11:30 AM', docName: 'Dr. Ramesh Sharma', type: 'In-Person', status: 'Scheduled' },
    { id: '2', date: '2026-07-08', time: '03:00 PM', docName: 'Dr. Anita Desai', type: 'Video Call', status: 'Scheduled' },
    { id: '3', date: '2026-07-10', time: '10:00 AM', docName: 'Dr. Vikram Patel', type: 'Video Call', status: 'Scheduled' },
    { id: '4', date: '2026-07-12', time: '02:00 PM', docName: 'Dr. Sunita Rao', type: 'In-Person', status: 'Scheduled' }
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center bg-white p-5 rounded-xl border border-slate-100 shadow-soft select-none">
        <div>
          <h2 className="text-sm font-bold text-slate-800">Your Sales Detailing Schedule</h2>
          <p className="text-xs text-slate-400 mt-1">Manage doctor appointments and follow-up reviews.</p>
        </div>
        <Button size="sm" icon={<Plus className="h-4 w-4" />} onClick={() => alert('Demo Feature: Create Appointment')}>
          Add Event
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Mock Calendar block */}
        <Card className="lg:col-span-8 p-6 flex flex-col items-center justify-center min-h-[350px]">
          <CalendarIcon className="h-10 w-10 text-brand-500 mb-3" />
          <h3 className="text-sm font-bold text-slate-800">July 2026</h3>
          <p className="text-xs text-slate-400 mt-1">Calendar UI simulation. Active scheduling is currently managed locally.</p>
          <div className="grid grid-cols-7 gap-2.5 mt-6 w-full max-w-md text-center text-xs font-semibold text-slate-450 border-t border-slate-50 pt-5">
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => <span key={i} className="text-slate-400">{d}</span>)}
            {Array.from({ length: 31 }).map((_, i) => (
              <span key={i} className={`p-2 rounded-md ${i + 1 === 8 ? 'bg-brand-500 text-white font-bold' : 'hover:bg-slate-50 cursor-pointer'}`}>
                {i + 1}
              </span>
            ))}
          </div>
        </Card>

        {/* Schedule List */}
        <Card className="lg:col-span-4 p-6">
          <h3 className="text-sm font-bold text-slate-800 border-b border-slate-50 pb-4 mb-4 select-none">
            Upcoming Detailings
          </h3>
          <div className="flex flex-col gap-3.5">
            {events.map(ev => (
              <div key={ev.id} className="p-3 bg-slate-50/50 border border-slate-100 rounded-lg flex justify-between items-start">
                <div>
                  <h4 className="text-xs font-bold text-slate-800">{ev.docName}</h4>
                  <span className="text-[10px] text-brand-500 font-semibold block mt-0.5">{ev.type}</span>
                  <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-2 font-medium">
                    <Clock className="h-3 w-3" /> {ev.time}
                  </div>
                </div>
                <Badge variant="info" className="text-[9px] px-1.5 py-0.5">{ev.status}</Badge>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Calendar;
