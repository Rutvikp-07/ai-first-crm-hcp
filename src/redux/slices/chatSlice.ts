import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ChatMessage } from '../../types';

interface ChatState {
  history: ChatMessage[];
  isTyping: boolean;
  suggestedPrompts: string[];
}

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
});

export const { addMessage, setTyping, clearChat } = chatSlice.actions;

export default chatSlice.reducer;
