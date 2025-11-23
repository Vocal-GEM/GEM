import React from 'react';

const IncognitoScreen = ({ onExit }) => {
    return (
        <div className="fixed inset-0 z-[9999] bg-black font-mono text-green-500 p-4 overflow-hidden" onDoubleClick={onExit}>
            <div className="text-xs opacity-70 mb-4">SYSTEM DIAGNOSTICS TOOL v4.2.1</div>
            <div className="space-y-1 text-[10px] sm:text-xs">
                <div>{'>'} CPU: OK</div>
                <div>{'>'} MEM: 1024MB OK</div>
                <div>{'>'} DISK: /dev/sda1 MOUNTED</div>
                <div>{'>'} NET: ETH0 UP 192.168.1.105</div>
                <div>{'>'} KERNEL: 5.15.0-76-generic</div>
                <div className="opacity-50">{'>'} Loading modules...</div>
                <div className="animate-pulse">{'>'} _</div>
            </div>
            <div className="absolute bottom-4 left-4 text-[9px] text-gray-600">Double-tap to exit diagnostics</div>
        </div>
    );
};

export default IncognitoScreen;
