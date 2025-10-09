import { Dispatch, SetStateAction, FormEvent } from 'react';

interface UserInputProps {
  input: string;
  setInput: Dispatch<SetStateAction<string>>;
  isLoading: boolean;
  onSendMessage: (e: FormEvent) => void;
}

export default function UserInput({ input, setInput, isLoading, onSendMessage }: UserInputProps) {
  return (
    <form onSubmit={onSendMessage} className="flex items-center">
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        className="flex-1 border rounded-l-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
        placeholder="Describe an image to search..."
        disabled={isLoading}
      />
      <button type="submit" disabled={isLoading || !input.trim()} className="bg-blue-600 text-white px-4 py-2 rounded-r-md disabled:bg-blue-300 hover:bg-blue-700 transition-colors">
        {isLoading ? '...' : 'Send'}
      </button>
    </form>
  );
}