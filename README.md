# RageRoom: The AI De-escalation Simulator

A real-time, voice-enabled training simulator where support agents practice de-escalating hyper-realistic, emotionally volatile AI customers.

## The Hackathon Brief

### 1. What problem, and who exactly has it?
**Target:** Customer Support Trainees and BPO QA Managers.
**Problem:** Currently, support agents train by roleplaying with other employees (which is awkward and unrealistic) or by reading static scripts. When they get on a real call with a screaming customer, they panic. RageRoom provides a zero-stakes, hyper-realistic environment to practice handling raw hostility.

### 2. What is the non-obvious hard part?
Keeping the AI "Customer" from breaking character and acting like a helpful assistant. Standard LLMs are heavily instruction-tuned to be polite. When the user (playing the agent) yells at the AI, the AI instinctively tries to apologize and de-escalate. We had to build a custom Prompt Architecture that completely isolates the LLM from its "assistant" identity, forcing it to maintain a 10/10 Frustration state and actively threaten to hang up.

### 3. What did you build versus what did the API give you?
**The API gave us:** Raw text generation and basic intent classification.
**We built:**
- A **Dynamic Emotional State Engine** (Frustration, Patience, Trust, Loyalty, Satisfaction) that decays in real-time based on the agent's responses.
- A **Dual-Model Pipeline**: Model A acts as a hidden observer classifying the agent's tone, which feeds mathematical deltas into the State Engine. Model B uses the updated State Engine to generate the customer's dialogue.
- A **Voice-Activity Detection (VAD) Loop** using the Web Speech API that automatically submits audio when the user stops speaking, simulating a real, uninterrupted phone call.
- A **Deterministic Report Card Generator** that grades the agent out of 100 based on the net-change in the customer's emotional factors.

### 4. Why does this break if you remove the AI?
Without the AI, this is just a static multiple-choice quiz. The core value is the fluid, unpredictable nature of human conversation. Hard-coded logic cannot detect when a trainee uses a passive-aggressive tone, nor can it dynamically generate a context-aware insult based on the specific CRM data of the scenario.

### 5. What breaks at ten thousand users?
- **Web Speech API Rate Limits**: We rely on the browser's native STT/TTS, which can be aggressively rate-limited by Chrome/Safari if thousands of concurrent sessions run from the same enterprise IP address.
- **LLM Token Costs**: The hidden classification model runs on *every single turn* of the conversation. At 10,000 active users having 20-turn conversations, the input context window costs will scale exponentially. We would need to aggressively truncate chat history or switch to a fine-tuned, self-hosted 8B model for classification.

---

## Originality Constraints Satisfied

1. **Two models, not one**
   We utilize a multi-agent orchestration architecture. The `Classifier` model silently observes the agent's message and categorizes their behavior (e.g., "dismissive", "vague_promise"). This output mathematically alters the customer's hidden state parameters. The `Roleplayer` model then receives those parameters to generate the actual dialogue. Finally, the `Judge` model evaluates the entire transcript.

2. **Multimodal Co-operation**
   The application requires the user's microphone for Voice Call mode, processing raw audio into transcripts, feeding it into the LLM, and streaming the response back through Text-to-Speech audio.

---

## Setup & Run Instructions

### Prerequisites
- Node.js installed
- MongoDB running locally
- A Groq API key

### 1. Backend (Server)
```bash
cd server
npm install
cp .env.example .env
# Add your GROQ_API_KEY to .env
node server.js
```

### 2. Frontend (Client)
```bash
cd client
npm install
npm run dev
```

Visit `http://localhost:5173` to start your simulation.
