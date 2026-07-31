sed -i '/import { Activity, Calendar, Trophy, Flame, Sparkles, AlertCircle/s/Activity, //g' src/components/views/DashboardView.jsx
sed -i '/import { Activity, Calendar, Trophy, Flame, Sparkles, AlertCircle/s/Calendar, //g' src/components/views/DashboardView.jsx
sed -i '/import { Activity, Calendar, Trophy, Flame, Sparkles, AlertCircle/s/Trophy, //g' src/components/views/DashboardView.jsx
sed -i '/import { Activity, Calendar, Trophy, Flame, Sparkles, AlertCircle/s/Flame, //g' src/components/views/DashboardView.jsx
sed -i '/import { Activity, Calendar, Trophy, Flame, Sparkles, AlertCircle/s/Sparkles, //g' src/components/views/DashboardView.jsx

sed -i 's/import SmartCoachWidget from/import _SmartCoachWidget from/' src/components/views/DashboardView.jsx
sed -i 's/import JourneyEntryCard from/import _JourneyEntryCard from/' src/components/views/DashboardView.jsx
sed -i 's/import RecommendedExercises from/import _RecommendedExercises from/' src/components/views/DashboardView.jsx
sed -i 's/import DailyChallengeCard from/import _DailyChallengeCard from/' src/components/views/DashboardView.jsx
sed -i 's/import RecommendedToolsWidget from/import _RecommendedToolsWidget from/' src/components/views/DashboardView.jsx
sed -i 's/import PersonalMilestonesDisplay from/import _PersonalMilestonesDisplay from/' src/components/views/DashboardView.jsx

sed -i 's/const { getStreakMessage } = useAchievements();/const { getStreakMessage: _getStreakMessage } = useAchievements();/' src/components/views/DashboardView.jsx
sed -i 's/const hasInProgressJourney = /const _hasInProgressJourney = /' src/components/views/DashboardView.jsx
sed -i 's/const isJourneyComplete = /const _isJourneyComplete = /' src/components/views/DashboardView.jsx
sed -i 's/const getProgressPercentage = /const _getProgressPercentage = /' src/components/views/DashboardView.jsx
sed -i 's/const streakData = /const _streakData = /' src/components/views/DashboardView.jsx
sed -i 's/const handleStartJourney = /const _handleStartJourney = /' src/components/views/DashboardView.jsx
sed -i 's/const handleResumeJourney = /const _handleResumeJourney = /' src/components/views/DashboardView.jsx
sed -i 's/const currentStep = /const _currentStep = /' src/components/views/DashboardView.jsx
sed -i 's/onOpenAdaptiveSession/onOpenAdaptiveSession_/' src/components/views/DashboardView.jsx

sed -i 's/import React, {/import {/' src/components/views/MarketplaceView.jsx
sed -i 's/import React, {/import {/' src/components/views/PersonalizedCurriculumView.jsx
sed -i 's/import React, {/import {/' src/components/views/VoiceJournalView.jsx
sed -i 's/import React, {/import {/' src/components/viz/FeedbackManager.jsx
