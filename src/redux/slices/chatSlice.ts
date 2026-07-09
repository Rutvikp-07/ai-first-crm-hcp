import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { ChatMessage } from '../../types';
import { agentApi } from '../../api/agent';
import { fetchHcpsThunk } from './hcpSlice';
import { populateDraftFromAi } from './interactionSlice';
import { addNotification } from './uiSlice';

interface ChatState {
  history: ChatMessage[];
  isTyping: boolean;
  suggestedPrompts: string[];
  processedNotesCount: number;
  isLoading: boolean;
  error: string | null;
}

// Async Thunk
export const processNotesThunk = createAsyncThunk(
  'chat/processNotes',
  async (rawText: string, thunkAPI) => {
    // Call AI Agent endpoint
    const result = await agentApi.processNotes(rawText);
    
    // Sync HCP list so the form dropdown is up-to-date
    await thunkAPI.dispatch(fetchHcpsThunk() as any);
    
    const state = thunkAPI.getState() as any;
    const hcpList = state.hcp.list;
    
    // Auto-fill draft form
    thunkAPI.dispatch(populateDraftFromAi({ response: result, hcpList }));
    
    let matchedHcp = null;
    if (result.hcp_id) {
      matchedHcp = hcpList.find((h: any) => String(h.id) === String(result.hcp_id));
    }
    if (!matchedHcp && result.hcp_email) {
      matchedHcp = hcpList.find((h: any) => h.email?.toLowerCase() === result.hcp_email.toLowerCase());
    }

    // Check for errors in response
    if (result.errors && result.errors.length > 0) {
      const hcpError = result.errors.find((e: string) => e.toLowerCase().includes('hcp') || e.toLowerCase().includes('not found'));
      if (hcpError) {
        thunkAPI.dispatch(addNotification({
          title: 'HCP Not Found',
          message: 'HCP not found in CRM.',
          type: 'warning',
        }));
      } else {
        thunkAPI.dispatch(addNotification({
          title: 'AI Extraction Error',
          message: result.errors[0] || 'Unable to extract meeting details.',
          type: 'warning',
        }));
      }
    } else {
      if (!matchedHcp) {
        thunkAPI.dispatch(addNotification({
          title: 'HCP Not Found',
          message: 'HCP not found. Please create the doctor profile first.',
          type: 'warning',
        }));
      }
    }
    
    return {
      result,
      matchedHcp
    };
  }
);

const initialState: ChatState = {
  history: [
    {
      id: 'msg-1',
      sender: 'assistant',
      text: "Hello! I'm your AI Assistant. You can describe your doctor meeting naturally here, and I'll help you extract the details to fill the form on the left.",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
    {
      id: 'msg-2',
      sender: 'assistant',
      text: "Try saying: 'I met Dr Ramesh Sharma today at Fortis. We discussed CardioSart patient compliance. He was very positive and requested brochure copies. I gave him 20 samples.'",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }
  ],
  isTyping: false,
  suggestedPrompts: [
    "I met Dr Ramesh Sharma today...",
    "Summarize my discussion",
    "Create follow-up actions"
  ],
  processedNotesCount: 0,
  isLoading: false,
  error: null,
};

export const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    addMessage: (state, action: PayloadAction<Omit<ChatMessage, 'id' | 'timestamp'>>) => {
      const newMessage: ChatMessage = {
        ...action.payload,
        id: `msg-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      state.history.push(newMessage);
    },
    setTyping: (state, action: PayloadAction<boolean>) => {
      state.isTyping = action.payload;
    },
    clearChat: (state) => {
      state.history = [
        {
          id: 'msg-init',
          sender: 'assistant',
          text: "Chat history cleared. Tell me about your latest interaction!",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        }
      ];
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(processNotesThunk.pending, (state) => {
        state.isTyping = true;
        state.isLoading = true;
        state.error = null;
        // Clear previous AI cards from chat history
        state.history = state.history.filter((msg) => !msg.isAiCard);
      })
      .addCase(processNotesThunk.fulfilled, (state, action) => {
        state.isTyping = false;
        state.isLoading = false;
        const { result, matchedHcp } = action.payload;
        const errors = result.errors || [];

        if (result.multiple_matches && result.multiple_matches.length > 0) {
          state.history.push({
            id: `msg-${Date.now()}`,
            sender: 'assistant',
            text: 'Multiple doctors found matching your notes. Please select the correct profile below.',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            isAiCard: true,
            aiCardData: {
              success: false,
              errorMsg: 'Multiple doctors found matching notes.',
              multipleMatches: result.multiple_matches,
              outcome: result.parsed_data?.discussion_outcome || result.parsed_data?.topics_discussed || '',
              interactionType: result.parsed_data?.interaction_type || 'Meeting',
              meetingDate: result.parsed_data?.meeting_date || null,
              sentiment: result.parsed_data?.sentiment || 'Neutral',
              topics: typeof result.parsed_data?.topics_discussed === 'string'
                ? result.parsed_data.topics_discussed.split(',').map((s: string) => s.trim()).filter(Boolean)
                : result.parsed_data?.topics_discussed || [],
              materialsShared: typeof result.parsed_data?.materials_shared === 'string'
                ? result.parsed_data.materials_shared.split(',').map((s: string) => s.trim()).filter(Boolean)
                : result.parsed_data?.materials_shared || [],
              samplesDistributed: result.parsed_data?.samples_distributed
                ? (typeof result.parsed_data.samples_distributed === 'string'
                    ? result.parsed_data.samples_distributed.split(',').map((part: string) => {
                        const match = part.match(/(.+?):\s*(\d+)/) || part.match(/(.+?)\s+(\d+)/);
                        return match ? { productName: match[1].trim(), quantity: Number(match[2]) } : { productName: part.trim(), quantity: 5 };
                      })
                    : result.parsed_data.samples_distributed)
                : [],
              followUpActionsList: typeof result.parsed_data?.follow_up_actions === 'string'
                ? result.parsed_data.follow_up_actions.split(/[\r\n\•\-\.]/).map((s: string) => s.trim()).filter(Boolean)
                : result.parsed_data?.follow_up_actions || [],
            }
          });
        } else if (errors.length > 0) {
          state.error = errors.join(', ');
          const firstErr = errors[0];
          const hasHcpErr = errors.some((e: string) => e.toLowerCase().includes('hcp') || e.toLowerCase().includes('not found'));
          
          let missingEmail = result.hcp_email || '';
          if (!missingEmail) {
            const emailMatch = firstErr.match(/[\w\.-]+@[\w\.-]+/);
            missingEmail = emailMatch ? emailMatch[0] : '';
          }
          
          state.history.push({
            id: `msg-${Date.now()}`,
            sender: 'assistant',
            text: firstErr,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            isAiCard: true,
            aiCardData: {
              success: false,
              errorMsg: hasHcpErr ? 'HCP not found in CRM.' : (firstErr || 'Unable to extract meeting details.'),
              missingEmail: missingEmail,
            }
          });
        } else {
          state.processedNotesCount += 1;
          const parsed = result.parsed_data || {};
          
          const topics = typeof parsed.topics_discussed === 'string'
            ? parsed.topics_discussed.split(',').map((s: string) => s.trim()).filter(Boolean)
            : parsed.topics_discussed || [];

          const materials = typeof parsed.materials_shared === 'string'
            ? parsed.materials_shared.split(',').map((s: string) => s.trim()).filter(Boolean)
            : parsed.materials_shared || [];

          let followUpList: string[] = [];
          if (typeof parsed.follow_up_actions === 'string') {
            followUpList = parsed.follow_up_actions
              .split(/[\r\n\•\-\.]/)
              .map((s: string) => s.trim())
              .filter(Boolean);
          } else if (Array.isArray(parsed.follow_up_actions)) {
            followUpList = parsed.follow_up_actions;
          }

          let samples: { productName: string; quantity: number }[] = [];
          if (parsed.samples_distributed) {
            if (typeof parsed.samples_distributed === 'string') {
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
            } else if (Array.isArray(parsed.samples_distributed)) {
              samples = parsed.samples_distributed
                .map((s: any) => ({
                  productName: s.product_name || s.productName || String(s),
                  quantity: Number(s.quantity || s.qty || 1),
                }))
                .filter((s: any) => s.productName && s.productName.trim() && s.productName.trim().toLowerCase() !== 'null');
            }
          }
          // NOTE: No raw-text fallback — if the AI does not extract samples, we show none.

          const outcome = parsed.discussion_outcome || parsed.topics_discussed || '';

          const confidenceIndicators = {
            doctorIdentified: !!(matchedHcp || parsed.doctor_name),
            emailMatched: !!result.hcp_email,
            hcpFoundInCrm: !!result.hcp_id,
            interactionLogged: !!result.id,
            sentimentDetected: !!parsed.sentiment,
          };
             
          state.history.push({
            id: `msg-${Date.now()}`,
            sender: 'assistant',
            text: 'Interaction processed successfully.',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            isAiCard: true,
            aiCardData: {
              success: true,
              doctorName: matchedHcp ? matchedHcp.name : (parsed.doctor_name || null),
              hospital: matchedHcp ? matchedHcp.hospital : (parsed.hospital || null),
              interactionType: parsed.interaction_type || null,
              meetingDate: parsed.meeting_date || null,
              sentiment: parsed.sentiment || null,
              topics: topics,
              materialsShared: materials,
              samplesDistributed: samples,
              outcome: outcome,
              followUpActionsList: followUpList,
              confidenceIndicators: confidenceIndicators,
            }
          });
        }
      })
      .addCase(processNotesThunk.rejected, (state, action) => {
        state.isTyping = false;
        state.isLoading = false;
        state.error = action.error.message || 'AI processing connection error';
        
        state.history.push({
          id: `msg-${Date.now()}`,
          sender: 'assistant',
          text: `⚠️ API Error: Unable to reach the AI agent. Details: ${state.error}. Please check if the backend is running.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        });
      });
  },
});

export const { addMessage, setTyping, clearChat } = chatSlice.actions;

export default chatSlice.reducer;

