import React from 'react';
import { motion } from 'framer-motion';
import { Bot, User } from 'lucide-react';

interface ChatBubbleProps {
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  typing?: boolean;
}

export const ChatBubble: React.FC<ChatBubbleProps> = ({
  sender,
  text,
  timestamp,
  typing = false,
}) => {
  const isAssistant = sender === 'assistant';

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
      <div className={`flex flex-col max-w-[75%] ${isAssistant ? 'items-start' : 'items-end'}`}>
        <div
          className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
            isAssistant
              ? 'bg-slate-55 bg-slate-100 text-slate-800 rounded-tl-none border border-slate-100 shadow-sm'
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
