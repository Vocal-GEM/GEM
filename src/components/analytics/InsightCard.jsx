import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const InsightCard = ({ insight, onDismiss }) => {
    if (!insight) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
            >
                <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-800 relative overflow-hidden">
                    <CardContent className="p-4 flex items-start gap-4">
                        <div className="text-3xl bg-white dark:bg-slate-800 rounded-full p-2 shadow-sm">
                            {insight.icon || '💡'}
                        </div>

                        <div className="flex-1">
                            <div className="flex justify-between items-start">
                                <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-1">
                                    {insight.title}
                                </h3>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6 -mr-2 -mt-2 text-blue-400 hover:text-blue-600 hover:bg-blue-100/50"
                                    onClick={onDismiss}
                                >
                                    <X size={16} />
                                </Button>
                            </div>

                            <p className="text-sm text-blue-800 dark:text-blue-200 leading-relaxed">
                                {insight.content}
                            </p>

                            {insight.link && (
                                <Button variant="link" className="p-0 h-auto text-xs mt-2 text-blue-600 dark:text-blue-300">
                                    Learn more &rarr;
                                </Button>
                            )}
                        </div>
                    </CardContent>

                    {/* Decorative background blur */}
                    <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-blue-400/10 rounded-full blur-3xl pointer-events-none" />
                </Card>
            </motion.div>
        </AnimatePresence>
    );
};
