import json
import subprocess

result = subprocess.run(['npm', 'run', 'lint', '--', '--format', 'json'], capture_output=True, text=True, env={"ESLINT_USE_FLAT_CONFIG": "false", "PATH": "/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin", "NODE_ENV": "development"})
try:
    stdout_str = result.stdout
    idx = stdout_str.find('[')
    if idx != -1:
        stdout_str = stdout_str[idx:]
    data = json.loads(stdout_str)
    for item in data:
        if item.get('errorCount', 0) > 0:
            print(f"File: {item['filePath']}")
            for msg in item['messages']:
                if msg['severity'] == 2:
                    print(f"  Line {msg['line']}: {msg['message']} ({msg['ruleId']})")
except Exception as e:
    pass
