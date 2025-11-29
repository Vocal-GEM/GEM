# Vocal GEM 💎

A personal voice coaching application for gender-affirming voice training.

## ✨ Features
- **Real-time Biofeedback**: Visualize Pitch, Resonance, and Vocal Weight.
- **AI Coach**: Chat with a specialized assistant for guidance.
- **Progress Tracking**: Level up, earn high scores, and track your daily streaks.
- **Tools**: Pitch Pipe, Intonation Guide, Voice Comparison, and Audio Journal.

## 📋 Prerequisites

Before you begin, ensure you have the following installed on your computer:

1.  **Node.js & npm** (Required for the frontend)
    *   Download and install from: [https://nodejs.org/](https://nodejs.org/)
    *   Verify by running `node -v` and `npm -v` in your terminal.

2.  **Python 3.8+** (Required for the backend)
    *   Download and install from: [https://python.org/](https://python.org/)
    *   Verify by running `python --version` in your terminal.

## 🚀 Installation

1.  **Install Frontend Dependencies**:
    Open a terminal in the project folder (`c:\Users\riley\Desktop\GEM`) and run:
    ```bash
    npm install
    ```

2.  **Install Backend Dependencies**:
    ```bash
    pip install -r backend/requirements.txt
    ```

## ▶️ How to Run

You need to run both the frontend and backend servers.

### 1. Start the Frontend (React App)
Run this command to start the user interface:
```bash
npm run dev
```
> Access the app at: `http://localhost:3000` (or the URL shown in the terminal)

### 2. Start the Backend (API)
Open a **new terminal window** and run:
```bash
python backend/app.py
```
> The backend runs on: `http://localhost:5000`

## 🛠️ Troubleshooting

*   **"npm is not recognized"**: You need to install Node.js. Restart your terminal after installation.
*   **"python is not recognized"**: You need to install Python. Make sure to check "Add Python to PATH" during installation.
*   **Audio Issues**: Ensure your microphone permissions are allowed in the browser.
