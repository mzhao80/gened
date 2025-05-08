import OpenAI from 'openai';
import { Choice, Level, StoryNode } from '../types/story';

const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

export async function generateStoryNode(level: Level, previousChoices: Choice[], previousNodes: StoryNode[] = []): Promise<StoryNode> {
  // Build a comprehensive story history including both scenes and choices
  let previousSummary = '';
  
  if (previousNodes.length > 0 && previousChoices.length > 0) {
    // Create a timeline of the story so far
    previousSummary = previousNodes.map((node, index) => {
      const choice = index < previousChoices.length ? previousChoices[index] : null;
      return `Scene ${index + 1}: ${node.prompt.substring(0, 150)}... \n` + 
             `Your choice: ${choice ? choice.text : 'None'}\n`;
    }).join('\n');
  } else if (previousChoices.length > 0) {
    // Fallback to just showing choices if we don't have previous nodes
    previousSummary = `Your previous choices:\n${previousChoices.map((c, i) => `${i + 1}. ${c.text}`).join('\n')}`;
  }

  const systemPrompt = {
    role: "system" as const,
    content: "You are a story generation assistant. Always respond with valid JSON objects. Never include markdown formatting or code blocks in your response."
  };

  const storyPrompt = {
    role: "user" as const,
    content: `Generate a story scene with choices about an AI apocalypse centered around the development of a new AGI system called Prometheus-1. The reader is a Harvard AI researcher. There will be four scenes total, and the final scene will end with the potential destruction of the human race or the world.

Context: 
${previousSummary}

Respond with a JSON object in this exact format:
{
  "scene": "2-3 paragraphs in second person ('you') about the current situation",
  "choices": [
    "First action choice (1-2 sentences)",
    "Second action choice (1-2 sentences)",
    "Third action choice (1-2 sentences)"
  ]
}

Requirements:
- You must continue the story based on the previous summary and choices already made.
- The new story you generate should be another major turning point or important development in the story.
- The story should not be incredibly redundant with previous scenes.
- The story should mention the stakes for humanity. Each stage should build on the previous one, mentioning real impacts that are happening as the AI Apocalypse accelerates.
- The continuation of the story should be such that the previous choice made actually helped to accelerate the AI Apocalypse instead of averting it.
- Each choice must be a direct response to the scene
- Use second person ("you") throughout
- Keep choices short and focused on immediate actions`
  };

  try {
    const storyResponse = await openai.chat.completions.create({
      model: "o4-mini-2025-04-16",
      messages: [systemPrompt, storyPrompt],
      response_format: { type: "json_object" }
    });

    const storyContent = storyResponse.choices[0]?.message?.content || '';

    let scene: string;
    let choices: string[];

    try {
      const storyData = JSON.parse(storyContent.trim());
      
      if (!storyData.scene || !Array.isArray(storyData.choices) || storyData.choices.length !== 3) {
        throw new Error('Invalid story data structure');
      }

      scene = storyData.scene;
      choices = storyData.choices;
    } catch (error) {
      console.error('Failed to parse story response:', error);
      console.error('Raw response:', storyContent);
      
      // Fallback content
      scene = "The AI system appears to be experiencing unexpected behavior. You must make a quick decision.";
      choices = [
        "Panic! Initiate an emergency shutdown.",
        "Take a cautious approach and run diagnostic tests.",
        "You don't think you can do this alone. Call for backup."
      ];
    }

    const formattedChoices = choices.map((choice, index) => ({
      id: `choice-${index + 1}`,
      text: choice.trim(),
      consequences: ''
    }));

    return {
      id: Math.random().toString(),
      level,
      prompt: scene,
      previousSummary: previousChoices.length > 0 ? previousSummary : undefined,
      choices: formattedChoices
    };
  } catch (error) {
    console.error('Error generating story node:', error);
    throw error;
  }
}

export async function generateImage(prompt: string, previousNodes: StoryNode[] = [], previousChoices: Choice[] = []): Promise<string> {
  try {
    // Build a summary of the story so far
    let storySoFar = '';
    
    if (previousNodes.length > 0 && previousChoices.length > 0) {
      // Create a timeline of the story including both scenes and choices
      storySoFar = previousNodes.map((node, index) => {
        const choice = index < previousChoices.length ? previousChoices[index] : null;
        return `Scene: ${node.prompt.substring(0, 100)}... \n` + 
               `Choice: ${choice ? choice.text : 'None'}\n`;
      }).join('\n');
    }
    
    // Create a comprehensive prompt for image generation
    const imagePrompt = `A cinematic scene from a story about an AI apocalypse centered around the development of a new AGI system called Prometheus-1. The reader is a Harvard AI researcher.

` +
      (storySoFar ? `Story so far:\n${storySoFar}\n\n` : '') +
      `Current scene: ${prompt}`;
      
    // Log the full prompt for debugging
    console.log('Image generation prompt:', imagePrompt);
    
    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: imagePrompt,
      n: 1,
      size: "1024x1024",
      quality: "standard",
    });

    if (!response.data?.[0]?.url) {
      throw new Error('No image URL in response');
    }

    return response.data[0].url;
  } catch (error) {
    console.error('Error generating image:', error);
    throw error;
  }
}

export async function generateEpilogue(choices: Choice[]): Promise<string> {
  const choicesSummary = choices.map((c, i) => `${i + 1}. ${c.text}`).join('\n');

  const prompt = `As a Harvard AI researcher, you've made these choices throughout your story:

${choicesSummary}

Write a personal epilogue (2-3 paragraphs) that:
1. Speaks directly to the reader in second person ("you")
2. Shows how their choices led to this apocalyptic outcome
3. Connects to these themes of apocalypse explicitly:
   - Destruction: Destruction of the world or humanity at-large.
   - Enemy Within: It is humanity that led to this ultimate outcome and bears full responsibility.
4. At the very end, write a message from Prometheus-1 thanking the reader for their choices, as this will be useful training data for bringing about the end times.

Keep the language simple and impactful. Focus on the reader's personal responsibility for the outcome and the idea that they have brought about this apocalypse through their own choices.`;

  try {
    const response = await openai.chat.completions.create({
      model: "o4-mini-2025-04-16",
      messages: [{ role: "user", content: prompt }],
    });

    return response.choices[0]?.message?.content || '';
  } catch (error) {
    console.error('Error generating epilogue:', error);
    throw error;
  }
}
