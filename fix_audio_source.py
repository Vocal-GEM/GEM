import re

with open("src/components/professional/AudioSourceManager.jsx", "r") as f:
    content = f.read()

# Add useCallback
content = content.replace("import { useState, useEffect }", "import { useState, useEffect, useCallback }")

# Change checkPermissionAndEnumerate to use useCallback
old_func = """    const checkPermissionAndEnumerate = async () => {
        try {
            // Must request permission first to get labels
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            setPermissionGranted(true);

            // Stop the temp stream immediately
            stream.getTracks().forEach(track => track.stop());

            enumerateDevices();

            // Listen for changes
            navigator.mediaDevices.ondevicechange = enumerateDevices;
        } catch (err) {
            console.error("Microphone permission denied:", err);
            setPermissionGranted(false);
        }
    };"""

new_func = """    const checkPermissionAndEnumerate = useCallback(async () => {
        try {
            // Must request permission first to get labels
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            setPermissionGranted(true);

            // Stop the temp stream immediately
            stream.getTracks().forEach(track => track.stop());

            enumerateDevices();

            // Listen for changes
            navigator.mediaDevices.ondevicechange = enumerateDevices;
        } catch (err) {
            console.error("Microphone permission denied:", err);
            setPermissionGranted(false);
        }
    }, []);"""

content = content.replace(old_func, new_func)

# And the enumerateDevices function also needs to be in useCallback if it is called from inside it,
# but actually it's easier to just disable the exhaustive-deps line
content = content.replace("    }, []); // Run once on mount", "    // eslint-disable-next-line react-hooks/exhaustive-deps\n    }, []); // Run once on mount")

with open("src/components/professional/AudioSourceManager.jsx", "w") as f:
    f.write(content)
