import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Pill, Clock, ArrowLeft, History, Loader2 } from 'lucide-react';
import { RootState, AppDispatch } from '../redux/store';
import { selectHcp, fetchHcpsThunk, updateHcpThunk, deleteHcpThunk } from '../redux/slices/hcpSlice';
import { updateDraftField, fetchInteractionsThunk, fetchInteractionByIdThunk } from '../redux/slices/interactionSlice';
import DoctorCard from '../components/DoctorCard';
import TimelineItem from '../components/TimelineItem';
import Card from '../components/Card';
import Badge from '../components/Badge';
import Button from '../components/Button';
import Modal from '../components/Modal';
import Input from '../components/Input';
import InteractionDetailModal from '../components/InteractionDetailModal';
import { Interaction } from '../types';
import { addNotification } from '../redux/slices/uiSlice';

export const HcpDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  const hcps = useSelector((state: RootState) => state.hcp.list);
  const selectedHcp = useSelector((state: RootState) => state.hcp.selectedHcp);
  const interactions = useSelector((state: RootState) => state.interaction.list);
  const hcpLoading = useSelector((state: RootState) => state.hcp.isLoading);
  const interactionLoading = useSelector((state: RootState) => state.interaction.isLoading);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const [selectedDetailsInt, setSelectedDetailsInt] = useState<Interaction | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  const handleViewDetails = async (id: string) => {
    try {
      const result = await dispatch(fetchInteractionByIdThunk(id)).unwrap();
      setSelectedDetailsInt(result);
      setIsDetailsModalOpen(true);
    } catch (err: any) {
      alert(err.message || 'Failed to retrieve interaction details');
    }
  };

  const [editData, setEditData] = useState({
    name: '',
    specialization: '',
    hospital: '',
    city: '',
    email: '',
    phone: '',
    status: 'Active' as 'Active' | 'Inactive' | 'Pending',
    notes: '',
  });

  // Sync selected doctor from route param and load records on mount
  useEffect(() => {
    dispatch(fetchHcpsThunk());
    dispatch(fetchInteractionsThunk());
  }, [dispatch]);

  useEffect(() => {
    if (id && hcps.length > 0) {
      dispatch(selectHcp(id));
    }
  }, [id, hcps, dispatch]);

  // Sync edit form data
  useEffect(() => {
    if (selectedHcp) {
      setEditData({
        name: selectedHcp.name,
        specialization: selectedHcp.specialization,
        hospital: selectedHcp.hospital,
        city: selectedHcp.city || '',
        email: selectedHcp.email || '',
        phone: selectedHcp.phone || '',
        status: selectedHcp.status,
        notes: selectedHcp.notes || '',
      });
    }
  }, [selectedHcp]);

  if (hcpLoading && hcps.length === 0) {
    return (
      <div className="py-12 text-center flex flex-col items-center justify-center gap-3">
        <Loader2 className="h-8 w-8 text-brand-500 animate-spin" />
        <span className="text-xs font-semibold text-slate-400">Loading doctor details...</span>
      </div>
    );
  }

  if (!selectedHcp) {
    return (
      <div className="py-12 text-center text-slate-450 text-slate-400 font-semibold select-none">
        Doctor Profile Not Found.
      </div>
    );
  }

  // Filter interactions for this doctor and sort by date DESC, then ID DESC
  const doctorInteractions = interactions
    .filter((i) => String(i.hcpId) === String(selectedHcp.id))
    .sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      if (dateA !== dateB) {
        return dateB - dateA;
      }
      return Number(b.id) - Number(a.id);
    });
 
  // Compute dynamic last interaction date for this doctor contact
  const sortedInts = [...doctorInteractions];
  const lastContactDate = sortedInts.length > 0 ? sortedInts[0].date : 'No Interactions Yet';
 
  const doctorWithLiveDate = {
    ...selectedHcp,
    lastInteraction: lastContactDate
  };
 
  // Extract products discussed based on topic names
  const productsDiscussed = Array.from(
    new Set(
      doctorInteractions.flatMap((i) =>
        i.topicsDiscussed
          .filter((t) => t.includes('GliclaCare') || t.includes('CardioSart') || t.includes('Pediatrix') || t.includes('DermaSoothe') || t.includes('NeuroProtect'))
          .map((t) => t.split(' ')[0])
      )
    )
  );
 
  const handleLogInteractionClick = () => {
    dispatch(updateDraftField({ field: 'hcpId', value: selectedHcp.id }));
    dispatch(updateDraftField({ field: 'hcpName', value: selectedHcp.name }));
    navigate('/log-interaction');
  };
 
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setApiError(null);
 
    try {
      await dispatch(updateHcpThunk({
        id: selectedHcp.id,
        data: {
          name: editData.name,
          specialization: editData.specialization,
          hospital: editData.hospital,
          city: editData.city,
          email: editData.email,
          phone: editData.phone,
          status: editData.status,
        }
      })).unwrap();
 
      setIsEditModalOpen(false);
    } catch (err: any) {
      const detail = err.response?.data?.detail;
      let errorMsg = 'Failed to update Healthcare Professional details.';
      if (typeof detail === 'string') {
        errorMsg = detail;
      } else if (Array.isArray(detail)) {
        errorMsg = detail.map(d => d.msg).join(', ');
      } else if (err.message) {
        errorMsg = err.message;
      }
      setApiError(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteClick = async () => {
    if (window.confirm(`Are you sure you want to permanently delete the profile for ${selectedHcp.name}?`)) {
      setIsSubmitting(true);
      try {
        await dispatch(deleteHcpThunk(selectedHcp.id)).unwrap();
        dispatch(addNotification({
          title: 'Doctor Profile Removed',
          message: `${selectedHcp.name} was removed from PharmaFlow.`,
          type: 'warning',
        }));
        setIsEditModalOpen(false);
        navigate('/hcps');
      } catch (err: any) {
        alert(err.message || 'Failed to delete Healthcare Professional');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Back button */}
      <div>
        <button
          onClick={() => navigate('/hcps')}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-brand-500 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Doctors List
        </button>
      </div>

      {/* Profile Header */}
      <DoctorCard
        doctor={doctorWithLiveDate}
        onEdit={() => setIsEditModalOpen(true)}
        onLogInteraction={handleLogInteractionClick}
      />

      {/* Detail grids */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Timeline */}
        <div className="lg:col-span-2 flex flex-col gap-5">
          <Card className="p-6">
            <h3 className="text-sm font-bold text-slate-800 border-b border-slate-55 border-slate-100 pb-4 mb-5 flex items-center gap-2 select-none">
              <History className="h-4.5 w-4.5 text-slate-400" />
              Interaction History timeline ({doctorInteractions.length})
            </h3>

            {interactionLoading && doctorInteractions.length === 0 ? (
              <div className="py-12 flex justify-center">
                <Loader2 className="h-6 w-6 text-brand-500 animate-spin" />
              </div>
            ) : doctorInteractions.length > 0 ? (
              <div className="flex flex-col">
                {doctorInteractions.map((item) => (
                  <TimelineItem
                    key={item.id}
                    interaction={item}
                    onClickDetails={() => handleViewDetails(item.id)}
                  />
                ))}
              </div>
            ) : (
              <div className="py-12 text-center text-slate-400 select-none text-xs font-medium">
                No past interactions logged for {selectedHcp.name} yet.
              </div>
            )}
          </Card>
        </div>

        {/* Right Column: Products & Tasks */}
        <div className="flex flex-col gap-6">
          {/* Products Discussed */}
          <Card className="p-6">
            <h3 className="text-sm font-bold text-slate-800 border-b border-slate-50 pb-4 mb-4 flex items-center gap-2 select-none">
              <Pill className="h-4.5 w-4.5 text-slate-400" />
              Products Discussed
            </h3>

            {productsDiscussed.length > 0 ? (
              <div className="flex flex-col gap-2.5">
                {productsDiscussed.map((prod, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 border border-slate-100 bg-slate-55/10 bg-slate-50/20 rounded-lg"
                  >
                    <span className="text-xs font-bold text-slate-700">{prod}</span>
                    <Badge variant="primary" className="text-[9px]">Discussed</Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-4 text-center text-xs text-slate-400 select-none">
                No products detailed yet.
              </div>
            )}
          </Card>

          {/* Upcoming Followups */}
          <Card className="p-6">
            <h3 className="text-sm font-bold text-slate-800 border-b border-slate-50 pb-4 mb-4 flex items-center gap-2 select-none">
              <Clock className="h-4.5 w-4.5 text-slate-400" />
              Upcoming Followups
            </h3>

            <div className="flex flex-col gap-3">
              {doctorInteractions.some(i => i.followUpActions) ? (
                doctorInteractions
                  .filter(i => i.followUpActions && i.followUpActions.trim())
                  .map((i, idx) => (
                    <div
                      key={idx}
                      className="p-3 border border-slate-100 bg-amber-50/10 rounded-lg flex flex-col gap-1"
                    >
                      <span className="text-[10px] font-semibold text-slate-450 text-slate-400">{i.date} follow-up</span>
                      <p className="text-xs text-slate-600 leading-relaxed">{i.followUpActions}</p>
                    </div>
                  ))
              ) : (
                <div className="py-4 text-center text-xs text-slate-400 select-none">
                  No upcoming follow-ups scheduled.
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* Edit HCP Profile Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title={`Edit Profile: ${selectedHcp.name}`}
        footer={
          <div className="flex justify-between items-center gap-2 w-full">
            <Button
              variant="ghost"
              className="text-rose-600 hover:bg-rose-50 font-semibold"
              size="sm"
              onClick={handleDeleteClick}
              disabled={isSubmitting}
            >
              Delete Doctor
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setIsEditModalOpen(false)} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button size="sm" onClick={handleEditSubmit} isLoading={isSubmitting}>
                Save Changes
              </Button>
            </div>
          </div>
        }
      >
        <form onSubmit={handleEditSubmit} className="flex flex-col gap-4">
          {apiError && (
            <div className="p-3 bg-rose-50 border border-rose-100 text-rose-600 rounded-lg text-xs font-semibold">
              {apiError}
            </div>
          )}

          <Input
            label="Doctor Name"
            value={editData.name}
            onChange={(e) => setEditData({ ...editData, name: e.target.value })}
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Specialization"
              value={editData.specialization}
              onChange={(e) => setEditData({ ...editData, specialization: e.target.value })}
            />

            <Input
              label="City"
              value={editData.city}
              onChange={(e) => setEditData({ ...editData, city: e.target.value })}
            />
          </div>

          <Input
            label="Hospital"
            value={editData.hospital}
            onChange={(e) => setEditData({ ...editData, hospital: e.target.value })}
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Email"
              value={editData.email}
              onChange={(e) => setEditData({ ...editData, email: e.target.value })}
            />

            <Input
              label="Phone"
              value={editData.phone}
              onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-700">Account Status</label>
            <div className="flex gap-4">
              {['Active', 'Pending', 'Inactive'].map((st) => (
                <label key={st} className="flex items-center gap-1.5 cursor-pointer text-xs text-slate-600">
                  <input
                    type="radio"
                    name="edit-status"
                    checked={editData.status === st}
                    onChange={() => setEditData({ ...editData, status: st as any })}
                    className="text-brand-500 focus:ring-brand-500"
                  />
                  <span>{st}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-700">Relationship Notes</label>
            <textarea
              value={editData.notes}
              onChange={(e) => setEditData({ ...editData, notes: e.target.value })}
              className="w-full bg-white border border-slate-200 rounded-lg p-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500 min-h-[80px] resize-y text-slate-800"
            />
          </div>
        </form>
      </Modal>

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

export default HcpDetails;
