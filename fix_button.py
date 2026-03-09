with open("src/components/ui/button.test.jsx", "r") as f:
    content = f.read()

# Fix the duplicate test structure caused by a bad merge conflict resolution
content = content.replace('''    expect(screen.queryByText("Icon")).not.toBeInTheDocument();
import React from "react";

describe("Button", () => {
  it("renders children correctly", () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole("button", { name: /click me/i })).toBeInTheDocument();
  });

  it("shows loading spinner when isLoading is true", () => {''',
'''    expect(screen.queryByText("Icon")).not.toBeInTheDocument();
  });

  it("renders children correctly", () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole("button", { name: /click me/i })).toBeInTheDocument();
  });

  it("shows loading spinner when isLoading is true", () => {''')

with open("src/components/ui/button.test.jsx", "w") as f:
    f.write(content)
