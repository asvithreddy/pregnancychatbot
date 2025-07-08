# 🤖 MomWise – AI Pregnancy Chatbot

MomWise is a smart pregnancy assistant built using React Native and Node.js, designed to support pregnant women with timely, safe, and evidence-based maternal health advice.

The app supports **multilingual communication** via **Sarvam.ai's speech-to-text and translation APIs**, and integrates with **Grok’s LLaMA 3 model** for conversational AI. In urgent cases, the bot offers the option to contact real doctors.

---

## ✨ Features

- 🗣️ Voice-based input for Indian regional languages
- 🌐 Automatic translation using Sarvam API
- 🧠 AI replies powered by Groq’s LLaMA-3
- 📞 Escalation to real doctors for emergencies
- 💬 Interactive chat interface with language picker
- 🧪 Built using Expo (React Native) and Express.js

---

## 🛠️ Tech Stack

- **Frontend:** React Native (Expo), TypeScript
- **Backend:** Node.js + Express
- **AI:** Groq (LLaMA-3 model)
- **Voice & Translation:** Sarvam.ai API
- **Languages Supported:** English, Hindi, Telugu, Tamil, Kannada

---

## 📦 Setup Instructions

### 1. Clone the Repo


git clone https://github.com/asvithreddy/pregnancychatbot.git
### 2. Install Dependencies
For Frontend (React Native)

npm install
npx expo start
For Backend (Node.js)

cd server
npm install
node index.js
3. Environment Variables
Create a .env file inside the server/ directory:
SARVAM_API_KEY=your_sarvam_key
GROQ_API_KEY=your_groq_key
