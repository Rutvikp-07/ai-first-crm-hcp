import React from 'react';
import { Mail, Phone, MapPin, Building, Calendar } from 'lucide-react';
import { HCP } from '../types';
import Avatar from './Avatar';
import Badge from './Badge';
import Card from './Card';

interface DoctorCardProps {
  doctor: HCP;
  onEdit?: () => void;
  onLogInteraction?: () => void;
}

export const DoctorCard: React.FC<DoctorCardProps> = ({
  doctor,
  onEdit,
  onLogInteraction,
}) => {
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

  return (
    <Card premium className="p-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div className="flex items-center gap-4">
          <Avatar name={doctor.name} size="xl" />
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xl font-bold text-slate-800">{doctor.name}</h2>
              <Badge variant={getStatusVariant(doctor.status)}>{doctor.status}</Badge>
            </div>
            <p className="text-sm font-semibold text-brand-500 mt-0.5">{doctor.specialization}</p>
            <p className="text-xs text-slate-400 flex items-center gap-1 mt-1">
              <Building className="h-3.5 w-3.5" />
              {doctor.hospital}
            </p>
          </div>
        </div>

        <div className="flex gap-2.5 w-full sm:w-auto">
          {onEdit && (
            <button
              onClick={onEdit}
              className="flex-1 sm:flex-initial px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-55 hover:bg-slate-50 transition-colors shadow-sm"
            >
              Edit Profile
            </button>
          )}
          {onLogInteraction && (
            <button
              onClick={onLogInteraction}
              className="flex-1 sm:flex-initial px-4 py-2 text-xs font-semibold text-white bg-brand-500 rounded-lg hover:bg-brand-600 transition-colors shadow-soft"
            >
              Log Interaction
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-5 text-sm">
        <div className="flex items-center gap-3 text-slate-655 text-slate-600">
          <Mail className="h-4 w-4 text-slate-400 shrink-0" />
          <span className="truncate">{doctor.email}</span>
        </div>
        
        <div className="flex items-center gap-3 text-slate-655 text-slate-600">
          <Phone className="h-4 w-4 text-slate-400 shrink-0" />
          <span>{doctor.phone}</span>
        </div>

        <div className="flex items-center gap-3 text-slate-655 text-slate-600">
          <MapPin className="h-4 w-4 text-slate-400 shrink-0" />
          <span className="truncate">{doctor.city}</span>
        </div>

        <div className="flex items-center gap-3 text-slate-655 text-slate-600">
          <Calendar className="h-4 w-4 text-slate-400 shrink-0" />
          <span>Last Contact: <strong className="text-slate-700">{doctor.lastInteraction}</strong></span>
        </div>
      </div>

      {doctor.notes && (
        <div className="mt-5 pt-4 border-t border-slate-100">
          <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5 select-none">Notes</h4>
          <p className="text-xs text-slate-555 text-slate-500 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100">
            {doctor.notes}
          </p>
        </div>
      )}
    </Card>
  );
};

export default DoctorCard;
