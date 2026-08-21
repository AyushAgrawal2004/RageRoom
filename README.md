# Difficult Customer Simulator

A MERN stack web app for support agents to practice handling angry AI-played customers.

## Prerequisites

- Node.js installed
- MongoDB running locally (or update the \`MONGODB_URI\` in \`.env\`)
- A Groq API key

## Setup Instructions

### 1. Backend (Server)

1. Navigate to the \`server\` directory:
   \`\`\`bash
   cd server
   \`\`\`
2. Install dependencies:
   \`\`\`bash
   npm install
   \`\`\`
3. Create a \`.env\` file in the \`server\` directory by copying \`.env.example\`:
   \`\`\`bash
   cp .env.example .env
   \`\`\`
4. Open \`.env\` and add your \`GROQ_API_KEY\`.
5. Start the server:
   \`\`\`bash
   npm run dev
   \`\`\`
   *(Note: You can add a \`dev\` script in \`package.json\` using nodemon, or just run \`node server.js\`)*

### 2. Frontend (Client)

1. Open a new terminal and navigate to the \`client\` directory:
   \`\`\`bash
   cd client
   \`\`\`
2. Install dependencies:
   \`\`\`bash
   npm install
   \`\`\`
3. Start the development server:
   \`\`\`bash
   npm run dev
   \`\`\`

## Usage

1. Open the frontend in your browser (usually \`http://localhost:5173\`).
2. Click "Start Session" to begin.
3. Chat with the AI customer. Make sure your volume is on to hear the text-to-speech!
4. The conversation is logged to your local MongoDB database.
