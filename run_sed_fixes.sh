# Let's fix only the 5 specific lines requested by the CI log that we haven't touched successfully yet.
# We will use targeted sed instead of python.

# 1. RecommendedToolsWidget.jsx, Line 124
sed -i 's/Try "/Try \&quot;/g' src/components/ui/RecommendedToolsWidget.jsx
sed -i 's/" again/\&quot; again/g' src/components/ui/RecommendedToolsWidget.jsx

# 2. TaskRecorder.jsx, Line 116
sed -i "s/replace('Read: \\\"', '')/replace('Read: \"', '')/g" src/components/professional/TaskRecorder.jsx
sed -i "s/replace('\\\"', '')/replace('\"', '')/g" src/components/professional/TaskRecorder.jsx

# 3. ClientDashboard.jsx, Line 130 -> Activity is missing, add to top
sed -i "s/import { Calendar, User, FileText, CheckCircle, Clock, Search, Filter, Play, Mic, MessageSquare, ChevronRight, BarChart2 } from 'lucide-react';/import { Calendar, User, FileText, CheckCircle, Clock, Search, Filter, Play, Activity, Mic, MessageSquare, ChevronRight, BarChart2 } from 'lucide-react';/g" src/components/professional/ClientDashboard.jsx


# TaskRecorder.jsx (Line 116)
# It's currently: <div className="mt-2 p-3 bg-slate-900/50 rounded border border-slate-700 text-slate-300 italic"> "{task.prompt.replace('Read: "', '').replace('"', '')}" </div>
sed -i 's/"> "{task\.prompt/"> \&quot;{task.prompt/g' src/components/professional/TaskRecorder.jsx
sed -i 's/replace('"'"'\\\"'"'"', '"'"''"'"')}\" <\/div>/replace('"'"'\\\"'"'"', '"'"''"'"')}\&quot; <\/div>/g' src/components/professional/TaskRecorder.jsx
sed -i 's/)}\" <\/div>/)}\&quot; <\/div>/g' src/components/professional/TaskRecorder.jsx
sed -i 's/)}\" /)}\&quot; /g' src/components/professional/TaskRecorder.jsx
sed -i 's/"> "/"> \&quot;/g' src/components/professional/TaskRecorder.jsx
