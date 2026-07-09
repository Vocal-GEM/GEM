with open('src/audio/PitchWorklet.js', 'r') as f:
    content = f.read()

search = """    process(inputs, outputs, parameters) {
        const input = inputs[0];"""

replace = """    process(inputs, _outputs, _parameters) {
        const input = inputs[0];"""

if search in content:
    content = content.replace(search, replace)
    with open('src/audio/PitchWorklet.js', 'w') as f:
        f.write(content)
    print("Success replacing process args")
else:
    print("Search string not found")
