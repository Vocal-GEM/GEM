with open('src/components/viz/QualityVisualizer.jsx', 'r') as f:
    lines = f.readlines()

new_lines = []
skip = False
for i, line in enumerate(lines):
    if i == 27:
        new_lines.append("    useEffect(() => {\n")
        new_lines.append("        const loop = () => {\n")
        new_lines.append("            if (!dataRef.current) return;\n")
        new_lines.append("            const data = dataRef.current;\n")
        new_lines.append("\n")
        new_lines.append("            // Update local state\n")
        new_lines.append("            setMetrics({\n")
        new_lines.append("                jitter: data.jitter || 0,\n")
        new_lines.append("                shimmer: data.shimmer || 0,\n")
        new_lines.append("                weight: data.weight || 50\n")
        new_lines.append("            });\n")
        new_lines.append("\n")
        new_lines.append("            // Update history\n")
        new_lines.append("            ['jitter', 'shimmer', 'weight'].forEach(key => {\n")
        new_lines.append("                historyRef.current[key].push(data[key] || 0);\n")
        new_lines.append("                if (historyRef.current[key].length > maxHistory) {\n")
        new_lines.append("                    historyRef.current[key].shift();\n")
        new_lines.append("                }\n")
        new_lines.append("            });\n")
        new_lines.append("        };\n")
        new_lines.append("\n")
        new_lines.append("        const unsubscribe = renderCoordinator.subscribe(\n")
        new_lines.append("            componentId,\n")
        new_lines.append("            loop,\n")
        new_lines.append("            renderCoordinator.PRIORITY.MEDIUM\n")
        new_lines.append("        );\n")
        new_lines.append("\n")
        new_lines.append("        return () => {\n")
        new_lines.append("            unsubscribe();\n")
        new_lines.append("        };\n")
        new_lines.append("    }, [dataRef, componentId]);\n")
        skip = True

    if skip and line.strip() == "// Helper to render sparkline":
        skip = False
        new_lines.append("\n")

    if not skip:
        new_lines.append(line)

with open('src/components/viz/QualityVisualizer.jsx', 'w') as f:
    f.writelines(new_lines)
