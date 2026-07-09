import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Filter, Stethoscope, ChevronRight, Check } from 'lucide-react';
import { RootState } from '../redux/store';
import {
  setSearchQuery,
  setSpecializationFilter,
  setCityFilter,
  setStatusFilter,
  addHcp,
  selectHcp
} from '../redux/slices/hcpSlice';
import { addNotification } from '../redux/slices/uiSlice';
import SearchInput from '../components/SearchInput';
import Card from '../components/Card';
import Badge from '../components/Badge';
import Avatar from '../components/Avatar';
import Modal from '../components/Modal';
import Input from '../components/Input';
import Dropdown from '../components/Dropdown';
import Button from '../components/Button';

export const HcpList: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { list: hcps, filters } = useSelector((state: RootState) => state.hcp);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newHcpData, setNewHcpData] = useState({
    name: '',
    specialization: 'Cardiology',
    hospital: '',
    city: 'New Delhi',
    email: '',
    phone: '',
    status: 'Active' as 'Active' | 'Inactive' | 'Pending',
    notes: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Filter lists configuration
  const specializations = ['All', 'Cardiology', 'Endocrinology', 'Neurology', 'Pediatrics', 'Oncology', 'Dermatology', 'Orthopedics'];
  const cities = ['All', 'New Delhi', 'Mumbai', 'Bengaluru', 'Gurugram'];
  const statuses = ['All', 'Active', 'Inactive', 'Pending'];

  // Handle Filtering logic
  const filteredHcps = hcps.filter((hcp) => {
    const matchesSearch =
      hcp.name.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
      hcp.hospital.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
      hcp.specialization.toLowerCase().includes(filters.searchQuery.toLowerCase());

    const matchesSpecialty =
      filters.specialization === 'All' || hcp.specialization === filters.specialization;

    const matchesCity = filters.city === 'All' || hcp.city === filters.city;

    const matchesStatus = filters.status === 'All' || hcp.status === filters.status;

    return matchesSearch && matchesSpecialty && matchesCity && matchesStatus;
  });

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'Active':
        return 'success';
      case 'Inactive':
        return 'danger';
      default:
        return 'warning';
    }
  };

  const handleRowClick = (id: string) => {
    dispatch(selectHcp(id));
    navigate(`/hcp/${id}`);
  };

  const handleAddHcpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!newHcpData.name.trim()) newErrors.name = 'Doctor name is required';
    if (!newHcpData.hospital.trim()) newErrors.hospital = 'Hospital name is required';
    if (!newHcpData.email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!/\S+@\S+\.\S+/.test(newHcpData.email)) {
      newErrors.email = 'Invalid email address';
    }
    if (!newHcpData.phone.trim()) newErrors.phone = 'Phone number is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Add doctor to store
    dispatch(addHcp(newHcpData));
    
    // Add banner notification
    dispatch(addNotification({
      title: 'Doctor Added',
      message: `${newHcpData.name} has been added to your target sales list.`,
      type: 'success'
    }));

    // Reset and Close
    setNewHcpData({
      name: '',
      specialization: 'Cardiology',
      hospital: '',
      city: 'New Delhi',
      email: '',
      phone: '',
      status: 'Active',
      notes: '',
    });
    setErrors({});
    setIsAddModalOpen(false);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Top action header */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <SearchInput
          value={filters.searchQuery}
          onChangeValue={(val) => dispatch(setSearchQuery(val))}
          placeholder="Search doctors, hospital, specialty..."
          containerClassName="max-w-md w-full"
        />

        <Button
          onClick={() => setIsAddModalOpen(true)}
          icon={<Plus className="h-4.5 w-4.5" />}
          className="text-xs font-semibold shrink-0"
        >
          Add Doctor (HCP)
        </Button>
      </div>

      {/* Filter panel */}
      <Card className="p-4 flex flex-wrap gap-4 items-center bg-slate-50/30">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wide select-none shrink-0">
          <Filter className="h-4 w-4" />
          Filter:
        </div>

        {/* Specialty Filter */}
        <div className="flex-1 min-w-[140px] max-w-[200px]">
          <select
            value={filters.specialization}
            onChange={(e) => dispatch(setSpecializationFilter(e.target.value))}
            className="w-full bg-white border border-slate-200 text-xs px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            {specializations.map((spec) => (
              <option key={spec} value={spec}>
                Specialization: {spec}
              </option>
            ))}
          </select>
        </div>

        {/* City Filter */}
        <div className="flex-1 min-w-[140px] max-w-[200px]">
          <select
            value={filters.city}
            onChange={(e) => dispatch(setCityFilter(e.target.value))}
            className="w-full bg-white border border-slate-200 text-xs px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            {cities.map((city) => (
              <option key={city} value={city}>
                City: {city}
              </option>
            ))}
          </select>
        </div>

        {/* Status Filter */}
        <div className="flex-1 min-w-[140px] max-w-[200px]">
          <select
            value={filters.status}
            onChange={(e) => dispatch(setStatusFilter(e.target.value))}
            className="w-full bg-white border border-slate-200 text-xs px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            {statuses.map((stat) => (
              <option key={stat} value={stat}>
                Status: {stat}
              </option>
            ))}
          </select>
        </div>

        {/* Reset Filters button */}
        {(filters.searchQuery || filters.specialization !== 'All' || filters.city !== 'All' || filters.status !== 'All') && (
          <button
            onClick={() => {
              dispatch(setSearchQuery(''));
              dispatch(setSpecializationFilter('All'));
              dispatch(setCityFilter('All'));
              dispatch(setStatusFilter('All'));
            }}
            className="text-xs font-bold text-slate-500 hover:text-brand-500 transition-colors"
          >
            Clear Filters
          </button>
        )}
      </Card>

      {/* Table grid */}
      <Card className="overflow-hidden border border-slate-100 shadow-soft">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-100 text-slate-500 font-bold select-none text-xs uppercase tracking-wider">
                <th className="px-6 py-4">Doctor Name</th>
                <th className="px-6 py-4">Specialization</th>
                <th className="px-6 py-4">Hospital</th>
                <th className="px-6 py-4">City</th>
                <th className="px-6 py-4">Last Interaction</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredHcps.length > 0 ? (
                filteredHcps.map((hcp) => (
                  <tr
                    key={hcp.id}
                    onClick={() => handleRowClick(hcp.id)}
                    className="hover:bg-slate-55 hover:bg-slate-50/50 cursor-pointer transition-colors group"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <Avatar name={hcp.name} size="sm" />
                        <div>
                          <span className="font-bold text-slate-800 group-hover:text-brand-500 transition-colors block">
                            {hcp.name}
                          </span>
                          <span className="text-[10px] text-slate-400 block mt-0.5">{hcp.email}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-slate-655 text-slate-600 font-medium">
                      {hcp.specialization}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-slate-555 text-slate-500">
                      {hcp.hospital}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-slate-555 text-slate-500">
                      {hcp.city}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-slate-500 text-xs font-semibold">
                      {hcp.lastInteraction}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge variant={getStatusVariant(hcp.status)}>{hcp.status}</Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-slate-400 group-hover:text-brand-500 transition-colors">
                      <ChevronRight className="h-4 w-4 inline" />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-400 select-none">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Stethoscope className="h-8 w-8 text-slate-300" />
                      <span className="text-xs font-semibold">No doctors found matching filters</span>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Add HCP Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Healthcare Professional"
        footer={
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleAddHcpSubmit}>
              Save Doctor
            </Button>
          </div>
        }
      >
        <form onSubmit={handleAddHcpSubmit} className="flex flex-col gap-4">
          <Input
            label="Doctor Name"
            placeholder="Dr. Rajesh Koothrappali"
            value={newHcpData.name}
            onChange={(e) => setNewHcpData({ ...newHcpData, name: e.target.value })}
            error={errors.name}
          />

          <div className="grid grid-cols-2 gap-4">
            <Dropdown
              label="Specialization"
              options={specializations.filter(s => s !== 'All').map(s => ({ value: s, label: s }))}
              value={newHcpData.specialization}
              onChange={(val) => setNewHcpData({ ...newHcpData, specialization: val })}
            />

            <Dropdown
              label="City"
              options={cities.filter(c => c !== 'All').map(c => ({ value: c, label: c }))}
              value={newHcpData.city}
              onChange={(val) => setNewHcpData({ ...newHcpData, city: val })}
            />
          </div>

          <Input
            label="Hospital / Clinic Name"
            placeholder="Apollo Speciality Clinic"
            value={newHcpData.hospital}
            onChange={(e) => setNewHcpData({ ...newHcpData, hospital: e.target.value })}
            error={errors.hospital}
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Email Address"
              type="email"
              placeholder="rajesh.k@apollo.com"
              value={newHcpData.email}
              onChange={(e) => setNewHcpData({ ...newHcpData, email: e.target.value })}
              error={errors.email}
            />

            <Input
              label="Phone Number"
              placeholder="+91 98765 43210"
              value={newHcpData.phone}
              onChange={(e) => setNewHcpData({ ...newHcpData, phone: e.target.value })}
              error={errors.phone}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-700">Account Status</label>
            <div className="flex gap-4">
              {['Active', 'Pending', 'Inactive'].map((st) => (
                <label key={st} className="flex items-center gap-1.5 cursor-pointer text-xs text-slate-655 text-slate-600">
                  <input
                    type="radio"
                    name="modal-status"
                    checked={newHcpData.status === st}
                    onChange={() => setNewHcpData({ ...newHcpData, status: st as any })}
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
              placeholder="Provide context e.g., preferences, best call times, general feedback..."
              value={newHcpData.notes}
              onChange={(e) => setNewHcpData({ ...newHcpData, notes: e.target.value })}
              className="w-full bg-white border border-slate-200 rounded-lg p-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500 min-h-[80px] resize-y text-slate-800"
            />
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default HcpList;
