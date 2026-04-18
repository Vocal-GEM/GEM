with open("src/components/ui/LoadingSpinnerVerification.jsx", "r") as f:
    lines = f.readlines()

new_lines = lines[:81] + ["        </div>\n", "      </section>\n", "    </div>\n", "  );\n", "}\n"]

with open("src/components/ui/LoadingSpinnerVerification.jsx", "w") as f:
    f.writelines(new_lines)
