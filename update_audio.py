with open('src/components/professional/AudioSourceManager.jsx', 'r') as f:
    content = f.read()

content = content.replace("    useEffect(() => {\n        checkPermissionAndEnumerate();\n    }, []);\n\n    const checkPermissionAndEnumerate = async () => {", "    const checkPermissionAndEnumerate = useCallback(async () => {")

content = content.replace("        } catch (err) {\n            console.error(\"Microphone permission denied:\", err);\n            setPermissionGranted(false);\n        }\n    };\n\n    const enumerateDevices = async () => {", "        } catch (err) {\n            console.error(\"Microphone permission denied:\", err);\n            setPermissionGranted(false);\n        }\n    // eslint-disable-next-line react-hooks/exhaustive-deps\n    }, [onSourceChange]);\n\n    useEffect(() => {\n        checkPermissionAndEnumerate();\n    }, [checkPermissionAndEnumerate]);\n\n    const enumerateDevices = async () => {")

with open('src/components/professional/AudioSourceManager.jsx', 'w') as f:
    f.write(content)
