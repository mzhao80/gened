# Echoes of Ourselves

An interactive web-based experience that invites users to co-author an AI-driven apocalypse through five sequential levels. This project explores the intersection of artificial intelligence, apocalyptic narratives, and academic reflection.

## Features

- Dynamic story generation using GPT-4
- AI-generated imagery for each scene
- Interactive choice system with custom input options
- Academic reflection prompts
- Five thematic levels:
  1. Destruction
  2. Transformation
  3. Liberation
  4. Enemy Within
  5. Last Human

## Getting Started

1. Clone this repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the root directory and add your OpenAI API key:
   ```
   OPENAI_API_KEY=your_api_key_here
   ```
4. Run the development server:
   ```bash
   npm run dev
   ```
5. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Technology Stack

- Next.js with TypeScript
- TailwindCSS for styling
- OpenAI API for story and image generation
- Framer Motion for animations

## Project Structure

- `src/components/StoryEngine.tsx`: Main game logic and UI
- `src/lib/openai.ts`: OpenAI integration for story and image generation
- `src/types/story.ts`: TypeScript definitions for game state
- `src/app/page.tsx`: Main application page

## Academic Context

This project serves as an interactive exploration of apocalyptic narratives, specifically focusing on AI-driven scenarios. It encourages users to reflect on course materials while creating their own apocalyptic narrative, bridging creative expression with academic analysis.
