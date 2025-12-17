import React, { useState, useRef, useEffect } from 'react';

interface InputAreaProps {
  onSend: (text: string, image?: File) => void;
  disabled: boolean;
}

const InputArea: React.FC<InputAreaProps> = ({ onSend, disabled }) => {
  const [text, setText] = useState('');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [text]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedImage(file);
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
  };

  const handleSend = () => {
    if ((!text.trim() && !selectedImage) || disabled) return;
    
    onSend(text, selectedImage || undefined);
    setText('');
    setSelectedImage(null);
    setImagePreview(null);
    
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="bg-white border-t border-slate-200 p-4 pb-6 sticky bottom-0 z-20">
      <div className="max-w-3xl mx-auto flex flex-col gap-3">
        
        {/* Image Preview Area */}
        {imagePreview && (
          <div className="relative inline-block w-fit">
            <img 
              src={imagePreview} 
              alt="Preview" 
              className="h-20 w-auto rounded-lg border border-slate-200 shadow-sm"
            />
            <button
              onClick={removeImage}
              className="absolute -top-2 -right-2 bg-slate-800 text-white rounded-full p-1 hover:bg-red-500 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
        )}

        <div className="flex items-end gap-2 bg-slate-50 border border-slate-200 rounded-2xl p-2 focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-indigo-500 transition-all shadow-sm">
          
          {/* File Input Button */}
          <div className="relative">
             <input
              type="file"
              accept="image/*"
              onChange={handleImageSelect}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
              disabled={disabled}
              id="file-upload"
            />
            <button
              type="button"
              disabled={disabled}
              className={`p-2.5 rounded-xl transition-colors ${
                disabled 
                  ? 'text-slate-300' 
                  : 'text-slate-500 hover:bg-slate-200 hover:text-indigo-600'
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                <circle cx="8.5" cy="8.5" r="1.5"></circle>
                <polyline points="21 15 16 10 5 21"></polyline>
              </svg>
            </button>
          </div>

          {/* Text Area */}
          <textarea
            ref={textareaRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={disabled ? "Waiting for response..." : "Ask a question or explain your thought process..."}
            disabled={disabled}
            rows={1}
            className="flex-1 bg-transparent border-none focus:ring-0 resize-none py-3 px-1 max-h-32 min-h-[44px] text-slate-800 placeholder:text-slate-400"
          />

          {/* Send Button */}
          <button
            onClick={handleSend}
            disabled={disabled || (!text.trim() && !selectedImage)}
            className={`p-2.5 rounded-xl transition-all duration-200 ${
              disabled || (!text.trim() && !selectedImage)
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-md hover:shadow-lg'
            }`}
          >
            {disabled ? (
              <div className="w-5 h-5 border-2 border-slate-400 border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13"></line>
                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
              </svg>
            )}
          </button>
        </div>
        <div className="text-center">
            <p className="text-[10px] text-slate-400">
                AI can make mistakes. Please double check important information.
            </p>
        </div>
      </div>
    </div>
  );
};

export default InputArea;
