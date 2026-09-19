const fs = require('fs');

function replaceAll(file, search, replace) {
    if (!fs.existsSync(file)) return;
    let content = fs.readFileSync(file, 'utf-8');
    content = content.split(search).join(replace);
    fs.writeFileSync(file, content);
}

// ClientDashboard missing Activity import (it was probably overwritten when checking out?) Let's add it carefully.
let cd = fs.readFileSync('src/components/professional/ClientDashboard.jsx', 'utf-8');
if (!cd.includes('Activity')) {
    cd = cd.replace('import { Play, User, MoreVertical, MapPin, Calendar, Clock, Video, Brain, MessageSquare } from \'lucide-react\';', 'import { Play, User, MoreVertical, MapPin, Calendar, Clock, Video, Brain, MessageSquare, Activity } from \'lucide-react\';');
    fs.writeFileSync('src/components/professional/ClientDashboard.jsx', cd);
}

// SuccessStories.test.jsx -> duplicate import from somewhere? The output says "Identifier 'render' has already been declared"
let ssTest = fs.readFileSync('src/components/community/SuccessStories.test.jsx', 'utf-8');
ssTest = ssTest.replace('import { render, screen, fireEvent, waitFor } from \'@testing-library/react\';\nimport { render, screen, fireEvent, waitFor } from \'@testing-library/react\';', 'import { render, screen, fireEvent, waitFor } from \'@testing-library/react\';');
fs.writeFileSync('src/components/community/SuccessStories.test.jsx', ssTest);


// LoadingSpinner.test.jsx
let lsTest = fs.readFileSync('src/components/ui/LoadingSpinner.test.jsx', 'utf-8');
lsTest = lsTest.replace('import LoadingSpinner from "./LoadingSpinner";\nimport React from "react";\nimport { render, screen } from \'@testing-library/react\';\nimport { describe, it, expect } from \'vitest\';\nimport LoadingSpinner from \'./LoadingSpinner\';', 'import React from "react";\nimport { render, screen } from \'@testing-library/react\';\nimport { describe, it, expect } from \'vitest\';\nimport LoadingSpinner from \'./LoadingSpinner\';');
fs.writeFileSync('src/components/ui/LoadingSpinner.test.jsx', lsTest);


// BreathinessMeter.jsx
let bm = fs.readFileSync('src/components/viz/BreathinessMeter.jsx', 'utf-8');
bm = bm.replace('import { renderCoordinator } from \'../../services/RenderCoordinator\';\nimport { Wind, CheckCircle2, AlertTriangle, Info, Sparkles, Activity, HelpCircle } from \'lucide-react\';\nimport { renderCoordinator } from \'../../services/RenderCoordinator\';', 'import { Wind, CheckCircle2, AlertTriangle, Info, Sparkles, Activity, HelpCircle } from \'lucide-react\';\nimport { renderCoordinator } from \'../../services/RenderCoordinator\';');
fs.writeFileSync('src/components/viz/BreathinessMeter.jsx', bm);


// QuickActions.jsx
// 81:19 error Parsing error: Unexpected token `}`. Did you mean `&rbrace;` or `{"}"}`?
let qa = fs.readFileSync('src/components/ui/QuickActions.jsx', 'utf-8');
qa = qa.replace('                    </button>\n                ))}\n            </div>', '                    </button>\n                ))}\n            </div>\n        </div>\n    );');
fs.writeFileSync('src/components/ui/QuickActions.jsx', qa);

// QuickActions.jsx again, need to make sure we don't have dangling things.
// actually let's checkout QuickActions.jsx and re-apply our fixes if any. Wait, we didn't touch QuickActions.jsx for this task. It must be a baseline failure or messed up by my replaceAll.
// I'll git checkout these files back to baseline because I should not be trying to fix them! The task was just palette icon buttons!
