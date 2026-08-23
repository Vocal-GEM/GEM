with open("src/components/views/DashboardView.jsx", "r") as f:
    content = f.read()

content = content.replace("import { Activity, Play, Calendar, Trophy, ArrowRight, Mic, Dumbbell, BookOpen, Flame, Sparkles, Timer } from 'lucide-react';", "import { Play, Calendar, Trophy, ArrowRight, Mic, Dumbbell, BookOpen, Flame, Sparkles, Timer } from 'lucide-react';")

with open("src/components/views/DashboardView.jsx", "w") as f:
    f.write(content)
