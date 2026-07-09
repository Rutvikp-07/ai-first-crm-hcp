import React from 'react';
import { Calendar, Phone, Video, Users, Mail, FileText, ChevronRight } from 'lucide-react';
import { Interaction } from '../types';
import Badge from './Badge';
import Card from './Card';

interface TimelineItemProps {
  interaction: Interaction;
  onClickDetails?: () => void;
  isNew?: boolean;
}

export const TimelineItem: React.FC<TimelineItemProps> = ({
  interaction,
  onClickDetails,
  isNew = false,
}) => {
  const getIcon = (type: string) => {
    switch (type) {
      case 'In-Person':
        return <Users className="h-4 w-4 text-emerald-600" />;
      case 'Video Call':
        return <Video className="h-4 w-4 text-blue-600" />;
      case 'Phone Call':
        return <Phone className="h-4 w-4 text-indigo-650" />;
      case 'Email':
        return <Mail className="h-4 w-4 text-amber-600" />;
      default:
        return <FileText className="h-4 w-4 text-slate-500" />;
    }
  };

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
    <div id={`int-${interaction.id}`} className="relative pl-8 pb-8 group last:pb-0">
      {/* Connector Line */}
      <div className="absolute left-[15px] top-8 bottom-0 w-0.5 bg-slate-100 group-last:hidden" />

      {/* Circle Icon Badge */}
      <div className="absolute left-0 top-1.5 h-8 w-8 rounded-full border border-slate-100 bg-white flex items-center justify-center shadow-sm z-10 group-hover:border-slate-200 transition-colors">
        {getIcon(interaction.type)}
      </div>

      {/* Box Panel */}
      <Card hoverable className={`p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 cursor-pointer transition-all duration-500 ${isNew ? 'animate-new-highlight border-emerald-400 bg-emerald-50/10 shadow-sm' : ''}`} onClick={onClickDetails}>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            {isNew && (
              <span className="text-[9px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-250 px-1.5 py-0.5 rounded-md animate-pulse">New</span>
            )}
            <span className="text-xs text-slate-450 font-medium">{interaction.date} • {interaction.time}</span>
            <Badge variant={getSentimentVariant(interaction.sentiment)}>
              {interaction.sentiment}
            </Badge>
            <span className="text-slate-300">|</span>
            <span className="text-xs font-semibold text-brand-500 uppercase tracking-wide">{interaction.type}</span>
          </div>

          <h4 className="text-sm font-bold text-slate-800 mb-1 group-hover:text-brand-500 transition-colors">
            {interaction.hcpName}
          </h4>

          <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
            {interaction.outcome}
          </p>

          <div className="flex flex-wrap gap-1.5 mt-3">
            {interaction.topicsDiscussed.map((topic, i) => (
              <Badge key={i} variant="secondary" className="text-[10px]">
                {topic}
              </Badge>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3 self-end md:self-auto shrink-0 text-slate-400 group-hover:text-brand-500 transition-colors">
          <span className="text-xs font-semibold select-none hidden md:inline">View Details</span>
          <ChevronRight className="h-4 w-4" />
        </div>
      </Card>
    </div>
  );
};

export default TimelineItem;
