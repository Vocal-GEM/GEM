const fs = require('fs');

const path = 'src/components/viz/VowelSpacePlot.jsx';
let content = fs.readFileSync(path, 'utf8');

// The file no longer needs useId and renderCoordinator because we put it inside an import statement
content = content.replace("import { useRef, useEffect, useState, useId } from 'react';", "import { useRef, useEffect, useState } from 'react';");
content = content.replace("import { renderCoordinator } from '../../services/RenderCoordinator';\n", "");

fs.writeFileSync(path, content);
