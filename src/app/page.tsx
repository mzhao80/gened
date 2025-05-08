import StoryEngineWrapper from '../components/StoryEngineWrapper';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <header className="bg-black bg-opacity-50 border-b border-gray-800 shadow-lg">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold text-blue-400">Prometheus Rising</h1>
          <p className="mt-2 text-lg text-gray-300">
            Your choices will determine humanity's fate in this AI apocalypse narrative.
          </p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <StoryEngineWrapper />
      </main>
      
      <footer className="border-t border-gray-800 py-4 bg-black bg-opacity-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-gray-500 text-sm">
          <p>Explore the moral implications of AI development through an interactive narrative game.</p>
        </div>
      </footer>
    </div>
  );
}
