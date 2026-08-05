import re

with open("src/components/viz/HighResSpectrogram.jsx", "r") as f:
    content = f.read()

# Add missing useId
content = re.sub(
    r"import \{ useEffect, useRef, useMemo, useState, useCallback, memo \} from 'react';",
    r"import { useEffect, useRef, useMemo, useState, useCallback, memo, useId } from 'react';",
    content
)

with open("src/components/viz/HighResSpectrogram.jsx", "w") as f:
    f.write(content)
