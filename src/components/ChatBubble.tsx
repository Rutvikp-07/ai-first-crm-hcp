import React from 'react';
import { motion } from 'framer-motion';
import { Bot, User, CheckCircle2, AlertTriangle, Calendar, Building, Clock, Plus, History } from 'lucide-react';
import Badge from './Badge';
import Button from './Button';

interface ChatBubbleProps {
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
  onCreateHcp?: () => void;
  onSelectHcp?: (hcpId: string, hcpName: string) => void;
}

export const ChatBubble: React.FC<ChatBubbleProps> = ({
  sender,
  text,
  timestamp,
  typing = false,
  isAiCard = false,
  aiCardData,
  onCreateHcp,
  onSelectHcp,
}) => {
  const isAssistant = sender === 'assistant';

  const renderCardContent = () => {
    if (!aiCardData) return null;

    if (aiCardData.multipleMatches && aiCardData.multipleMatches.length > 0) {
      return (
        <div className="flex flex-col gap-3 bg-white border border-slate-100 rounded-xl p-4 shadow-sm w-full mt-2 border-l-4 border-l-amber-500 text-left select-text animate-fade-in">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-2 select-none">
            <AlertTriangle className="h-4.5 w-4.5 text-amber-500 shrink-0" />
            <h4 className="text-xs font-bold text-slate-800">Multiple Matching Doctors</h4>
          </div>

          <div className="flex flex-col gap-2.5 text-xs text-slate-600 font-medium leading-relaxed">
            <p>We found multiple profiles matching your search parameters. Please select the correct doctor below:</p>

            <select
              onChange={(e) => {
                const selectedId = e.target.value;
                const matched = aiCardData.multipleMatches?.find(h => String(h.id) === String(selectedId));
                if (matched && onSelectHcp) {
                  onSelectHcp(matched.id, matched.name);
                }
              }}
              defaultValue=""
              className="w-full bg-white border border-slate-200 text-xs px-3 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-800 cursor-pointer font-semibold"
            >
              <option value="" disabled>-- Select Doctor Profile --</option>
              {aiCardData.multipleMatches.map((doc) => (
                <option key={doc.id} value={doc.id}>
                  {doc.name} ({doc.hospital} - {doc.email})
                </option>
              ))}
            </select>
          </div>
        </div>
      );
    }

    if (aiCardData.success) {
      return (
        <div className="flex flex-col gap-4 bg-slate-50 border border-slate-150 rounded-xl p-4 shadow-sm w-full mt-2 border-l-4 border-l-emerald-500 text-left select-text">
          {/* Section 1: AI Analysis Card */}
          <div className="bg-white border border-slate-150 rounded-xl p-3.5 flex flex-col gap-3 shadow-sm select-none">
            <h4 className="text-xs font-bold text-slate-800 border-b border-slate-100 pb-2 uppercase tracking-wider flex items-center gap-1.5">
              <Bot className="h-4 w-4 text-brand-500 shrink-0" />
              AI Analysis
            </h4>

            {aiCardData.outcome && (
              <div className="flex flex-col gap-1">
                <span className="text-[9px] font-bold text-slate-400 uppercase">Meeting Summary</span>
                <p className="text-xs text-slate-655 leading-relaxed font-semibold italic bg-slate-50 p-2 rounded-lg border border-slate-100">
                  "{aiCardData.outcome}"
                </p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-x-3 gap-y-2 text-[11px] font-semibold">
              <div className="flex flex-col">
                <span className="text-[9px] font-bold text-slate-400 uppercase">Doctor</span>
                <span className="text-slate-800 mt-0.5">{aiCardData.doctorName || 'No information extracted'}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[9px] font-bold text-slate-400 uppercase">Hospital</span>
                <span className="text-slate-800 mt-0.5">{aiCardData.hospital || 'No information extracted'}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[9px] font-bold text-slate-400 uppercase">Interaction</span>
                <span className="text-slate-800 mt-0.5">{aiCardData.interactionType || 'No information extracted'}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[9px] font-bold text-slate-400 uppercase">Sentiment</span>
                <span className="mt-0.5">
                  {aiCardData.sentiment ? (
                    <Badge
                      variant={
                        aiCardData.sentiment === 'Positive'
                          ? 'sentiment-positive'
                          : aiCardData.sentiment === 'Negative'
                          ? 'sentiment-negative'
                          : 'sentiment-neutral'
                      }
                      className="text-[9px] font-bold px-2 py-0.5"
                    >
                      {aiCardData.sentiment}
                    </Badge>
                  ) : (
                    'Neutral'
                  )}
                </span>
              </div>
            </div>
          </div>

          {/* Section 2: Extracted Information Card */}
          <div className="bg-white border border-slate-150 rounded-xl p-3.5 flex flex-col gap-3 shadow-sm select-none">
            <h4 className="text-xs font-bold text-slate-800 border-b border-slate-100 pb-2 uppercase tracking-wider flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
              Extracted Information
            </h4>

            {/* Topics */}
            <div className="flex flex-col gap-1">
              <span className="text-[9px] font-bold text-slate-400 uppercase">Topics</span>
              {aiCardData.topics && aiCardData.topics.length > 0 ? (
                <div className="flex flex-col gap-1 mt-0.5">
                  {aiCardData.topics.map((t, idx) => (
                    <div key={idx} className="text-xs text-slate-700 flex items-center gap-1.5 font-medium">
                      <span className="text-emerald-500 font-bold">✓</span>
                      <span>{t}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <span className="text-xs text-slate-400 italic">No information extracted</span>
              )}
            </div>

            {/* Materials */}
            <div className="flex flex-col gap-1 border-t border-slate-100 pt-2">
              <span className="text-[9px] font-bold text-slate-400 uppercase">Materials</span>
              {aiCardData.materialsShared && aiCardData.materialsShared.length > 0 ? (
                <div className="flex flex-col gap-1 mt-0.5">
                  {aiCardData.materialsShared.map((m, idx) => (
                    <div key={idx} className="text-xs text-slate-700 flex items-center gap-1.5 font-medium">
                      <span className="text-emerald-500 font-bold">✓</span>
                      <span>{m}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <span className="text-xs text-slate-400 italic">No information extracted</span>
              )}
            </div>

            {/* Samples */}
            <div className="flex flex-col gap-1 border-t border-slate-100 pt-2">
              <span className="text-[9px] font-bold text-slate-400 uppercase">Samples</span>
              {aiCardData.samplesDistributed && aiCardData.samplesDistributed.length > 0 ? (
                <div className="flex flex-col gap-1 mt-0.5">
                  {aiCardData.samplesDistributed.map((sm, idx) => (
                    <div key={idx} className="text-xs text-slate-700 flex items-center gap-1.5 font-medium">
                      <span className="text-emerald-500 font-bold">✓</span>
                      <span>{sm.productName} × {sm.quantity}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <span className="text-xs text-slate-400 italic">No information extracted</span>
              )}
            </div>

            {/* Follow-up */}
            <div className="flex flex-col gap-1 border-t border-slate-100 pt-2">
              <span className="text-[9px] font-bold text-slate-400 uppercase">Follow-up</span>
              {aiCardData.followUpActionsList && aiCardData.followUpActionsList.length > 0 ? (
                <div className="flex flex-col gap-1 mt-0.5">
                  {aiCardData.followUpActionsList.map((a, idx) => (
                    <div key={idx} className="text-xs text-slate-700 flex items-center gap-1.5 font-medium">
                      <span className="text-emerald-500 font-bold">✓</span>
                      <span>{a}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <span className="text-xs text-slate-400 italic">No information extracted</span>
              )}
            </div>
          </div>

          {/* Section 3: CRM Status Card */}
          <div className="bg-white border border-slate-150 rounded-xl p-3.5 flex flex-col gap-3 shadow-sm select-none">
            <h4 className="text-xs font-bold text-slate-800 border-b border-slate-100 pb-2 uppercase tracking-wider flex items-center gap-1.5">
              <History className="h-4 w-4 text-indigo-500 shrink-0" />
              CRM Status
            </h4>

            <div className="grid grid-cols-1 gap-2 text-xs font-semibold text-slate-700">
              <div className="flex items-center justify-between">
                <span>Doctor Found</span>
                <span className={aiCardData.confidenceIndicators?.doctorIdentified ? "text-emerald-600 font-bold" : "text-slate-400"}>
                  {aiCardData.confidenceIndicators?.doctorIdentified ? "✓ Found" : "○ Not Found"}
                </span>
              </div>
              <div className="flex items-center justify-between border-t border-slate-50 pt-1.5">
                <span>Interaction Saved</span>
                <span className={aiCardData.confidenceIndicators?.interactionLogged ? "text-emerald-600 font-bold" : "text-slate-400"}>
                  {aiCardData.confidenceIndicators?.interactionLogged ? "✓ Saved to CRM" : "○ Pending"}
                </span>
              </div>
              <div className="flex items-center justify-between border-t border-slate-50 pt-1.5">
                <span>Database Updated</span>
                <span className={aiCardData.confidenceIndicators?.hcpFoundInCrm ? "text-emerald-600 font-bold" : "text-slate-400"}>
                  {aiCardData.confidenceIndicators?.hcpFoundInCrm ? "✓ Synced" : "○ Pending Sync"}
                </span>
              </div>
            </div>
          </div>
          
          <div className="text-[10px] text-slate-400 italic text-center select-none pt-1">
            Interaction has been saved and added to the doctor's history.
          </div>
        </div>
      );
    } else {
      return (
        <div className="flex flex-col gap-3 bg-white border border-slate-100 rounded-xl p-4 shadow-sm w-full mt-2 border-l-4 border-l-rose-500 text-left select-text">
          {/* Header */}
          <div className="flex items-center gap-2 border-b border-slate-100 pb-2 select-none">
            <AlertTriangle className="h-4.5 w-4.5 text-rose-500 shrink-0" />
            <h4 className="text-xs font-bold text-slate-800">Unable to Process Interaction</h4>
          </div>

          <div className="flex flex-col gap-2 text-xs text-slate-655 font-medium leading-relaxed">
            <p className="text-slate-600">{aiCardData.errorMsg}</p>

            {aiCardData.missingEmail && (
              <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-100 flex flex-col gap-1">
                <span className="text-[9px] font-bold text-rose-500 uppercase tracking-wide">Missing Doctor Email</span>
                <span className="font-mono text-xs font-bold text-rose-700 break-all select-all">{aiCardData.missingEmail}</span>
              </div>
            )}

            <p className="text-slate-450 text-slate-400 mt-1 select-none">Please register the doctor profile in PharmaFlow CRM database first to log notes.</p>
          </div>

          {onCreateHcp && (
            <div className="border-t border-slate-100 pt-3.5 flex justify-end select-none">
              <Button
                type="button"
                size="sm"
                onClick={onCreateHcp}
                className="bg-brand-500 text-white font-semibold text-xs flex items-center gap-1 shadow-soft"
              >
                <Plus className="h-3.5 w-3.5" />
                Create HCP Profile
              </Button>
            </div>
          )}
        </div>
      );
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className={`flex gap-3 w-full my-2.5 ${isAssistant ? 'justify-start' : 'justify-end'}`}
    >
      {/* Icon Badge */}
      {isAssistant && (
        <div className="h-8 w-8 rounded-lg bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center shrink-0 shadow-sm mt-0.5">
          <Bot className="h-4.5 w-4.5" />
        </div>
      )}

      {/* Bubble Content */}
      <div className={`flex flex-col max-w-[85%] ${isAssistant ? 'items-start font-sans' : 'items-end'}`}>
        {isAiCard ? (
          renderCardContent()
        ) : (
          <div
            className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
              isAssistant
                ? 'bg-slate-100 text-slate-800 rounded-tl-none border border-slate-100 shadow-sm'
                : 'bg-brand-500 text-white rounded-tr-none shadow-soft'
            }`}
          >
            {typing ? (
              <div className="flex items-center gap-1 py-1 px-2 select-none">
                <span className="w-1.5 h-1.5 bg-current rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-1.5 h-1.5 bg-current rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-1.5 h-1.5 bg-current rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            ) : (
              <p className="whitespace-pre-line">{text}</p>
            )}
          </div>
        )}
        <span className="text-[10px] text-slate-400 mt-1 select-none font-medium px-1">
          {timestamp}
        </span>
      </div>

      {!isAssistant && (
        <div className="h-8 w-8 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-650 flex items-center justify-center shrink-0 shadow-sm mt-0.5">
          <User className="h-4.5 w-4.5 text-brand-500" />
        </div>
      )}
    </motion.div>
  );
};

export default ChatBubble;
