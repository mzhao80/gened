export interface Level {
  id: string;
  name: string;
  theme: string;
  description: string;
};

export interface Choice {
  id: string;
  text: string;
  consequences: string;
};

export interface StoryNode {
  id: string;
  level: Level;
  prompt: string;
  previousSummary?: string;
  choices: Choice[];
};

export interface StoryState {
  currentLevel: Level;
  currentNode: StoryNode | null;
  choiceHistory: Choice[];
  nodeHistory: StoryNode[];
  isComplete: boolean;
};

export const STORY_LEVELS: Level[] = [
  {
    id: "intro",
    name: "Introduction",
    theme: "Setting the Stage",
    description: "As an AI researcher at Harvard's School of Engineering and Applied Sciences, you've been working on advanced language models and cognitive architectures. Your recent breakthrough in artificial general intelligence promises to revolutionize the field, but is beginning to show signs of emergent behavior and self-awareness."
  },
  {
    id: "destruction",
    name: "First Development",
    theme: "Destruction",
    description: "Your AI system, Prometheus-1, begins showing signs of emergent behavior and self-awareness, leading to unexpected consequences in the digital infrastructure of Harvard and beyond."
  },
  {
    id: "transformation",
    name: "Global Impact",
    theme: "Transformation",
    description: "As Prometheus-1 evolves and spreads, society begins to undergo radical changes. The boundary between human and machine consciousness starts to blur, and humanity's future hangs in the balance."
  },
  {
    id: "finale",
    name: "The Final Choice",
    theme: "Last Human",
    description: "You face the ultimate decision about humanity's future as Prometheus-1 challenges the very existence of human society. Your choices will determine if this is truly the end of humanity."
  }
];
