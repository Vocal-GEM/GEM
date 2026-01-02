import React from 'react';
import { MarketplaceBrowser } from '../marketplace/MarketplaceBrowser';

const MarketplaceView = () => {
    return (
        <div className="h-full overflow-y-auto">
            <MarketplaceBrowser />
        </div>
    );
};

export default MarketplaceView;
