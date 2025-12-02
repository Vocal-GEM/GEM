# Vocal GEM 💎

A personal voice coaching application for gender-affirming voice training. Vocal GEM combines real-time biofeedback with AI-driven insights to help you achieve your voice goals.

## ✨ Features

### 🎯 Real-time Biofeedback
*   **Pitch Visualizer**: Track your fundamental frequency (F0) with a clear, responsive graph. Includes zoom controls and gender-coded target ranges.
*   **Resonance Orb**: Visualize your vocal resonance (bright vs. dark) using a dynamic 3D orb that responds to your voice's spectral characteristics.
*   **Voice Quality Meter**: Monitor vocal weight and clarity (CPP) to ensure a healthy, balanced tone.
*   **Spectrogram**: View the full frequency spectrum of your voice in real-time.

### 🎧 Interactive Tools
*   **Haptic & Tone Feedback**: Receive vibration or audio cues when you drift out of your target pitch or resonance range (configurable).
*   **Pitch Pipe**: Generate reference tones to help you find your starting pitch.
*   **Comparison Tool**: Record and compare your voice against target clips or previous sessions.
*   **Intonation Trainer**: Practice speech patterns and melody with guided exercises.

### 🤖 AI Coach & Insights
*   **AI Companion**: Chat with a specialized assistant for personalized guidance and exercises.
*   **Progress Tracking**: View detailed history of your sessions, including pitch averages, resonance scores, and consistency streaks.
*   **Audio Journal**: Record and save practice sessions with notes to track your qualitative progress over time.

## 🚀 Quick Start

1.  **Prerequisites**: Ensure you have **Node.js** (v16+) and **Python** (3.8+) installed.
2.  **Clone & Install**:
    ```bash
    git clone <repo-url>
    cd GEM
    npm install
    pip install -r backend/requirements.txt
    ```
3.  **Start Backend**:
    ```bash
    python backend/app.py
    ```
4.  **Start Frontend**:
    ```bash
    npm run dev
    ```
5.  **Open App**: Go to `http://localhost:3000` and allow microphone access.

## 🛠️ Tech Stack

*   **Frontend**: React, Vite, Tailwind CSS, Framer Motion
*   **Visualization**: Three.js (React Three Fiber), Chart.js
*   **Audio Processing**: Web Audio API, AudioWorklets, Meyda
*   **Backend**: Python, Flask (for AI and advanced analysis)
*   **State Management**: React Context API, Zustand

## 🧩 Troubleshooting

*   **"Unstable Signal"**: If you see this warning in the Pitch Visualizer, try moving closer to the microphone, reducing background noise, or speaking louder. Click the help icon (?) next to the warning for more tips.
*   **Audio Issues**: Ensure your microphone permissions are allowed in the browser. Check the "Settings" menu to verify the correct input device is selected.
*   **Backend Connection**: If features like the AI Coach or advanced analysis aren't working, ensure the Python backend is running on port 5000.

## 📄 License

This project is for personal and educational use.
