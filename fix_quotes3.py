import sys

def fix_task(filepath):
    with open(filepath, 'r') as f:
        content = f.read()

    # The previous regex might have missed the trailing quote if the string was slightly different. Let's just hardcode the fix based on the lines we just read.
    content = content.replace("&quot;{task.prompt.replace('Read: \"', '').replace('\"', '')}\"", "&quot;{task.prompt.replace('Read: \"', '').replace('\"', '')}&quot;")

    with open(filepath, 'w') as f:
        f.write(content)

if __name__ == "__main__":
    fix_task("src/components/professional/TaskRecorder.jsx")
