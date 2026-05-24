#!/bin/bash
sed -i 's/                            "{task.prompt.replace('"'"'Read: \&quot;'"'"', '"'"''"'"').replace('"'"'"'"', '"'"''"'"')}"/                            \&quot;{task.prompt.replace('"'"'Read: \\\&quot;'"'"', '"'"''"'"').replace('"'"'\\\&quot;'"'"', '"'"''"'"')}\&quot;/' src/components/professional/TaskRecorder.jsx
# let's just make it completely simple:
sed -i 's/                            "{task.prompt.replace('"'"'Read: \&quot;'"'"', '"'"''"'"').replace('"'"'"'"', '"'"''"'"')}"/                            \&quot;{task.prompt.replace(\/Read: "|"\//g, '"'"''"'"')}\&quot;/' src/components/professional/TaskRecorder.jsx
