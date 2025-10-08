'use client';

import { useState, useRef, useEffect } from 'react';
import { Message, SearchResult } from '../types';

export function ImageChat() {
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load messages on component mount
  useEffect(() => {
    loadMessages();
  }, []);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadMessages = async () => {
    try {
      const response = await fetch('/api/chat');
      const data = await response.json();
      
      if (data.success) {
        setMessages(data.messages);
      }
    } catch (error) {
      console.error('Failed to load messages:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = input;
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        // Reload all messages to get the latest from database
        await loadMessages();
      }
    } catch (error) {
      console.error('Chat error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check file size (limit to 4MB)
    if (file.size > 4 * 1024 * 1024) {
      alert('File too large. Please upload an image smaller than 4MB.');
      return;
    }

    setIsUploading(true);
    
    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();
      
      if (result.success) {
        // Reload messages to show the upload in chat
        await loadMessages();
      } else {
        alert(result.error);
      }
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Upload failed. Please try again.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Function to render image preview
  const renderImagePreview = (metadata: any) => {
    if (!metadata?.imageUrl) return null;

    return (
      <div className="mt-3 p-3 bg-gray-50 rounded-lg border">
        <div className="flex items-center gap-3">
          <img 
            src={metadata.imageUrl} 
            alt="Uploaded preview"
            className="w-20 h-20 object-cover rounded-lg border"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
          <div className="flex-1">
            <div className="text-sm font-medium text-gray-900">
              {metadata.filename || 'Uploaded Image'}
            </div>
            {metadata.description && (
              <div className="text-xs text-gray-600 mt-1">
                {metadata.description}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Function to render search results with images
  const renderSearchResults = (metadata: any) => {
    if (!metadata?.searchResults || metadata.searchResults.length === 0) return null;

    return (
      <div className="mt-4 space-y-4">
        <h4 className="font-semibold text-lg text-green-600">📸 Matching Images:</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {metadata.searchResults.map((result: SearchResult, index: number) => (
            <div key={result.id} className="border rounded-lg p-4 bg-white shadow-sm hover:shadow-md transition-shadow">
              <div className="aspect-square mb-3 bg-gray-100 rounded-lg overflow-hidden">
                {result.imageUrl ? (
                  <img 
                    src={result.imageUrl} 
                    alt={result.description}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    📷 No Image
                  </div>
                )}
              </div>
              <div className="text-sm">
                <div className="font-medium text-gray-900 truncate" title={result.filename}>
                  {result.filename}
                </div>
                <div className="text-green-600 font-semibold">{result.similarity} match</div>
                <div className="text-gray-600 text-xs mt-1 line-clamp-3" title={result.description}>
                  {result.description}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Clear chat history
  const clearChat = async () => {
    if (confirm('Are you sure you want to clear all chat history?')) {
      try {
        const response = await fetch('/api/chat', { method: 'DELETE' });
        if (response.ok) {
          setMessages([]);
        }
      } catch (error) {
        console.error('Failed to clear chat:', error);
      }
    }
  };

  return (
    <div className="flex flex-col h-screen max-w-6xl mx-auto p-4 bg-white rounded-lg shadow-lg">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-bold text-gray-800">AI Image Search</h1>
          <button
            onClick={clearChat}
            className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
          >
            Clear Chat
          </button>
        </div>
        <p className="text-gray-600">Upload images and search using natural language</p>
        <div className="flex justify-center gap-4 mt-4 text-sm text-gray-500">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            Type anything to search images
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            All chats are saved automatically
          </div>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto mb-4 space-y-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
        {messages.length === 0 && (
          <div className="text-center text-gray-500 py-8">
            <div className="text-4xl mb-4">🖼️</div>
            <p className="text-lg font-semibold">Welcome to AI Image Search!</p>
            <p className="mt-2">You can:</p>
            <div className="mt-4 space-y-2 text-sm">
              <div className="flex items-center justify-center gap-2">
                <span className="bg-green-100 text-green-800 px-2 py-1 rounded">📁</span>
                <span>Upload images using the upload button</span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">💬</span>
                <span>Type anything to search your image collection</span>
              </div>
            </div>
            <p className="mt-4 text-xs text-orange-600">
              💡 Example: "Show me landscape photos" or "Find images with dogs"
            </p>
          </div>
        )}
        
        {messages.map((message) => (
          <div key={message.id}>
            <div
              className={`p-4 rounded-lg max-w-[80%] ${
                message.role === 'user' 
                  ? 'bg-blue-500 text-white ml-auto' 
                  : 'bg-white text-gray-800 mr-auto border'
              }`}
            >
              <div className="whitespace-pre-wrap">{message.content}</div>
              
              {/* Show image preview for upload messages */}
              {message.metadata?.preview && message.metadata?.imageUrl && (
                renderImagePreview(message.metadata)
              )}
            </div>
            
            {/* Display search results with images for assistant messages */}
            {message.role === 'assistant' && message.metadata?.searchResults && (
              <div className="mt-2 mr-auto max-w-[80%]">
                {renderSearchResults(message.metadata)}
              </div>
            )}
          </div>
        ))}
        
        {(isUploading || isLoading) && (
          <div className="p-4 rounded-lg bg-white border mr-auto max-w-[80%]">
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
              <span>
                {isUploading ? 'Uploading and processing image...' : 'Searching your image collection...'}
              </span>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Action Buttons - Only Upload now */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={handleUploadClick}
          disabled={isUploading || isLoading}
          className="flex-1 bg-green-500 text-white p-3 rounded-lg hover:bg-green-600 disabled:opacity-50 transition-colors flex items-center justify-center space-x-2 font-medium"
        >
          <span>📁</span>
          <span>{isUploading ? 'Uploading...' : 'Upload Image'}</span>
        </button>
      </div>

      {/* Chat Input */}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Describe the images you're looking for..."
          className="flex-1 p-3 border text-black border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          className="bg-blue-500 text-white p-3 rounded-lg hover:bg-blue-600 disabled:opacity-50 transition-colors min-w-[80px] font-medium"
        >
          {isLoading ? '...' : 'Search'}
        </button>
      </form>

      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"

      />
    </div>
  );
}