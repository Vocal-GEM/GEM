# Getting Started with Vocal GEM

This guide provides detailed instructions for setting up Vocal GEM on different platforms and troubleshooting common issues.

## 🌍 Web Setup (Windows/Mac/Linux)

### Prerequisites
- **Node.js (v16+)**: [Download](https://nodejs.org/)
- **Python (3.8+)**: [Download](https://python.org/)
- **Git**: [Download](https://git-scm.com/)

### Installation
1.  **Clone the repository**:
    ```bash
    git clone <repo-url>
    cd GEM
    ```
2.  **Install Frontend Dependencies**:
    ```bash
    npm install
    ```
3.  **Install Backend Dependencies**:
    ```bash
    pip install -r backend/requirements.txt
    ```

### Running the App
1.  **Start Backend**:
    ```bash
    python backend/app.py
    ```
2.  **Start Frontend**:
    ```bash
    npm run dev
    ```
3.  **Access**: Open `http://localhost:3000` in your browser.

---

## 📱 Mobile Setup (Android/iOS)

Vocal GEM uses Capacitor for mobile deployment.

### Android
1.  **Install Android Studio**.
2.  **Sync Capacitor**:
    ```bash
    npx cap sync android
    ```
3.  **Open in Android Studio**:
    ```bash
    npx cap open android
    ```
4.  Run the app on an emulator or connected device.

### iOS (Mac only)
1.  **Install Xcode**.
2.  **Sync Capacitor**:
    ```bash
    npx cap sync ios
    ```
3.  **Open in Xcode**:
    ```bash
    npx cap open ios
    ```
4.  Run the app on a simulator or connected device.

---

## 🔧 Troubleshooting

### Common Issues

#### Port Conflicts
*   **Error**: `EADDRINUSE: address already in use :::3000`
*   **Fix**: Kill the process running on port 3000 or let Vite choose another port (it usually does this automatically).
    *   **Windows**: `netstat -ano | findstr :3000` then `taskkill /PID <PID> /F`
    *   **Mac/Linux**: `lsof -i :3000` then `kill -9 <PID>`

#### Environment Variables
*   Ensure you have a `.env` file in the root directory if required.
*   Example `.env`:
    ```
    VITE_API_URL=http://localhost:5000
    ```

#### NPM Scripts
*   **`npm run dev` fails**: Delete `node_modules` and `package-lock.json`, then run `npm install` again.
*   **Build errors**: Run `npm run build` to check for production build issues.

#### Audio Permissions
*   If the microphone doesn't work, check your browser settings and ensure Vocal GEM has permission to access the microphone.
*   On macOS, check System Preferences > Security & Privacy > Microphone.

### Backend Issues
*   **`ModuleNotFoundError`**: Ensure you activated the virtual environment (if using one) and ran `pip install -r backend/requirements.txt`.
*   **`numpy` errors**: You might need to install build tools or use a pre-compiled binary. Try `pip install numpy --upgrade`.
