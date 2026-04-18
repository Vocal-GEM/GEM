with open("src/components/community/SuccessStories.test.jsx", "r") as f:
    lines = f.readlines()

new_lines = lines[4:]

with open("src/components/community/SuccessStories.test.jsx", "w") as f:
    f.writelines(new_lines)
