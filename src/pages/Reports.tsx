import React from 'react';
import Card from '../components/Card';
import { BarChart3, TrendingUp, PieChart, Star, Target } from 'lucide-react';
import StatCard from '../components/StatCard';
import Badge from '../components/Badge';

export const Reports: React.FC = () => {
  return (
    <div className="flex flex-col gap-6">
      <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-soft select-none">
        <h2 className="text-sm font-bold text-slate-800">Detailing Analytics & Reports</h2>
        <p className="text-xs text-slate-400 mt-1">Review physician sentiment trends, detailing reach, and sample coverage indicators.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <StatCard title="Call Detailing Reach" value="94%" icon={<Target className="h-5 w-5 text-indigo-500" />} subtitle="of target doctors" />
        <StatCard title="Average Detailing Rating" value="4.8 / 5.0" icon={<Star className="h-5 w-5 text-amber-500" />} subtitle="physician rating" />
        <StatCard title="Detailing Frequency" value="3.1 calls / doc" icon={<TrendingUp className="h-5 w-5 text-emerald-500" />} subtitle="average frequency" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Mock sentiments graph */}
        <Card className="p-6 min-h-[300px] flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5 border-b border-slate-50 pb-3.5 select-none">
              <PieChart className="h-4.5 w-4.5 text-slate-400" />
              Observed Doctor Sentiment Share
            </h3>
            
            <div className="flex items-center gap-6 mt-8">
              <div className="flex-1 flex flex-col gap-4">
                <div className="flex justify-between items-center text-xs font-semibold">
                  <div className="flex items-center gap-1.5">
                    <span className="h-3 w-3 rounded-full bg-emerald-500" />
                    <span>Positive Sentiment</span>
                  </div>
                  <span>75%</span>
                </div>
                <div className="flex justify-between items-center text-xs font-semibold">
                  <div className="flex items-center gap-1.5">
                    <span className="h-3 w-3 rounded-full bg-slate-400" />
                    <span>Neutral Sentiment</span>
                  </div>
                  <span>20%</span>
                </div>
                <div className="flex justify-between items-center text-xs font-semibold">
                  <div className="flex items-center gap-1.5">
                    <span className="h-3 w-3 rounded-full bg-rose-500" />
                    <span>Negative Sentiment</span>
                  </div>
                  <span>5%</span>
                </div>
              </div>

              {/* Graphic Ring visualization */}
              <div className="h-28 w-28 rounded-full border-[10px] border-emerald-500 flex items-center justify-center shrink-0">
                <div className="text-[10px] font-bold text-slate-400 uppercase text-center leading-none">
                  Vibe<br/>Index
                </div>
              </div>
            </div>
          </div>

          <p className="text-[10px] text-slate-400 font-semibold select-none">
            DATA AUTO-EXTRACTED FROM 4 ACTIVE LOGGED MEETINGS.
          </p>
        </Card>

        {/* Mock detailed summary progress */}
        <Card className="p-6 min-h-[300px] flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5 border-b border-slate-50 pb-3.5 select-none">
              <BarChart3 className="h-4.5 w-4.5 text-slate-400" />
              Product Detailing Share
            </h3>

            <div className="flex flex-col gap-3 mt-6">
              {[
                { name: 'CardioSart HCT (Hypertension)', share: 50, color: 'bg-blue-500' },
                { name: 'GliclaCare XR (Diabetes)', share: 25, color: 'bg-indigo-500' },
                { name: 'Pediatrix Multi-V (Nutritional)', share: 25, color: 'bg-emerald-500' }
              ].map((p, idx) => (
                <div key={idx} className="flex flex-col gap-1">
                  <div className="flex justify-between text-xs font-semibold">
                    <span>{p.name}</span>
                    <span>{p.share}%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div className={`${p.color} h-full rounded-full`} style={{ width: `${p.share}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <p className="text-[10px] text-slate-400 font-semibold select-none">
            UPDATED AS OF TODAY'S RECENT TIMELINE DETAILS.
          </p>
        </Card>
      </div>
    </div>
  );
};

export default Reports;
