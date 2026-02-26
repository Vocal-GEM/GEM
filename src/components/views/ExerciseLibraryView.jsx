import { useState } from 'react';
import { Search, Filter, Grid, List, BookOpen, X, Info, PlayCircle } from 'lucide-react';
import { applyFilters, getCategories, getDifficulties, getExerciseStats } from '../../utils/exerciseSearchEngine';
import { useNavigation } from '../../context/NavigationContext';

const ExerciseLibraryView = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [selectedDifficulty, setSelectedDifficulty] = useState('all');
    const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
    const [selectedExercise, setSelectedExercise] = useState(null);
    const { navigate } = useNavigation();

    // Apply filters and get results
    const exercises = applyFilters({
        query: searchQuery,
        category: selectedCategory,
        difficulty: selectedDifficulty,
        sortBy: 'name'
    });

    const categories = getCategories();
    const difficulties = getDifficulties();
    const stats = getExerciseStats();

    const handleClearFilters = () => {
        setSearchQuery('');
        setSelectedCategory('all');
        setSelectedDifficulty('all');
    };

    const handleViewDetails = (exercise) => {
        setSelectedExercise(exercise);
    };

    const activeFilterCount = (searchQuery ? 1 : 0) +
        (selectedCategory !== 'all' ? 1 : 0) +
        (selectedDifficulty !== 'all' ? 1 : 0);

    return (
        <div className="h-full flex flex-col bg-slate-950 text-white overflow-hidden">
            {/* Header */}
            <div className="p-6 border-b border-white/5 bg-slate-900/50 backdrop-blur-sm shrink-0">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-500/20 rounded-lg">
                            <BookOpen className="w-6 h-6 text-blue-400" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold">Exercise Library</h2>
                            <p className="text-sm text-slate-400">
                                {stats.total} exercises • {Object.keys(stats.byCategory).length} categories
                            </p>
                        </div>
                    </div>

                    {/* View Toggle */}
                    <div className="flex gap-2 bg-slate-800 rounded-lg p-1">
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`p-2 rounded transition-all ${viewMode === 'grid'
                                    ? 'bg-blue-600 text-white'
                                    : 'text-slate-400 hover:text-white'
                                }`}
                            title="Grid view"
                        >
                            <Grid className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={`p-2 rounded transition-all ${viewMode === 'list'
                                    ? 'bg-blue-600 text-white'
                                    : 'text-slate-400 hover:text-white'
                                }`}
                            title="List view"
                        >
                            <List className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Search Bar */}
                <div className="relative mb-4">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search exercises by name, category, or instructions..."
                        className="w-full pl-12 pr-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-all"
                    />
                </div>

                {/* Filters */}
                <div className="flex flex-wrap gap-2">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
                        <Filter className="w-4 h-4" />
                        Filters:
                    </div>

                    {/* Category Filter */}
                    <div className="flex flex-wrap gap-2">
                        <button
                            onClick={() => setSelectedCategory('all')}
                            className={`px-3 py-1.5 text-xs rounded-full transition-all ${selectedCategory === 'all'
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                                }`}
                        >
                            All
                        </button>
                        {categories.map((cat) => (
                            <button
                                key={cat}
                                onClick={() => setSelectedCategory(cat)}
                                className={`px-3 py-1.5 text-xs rounded-full transition-all capitalize ${selectedCategory === cat
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                                    }`}
                            >
                                {cat} ({stats.byCategory[cat] || 0})
                            </button>
                        ))}
                    </div>

                    <div className="w-px h-6 bg-slate-700" />

                    {/* Difficulty Filter */}
                    <div className="flex gap-2">
                        {difficulties.map((diff) => (
                            <button
                                key={diff}
                                onClick={() => setSelectedDifficulty(diff === selectedDifficulty ? 'all' : diff)}
                                className={`px-3 py-1.5 text-xs rounded-full transition-all capitalize ${selectedDifficulty === diff
                                        ? 'bg-emerald-600 text-white'
                                        : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                                    }`}
                            >
                                {diff}
                            </button>
                        ))}
                    </div>

                    {activeFilterCount > 0 && (
                        <button
                            onClick={handleClearFilters}
                            className="px-3 py-1.5 text-xs bg-red-500/20 text-red-400 rounded-full hover:bg-red-500/30 transition-all flex items-center gap-1"
                        >
                            Clear ({activeFilterCount})
                            <X className="w-3 h-3" />
                        </button>
                    )}
                </div>
            </div>

            {/* Exercise Grid/List */}
            <div className="flex-1 overflow-y-auto p-6">
                {exercises.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12">
                        <div className="glass-panel rounded-2xl p-8 max-w-md text-center">
                            <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Search className="w-8 h-8 text-slate-600" />
                            </div>
                            <h3 className="text-lg font-bold mb-2">No exercises found</h3>
                            <p className="text-sm text-slate-400 mb-4">
                                Try adjusting your search or filters
                            </p>
                            {activeFilterCount > 0 && (
                                <button
                                    onClick={handleClearFilters}
                                    className="px-4 py-2 bg-blue-600 rounded-lg text-sm hover:bg-blue-500 transition-colors"
                                >
                                    Clear all filters
                                </button>
                            )}
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="flex items-center justify-between mb-4">
                            <p className="text-sm text-slate-400">
                                Showing {exercises.length} exercise{exercises.length > 1 ? 's' : ''}
                            </p>
                        </div>

                        {viewMode === 'grid' ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {exercises.map((exercise) => (
                                    <div
                                        key={exercise.id}
                                        className="glass-panel rounded-xl p-4 hover:bg-white/5 transition-all group flex flex-col"
                                    >
                                        <div className="flex items-start justify-between mb-3">
                                            <div>
                                                <h3 className="font-bold text-white group-hover:text-blue-400 transition-colors mb-1">
                                                    {exercise.title}
                                                </h3>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded-full capitalize">
                                                        {exercise.category}
                                                    </span>
                                                    <span className="text-xs px-2 py-0.5 bg-slate-700 text-slate-400 rounded-full capitalize">
                                                        {exercise.difficulty}
                                                    </span>
                                                </div>
                                            </div>
                                            <span className="text-xs text-slate-500 shrink-0">
                                                {exercise.duration}s
                                            </span>
                                        </div>

                                        <p className="text-sm text-slate-400 leading-relaxed mb-4 flex-1 line-clamp-3">
                                            {exercise.instructions}
                                        </p>

                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleViewDetails(exercise)}
                                                className="flex-1 py-2 bg-slate-700 rounded-lg text-white text-sm hover:bg-slate-600 transition-colors flex items-center justify-center gap-2"
                                            >
                                                <Info className="w-4 h-4" />
                                                Details
                                            </button>
                                            <button
                                                onClick={() => navigate('practice')}
                                                className="flex-1 py-2 bg-blue-600 rounded-lg text-white text-sm hover:bg-blue-500 transition-colors flex items-center justify-center gap-2"
                                            >
                                                <PlayCircle className="w-4 h-4" />
                                                Start
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {exercises.map((exercise) => (
                                    <div
                                        key={exercise.id}
                                        className="glass-panel rounded-xl p-4 hover:bg-white/5 transition-all group"
                                    >
                                        <div className="flex items-start gap-4">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <h3 className="font-bold text-white group-hover:text-blue-400 transition-colors">
                                                        {exercise.title}
                                                    </h3>
                                                    <span className="text-xs px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded-full capitalize">
                                                        {exercise.category}
                                                    </span>
                                                    <span className="text-xs px-2 py-0.5 bg-slate-700 text-slate-400 rounded-full capitalize">
                                                        {exercise.difficulty}
                                                    </span>
                                                    <span className="text-xs text-slate-500">
                                                        {exercise.duration}s
                                                    </span>
                                                </div>
                                                <p className="text-sm text-slate-400 leading-relaxed">
                                                    {exercise.instructions}
                                                </p>
                                            </div>
                                            <div className="flex flex-col gap-2 shrink-0">
                                                <button
                                                    onClick={() => handleViewDetails(exercise)}
                                                    className="p-2 bg-slate-700 rounded-lg text-white hover:bg-slate-600 transition-colors"
                                                    title="View details"
                                                >
                                                    <Info className="w-5 h-5" />
                                                </button>
                                                <button
                                                    onClick={() => navigate('practice')}
                                                    className="p-2 bg-blue-600 rounded-lg text-white hover:bg-blue-500 transition-colors"
                                                    title="Start exercise"
                                                >
                                                    <PlayCircle className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Exercise Detail Modal */}
            {selectedExercise && (
                <div className="absolute inset-0 bg-slate-950/95 backdrop-blur-sm p-6 flex items-center justify-center z-50 animate-in fade-in duration-200">
                    <div className="bg-slate-900 border border-white/10 rounded-2xl p-6 max-w-lg w-full max-h-[80vh] overflow-y-auto">
                        <div className="flex items-start justify-between mb-4">
                            <div>
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="text-xs px-2 py-1 bg-blue-500/20 rounded-full text-blue-400 font-bold uppercase tracking-wider capitalize">
                                        {selectedExercise.category}
                                    </span>
                                    <span className="text-xs px-2 py-1 bg-slate-700 rounded-full text-slate-400 capitalize">
                                        {selectedExercise.difficulty}
                                    </span>
                                </div>
                                <h3 className="text-2xl font-bold">{selectedExercise.title}</h3>
                            </div>
                            <button
                                onClick={() => setSelectedExercise(null)}
                                className="p-2 text-slate-500 hover:text-white transition-colors"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Instructions</h4>
                                <p className="text-slate-300 leading-relaxed">{selectedExercise.instructions}</p>
                            </div>

                            <div>
                                <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Duration</h4>
                                <p className="text-slate-300">{selectedExercise.duration} seconds</p>
                            </div>

                            {selectedExercise.goals && selectedExercise.goals.length > 0 && (
                                <div>
                                    <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Goals</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {selectedExercise.goals.map((goal, idx) => (
                                            <span key={idx} className="px-3 py-1 bg-slate-800 rounded-full text-sm text-slate-300 capitalize">
                                                {goal}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {selectedExercise.citations && selectedExercise.citations.length > 0 && (
                                <div>
                                    <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Research</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {selectedExercise.citations.map((citation, idx) => (
                                            <span key={idx} className="text-xs px-2 py-1 bg-slate-800 rounded text-slate-400">
                                                {citation}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <button
                                onClick={() => {
                                    setSelectedExercise(null);
                                    navigate('practice');
                                }}
                                className="w-full py-3 bg-blue-600 rounded-xl font-bold text-white hover:bg-blue-500 transition-colors flex items-center justify-center gap-2 mt-6"
                            >
                                <PlayCircle className="w-5 h-5" />
                                Go to Practice Mode
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ExerciseLibraryView;
