## 2024-11-04 - React Performance - Date Object Instantiation
**Learning:** Using `useState(new Date())` or `useState(new Date().getMonth())` in React components evaluates the expression on every render, even though the initial state is only used on the first render.
**Action:** Use a lazy initializer function `useState(() => new Date())` to avoid unnecessary object instantiation and method calls on every render.
