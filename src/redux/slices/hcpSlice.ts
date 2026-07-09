import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { HCP } from '../../types';
import { MOCK_HCPS } from '../../utils/mockData';

interface HcpState {
  list: HCP[];
  selectedHcp: HCP | null;
  filters: {
    searchQuery: string;
    specialization: string;
    city: string;
    status: string;
  };
}

const initialState: HcpState = {
  list: MOCK_HCPS,
  selectedHcp: MOCK_HCPS[0], // default select the first doctor
  filters: {
    searchQuery: '',
    specialization: 'All',
    city: 'All',
    status: 'All',
  },
};

export const hcpSlice = createSlice({
  name: 'hcp',
  initialState,
  reducers: {
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.filters.searchQuery = action.payload;
    },
    setSpecializationFilter: (state, action: PayloadAction<string>) => {
      state.filters.specialization = action.payload;
    },
    setCityFilter: (state, action: PayloadAction<string>) => {
      state.filters.city = action.payload;
    },
    setStatusFilter: (state, action: PayloadAction<string>) => {
      state.filters.status = action.payload;
    },
    selectHcp: (state, action: PayloadAction<string>) => {
      const hcp = state.list.find((h) => h.id === action.payload);
      if (hcp) {
        state.selectedHcp = hcp;
      }
    },
    addHcp: (state, action: PayloadAction<Omit<HCP, 'id' | 'lastInteraction'>>) => {
      const newHcp: HCP = {
        ...action.payload,
        id: `hcp-${state.list.length + 1}`,
        lastInteraction: 'No Interactions Yet',
      };
      state.list.unshift(newHcp);
    },
    updateHcpLastInteraction: (
      state,
      action: PayloadAction<{ id: string; date: string }>
    ) => {
      const hcp = state.list.find((h) => h.id === action.payload.id);
      if (hcp) {
        hcp.lastInteraction = action.payload.date;
      }
    },
  },
});

export const {
  setSearchQuery,
  setSpecializationFilter,
  setCityFilter,
  setStatusFilter,
  selectHcp,
  addHcp,
  updateHcpLastInteraction,
} = hcpSlice.actions;

export default hcpSlice.reducer;
