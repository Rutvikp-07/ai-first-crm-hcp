import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Search, Filter, History, Calendar, FileText, Loader2 } from 'lucide-react';
import { RootState, AppDispatch } from '../redux/store';
import {
  setSearchQuery,
  setSentimentFilter,
  setTypeFilter,
  fetchInteractionsThunk,
  fetchInteractionByIdThunk
} from '../redux/slices/interactionSlice';
import { fetchHcpsThunk } from '../redux/slices/hcpSlice';
import { Interaction } from '../types';
import TimelineItem from '../components/TimelineItem';
import SearchInput from '../components/SearchInput';
import Card from '../components/Card';
import InteractionDetailModal from '../components/InteractionDetailModal';
import Badge from '../components/Badge';

export const InteractionHistory: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();

  const { list: interactions, filters, isLoading } = useSelector((state: RootState) => state.interaction);

  const [selectedDetailsInt, setSelectedDetailsInt] = useState<Interaction | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

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

  const [highlightId, setHighlightId] = useState<string | null>(null);

  useEffect(() => {
    const newId = sessionStorage.getItem('newlyCreatedInteractionId');
    if (newId) {
      setHighlightId(newId);
      const scrollTimer = setTimeout(() => {
        const el = document.getElementById(`int-${newId}`);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 500);

      const clearTimer = setTimeout(() => {
        sessionStorage.removeItem('newlyCreatedInteractionId');
        setHighlightId(null);
      }, 3500);

      return () => {
        clearTimeout(scrollTimer);
        clearTimeout(clearTimer);
      };
    }
  }, [interactions]);

  const sentimentFilters = ['All', 'Positive', 'Neutral', 'Negative'];
  const typeFilters = ['All', 'In-Person', 'Video Call', 'Phone Call', 'Email'];

  // Apply filters and sort by meeting_date DESC, then ID DESC
  const filteredInteractions = interactions
    .filter((item) => {
      const matchesSearch =
        item.hcpName.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
        item.outcome.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
        item.topicsDiscussed.some((t) => t.toLowerCase().includes(filters.searchQuery.toLowerCase()));

      const matchesSentiment =
        filters.sentiment === 'All' || item.sentiment === filters.sentiment;

      const matchesType = filters.type === 'All' || item.type === filters.type;

      return matchesSearch && matchesSentiment && matchesType;
    })
    .sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      if (dateA !== dateB) {
        return dateB - dateA;
      }
      return Number(b.id) - Number(a.id);
    });

  return (
    <div className="flex flex-col gap-6">
      <style>{`
        @keyframes highlight-fade {
          0% { background-color: rgba(16, 185, 129, 0.15); border-color: rgba(16, 185, 129, 0.4); }
          100% { background-color: transparent; }
        }
        .animate-new-highlight {
          animation: highlight-fade 3s ease-out forwards;
        }
      `}</style>
      {/* Top search & title */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <SearchInput
          value={filters.searchQuery}
          onChangeValue={(val) => dispatch(setSearchQuery(val))}
          placeholder="Search by doctor, topics, outcome summary..."
          containerClassName="max-w-md w-full"
        />
        
        <span className="text-xs font-semibold text-slate-400 select-none self-end md:self-auto">
          {filteredInteractions.length} Interactions Found
        </span>
      </div>

      {/* Filter panel */}
      <Card className="p-4 flex flex-wrap gap-4 items-center bg-slate-55 bg-slate-50/40">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-550 text-slate-500 uppercase tracking-wide select-none">
          <Filter className="h-4 w-4" />
          Filter:
        </div>

        {/* Type Select */}
        <div className="flex-grow sm:flex-initial min-w-[140px] max-w-[200px]">
          <select
            value={filters.type}
            onChange={(e) => dispatch(setTypeFilter(e.target.value))}
            className="w-full bg-white border border-slate-200 text-xs px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            {typeFilters.map((type) => (
              <option key={type} value={type}>
                Type: {type}
              </option>
            ))}
          </select>
        </div>

        {/* Sentiment Select */}
        <div className="flex-grow sm:flex-initial min-w-[140px] max-w-[200px]">
          <select
            value={filters.sentiment}
            onChange={(e) => dispatch(setSentimentFilter(e.target.value))}
            className="w-full bg-white border border-slate-200 text-xs px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            {sentimentFilters.map((s) => (
              <option key={s} value={s}>
                Sentiment: {s}
              </option>
            ))}
          </select>
        </div>

        {/* Clear trigger */}
        {(filters.searchQuery || filters.type !== 'All' || filters.sentiment !== 'All') && (
          <button
            onClick={() => {
              dispatch(setSearchQuery(''));
              dispatch(setTypeFilter('All'));
              dispatch(setSentimentFilter('All'));
            }}
            className="text-xs font-bold text-slate-500 hover:text-brand-500 transition-colors"
          >
            Clear Filters
          </button>
        )}
      </Card>

      {/* Timeline wrapper list */}
      <Card className="p-6">
        <h3 className="text-sm font-bold text-slate-800 border-b border-slate-55 border-slate-100 pb-4 mb-6 flex items-center gap-2 select-none">
          <History className="h-4.5 w-4.5 text-slate-400" />
          All Interactions Archive
        </h3>

        {isLoading && interactions.length === 0 ? (
          <div className="py-16 flex flex-col items-center justify-center gap-3">
            <Loader2 className="h-8 w-8 text-brand-500 animate-spin" />
            <span className="text-xs font-semibold text-slate-400">Loading interactions logs...</span>
          </div>
        ) : filteredInteractions.length > 0 ? (
          <div className="flex flex-col">
            {filteredInteractions.map((item) => (
              <TimelineItem
                key={item.id}
                interaction={item}
                isNew={highlightId === item.id}
                onClickDetails={() => handleViewDetails(item.id)}
              />
            ))}
          </div>
        ) : (
          <div className="py-16 text-center text-slate-450 text-slate-400 select-none">
            <div className="flex flex-col items-center gap-2.5">
              <FileText className="h-8 w-8 text-slate-300" />
              <span className="text-xs font-semibold">No interactions match your search criteria.</span>
            </div>
          </div>
        )}
      </Card>

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

export default InteractionHistory;
