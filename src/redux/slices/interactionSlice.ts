import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { Interaction, SentimentType, HCP } from '../../types';
import { interactionsApi } from '../../api/interactions';

// Helper to map API models to frontend Interaction interface
export const mapInteractionFromApi = (apiInt: any, hcpList: HCP[]): Interaction => {
  const hcp = hcpList.find((h) => String(h.id) === String(apiInt.hcp_id));
  return {
    id: String(apiInt.id),
    hcpId: String(apiInt.hcp_id),
    hcpName: hcp ? hcp.name : `Dr. (ID: ${apiInt.hcp_id})`,
    type: (apiInt.interaction_type || 'In-Person') as any,
    date: apiInt.meeting_date || '',
    time: apiInt.created_at ? new Date(apiInt.created_at).toTimeString().substring(0, 5) : '12:00',
    attendees: apiInt.attendees ? apiInt.attendees.split(',').map((s: string) => s.trim()).filter(Boolean) : [],
    topicsDiscussed: apiInt.topics_discussed ? apiInt.topics_discussed.split(',').map((s: string) => s.trim()).filter(Boolean) : [],
    materialsShared: apiInt.materials_shared ? apiInt.materials_shared.split(',').map((s: string) => s.trim()).filter(Boolean) : [],
    samplesDistributed: [],
    sentiment: (apiInt.sentiment || 'Neutral') as SentimentType,
    outcome: apiInt.topics_discussed || '',
    followUpActions: apiInt.follow_up_actions || '',
    aiSuggestedFollowUps: apiInt.follow_up_actions ? [apiInt.follow_up_actions] : [],
  };
};

// Async Thunks
export const fetchInteractionsThunk = createAsyncThunk(
  'interaction/fetchAll',
  async (_, thunkAPI) => {
    const state = thunkAPI.getState() as any;
    const hcpList = state.hcp.list;
    const data = await interactionsApi.getInteractions();
    return data.map((item: any) => mapInteractionFromApi(item, hcpList));
  }
);

export const createInteractionThunk = createAsyncThunk(
  'interaction/create',
  async (interactionData: Omit<Interaction, 'id'>, thunkAPI) => {
    const state = thunkAPI.getState() as any;
    const hcpList = state.hcp.list;

    const payload = {
      hcp_id: Number(interactionData.hcpId),
      interaction_type: interactionData.type,
      meeting_date: interactionData.date,
      attendees: interactionData.attendees.join(', '),
      topics_discussed: interactionData.topicsDiscussed.join(', ') + (interactionData.outcome ? ` - Outcome: ${interactionData.outcome}` : ''),
      materials_shared: interactionData.materialsShared.join(', '),
      sentiment: interactionData.sentiment,
      follow_up_actions: interactionData.followUpActions,
    };

    const result = await interactionsApi.createInteraction(payload);
    return mapInteractionFromApi(result, hcpList);
  }
);

export const deleteInteractionThunk = createAsyncThunk(
  'interaction/delete',
  async (id: string) => {
    await interactionsApi.deleteInteraction(id);
    return id;
  }
);

export const fetchInteractionByIdThunk = createAsyncThunk(
  'interaction/fetchById',
  async (id: string, thunkAPI) => {
    const state = thunkAPI.getState() as any;
    const hcpList = state.hcp.list;

    // Check if it already exists in list
    const existing = state.interaction.list.find((i: Interaction) => i.id === id);
    if (existing) {
      return existing;
    }

    // Otherwise fetch from backend API
    const data = await interactionsApi.getInteractionById(id);
    return mapInteractionFromApi(data, hcpList);
  }
);

interface InteractionState {
  list: Interaction[];
  isLoading: boolean;
  error: string | null;
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
  list: [],
  isLoading: false,
  error: null,
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
    populateDraftFromAi: (state, action: PayloadAction<{ response: any; hcpList: HCP[] }>) => {
      const { response, hcpList } = action.payload;
      const parsed = response.parsed_data || {};
      
      // Clear previous draft values entirely before populating new ones
      state.draft = {
        hcpId: '',
        hcpName: '',
        type: 'In-Person',
        date: new Date().toISOString().split('T')[0],
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
        attendees: [],
        topicsDiscussed: [],
        materialsShared: [],
        samplesDistributed: [],
        sentiment: 'Neutral',
        outcome: '',
        followUpActions: '',
        aiSuggestedFollowUps: [],
      };

      // 1. HCP Selection Logic
      let matchedHcp: HCP | undefined = undefined;
      if (response.hcp_id) {
        matchedHcp = hcpList.find((h) => String(h.id) === String(response.hcp_id));
      }
      if (!matchedHcp && response.hcp_email) {
        matchedHcp = hcpList.find((h) => h.email?.toLowerCase() === response.hcp_email.toLowerCase());
      }
      
      if (matchedHcp) {
        state.draft.hcpId = String(matchedHcp.id);
        state.draft.hcpName = matchedHcp.name;
      } else {
        state.draft.hcpId = '';
        state.draft.hcpName = '';
      }
      
      // 2. Map form fields
      if (parsed.interaction_type) {
        const rawType = parsed.interaction_type;
        if (rawType.toLowerCase().includes('in-person') || rawType.toLowerCase().includes('visit')) {
          state.draft.type = 'In-Person';
        } else if (rawType.toLowerCase().includes('video') || rawType.toLowerCase().includes('zoom') || rawType.toLowerCase().includes('teams') || rawType.toLowerCase() === 'meeting') {
          state.draft.type = 'Video Call';
        } else if (rawType.toLowerCase().includes('phone') || rawType.toLowerCase().includes('call')) {
          state.draft.type = 'Phone Call';
        } else if (rawType.toLowerCase().includes('email')) {
          state.draft.type = 'Email';
        } else if (rawType.toLowerCase().includes('seminar') || rawType.toLowerCase().includes('roundtable')) {
          state.draft.type = 'Seminar';
        } else {
          state.draft.type = 'In-Person';
        }
      }
      
      if (parsed.meeting_date) {
        state.draft.date = parsed.meeting_date;
      }
      if (parsed.meeting_time) {
        state.draft.time = parsed.meeting_time;
      }
      
      if (parsed.attendees) {
        state.draft.attendees = typeof parsed.attendees === 'string'
          ? parsed.attendees.split(',').map((s: string) => s.trim()).filter(Boolean)
          : parsed.attendees;
      }
      
      if (parsed.topics_discussed) {
        state.draft.topicsDiscussed = typeof parsed.topics_discussed === 'string'
          ? parsed.topics_discussed.split(',').map((s: string) => s.trim()).filter(Boolean)
          : parsed.topics_discussed;
      }
      
      if (parsed.materials_shared) {
        state.draft.materialsShared = typeof parsed.materials_shared === 'string'
          ? parsed.materials_shared.split(',').map((s: string) => s.trim()).filter(Boolean)
          : parsed.materials_shared;
      }
      
      if (parsed.sentiment) {
        const rawSentiment = String(parsed.sentiment).toLowerCase();
        if (rawSentiment.includes('pos')) {
          state.draft.sentiment = 'Positive';
        } else if (rawSentiment.includes('neg')) {
          state.draft.sentiment = 'Negative';
        } else {
          state.draft.sentiment = 'Neutral';
        }
      }
      
      if (parsed.follow_up_actions) {
        state.draft.followUpActions = parsed.follow_up_actions;
        state.draft.aiSuggestedFollowUps = typeof parsed.follow_up_actions === 'string'
          ? parsed.follow_up_actions.split('.').map((s: string) => s.trim()).filter(Boolean)
          : [parsed.follow_up_actions];
      }

      if (parsed.discussion_outcome) {
        state.draft.outcome = parsed.discussion_outcome;
      } else if (parsed.topics_discussed) {
        state.draft.outcome = parsed.topics_discussed;
      }
      
      if (parsed.samples_distributed) {
        if (typeof parsed.samples_distributed === 'string') {
          const samples: { productName: string; quantity: number }[] = [];
          parsed.samples_distributed.split(',').forEach((part: string) => {
            const trimmed = part.trim();
            if (!trimmed) return;
            const match = trimmed.match(/(.+?):\s*(\d+)/) || trimmed.match(/(.+?)\s+(\d+)/);
            if (match) {
              const pName = match[1].trim();
              if (pName && pName.toLowerCase() !== 'null') {
                samples.push({ productName: pName, quantity: Number(match[2]) });
              }
            } else if (trimmed && trimmed.toLowerCase() !== 'null') {
              samples.push({ productName: trimmed, quantity: 1 });
            }
          });
          state.draft.samplesDistributed = samples;
        } else if (Array.isArray(parsed.samples_distributed)) {
          state.draft.samplesDistributed = parsed.samples_distributed
            .map((s: any) => ({
              productName: s.product_name || s.productName || String(s),
              quantity: Number(s.quantity || s.qty || 1),
            }))
            .filter((s: any) => s.productName && s.productName.trim() && s.productName.trim().toLowerCase() !== 'null');
        }
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchInteractionsThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchInteractionsThunk.fulfilled, (state, action: PayloadAction<Interaction[]>) => {
        state.isLoading = false;
        state.list = action.payload;
      })
      .addCase(fetchInteractionsThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch interactions';
      })
      .addCase(createInteractionThunk.fulfilled, (state, action: PayloadAction<Interaction>) => {
        state.list.unshift(action.payload);
      })
      .addCase(deleteInteractionThunk.fulfilled, (state, action: PayloadAction<string>) => {
        state.list = state.list.filter((i) => i.id !== action.payload);
      })
      .addCase(fetchInteractionByIdThunk.fulfilled, (state, action: PayloadAction<Interaction>) => {
        const exists = state.list.some((i) => i.id === action.payload.id);
        if (!exists) {
          state.list.push(action.payload);
        }
      });
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
  populateDraftFromAi,
} = interactionSlice.actions;

export default interactionSlice.reducer;

