import React, { useState, useRef, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { ChatMessage, Role } from './types';
import { sendMessageToGemini } from './services/geminiService';
import MessageBubble from './components/MessageBubble';
import InputArea from './components/InputArea';
import ThinkingIndicator from './components/ThinkingIndicator';

const App: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Initial greeting
  useEffect(() => {
    setMessages([
      {
        id: 'init-1',
        role: Role.MODEL,
        text: "Hello! I'm your Socratic Math Tutor. \n\nI'm here to help you understand math, not just solve it. Feel free to upload a picture of a problem or ask me a question. We'll take it one step at a time!",
        timestamp: Date.now(),
      }
    ]);
  }, []);

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSendMessage = async (text: string, imageFile?: File) => {
    if (!text && !imageFile) return;

    setIsLoading(true);

    let imageBase64: string | undefined;
    
    // Process image if exists
    if (imageFile) {
      try {
        imageBase64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(imageFile);
        });
      } catch (error) {
        console.error("Error reading file", error);
        setIsLoading(false);
        return; // Handle error appropriately in UI
      }
    }

    // Add user message to state
    const newUserMessage: ChatMessage = {
      id: uuidv4(),
      role: Role.USER,
      text: text,
      image: imageBase64,
      timestamp: Date.now(),
    };

    const updatedMessages = [...messages, newUserMessage];
    setMessages(updatedMessages);

    try {
      // API Call
      const responseText = await sendMessageToGemini(
        updatedMessages.slice(0, -1), // Send history excluding the new message (service handles adding it to proper format if needed, or we just pass all)
        // Actually, my service design takes history + current parts. 
        // Let's pass the *previous* messages as history, and the new data as current.
        text,
        imageBase64,
        imageFile?.type
      );

      const newModelMessage: ChatMessage = {
        id: uuidv4(),
        role: Role.MODEL,
        text: responseText,
        timestamp: Date.now(),
      };

      setMessages(prev => [...prev, newModelMessage]);
    } catch (error) {
      console.error("Failed to get response", error);
      const errorMessage: ChatMessage = {
        id: uuidv4(),
        role: Role.MODEL,
        text: "I'm sorry, I encountered an error while thinking about that. Please try again.",
        timestamp: Date.now(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
              <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800">Socratic Math Tutor</h1>
            <p className="text-xs text-slate-500 font-medium">Patient • Step-by-Step • Understanding</p>
          </div>
        </div>
      </header>

      {/* Chat Area */}
      <main className="flex-1 overflow-y-auto p-4 md:p-6 scroll-smooth">
        <div className="max-w-3xl mx-auto flex flex-col min-h-full">
          {/* Empty State / Logo */}
          {messages.length === 0 && (
             <div className="flex-1 flex flex-col items-center justify-center text-slate-300 opacity-50">
                <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
                  <line x1="12" y1="17" x2="12.01" y2="17"></line>
                </svg>
                <p className="mt-4 font-light">Ready to learn</p>
             </div>
          )}

          {/* Messages */}
          <div className="flex-1">
            {messages.map((msg) => (
              <MessageBubble key={msg.id} message={msg} />
            ))}
            
            {/* Thinking Indicator */}
            {isLoading && (
              <div className="flex justify-start mb-6">
                <div className="ml-1">
                   <div className="text-xs text-slate-400 mb-1 ml-1">Tutor</div>
                   <ThinkingIndicator />
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        </div>
      </main>

      {/* Input Area */}
      <InputArea onSend={handleSendMessage} disabled={isLoading} />
    </div>
  );
};

export default App;
