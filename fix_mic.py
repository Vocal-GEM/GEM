with open('src/components/ui/MicrophoneCalibration.jsx', 'r') as f:
    content = f.read()

search = """                                <p className="text-slate-400 mb-6">Say "Ahhhh" or count to 5... ({countdown}s)</p>"""
replace = """                                <p className="text-slate-400 mb-6">Say &quot;Ahhhh&quot; or count to 5... ({countdown}s)</p>"""

if search in content:
    content = content.replace(search, replace)
    with open('src/components/ui/MicrophoneCalibration.jsx', 'w') as f:
        f.write(content)
    print("Success fixing mic")
else:
    print("Search string not found")
