import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Users, FileText, CheckSquare, Calendar, Plus, ExternalLink, Activity, Sparkles, Loader2 } from 'lucide-react';
import { RootState, AppDispatch } from '../redux/store';
import { fetchHcpsThunk } from '../redux/slices/hcpSlice';
import { fetchInteractionsThunk, fetchInteractionByIdThunk } from '../redux/slices/interactionSlice';
import { getDisplayNameFromEmail } from '../redux/slices/authSlice';
import StatCard from '../components/StatCard';
import TimelineItem from '../components/TimelineItem';
import Card from '../components/Card';
import Badge from '../components/Badge';
import Avatar from '../components/Avatar';
import Button from '../components/Button';
import InteractionDetailModal from '../components/InteractionDetailModal';
import { Interaction } from '../types';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  const { list: hcps, isLoading: hcpLoading } = useSelector((state: RootState) => state.hcp);
  const { list: interactions, isLoading: interactionLoading } = useSelector((state: RootState) => state.interaction);
  const processedNotesCount = useSelector((state: RootState) => state.chat.processedNotesCount);
  const user = useSelector((state: RootState) => state.auth.user);

  const [selectedDetailsInt, setSelectedDetailsInt] = useState<Interaction | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  const userFirstName = user ? getDisplayNameFromEmail(user.email).split(' ')[0] : 'Representative';

  useEffect(() => {
    dispatch(fetchHcpsThunk());
    dispatch(fetchInteractionsThunk());
  }, [dispatch]);

  const handleViewDetails = async (id: string) => {
    try {
      const result = await dispatch(fetchInteractionByIdThunk(id)).unwrap();
      setSelectedDetailsInt(result);
      setIsDetailsModalOpen(true);
    } catch (err: any) {
      alert(err.message || 'Failed to retrieve interaction details');
    }
  };

  // Loading state handling
  const isLoading = hcpLoading || interactionLoading;

  // Stats calculation
  const totalHcps = hcps.length;
  const totalInteractions = interactions.length;

  const todayStr = new Date().toISOString().split('T')[0];
  const todayMeetings = interactions.filter(i => i.date === todayStr);

  const mappedTodayMeetings = todayMeetings.map((meet) => {
    const hcp = hcps.find(h => String(h.id) === String(meet.hcpId));
    return {
      id: meet.id,
      hcpName: meet.hcpName,
      specialty: hcp ? hcp.specialization : 'General',
      time: meet.time || '12:00',
      location: hcp ? hcp.hospital : 'Clinic',
      purpose: meet.topicsDiscussed.join(', ') || 'Medical detailing visit',
    };
  });

  // Extract pending follow-up actions from interactions
  const pendingFollowups = interactions
    .filter(i => i.followUpActions && i.followUpActions.trim())
    .map((item, idx) => ({
      id: `follow-${item.id}-${idx}`,
      hcpName: item.hcpName,
      action: item.followUpActions,
      date: item.date === todayStr ? 'Due today' : `Date: ${item.date}`,
    }))
    .slice(0, 4);

  if (isLoading && hcps.length === 0 && interactions.length === 0) {
    return (
      <div className="h-[70vh] w-full flex flex-col items-center justify-center gap-4">
        <Loader2 className="h-10 w-10 text-brand-500 animate-spin" />
        <p className="text-sm font-semibold text-slate-500">Syncing live CRM data from FastAPI server...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Welcome banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-xl border border-slate-100 shadow-soft">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Welcome Back, {userFirstName}</h2>
          <p className="text-xs text-slate-455 text-slate-400 mt-1">Here is a summary of your medical representative activities and doctor relationships today.</p>
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
          subtitle="registered in CRM"
        />
        <StatCard
          title="Interactions Logged"
          value={totalInteractions}
          icon={<FileText className="h-5 w-5 text-indigo-650" />}
          subtitle="total logged visits"
        />
        <StatCard
          title="Today's Meetings"
          value={mappedTodayMeetings.length}
          icon={<Calendar className="h-5 w-5 text-emerald-650" />}
          subtitle="scheduled for today"
        />
        <StatCard
          title="AI Notes Processed"
          value={processedNotesCount}
          icon={<Sparkles className="h-5 w-5 text-amber-650" />}
          subtitle="via AI Copilot"
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
              <span className="text-xs font-semibold text-slate-400">
                {mappedTodayMeetings.length} {mappedTodayMeetings.length === 1 ? 'Meeting' : 'Meetings'} Scheduled
              </span>
            </div>

            <div className="flex flex-col gap-3">
              {mappedTodayMeetings.length > 0 ? (
                mappedTodayMeetings.map((meet) => (
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
                ))
              ) : (
                <div className="py-8 text-center text-slate-400 select-none text-xs font-medium">
                  No detailing visits logged for today yet.
                </div>
              )}
            </div>
          </Card>

          {/* Recent Interactions Timeline */}
          <Card className="p-6">
            <div className="flex items-center justify-between border-b border-slate-55 border-slate-100 pb-4 mb-5 select-none">
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
              {interactions.length > 0 ? (
                interactions.slice(0, 3).map((item) => (
                  <TimelineItem
                    key={item.id}
                    interaction={item}
                    onClickDetails={() => handleViewDetails(item.id)}
                  />
                ))
              ) : (
                <div className="py-8 text-center text-slate-400 select-none text-xs font-medium">
                  No interactions recorded yet. Click "New Interaction" to log one.
                </div>
              )}
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
              {pendingFollowups.length > 0 ? (
                pendingFollowups.map((item) => (
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
                    <p className="text-xs text-slate-555 text-slate-550 text-slate-500 leading-relaxed">
                      {item.action}
                    </p>
                  </div>
                ))
              ) : (
                <div className="py-8 text-center text-slate-450 text-slate-400 text-xs select-none">
                  No pending follow-up actions.
                </div>
              )}
            </div>
          </Card>

          {/* Quick Doctor list check */}
          <Card className="p-6">
            <h3 className="text-sm font-bold text-slate-800 border-b border-slate-50 pb-4 mb-4 select-none flex items-center gap-2">
              <Users className="h-4.5 w-4.5 text-slate-400" />
              Top Active Doctors
            </h3>

            <div className="flex flex-col gap-3">
              {hcps.length > 0 ? (
                hcps.slice(0, 4).map((doc) => (
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
                ))
              ) : (
                <div className="py-8 text-center text-slate-400 select-none text-xs font-medium">
                  No doctors managed yet.
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>

      <InteractionDetailModal
        isOpen={isDetailsModalOpen}
        onClose={() => {
          setIsDetailsModalOpen(false);
          setSelectedDetailsInt(null);
        }}
        interaction={selectedDetailsInt}
      />
    </div>
  );
};

export default Dashboard;
