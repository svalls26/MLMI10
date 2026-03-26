# DialogLab

<img src="content/dialoglab-fig.png" alt="DialogLab teaser figure" width="100%"/>

[Paper](https://dl.acm.org/doi/10.1145/3746059.3747696) | [30s Preview](https://www.youtube.com/watch?v=AdvYhP8A51M) | [Video Figure](https://www.youtube.com/watch?v=U2Ag_Ktobzw) | [Web Demo](https://chatlab.3dvar.com/)

**DialogLab** is an authoring tool for configuring and orchestrating multi-agent conversations with animated 3D avatars. Built with React, Vite, and Express, it enables researchers, designers, and developers to create, visualize, and evaluate complex agent-based dialogue systems.

## Features

- **Visual Conversation Design**: Configure multi-agent conversations with an intuitive node-based editor
- **3D Avatar Integration**: Animate conversations using Ready Player Me avatars with synchronized speech
- **Multiple LLM Support**: Compatible with OpenAI GPT and Google Gemini models
- **Multi-Agent Orchestration**: Party mode with free, round-robin, and moderated turn-taking; hand-raising mechanism for managed speaking turns
- **Conversation Memory**: Configurable short-term memory window with automatic summarization to maintain coherent long-running dialogues
- **Content Management**: Upload PDF and text documents to ground agent responses in specific content
- **Scene Management**: Create and manage multiple conversation scenarios with real-time scene switching
- **Impromptu / Derailment Phases**: Define agents that can interrupt or deviate from the planned script, with an approval workflow
- **Verification Tools**: Analyze conversation coherence, sentiment, and quality metrics with visual dashboards
- **Experience Mode**: Present finished conversations in a polished viewer

## Prerequisites

- **Node.js** 18+ (Node 23 recommended for build and deploy scripts)
- **npm** 8+
- At least one LLM provider API key (OpenAI or Google Gemini)
- Google Cloud Text-to-Speech API key (optional, required for avatar speech)

## Repository Structure

```
DialogLab/
├── client/                    # React/Vite frontend (port 5173)
│   ├── src/
│   │   ├── App.jsx            # Root component with authoring/experience mode switching
│   │   ├── components/
│   │   │   ├── nodeeditor/    # Node-based conversation flow editor
│   │   │   ├── inspector/     # Property panels for agents and nodes
│   │   │   ├── scene/         # 3D avatar visualization (Three.js)
│   │   │   ├── verification/  # Conversation analysis and metrics
│   │   │   ├── quiz/          # Experience / presentation mode
│   │   │   ├── avatarconfig/  # Avatar customization
│   │   │   └── preview/       # Real-time preview
│   │   └── libs/              # Shared utilities
│   └── public/
│       ├── assets/            # Avatar .glb files (Ready Player Me)
│       └── libs/              # TalkingHead animation library
└── server/                    # Express API server (port 3010)
    ├── server.js              # API routes and server setup
    ├── chat.js                # ConversationManager — orchestrates multi-agent dialogue
    ├── agent.js               # Agent class — individual conversation participants
    ├── conversationmemory.js  # Memory management and context summarization
    ├── chatutils.js           # Utility functions for chat logic
    ├── tts.js                 # Google Cloud Text-to-Speech integration
    ├── contentManager.js      # Document ingestion and retrieval
    ├── contentAPI.js          # Content management endpoints
    ├── modelAPI.js            # LLM model management endpoints
    ├── verificationAPI.js     # Conversation analysis endpoints
    └── providers/
        ├── llmProvider.js     # LLM provider abstraction layer
        └── geminiAPI.js       # Google Gemini integration
```

## Getting Started

### 1. Install Dependencies

```bash
# Install client dependencies
cd client
npm install

# Install server dependencies
cd ../server
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the `server/` directory:

```env
# Runtime environment
NODE_ENV=development

# LLM Providers — configure at least one
GEMINI_API_KEY=your-gemini-api-key-here
API_KEY_LLM=your-openai-api-key-here

# Default LLM settings (optional)
DEFAULT_LLM_PROVIDER=gemini        # or openai
DEFAULT_OPENAI_MODEL=gpt-4
DEFAULT_GEMINI_MODEL=gemini-2.0-flash

# Text-to-Speech — required for avatar speech synthesis
TTS_API_KEY=your-google-tts-api-key-here
TTS_ENDPOINT=https://eu-texttospeech.googleapis.com/v1beta1/text:synthesize
```

### 3. Start the Server

```bash
cd server
node server.js
```

The server starts at `http://localhost:3010`.

### 4. Start the Client

In a separate terminal:

```bash
cd client
npm run dev
```

Open your browser and navigate to `http://localhost:5173`.

## Technology Stack

| Layer | Technologies |
|---|---|
| Frontend | React 19, Vite 6, TypeScript, Tailwind CSS 4 |
| 3D / Animation | Three.js, TalkingHead |
| State Management | Zustand |
| UI Components | Radix UI (shadcn), Lucide React, React Select |
| Charts | Recharts |
| Backend | Express.js, Node.js |
| LLM Providers | OpenAI SDK, Google Generative AI (Gemini) |
| Text-to-Speech | Google Cloud Text-to-Speech |
| File Handling | Multer, pdf-parse |

## Key Concepts

### Agents
Each agent represents a conversation participant. Agents are configured with a personality, interaction patterns, filler-word frequency, and optional content documents that ground their responses. A special **derailer** mode allows an agent to interrupt or derail the conversation during impromptu phases.

### Conversation Orchestration
The `ConversationManager` controls turn-taking across agents. Supported party turn modes:
- **Free** — agents self-select when to speak
- **Round-robin** — agents take strictly alternating turns
- **Moderated** — a designated moderator agent directs the conversation

A hand-raising mechanism lets agents signal intent to speak in moderated mode.

### Conversation Memory
Each conversation maintains a sliding context window (default: last 3 messages). When the window fills, the system automatically summarizes older exchanges and tracks covered topics and analogies to avoid repetition.

### Verification & Analysis
After a conversation is generated, the verification panel provides:
- **Coherence score** — LLM-based analysis of logical flow
- **Sentiment analysis** — overall emotional tone
- **Metrics dashboard** — turn distribution, topic coverage

## Production Build

```bash
cd client
npm run build   # outputs to client/dist/
```

The server is deployed separately. The hosted demo runs at `https://chatlab.3dvar.com`.

## Third-Party Components & Licenses

### TalkingHead (MIT License)
Portions of this project's code are adapted from [TalkingHead](https://github.com/met4citizen/TalkingHead), © 2024 Mika Suominen, licensed under the MIT License.

**Files**: `client/public/libs/talkinghead.mjs`

### Three.js (MIT License)
This project uses [Three.js](https://threejs.org/) and its example modules, © 2010–present Three.js authors, licensed under the MIT License.

### Ready Player Me Avatars (Custom License)
Example avatar files (`client/public/assets/*.glb`) were created using [Ready Player Me](https://readyplayer.me/) and are subject to [Ready Player Me's Terms of Use](https://readyplayer.me/terms-of-use). These assets are provided for demonstration purposes only and are **not covered** by this project's MIT license. For production use, obtain your own avatars or comply with Ready Player Me's licensing terms.

## Citation

If you use DialogLab in your research, please cite our UIST 2025 paper:

```bibtex
@inproceedings{dialoglab2025,
  author    = {Hu, Erzhen and Chen, Yanhe and Li, Mingyi and Phadnis, Vrushank and Xu, Pingmei and Qian, Xun and Olwal, Alex and Kim, David and Heo, Seongkook and Du, Ruofei},
  title     = {DialogLab: Configuring and Orchestrating Multi-Agent Conversations},
  booktitle = {Proceedings of the 38th Annual ACM Symposium on User Interface Software and Technology (UIST '25)},
  year      = {2025},
  publisher = {Association for Computing Machinery},
  address   = {New York, NY, USA},
  doi       = {10.1145/3746059.3747696}
}
```
