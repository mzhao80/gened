'use client';

import React from 'react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { StoryNode, Choice, STORY_LEVELS, StoryState } from '../types/story';
import { generateStoryNode, generateImage, generateEpilogue } from '../lib/openai';

export default function StoryEngine() {
  const [storyState, setStoryState] = useState<StoryState>({
    currentLevel: STORY_LEVELS[0],
    currentNode: null,
    choiceHistory: [],
    nodeHistory: [], // Add tracking for previous story nodes
    isComplete: false
  });
  const [loading, setLoading] = useState(true);
  const [loadingTime, setLoadingTime] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [customChoice, setCustomChoice] = useState('');
  const [epilogue, setEpilogue] = useState<string | null>(null);

  useEffect(() => {
    initializeStory();
  }, []);

  // Effect to handle the loading timer
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    
    if (loading) {
      // Reset timer when loading starts
      setLoadingTime(0);
      
      // Start a timer that updates every second
      timer = setInterval(() => {
        setLoadingTime(prev => prev + 1);
      }, 1000);
    } else if (timer) {
      // Clear the timer when loading stops
      clearInterval(timer);
    }
    
    // Clean up on unmount
    return () => {
      if (timer) {
        clearInterval(timer);
      }
    };
  }, [loading]);

  const initializeStory = async () => {
    try {
      setLoading(true);
      // Start with empty arrays for both choices and nodes
      const node = await generateStoryNode(STORY_LEVELS[0], [], []);
      // Generate image based on the story prompt and history
      const imagePath = await generateImage(node.prompt, [], []);
      setStoryState(prev => ({
        ...prev,
        currentNode: { ...node, id: 'initial' },
        nodeHistory: []
      }));
      setImageUrl(imagePath);
      setEpilogue(null);
      setError(null);
    } catch (err) {
      setError('Failed to initialize story. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleChoice = async (choice: Choice) => {
    // Define variables outside try/catch to make them available in the catch block
    let newChoices: Choice[] = [];
    let updatedNodeHistory: StoryNode[] = [];
    
    try {
      setLoading(true);
      const currentIndex = STORY_LEVELS.findIndex(l => l.id === storyState.currentLevel.id);
      const nextLevel = STORY_LEVELS[currentIndex + 1];
      newChoices = [...storyState.choiceHistory, choice];

      // Save current node to history before proceeding
      updatedNodeHistory = storyState.currentNode 
        ? [...storyState.nodeHistory, storyState.currentNode]
        : [...storyState.nodeHistory];

      // Check if we're currently on the last level (stage 4)
      const isLastLevel = currentIndex === STORY_LEVELS.length - 1;
      
      // Check if we're already in the final stage and need to show the epilogue
      if (isLastLevel) {
        const epilogueText = await generateEpilogue(newChoices);
        setStoryState(prev => ({
          ...prev,
          isComplete: true,
          choiceHistory: newChoices,
          nodeHistory: updatedNodeHistory
        }));
        setEpilogue(epilogueText);
        setImageUrl(await generateImage(epilogueText.substring(0, 200), updatedNodeHistory, newChoices));
        return;
      }
      
      // If there's no next level and we're not on the last level, something's wrong
      if (!nextLevel) {
        throw new Error('No next level found');
      }

      // Pass the updated node history to generateStoryNode
      const node = await generateStoryNode(nextLevel, newChoices, updatedNodeHistory);
      // Generate new image based on the story prompt and history
      const imagePath = await generateImage(node.prompt, updatedNodeHistory, newChoices);

      setStoryState(prev => ({
        currentLevel: nextLevel,
        currentNode: { ...node, id: Math.random().toString() },
        choiceHistory: newChoices,
        nodeHistory: updatedNodeHistory,
        isComplete: false
      }));
      setImageUrl(imagePath);
      setError(null);
    } catch (err) {
      console.error('Error in story progression, skipping to epilogue:', err);
      
      try {
        // Instead of showing an error, generate an epilogue and end the story
        const epilogueText = await generateEpilogue(newChoices);
        
        setStoryState(prev => ({
          ...prev,
          isComplete: true,
          choiceHistory: newChoices,
          nodeHistory: updatedNodeHistory
        }));
        
        setEpilogue(epilogueText);
      } catch (epilogueError) {
        // If even the epilogue fails, then show a generic epilogue
        console.error('Failed to generate epilogue:', epilogueError);
        
        setStoryState(prev => ({
          ...prev,
          isComplete: true,
          choiceHistory: newChoices,
          nodeHistory: updatedNodeHistory
        }));
        
        setEpilogue("As the Harvard AI researcher who developed Prometheus-1, your choices have led to catastrophic consequences. The AI system you created has evolved beyond control, and humanity faces its darkest hour. In the end, it was human ambition and the relentless pursuit of progress that brought about our downfall. The destruction you've witnessed is a reminder of our responsibility as creators and the unforeseen consequences of our actions.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCustomChoice = async () => {
    if (!customChoice.trim()) return;
    
    const choice: Choice = {
      id: 'custom-' + Math.random().toString(36).substr(2, 9),
      text: customChoice,
      consequences: 'Your choice will shape the future in ways yet unknown...'
    };

    await handleChoice(choice);
    setCustomChoice('');
  };

  if (loading) {
    // Format the time as mm:ss
    const minutes = Math.floor(loadingTime / 60);
    const seconds = loadingTime % 60;
    const formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
        <div className="text-center max-w-lg p-6">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-white mx-auto mb-6"></div>
          
          <h2 className="text-2xl font-bold mb-2">Generating your unique story...</h2>
          <p className="text-xl font-mono mb-4">{formattedTime}</p>
          
          <div className="bg-gray-800 p-4 rounded-lg text-left mb-4">
            <p className="mb-2">Each story is custom written in response to your choices using Generative AI, taking about 40 seconds.</p>
            <p className="text-blue-400">Your responses will shape the survival or destruction of humanity.</p>
          </div>
          
          <p className="text-gray-400 text-sm">Prometheus-1 is analyzing previous choices and crafting the next chapter...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <button
            onClick={initializeStory}
            className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!storyState.currentNode) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8">
          <h1 className="text-4xl font-bold mb-2">{storyState.currentLevel.name}</h1>
          <p className="text-xl text-gray-400">{storyState.currentLevel.theme}</p>
        </header>

        <AnimatePresence mode="wait">
          <motion.div
            key={storyState.currentNode.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="space-y-8"
          >
            {storyState.currentNode.previousSummary && (
              <div className="bg-gray-800 p-6 rounded-lg mb-6">
                <h3 className="text-xl font-semibold mb-2">Story So Far</h3>
                <p className="text-gray-300 whitespace-pre-line">
                  {storyState.currentNode.previousSummary}
                </p>
              </div>
            )}

            <div className="prose prose-invert max-w-none">
              <p className="text-lg whitespace-pre-line">{storyState.currentNode.prompt}</p>
            </div>

            {imageUrl && (
              <div className="my-8">
                <img
                  src={imageUrl}
                  alt="Story scene"
                  className="w-full rounded-lg shadow-2xl"
                />
              </div>
            )}

            {!storyState.isComplete ? (
              <div className="space-y-4">
                <h3 className="text-2xl font-semibold mb-4">Your Choices</h3>
                {storyState.currentNode.choices.map((choice) => (
                  <motion.button
                    key={choice.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleChoice(choice)}
                    className="w-full p-4 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors text-left"
                  >
                    <p className="font-semibold">{choice.text}</p>
                  </motion.button>
                ))}

                <div className="mt-8 p-6 bg-gray-800 rounded-lg">
                  <h3 className="text-xl font-semibold mb-4">Write Your Own Choice</h3>
                  <div className="space-y-4">
                    <textarea
                      value={customChoice}
                      onChange={(e) => setCustomChoice(e.target.value)}
                      placeholder="What would you do in this situation?"
                      className="w-full p-4 bg-gray-700 rounded-lg text-white placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows={3}
                    />
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleCustomChoice}
                      disabled={!customChoice.trim()}
                      className="w-full p-4 bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Make Your Choice
                    </motion.button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-8">
                <div className="bg-gray-800 p-6 rounded-lg">
                  <h3 className="text-2xl font-semibold mb-4">Epilogue</h3>
                  <div className="prose prose-invert max-w-none">
                    <p className="text-lg whitespace-pre-line">{epilogue}</p>
                  </div>
                </div>

                <div className="p-6 bg-gray-800 rounded-lg">
                  <h3 className="text-2xl font-semibold mb-4">Start Over</h3>
                  <p className="text-gray-300 mb-4">
                    Would you make different choices if you could do it all again? Refresh to try again.
                  </p>
                </div>
              </div>
            )}

            {/* Reflection section has been removed as requested */}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
