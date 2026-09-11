with open("src/components/marketplace/MarketplaceBrowser.jsx", "r") as f:
    content = f.read()

import re
content = re.sub(r'import React, \{ useState, useEffect \} from \'react\';\nimport \{ Tabs, TabsList, TabsTrigger, TabsContent \} from \'@/components/ui/tabs\';\n', 'import React, { useState, useEffect } from \'react\';\nimport { Tabs, TabsList, TabsTrigger, TabsContent } from \'@/components/ui/tabs\';\n', content)
# wait, what's wrong with MarketplaceBrowser exactly?
