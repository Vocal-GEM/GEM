sed -i 's/import { Users, UserPlus, Search, FileText, Calendar, ChevronRight, MoreVertical } from '"'"'lucide-react'"'"';/import { Users, UserPlus, Search, FileText, Calendar, ChevronRight, MoreVertical, Activity } from '"'"'lucide-react'"'"';/' src/components/professional/ClientDashboard.jsx
sed -i 's/"Call to schedule a doctor'"'"'s appointment"/\&quot;Call to schedule a doctor\&apos;s appointment\&quot;/' src/components/professional/TaskRecorder.jsx
sed -i 's/voice'"'"'s perceived gender/voice\&apos;s perceived gender/' src/components/ui/IntakeQuestionnaire.jsx
sed -i 's/like "Me"/like \&quot;Me\&quot;/' src/components/ui/IntakeQuestionnaire.jsx
sed -i 's/"normal"/\&quot;normal\&quot;/' src/components/ui/MicrophoneCalibration.jsx
sed -i 's/"Pitch Perfect"/\&quot;Pitch Perfect\&quot;/' src/components/ui/RecommendedToolsWidget.jsx
sed -i 's/"Resonance"/\&quot;Resonance\&quot;/' src/components/ui/RecommendedToolsWidget.jsx
