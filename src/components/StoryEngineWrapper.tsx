'use client';

import dynamic from 'next/dynamic';

const StoryEngine = dynamic(() => import('./StoryEngine'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-pulse text-2xl">Loading story engine...</div>
    </div>
  ),
});

export default function StoryEngineWrapper() {
  return <StoryEngine />;
}
