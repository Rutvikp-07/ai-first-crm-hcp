import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Users, FileText, CheckSquare, Smile, Calendar, Plus, ExternalLink, Activity } from 'lucide-react';
import { RootState } from '../redux/store';
import StatCard from '../components/StatCard';
import TimelineItem from '../components/TimelineItem';
import Card from '../components/Card';
import Badge from '../components/Badge';
import Avatar from '../components/Avatar';
import Button from '../components/Button';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const hcps = useSelector((state: RootState) => state.hcp.list);
  const interactions = useSelector((state: RootState) => state.interaction.list);

  // Stats calculation
  const totalHcps = hcps.length;
  const totalInteractions = interactions.length;
  const positiveSentimentCount = interactions.filter(i => i.sentiment === 'Positive').length;
  const positiveSentimentRate = totalInteractions > 0 
    ? Math.round((positiveSentimentCount / totalInteractions) * 100) 
    : 100;

  const todayMeetings = [
    {
      id: 'meet-1',
      hcpName: 'Dr. Ramesh Sharma',
      specialty: 'Cardiology',
      time: '11:30 AM',
      location: 'Fortis Escorts, Okhla',
      purpose: 'CardioSart HCT detailing session'
    },
    {
      id: 'meet-2',
      hcpName: 'Dr. Anita Desai',
      specialty: 'Endocrinology',
      time: '03:00 PM',
      location: 'Video Call (Zoom)',
      purpose: 'GliclaCare Phase III cardiovascular trial summary'
    }
  ];

  const pendingFollowups = [
    {
      id: 'f-1',
      hcpName: 'Dr. preeti Gupta',
      action: 'Share digital copy of Safety Data Sheet via WhatsApp',
      date: 'Due today'
    },
    {
      id: 'f-2',
      hcpName: 'Dr. Sunita Rao',
      action: 'Deliver 50 more samples of Pediatrix Multi-V to clinic reception',
      date: 'Due in 2 days'
    }
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Welcome banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-xl border border-slate-100 shadow-soft">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Welcome Back, Amit</h2>
          <p className="text-xs text-slate-450 mt-1">Here is a summary of your medical representative activities and doctor relationships today.</p>
        </div>
        <Button
          onClick={() => navigate('/log-interaction')}
          icon={<Plus className="h-4 w-4" />}
          className="text-xs font-semibold"
        >
          New Interaction
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Total HCPs Managed"
          value={totalHcps}
          icon={<Users className="h-5 w-5 text-blue-650" />}
          trend={{ value: 12, isPositive: true }}
          subtitle="this month"
        />
        <StatCard
          title="Interactions Logged"
          value={totalInteractions}
          icon={<FileText className="h-5 w-5 text-indigo-650" />}
          trend={{ value: 8, isPositive: true }}
          subtitle="this month"
        />
        <StatCard
          title="Positive Sentiment"
          value={`${positiveSentimentRate}%`}
          icon={<Smile className="h-5 w-5 text-emerald-650" />}
          trend={{ value: 4, isPositive: true }}
          subtitle="average doctor vibe"
        />
        <StatCard
          title="Pending Followups"
          value={pendingFollowups.length}
          icon={<CheckSquare className="h-5 w-5 text-amber-650" />}
          subtitle="actions required"
        />
      </div>

      {/* Main Grid Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Meetings & Timeline */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* Today's Meetings widget */}
          <Card className="p-6">
            <div className="flex items-center justify-between border-b border-slate-50 pb-4 mb-4 select-none">
              <div className="flex items-center gap-2">
                <Calendar className="h-4.5 w-4.5 text-slate-400" />
                <h3 className="text-sm font-bold text-slate-800">Today's Detailed Detailing Visits</h3>
              </div>
              <span className="text-xs font-semibold text-slate-400">2 Meetings Scheduled</span>
            </div>

            <div className="flex flex-col gap-3">
              {todayMeetings.map((meet) => (
                <div
                  key={meet.id}
                  className="flex items-start justify-between p-4 rounded-xl border border-slate-100 hover:border-slate-200 transition-colors bg-slate-50/20"
                >
                  <div className="flex items-start gap-3">
                    <Avatar name={meet.hcpName} size="md" />
                    <div>
                      <h4 className="text-sm font-bold text-slate-850 text-slate-800">{meet.hcpName}</h4>
                      <p className="text-[11px] font-semibold text-brand-500">{meet.specialty}</p>
                      <p className="text-xs text-slate-500 mt-1">{meet.purpose}</p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-xs font-bold text-slate-800 block">{meet.time}</span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">{meet.location}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Recent Interactions Timeline */}
          <Card className="p-6">
            <div className="flex items-center justify-between border-b border-slate-50 pb-4 mb-5 select-none">
              <div className="flex items-center gap-2">
                <Activity className="h-4.5 w-4.5 text-slate-400" />
                <h3 className="text-sm font-bold text-slate-800">Recent Interactions Activity</h3>
              </div>
              <button
                onClick={() => navigate('/interactions')}
                className="text-xs font-bold text-brand-500 hover:underline flex items-center gap-0.5"
              >
                View all archives <ExternalLink className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="flex flex-col">
              {interactions.slice(0, 3).map((item) => (
                <TimelineItem
                  key={item.id}
                  interaction={item}
                  onClickDetails={() => navigate(`/hcp/${item.hcpId}`)}
                />
              ))}
            </div>
          </Card>
        </div>

        {/* Right 1 Column: Follow-ups & Visits */}
        <div className="flex flex-col gap-6">
          {/* Pending Followups */}
          <Card className="p-6">
            <h3 className="text-sm font-bold text-slate-800 border-b border-slate-50 pb-4 mb-4 select-none flex items-center gap-2">
              <CheckSquare className="h-4.5 w-4.5 text-slate-400" />
              AI Suggested Follow Ups
            </h3>

            <div className="flex flex-col gap-3">
              {pendingFollowups.map((item) => (
                <div
                  key={item.id}
                  className="p-3.5 rounded-lg border border-slate-100 bg-amber-50/10 flex flex-col gap-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800">{item.hcpName}</span>
                    <Badge variant="warning" className="text-[9px] px-1.5 py-0.5">
                      {item.date}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-555 text-slate-500 leading-relaxed">
                    {item.action}
                  </p>
                </div>
              ))}
            </div>
          </Card>

          {/* Quick Doctor list check */}
          <Card className="p-6">
            <h3 className="text-sm font-bold text-slate-800 border-b border-slate-50 pb-4 mb-4 select-none flex items-center gap-2">
              <Users className="h-4.5 w-4.5 text-slate-400" />
              Top Active Doctors
            </h3>

            <div className="flex flex-col gap-3">
              {hcps.slice(0, 4).map((doc) => (
                <div
                  key={doc.id}
                  onClick={() => navigate(`/hcp/${doc.id}`)}
                  className="flex items-center justify-between p-2.5 rounded-lg hover:bg-slate-55 hover:bg-slate-50 cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Avatar name={doc.name} size="sm" />
                    <div className="min-w-0">
                      <span className="text-xs font-bold text-slate-800 block truncate">{doc.name}</span>
                      <span className="text-[10px] text-slate-400 block truncate">{doc.specialization} • {doc.hospital}</span>
                    </div>
                  </div>
                  <Badge variant="success" className="text-[9px] shrink-0">
                    {doc.status}
                  </Badge>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
