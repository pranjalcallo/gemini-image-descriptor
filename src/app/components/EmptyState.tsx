'use client';

export default function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center text-gray-500">
      <div className="bg-white p-8 rounded-lg shadow-md">
        <svg xmlns="http://www.w3.org/2000/svg" className="w-16 h-16 mx-auto text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <h2 className="mt-4 text-xl font-semibold text-gray-800">Welcome to AI Image Search</h2>
        <p className="mt-2 max-w-sm">
          Your visual library is currently empty. Upload an image to generate an AI description, or start by searching for concepts if you have an existing collection.
        </p>
      </div>
    </div>
  );
}