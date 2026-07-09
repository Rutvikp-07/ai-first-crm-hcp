import React from 'react';
import { Interaction } from '../types';
import Modal from './Modal';
import Badge from './Badge';
import { Calendar, Clock, User, FileText, ShoppingBag, Building, ShieldCheck } from 'lucide-react';

interface InteractionDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  interaction: Interaction | null;
}

export const InteractionDetailModal: React.FC<InteractionDetailModalProps> = ({
  isOpen,
  onClose,
  interaction,
}) => {
  if (!interaction) return null;

  const getSentimentVariant = (sentiment: string) => {
    switch (sentiment) {
      case 'Positive':
        return 'sentiment-positive';
      case 'Negative':
        return 'sentiment-negative';
      default:
        return 'sentiment-neutral';
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Interaction Visit Details"
      footer={
        <div className="flex justify-end w-full">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors shadow-sm"
          >
            Close Details
          </button>
        </div>
      }
    >
      <div className="flex flex-col gap-5 text-sm max-h-[70vh] overflow-y-auto pr-1">
        {/* Header Summary */}
        <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 flex flex-col gap-2 border-l-4 border-l-brand-500">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Doctor / HCP</span>
            <Badge variant={getSentimentVariant(interaction.sentiment)}>{interaction.sentiment} Vibe</Badge>
          </div>
          <h4 className="text-base font-bold text-slate-800">{interaction.hcpName}</h4>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Interaction Type</span>
            <Badge variant="primary" className="w-fit font-bold">{interaction.type}</Badge>
          </div>
          
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Date & Time</span>
            <span className="text-xs font-semibold text-slate-700 flex items-center gap-1.5 mt-0.5">
              <Calendar className="h-4 w-4 text-slate-400 shrink-0" />
              {interaction.date} at {interaction.time}
            </span>
          </div>
        </div>

        {/* Attendees */}
        <div className="flex flex-col gap-1.5 border-t border-slate-100 pt-3">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide flex items-center gap-1">
            <User className="h-4 w-4 text-slate-400 shrink-0" /> Attendees Present
          </span>
          {interaction.attendees && interaction.attendees.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {interaction.attendees.map((att, i) => (
                <span key={i} className="text-xs bg-slate-100 border border-slate-200 text-slate-600 font-semibold px-2 py-0.5 rounded">
                  {att}
                </span>
              ))}
            </div>
          ) : (
            <span className="text-xs text-slate-400 italic">No other attendees logged.</span>
          )}
        </div>

        {/* Topics Discussed */}
        <div className="flex flex-col gap-1.5 border-t border-slate-100 pt-3">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide flex items-center gap-1">
            <ShieldCheck className="h-4 w-4 text-slate-400 shrink-0" /> Topics Discussed
          </span>
          {interaction.topicsDiscussed && interaction.topicsDiscussed.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {interaction.topicsDiscussed.map((topic, i) => (
                <span key={i} className="text-xs bg-brand-50 border border-brand-100 text-brand-600 font-semibold px-2 py-0.5 rounded">
                  {topic}
                </span>
              ))}
            </div>
          ) : (
            <span className="text-xs text-slate-400 italic">No topics recorded.</span>
          )}
        </div>

        {/* Materials Shared */}
        <div className="flex flex-col gap-1.5 border-t border-slate-100 pt-3">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide flex items-center gap-1">
            <Building className="h-4 w-4 text-slate-400 shrink-0" /> Materials Shared
          </span>
          {interaction.materialsShared && interaction.materialsShared.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {interaction.materialsShared.map((mat, i) => (
                <span key={i} className="text-xs bg-blue-50 border border-blue-100 text-blue-600 font-semibold px-2 py-0.5 rounded">
                  {mat}
                </span>
              ))}
            </div>
          ) : (
            <span className="text-xs text-slate-400 italic">No materials shared.</span>
          )}
        </div>

        {/* Samples Distributed */}
        <div className="flex flex-col gap-1.5 border-t border-slate-100 pt-3">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide flex items-center gap-1">
            <ShoppingBag className="h-4 w-4 text-slate-400 shrink-0" /> Samples Distributed
          </span>
          {interaction.samplesDistributed && interaction.samplesDistributed.length > 0 ? (
            <div className="flex flex-col gap-1.5 max-w-sm">
              {interaction.samplesDistributed.map((sm, i) => (
                <div key={i} className="flex justify-between items-center bg-slate-50 border border-slate-100 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700">
                  <span>{sm.productName}</span>
                  <Badge variant="primary" className="text-[10px] font-bold">{sm.quantity} units</Badge>
                </div>
              ))}
            </div>
          ) : (
            <span className="text-xs text-slate-400 italic">No product samples distributed.</span>
          )}
        </div>

        {/* Discussion Outcome */}
        <div className="flex flex-col gap-1.5 border-t border-slate-100 pt-3">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide flex items-center gap-1">
            <FileText className="h-4 w-4 text-slate-400 shrink-0" /> Discussion Outcome Summary
          </span>
          <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100 leading-relaxed font-medium">
            {interaction.outcome || 'No outcome summary recorded.'}
          </p>
        </div>

        {/* Follow-up Actions */}
        <div className="flex flex-col gap-1.5 border-t border-slate-100 pt-3 bg-amber-50/10 p-3 rounded-xl border border-amber-100/20">
          <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wide flex items-center gap-1">
            <Clock className="h-4 w-4 shrink-0" /> Follow-up Actions Required
          </span>
          <p className="text-xs text-slate-700 leading-relaxed font-semibold">
            {interaction.followUpActions || 'No follow-up actions scheduled.'}
          </p>
        </div>
      </div>
    </Modal>
  );
};

export default InteractionDetailModal;
