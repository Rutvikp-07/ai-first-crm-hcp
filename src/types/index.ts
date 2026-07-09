export interface HCP {
  id: string;
  name: string;
  specialization: string;
  hospital: string;
  city: string;
  lastInteraction: string;
  status: 'Active' | 'Inactive' | 'Pending';
  email: string;
  phone: string;
  avatar?: string;
  address?: string;
  notes?: string;
}

export type InteractionType = 'In-Person' | 'Video Call' | 'Phone Call' | 'Email' | 'Seminar';

export type SentimentType = 'Positive' | 'Neutral' | 'Negative';

export interface Interaction {
  id: string;
  hcpId: string;
  hcpName: string;
  type: InteractionType;
  date: string;
  time: string;
  attendees: string[];
  topicsDiscussed: string[];
  voiceNoteUrl?: string;
  voiceNoteDuration?: string;
  materialsShared: string[];
  samplesDistributed: { productName: string; quantity: number }[];
  sentiment: SentimentType;
  outcome: string;
  followUpActions: string;
  aiSuggestedFollowUps: string[];
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  typing?: boolean;
  isAiCard?: boolean;
  aiCardData?: {
    success: boolean;
    doctorName?: string;
    hospital?: string;
    interactionType?: string;
    meetingDate?: string;
    sentiment?: string;
    topics?: string[];
    materialsShared?: string[];
    samplesDistributed?: { productName: string; quantity: number }[];
    outcome?: string;
    followUpActions?: string;
    followUpActionsList?: string[];
    confidenceIndicators?: {
      doctorIdentified: boolean;
      emailMatched: boolean;
      hcpFoundInCrm: boolean;
      interactionLogged: boolean;
      sentimentDetected: boolean;
    };
    errorMsg?: string;
    missingEmail?: string;
    multipleMatches?: { id: string; name: string; email: string; hospital: string }[];
  };
}

export interface Product {
  id: string;
  name: string;
  category: string;
}

export interface SharedMaterial {
  id: string;
  name: string;
  type: 'Clinical Trial' | 'Brochure' | 'Presentation' | 'Safety Data Sheet';
}

export interface DashboardStats {
  totalHCPs: number;
  totalInteractions: number;
  sentimentTrend: { positive: number; neutral: number; negative: number };
  pendingFollowups: number;
  meetingsThisWeek: number;
}
