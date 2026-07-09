import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Interaction, SentimentType } from '../../types';
import { MOCK_INTERACTIONS } from '../../utils/mockData';

interface InteractionState {
  list: Interaction[];
  draft: Omit<Interaction, 'id'>;
  filters: {
    searchQuery: string;
    sentiment: string;
    type: string;
  };
}

const defaultDraft: Omit<Interaction, 'id'> = {
  hcpId: '',
  hcpName: '',
  type: 'In-Person',
  date: new Date().toISOString().split('T')[0],
  time: new Date().toTimeString().split(' ')[0].substring(0, 5),
  attendees: [],
  topicsDiscussed: [],
  voiceNoteUrl: '',
  voiceNoteDuration: '',
  materialsShared: [],
  samplesDistributed: [],
  sentiment: 'Neutral',
  outcome: '',
  followUpActions: '',
  aiSuggestedFollowUps: [],
};

const initialState: InteractionState = {
  list: MOCK_INTERACTIONS,
  draft: defaultDraft,
  filters: {
    searchQuery: '',
    sentiment: 'All',
    type: 'All',
  },
};

export const interactionSlice = createSlice({
  name: 'interaction',
  initialState,
  reducers: {
    addInteraction: (state, action: PayloadAction<Omit<Interaction, 'id'>>) => {
      const newInteraction: Interaction = {
        ...action.payload,
        id: `int-${state.list.length + 1}`,
      };
      state.list.unshift(newInteraction);
    },
    saveDraft: (state, action: PayloadAction<Omit<Interaction, 'id'>>) => {
      state.draft = action.payload;
    },
    clearDraft: (state) => {
      state.draft = {
        ...defaultDraft,
        date: new Date().toISOString().split('T')[0],
        time: new Date().toTimeString().split(' ')[0].substring(0, 5),
      };
    },
    updateDraftField: (state, action: PayloadAction<{ field: keyof Omit<Interaction, 'id'>; value: any }>) => {
      const { field, value } = action.payload;
      state.draft = {
        ...state.draft,
        [field]: value,
      } as any;
    },
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.filters.searchQuery = action.payload;
    },
    setSentimentFilter: (state, action: PayloadAction<string>) => {
      state.filters.sentiment = action.payload;
    },
    setTypeFilter: (state, action: PayloadAction<string>) => {
      state.filters.type = action.payload;
    },
  },
});

export const {
  addInteraction,
  saveDraft,
  clearDraft,
  updateDraftField,
  setSearchQuery,
  setSentimentFilter,
  setTypeFilter,
} = interactionSlice.actions;

export default interactionSlice.reducer;
