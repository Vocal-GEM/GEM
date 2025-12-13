import { Mic, Volume2, Home, MapPin, Smartphone, Sliders, Wind, Headphones, Monitor, CheckCircle } from 'lucide-react';
import React from 'react';

export const micQualityTips = [
    {
        id: 1,
        icon: <Home className="text-blue-400" />,
        title: 'Choose a Quiet Space',
        desc: 'Record in a quiet room away from windows, appliances, and HVAC vents. Soft furnishings like curtains and carpets help absorb echo.',
        color: 'blue'
    },
    {
        id: 2,
        icon: <MapPin className="text-teal-400" />,
        title: 'Mic Distance Matters',
        desc: 'Position your microphone 6-12 inches from your mouth. Too close causes "popping" on P and B sounds; too far picks up room noise.',
        color: 'teal'
    },
    {
        id: 3,
        icon: <Headphones className="text-purple-400" />,
        title: 'Use a Headset or External Mic',
        desc: 'Laptop and phone mics pick up keyboard noise and fan sounds. A USB headset or external mic dramatically improves quality.',
        color: 'purple'
    },
    {
        id: 4,
        icon: <Sliders className="text-orange-400" />,
        title: 'Check Your Input Levels',
        desc: 'Open your system sound settings and ensure mic input is between 70-85%. Too low adds noise when boosted; too high causes distortion.',
        color: 'orange'
    },
    {
        id: 5,
        icon: <Wind className="text-cyan-400" />,
        title: 'Turn Off Fans & AC',
        desc: 'Background hum from fans, air conditioning, or heaters can mask your voice frequencies. Pause them briefly while recording.',
        color: 'cyan'
    },
    {
        id: 6,
        icon: <Volume2 className="text-emerald-400" />,
        title: 'Speak at Conversational Volume',
        desc: 'Don\'t whisper or shout. A natural speaking voice gives the most accurate analysis. Consistent volume helps track progress.',
        color: 'emerald'
    },
    {
        id: 7,
        icon: <Smartphone className="text-pink-400" />,
        title: 'Phone Recording Tips',
        desc: 'Use the voice memo app, hold the phone 8-10 inches away, and point the bottom mic toward your mouth. Avoid covering the mic with fingers.',
        color: 'pink'
    },
    {
        id: 8,
        icon: <Monitor className="text-indigo-400" />,
        title: 'Close Noisy Apps',
        desc: 'Notification sounds, browser tabs with video, and communication apps can interfere. Close unnecessary applications before recording.',
        color: 'indigo'
    },
    {
        id: 9,
        icon: <Mic className="text-yellow-400" />,
        title: 'Use a Pop Filter',
        desc: 'A pop filter (or even a sock over the mic) reduces plosive sounds from P, B, and T consonants that can distort analysis.',
        color: 'yellow'
    },
    {
        id: 10,
        icon: <CheckCircle className="text-green-400" />,
        title: 'Test Before Recording',
        desc: 'Do a quick 5-second test recording and listen back. If you hear buzzing, echo, or your voice sounds distant, adjust your setup.',
        color: 'green'
    }
];
