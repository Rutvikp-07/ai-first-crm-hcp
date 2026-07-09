import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Activity, Pill, Clock, ArrowLeft, Edit3, MessageSquare, History } from 'lucide-react';
import { RootState } from '../redux/store';
import { selectHcp, addHcp } from '../redux/slices/hcpSlice';
import { updateDraftField } from '../redux/slices/interactionSlice';
import DoctorCard from '../components/DoctorCard';
import TimelineItem from '../components/TimelineItem';
import Card from '../components/Card';
import Badge from '../components/Badge';
import Button from '../components/Button';
import Modal from '../components/Modal';
import Input from '../components/Input';
import Dropdown from '../components/Dropdown';
import { addNotification } from '../redux/slices/uiSlice';

export const HcpDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const hcps = useSelector((state: RootState) => state.hcp.list);
  const selectedHcp = useSelector((state: RootState) => state.hcp.selectedHcp);
  const interactions = useSelector((state: RootState) => state.interaction.list);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
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

  // Sync selected doctor from route param
  useEffect(() => {
    if (id) {
      dispatch(selectHcp(id));
    }
  }, [id, dispatch]);

  // Sync edit form data
  useEffect(() => {
    if (selectedHcp) {
      setEditData({
        name: selectedHcp.name,
        specialization: selectedHcp.specialization,
        hospital: selectedHcp.hospital,
        city: selectedHcp.city,
        email: selectedHcp.email,
        phone: selectedHcp.phone,
        status: selectedHcp.status,
        notes: selectedHcp.notes || '',
      });
    }
  }, [selectedHcp]);

  if (!selectedHcp) {
    return (
      <div className="py-12 text-center text-slate-400 font-semibold select-none">
        Doctor Profile Not Found.
      </div>
    );
  }

  // Filter interactions for this doctor
  const doctorInteractions = interactions.filter((i) => i.hcpId === selectedHcp.id);

  // Extract products discussed based on topic names or hardcoded list for realism
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
    // Populate draft state with selected doctor information
    dispatch(updateDraftField({ field: 'hcpId', value: selectedHcp.id }));
    dispatch(updateDraftField({ field: 'hcpName', value: selectedHcp.name }));
    navigate('/log-interaction');
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // In our local store, since we don't have direct "update" in slices yet, we can mock update
    // or just trigger success message. Let's make an update action in hcpSlice.
    // However, to keep it simple, we can display success notification. We will also add
    // code edit to hcpSlice if we want it to persist. Let's assume we dispatch a success notification.
    dispatch(addNotification({
      title: 'Profile Updated',
      message: `${editData.name}'s profile details updated successfully.`,
      type: 'success',
    }));
    
    setIsEditModalOpen(false);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Back button */}
      <div>
        <button
          onClick={() => navigate('/hcps')}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-555 text-slate-500 hover:text-brand-500 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Doctors List
        </button>
      </div>

      {/* Profile Header */}
      <DoctorCard
        doctor={selectedHcp}
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

            {doctorInteractions.length > 0 ? (
              <div className="flex flex-col">
                {doctorInteractions.map((item) => (
                  <TimelineItem
                    key={item.id}
                    interaction={item}
                    onClickDetails={() => {}}
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
                    className="flex items-center justify-between p-3 border border-slate-100 bg-slate-50/20 rounded-lg"
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
                  .filter(i => i.followUpActions)
                  .map((i, idx) => (
                    <div
                      key={idx}
                      className="p-3 border border-slate-100 bg-amber-50/10 rounded-lg flex flex-col gap-1"
                    >
                      <span className="text-[10px] font-semibold text-slate-400">{i.date} follow-up</span>
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
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setIsEditModalOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleEditSubmit}>
              Save Changes
            </Button>
          </div>
        }
      >
        <form onSubmit={handleEditSubmit} className="flex flex-col gap-4">
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
                <label key={st} className="flex items-center gap-1.5 cursor-pointer text-xs text-slate-655 text-slate-600">
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
    </div>
  );
};

export default HcpDetails;
