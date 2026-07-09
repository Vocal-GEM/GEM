with open('src/components/professional/TaskRecorder.jsx', 'r') as f:
    content = f.read()

search = """                            "{task.prompt.replace('Read: "', '').replace('"', '')}\""""
replace = """                            &quot;{task.prompt.replace('Read: "', '').replace('"', '')}&quot;"""

if search in content:
    content = content.replace(search, replace)
    with open('src/components/professional/TaskRecorder.jsx', 'w') as f:
        f.write(content)
    print("Success fixing task recorder")
else:
    print("Search string not found")
