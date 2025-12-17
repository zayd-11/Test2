import React from 'react';
import ReactMarkdown from 'react-markdown';
import { ChatMessage, Role } from '../types';

interface MessageBubbleProps {
  message: ChatMessage;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const isUser = message.role === Role.USER;

  return (
    <div className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'} mb-6`}>
      <div className={`flex flex-col max-w-[85%] md:max-w-[70%] ${isUser ? 'items-end' : 'items-start'}`}>
        
        {/* Avatar / Name */}
        <span className={`text-xs text-slate-400 mb-1 ${isUser ? 'mr-1' : 'ml-1'}`}>
          {isUser ? 'You' : 'Tutor'}
        </span>

        {/* Bubble */}
        <div
          className={`px-5 py-4 rounded-2xl shadow-sm text-sm md:text-base leading-relaxed overflow-hidden
            ${
              isUser
                ? 'bg-indigo-600 text-white rounded-br-sm'
                : 'bg-white border border-slate-100 text-slate-800 rounded-bl-sm'
            }
          `}
        >
          {message.image && (
            <div className="mb-3 rounded-lg overflow-hidden border border-white/20">
              <img 
                src={message.image} 
                alt="Uploaded content" 
                className="max-h-64 object-cover w-full bg-slate-100"
              />
            </div>
          )}
          
          <div className={`markdown-body ${isUser ? 'text-white' : 'text-slate-800'}`}>
            <ReactMarkdown
              components={{
                code({ className, children, ...props }) {
                  const match = /language-(\w+)/.exec(className || '')
                  return (
                    <code className={`${className} ${isUser ? 'bg-indigo-700' : 'bg-slate-100'} px-1 py-0.5 rounded font-mono text-xs`} {...props}>
                      {children}
                    </code>
                  )
                },
                // Style paragraphs to have spacing
                p({ children }) {
                    return <p className="mb-2 last:mb-0">{children}</p>
                }
              }}
            >
              {message.text}
            </ReactMarkdown>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;
