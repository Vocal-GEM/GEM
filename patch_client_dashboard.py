with open("src/components/professional/ClientDashboard.jsx", "r") as f:
    lines = f.readlines()

new_lines = []
for line in lines:
    if '<// Activity size={18} /> Progress' in line:
        line = line.replace('<// Activity size={18} /> Progress', 'Progress')
    new_lines.append(line)

with open("src/components/professional/ClientDashboard.jsx", "w") as f:
    f.writelines(new_lines)
