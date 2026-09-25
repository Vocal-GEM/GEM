const fs = require('fs');
const file = 'src/components/professional/TaskRecorder.jsx';
let content = fs.readFileSync(file, 'utf8');
content = content.replace(
`                        <div className="mt-2 p-3 bg-slate-900/50 rounded border border-slate-700 text-slate-300 italic">
                            "{task.prompt.replace('Read: "', '').replace('"', '')}"
                        </div>`,
`                        <div className="mt-2 p-3 bg-slate-900/50 rounded border border-slate-700 text-slate-300 italic">
                            &quot;{task.prompt.replace('Read: "', '').replace('"', '')}&quot;
                        </div>`
);
fs.writeFileSync(file, content);
