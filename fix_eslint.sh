sed -i 's/renderCoordinator/renderCoordinatorInstance/' src/components/viz/BreathinessMeter.jsx
sed -i 's/process/import.meta.env/' src/services/ResearchMode.js
sed -i 's/shareProgress:/shareProgressLegacy:/' src/services/PrivacyManager.js
sed -i 's/componentId/componentIdValue/' src/components/viz/HighResSpectrogram.jsx
