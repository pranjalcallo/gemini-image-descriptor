'use client';

const SkeletonBubble = ({ align = 'left' }: { align?: 'left' | 'right' }) => (
  <div className={`flex items-end gap-2 ${align === 'right' ? 'justify-end' : 'justify-start'}`}>
    {align === 'left' && <div className="w-8 h-8 rounded-full bg-gray-200"></div>}
    <div className={`w-3/5 h-16 rounded-lg bg-gray-200`}></div>
    {align === 'right' && <div className="w-8 h-8 rounded-full bg-gray-200"></div>}
  </div>
);

export default function LoadingSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <SkeletonBubble align="left" />
      <SkeletonBubble align="right" />
      <SkeletonBubble align="left" />
      <p className="text-center text-gray-400 text-sm">Initializing conversation...</p>
    </div>
  );
}