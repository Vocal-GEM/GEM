
import { useAudio } from '../../context/AudioContext';
import LTASPlot from '../viz/LTASPlot';
import { useTranslation } from 'react-i18next';
import { Activity, Wind, Waves, Mic2 } from 'lucide-react';

const MetricCard = ({ title, value, unit, icon, description, color = "text-teal-400" }) => (
    <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
        <div className="flex items-center gap-3 mb-2">
            <div className={`p-2 bg-slate-950 rounded-lg ${color}`}>
                {icon}
            </div>
            <h3 className="text-slate-200 font-bold">{title}</h3>
        </div>
        <div className="text-3xl font-mono font-bold text-white mb-1">
            {typeof value === 'number' ? value.toFixed(2) : value} <span className="text-sm text-slate-500">{unit}</span>
        </div>
        <p className="text-xs text-slate-400">{description}</p>
    </div>
);

const AcousticAnalysisView = () => {
    const { t } = useTranslation();
    const { dataRef } = useAudio();
    const backendData = dataRef.current?.debug?.backend || {};

    return (
        <div className="w-full min-h-screen bg-slate-950 p-6">
            <div className="max-w-6xl mx-auto pt-12">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-white mb-2">{t('acoustic.title')}</h1>
                    <p className="text-slate-400">{t('acoustic.subtitle')}</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                    {/* Vospector Module (Breathiness/Roughness) */}
                    <MetricCard
                        title={t('acoustic.cards.breathiness.title')}
                        value={backendData.breathiness_score || 0}
                        unit="%"
                        icon={<Wind size={20} />}
                        color="text-blue-400"
                        description={t('acoustic.cards.breathiness.desc')}
                    />
                    <MetricCard
                        title={t('acoustic.cards.roughness.title')}
                        value={backendData.roughness_score || 0}
                        unit="%"
                        icon={<Waves size={20} />}
                        color="text-orange-400"
                        description={t('acoustic.cards.roughness.desc')}
                    />
                    <MetricCard
                        title={t('acoustic.cards.cpp.title')}
                        value={backendData.cpp_mean || 0}
                        unit="dB"
                        icon={<Activity size={20} />}
                        color="text-emerald-400"
                        description={t('acoustic.cards.cpp.desc')}
                    />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* LTAS Section */}
                    <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                <Activity className="text-amber-400" />
                                {t('acoustic.ltas.title')}
                            </h2>
                        </div>
                        <LTASPlot width={500} height={300} />
                        <div className="mt-4 text-sm text-slate-400">
                            {t('acoustic.ltas.desc')}
                            <ul className="list-disc list-inside mt-2 space-y-1">
                                <li><strong>{t('acoustic.ltas.fem')}</strong></li>
                                <li><strong>{t('acoustic.ltas.masc')}</strong></li>
                            </ul>
                        </div>
                    </div>

                    {/* Spectral Tilt / Weight */}
                    <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800">
                        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                            <Mic2 className="text-purple-400" />
                            {t('acoustic.spectral.title')}
                        </h2>

                        <div className="flex items-center justify-center h-64">
                            <div className="text-center">
                                <div className="text-6xl font-bold text-white mb-2">
                                    {dataRef.current?.weight?.toFixed(1) || 0}
                                </div>
                                <div className="text-slate-400">{t('acoustic.spectral.score')}</div>
                                <div className="mt-8 w-full bg-slate-800 h-4 rounded-full overflow-hidden relative max-w-xs mx-auto">
                                    <div
                                        className="h-full bg-purple-500 transition-all duration-300"
                                        style={{ width: `${dataRef.current?.weight || 0}%` }}
                                    />
                                </div>
                                <div className="flex justify-between text-xs text-slate-500 mt-2 max-w-xs mx-auto">
                                    <span>{t('acoustic.spectral.dark')}</span>
                                    <span>{t('acoustic.spectral.bright')}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AcousticAnalysisView;
