'use client';
import { useState, useEffect, useRef, FormEvent, useCallback } from 'react';
import { Message } from '@/app/types';
import ChatMessages from '@/app/components/ChatMessages';
import UserInput from '@/app/components/UserInput';
import FileUpload from '@/app/components/FileUpload';
import LoadingSkeleton from '@/app/components/LoadingSkeleton';
import EmptyState from '@/app/components/EmptyState';
import ErrorState from '@/app/components/ErrorState';

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isInitialLoading, setIsInitialLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const fetchMessages = useCallback(async () => {
    setIsInitialLoading(true);
    setError(null); // Clear previous errors
    try {
      const response = await fetch('/api/chat');
      if (!response.ok) throw new Error('Network response was not ok.');
      const data = await response.json();
      if (data.success) {
        setMessages(data.messages);
      } else {
        throw new Error(data.error || 'Failed to fetch messages.');
      }
    } catch (err) {
      console.error('Fetch error:', err);
      setError('Could not connect to the server. Please check your connection and try again.');
    } finally {
      setIsInitialLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);
  
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    setIsLoading(true);
    const tempUserMessage: Message = { id: `temp-${Date.now()}`, role: 'user', content: input, created_at: new Date().toISOString() };
    setMessages(prev => [...prev, tempUserMessage]);
    setInput('');

    try {
      await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input }),
      });
      await fetchMessages();
    } catch (error) {
      console.error('Failed to send message:', error);
      setError('Failed to send message. Please try again.'); // Optionally show error in UI
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to render the main content based on state
  const renderMainContent = () => {
    if (isInitialLoading) {
      return <LoadingSkeleton />;
    }
    if (error) {
      return <ErrorState message={error} onRetry={fetchMessages} />;
    }
    if (!messages || messages.length === 0) {
      return <EmptyState />;
    }
    return <ChatMessages messages={messages} />;
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100 font-sans">
      <header className="bg-white shadow-md p-4 border-b">
        <h1 className="text-xl font-bold text-center text-gray-800">AI Vector Image Search</h1>
      </header>
      
      <main className="flex-1 overflow-y-auto p-4">
        {renderMainContent()}
        <div ref={chatEndRef} />
      </main>
      
      <footer className="bg-white p-4 border-t-2">
        <FileUpload onUploadComplete={fetchMessages} />
        <UserInput 
          input={input} 
          setInput={setInput} 
          isLoading={isLoading || isInitialLoading} 
          onSendMessage={handleSendMessage} 
        />
      </footer>
    </div>
  );
}