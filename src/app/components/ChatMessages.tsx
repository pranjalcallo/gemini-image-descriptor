'use client';
import { Message, SearchResult } from '@/app/types';

// Simple avatar components
const UserAvatar = () => (
  <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
    You
  </div>
);

const AIAvatar = () => (
  <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-white flex-shrink-0">
    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
      <path d="M10 3.5a1.5 1.5 0 013 0V4a1 1 0 001 1h.5a1.5 1.5 0 010 3H14a1 1 0 00-1 1v.5a1.5 1.5 0 01-3 0V9a1 1 0 00-1-1h-.5a1.5 1.5 0 010-3H9a1 1 0 001-1v-.5z" />
      <path d="M10 12.5a1.5 1.5 0 013 0V13a1 1 0 001 1h.5a1.5 1.5 0 010 3H14a1 1 0 00-1 1v.5a1.5 1.5 0 01-3 0V17a1 1 0 00-1-1h-.5a1.5 1.5 0 010-3H9a1 1 0 001-1v-.5zM6.5 7a1.5 1.5 0 000-3H7a1 1 0 011-1v-.5a1.5 1.5 0 00-3 0V4a1 1 0 011 1h.5zM6.5 15a1.5 1.5 0 000-3H7a1 1 0 011-1v-.5a1.5 1.5 0 00-3 0V12a1 1 0 011 1h.5z" />
    </svg>
  </div>
);

const isSearchResult = (metadata: any): metadata is { type: 'search_response', results: SearchResult[] } => {
  return metadata?.type === 'search_response' && Array.isArray(metadata.results);
};

const isUploadSuccess = (metadata: any): metadata is { type: 'upload_success', imageUrl: string } => {
  return metadata?.type === 'upload_success' && typeof metadata.imageUrl === 'string';
};

export default function ChatMessages({ messages }: { messages: Message[] }) {
  return (
    <div className="space-y-6">
      {messages.map((msg) => (
        <div key={msg.id} className={`flex items-start gap-3 max-w-xl ${msg.role === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}>
          {msg.role === 'user' ? <UserAvatar /> : <AIAvatar />}
          <div className={`p-4 rounded-lg shadow-sm ${msg.role === 'user' ? 'bg-blue-600 text-white rounded-br-none' : 'bg-white text-gray-800 rounded-bl-none'}`}>
            <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
            {isUploadSuccess(msg.metadata) && (
              <div className="mt-3">
                <img src={msg.metadata.imageUrl} alt="Uploaded preview" className="rounded-lg max-h-48 border-2 border-gray-200" />
              </div>
            )}
            {isSearchResult(msg.metadata) && msg.metadata.results.length > 0 && (
               <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-2">
                {msg.metadata.results.map(result => (
                  <div key={result.id} className="border rounded-lg p-1 bg-gray-50">
                    <img src={result.imageUrl} alt={result.filename} className="rounded-md w-full h-24 object-cover" />
                    <p className="text-xs text-gray-700 mt-1 truncate font-medium">{result.filename}</p>
                    <p className="text-xs font-bold text-green-600">{(result.similarity * 100).toFixed(1)}% match</p>
                  </div>
                ))}
              </div>
            )}
            <div className={`text-xs mt-2 ${msg.role === 'user' ? 'text-blue-200' : 'text-gray-400'}`}>{new Date(msg.created_at).toLocaleTimeString()}</div>
          </div>
        </div>
      ))}
    </div>
  );
}