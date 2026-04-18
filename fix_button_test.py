with open("src/components/ui/button.test.jsx", "r") as f:
    lines = f.readlines()

new_lines = lines[:32] + ["  });\n", "});\n"]

with open("src/components/ui/button.test.jsx", "w") as f:
    f.writelines(new_lines)
