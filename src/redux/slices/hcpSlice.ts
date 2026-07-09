import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { HCP } from '../../types';
import { hcpsApi, HCPCreateInput, HCPUpdateInput } from '../../api/hcps';

// Helper to map API models to frontend HCP interface
export const mapHcpFromApi = (apiHcp: any): HCP => ({
  id: String(apiHcp.id),
  name: apiHcp.name,
  specialization: apiHcp.specialization,
  hospital: apiHcp.hospital,
  city: apiHcp.city || '',
  email: apiHcp.email || '',
  phone: apiHcp.phone || '',
  status: apiHcp.status || 'Active',
  lastInteraction: 'No Interactions Yet',
});

// Async Thunks
export const fetchHcpsThunk = createAsyncThunk(
  'hcp/fetchAll',
  async () => {
    const data = await hcpsApi.getHcps();
    return data.map(mapHcpFromApi);
  }
);

export const createHcpThunk = createAsyncThunk(
  'hcp/create',
  async (hcpData: HCPCreateInput) => {
    const data = await hcpsApi.createHcp(hcpData);
    return mapHcpFromApi(data);
  }
);

export const updateHcpThunk = createAsyncThunk(
  'hcp/update',
  async ({ id, data }: { id: string; data: HCPUpdateInput }) => {
    const result = await hcpsApi.updateHcp(id, data);
    return mapHcpFromApi(result);
  }
);

export const deleteHcpThunk = createAsyncThunk(
  'hcp/delete',
  async (id: string) => {
    await hcpsApi.deleteHcp(id);
    return id;
  }
);

interface HcpState {
  list: HCP[];
  selectedHcp: HCP | null;
  isLoading: boolean;
  error: string | null;
  filters: {
    searchQuery: string;
    specialization: string;
    city: string;
    status: string;
  };
}

const initialState: HcpState = {
  list: [],
  selectedHcp: null,
  isLoading: false,
  error: null,
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
  extraReducers: (builder) => {
    builder
      .addCase(fetchHcpsThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchHcpsThunk.fulfilled, (state, action: PayloadAction<HCP[]>) => {
        state.isLoading = false;
        state.list = action.payload;
        if (action.payload.length > 0) {
          const currentSelect = state.selectedHcp;
          const stillExists = currentSelect ? action.payload.find((h) => h.id === currentSelect.id) : null;
          state.selectedHcp = stillExists || action.payload[0];
        } else {
          state.selectedHcp = null;
        }
      })
      .addCase(fetchHcpsThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch HCPs';
      })
      .addCase(createHcpThunk.fulfilled, (state, action: PayloadAction<HCP>) => {
        state.list.unshift(action.payload);
        if (!state.selectedHcp) {
          state.selectedHcp = action.payload;
        }
      })
      .addCase(updateHcpThunk.fulfilled, (state, action: PayloadAction<HCP>) => {
        const index = state.list.findIndex((h) => h.id === action.payload.id);
        if (index !== -1) {
          state.list[index] = {
            ...state.list[index],
            ...action.payload,
          };
          if (state.selectedHcp?.id === action.payload.id) {
            state.selectedHcp = state.list[index];
          }
        }
      })
      .addCase(deleteHcpThunk.fulfilled, (state, action: PayloadAction<string>) => {
        state.list = state.list.filter((h) => h.id !== action.payload);
        if (state.selectedHcp?.id === action.payload) {
          state.selectedHcp = state.list.length > 0 ? state.list[0] : null;
        }
      });
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

