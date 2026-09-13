import re

with open('src/components/community/SuccessStories.test.jsx', 'r') as f:
    content = f.read()

content = content.replace("import { render, screen, waitFor, fireEvent } from '@testing-library/react';\nimport { vi, describe, test, expect, beforeEach } from 'vitest';\nimport React from 'react';\nimport { render, screen, fireEvent, waitFor } from '@testing-library/react';\nimport { describe, it, expect, vi, beforeEach } from 'vitest';", "import { render, screen, waitFor, fireEvent } from '@testing-library/react';\nimport { vi, describe, it, test, expect, beforeEach } from 'vitest';\nimport React from 'react';")

with open('src/components/community/SuccessStories.test.jsx', 'w') as f:
    f.write(content)

print("Done fixing linting errors")
