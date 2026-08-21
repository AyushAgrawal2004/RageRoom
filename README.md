# Difficult Customer Simulator

A MERN stack web app for support agents to practice handling angry AI-played customers.

## Prerequisites

- Node.js installed
- MongoDB running locally (or update the `MONGODB_URI` in `.env`)
- A Groq API key

## Setup Instructions

### 1. Kokoro TTS Microservice (Python)

To run the local, blazing-fast Kokoro-82M TTS engine:

1. Navigate to the `kokoro-service` directory:
   ```bash
   cd kokoro-service
   ```
2. (Recommended) Create a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate
   ```
3. Install the dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Start the FastAPI microservice:
   ```bash
   uvicorn main:app --port 8001
   ```
*Note: The first time it runs, it will download the Kokoro-82M model (~82MB). It runs completely locally on your CPU.*

### 2. Backend (Node.js)

1. Navigate to the `server` directory:
   ```bash
   cd server
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `server` directory by copying `.env.example`:
   ```bash
   cp .env.example .env
   ```
4. Open `.env` and add your keys (e.g. `GROQ_API_KEY`). Ensure `TTS_PROVIDER=kokoro` is set.
5. Start the server:
   ```bash
   npm run dev
   ```
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
