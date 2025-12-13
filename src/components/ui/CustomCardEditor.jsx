import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Star, Copy, X, FolderPlus, FileText } from 'lucide-react';
import {
    getCollections,
    createCollection,
    deleteCollection,
    addCard,
    deleteCard,
    toggleStar,
    importFromText
} from '../../services/CustomCardsService';

const CustomCardEditor = ({ onClose }) => {
    const [collections, setCollections] = useState([]);
    const [activeCollection, setActiveCollection] = useState(null);
    const [showNewCollection, setShowNewCollection] = useState(false);
    const [newCollectionName, setNewCollectionName] = useState('');
    const [newCardText, setNewCardText] = useState('');
    const [importText, setImportText] = useState('');
    const [showImport, setShowImport] = useState(false);

    useEffect(() => {
        loadCollections();
    }, []);

    const loadCollections = () => {
        const data = getCollections();
        setCollections(data);
        if (data.length > 0 && !activeCollection) {
            setActiveCollection(data[0]);
        }
    };

    const handleCreateCollection = () => {
        if (!newCollectionName.trim()) return;
        const newColl = createCollection(newCollectionName.trim());
        setNewCollectionName('');
        setShowNewCollection(false);
        loadCollections();
        setActiveCollection(newColl);
    };

    const handleDeleteCollection = (id) => {
        if (confirm('Delete this collection and all its cards?')) {
            deleteCollection(id);
            loadCollections();
            if (activeCollection?.id === id) {
                setActiveCollection(collections.length > 1 ? collections[0] : null);
            }
        }
    };

    const handleAddCard = () => {
        if (!newCardText.trim() || !activeCollection) return;
        addCard(activeCollection.id, { text: newCardText.trim() });
        setNewCardText('');
        loadCollections();
        // Refresh active collection
        setActiveCollection(getCollections().find(c => c.id === activeCollection.id));
    };

    const handleDeleteCard = (cardId) => {
        if (!activeCollection) return;
        deleteCard(activeCollection.id, cardId);
        loadCollections();
        setActiveCollection(getCollections().find(c => c.id === activeCollection.id));
    };

    const handleToggleStar = (cardId) => {
        if (!activeCollection) return;
        toggleStar(activeCollection.id, cardId);
        loadCollections();
        setActiveCollection(getCollections().find(c => c.id === activeCollection.id));
    };

    const handleImport = () => {
        if (!importText.trim() || !activeCollection) return;
        importFromText(activeCollection.id, importText);
        setImportText('');
        setShowImport(false);
        loadCollections();
        setActiveCollection(getCollections().find(c => c.id === activeCollection.id));
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="w-full max-w-4xl max-h-[90vh] bg-slate-900 rounded-2xl border border-slate-700 overflow-hidden flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-slate-700">
                    <h2 className="text-xl font-bold text-white">My Practice Cards</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-white p-2">
                        <X size={20} />
                    </button>
                </div>

                <div className="flex flex-1 overflow-hidden">
                    {/* Collections Sidebar */}
                    <div className="w-64 border-r border-slate-700 p-4 overflow-y-auto">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-bold text-slate-400 uppercase">Collections</h3>
                            <button
                                onClick={() => setShowNewCollection(true)}
                                className="p-1 text-slate-400 hover:text-white"
                            >
                                <FolderPlus size={18} />
                            </button>
                        </div>

                        {showNewCollection && (
                            <div className="mb-4">
                                <input
                                    value={newCollectionName}
                                    onChange={(e) => setNewCollectionName(e.target.value)}
                                    placeholder="Collection name..."
                                    className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white text-sm"
                                    onKeyDown={(e) => e.key === 'Enter' && handleCreateCollection()}
                                    autoFocus
                                />
                                <div className="flex gap-2 mt-2">
                                    <button onClick={handleCreateCollection} className="flex-1 py-1 bg-emerald-600 text-white text-sm rounded-lg">Create</button>
                                    <button onClick={() => setShowNewCollection(false)} className="flex-1 py-1 bg-slate-700 text-white text-sm rounded-lg">Cancel</button>
                                </div>
                            </div>
                        )}

                        <div className="space-y-1">
                            {collections.map(coll => (
                                <div
                                    key={coll.id}
                                    className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors ${activeCollection?.id === coll.id
                                            ? 'bg-blue-600 text-white'
                                            : 'text-slate-300 hover:bg-slate-800'
                                        }`}
                                    onClick={() => setActiveCollection(coll)}
                                >
                                    <span className="truncate">{coll.name}</span>
                                    <span className="text-xs text-slate-500">{coll.cards?.length || 0}</span>
                                </div>
                            ))}
                        </div>

                        {collections.length === 0 && (
                            <p className="text-slate-500 text-sm text-center py-4">No collections yet</p>
                        )}
                    </div>

                    {/* Cards Area */}
                    <div className="flex-1 p-4 overflow-y-auto">
                        {activeCollection ? (
                            <>
                                <div className="flex items-center justify-between mb-4">
                                    <div>
                                        <h3 className="text-lg font-bold text-white">{activeCollection.name}</h3>
                                        <p className="text-sm text-slate-400">{activeCollection.cards?.length || 0} cards</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => setShowImport(!showImport)}
                                            className="px-3 py-1 bg-slate-700 hover:bg-slate-600 text-white text-sm rounded-lg flex items-center gap-1"
                                        >
                                            <Copy size={14} /> Import
                                        </button>
                                        <button
                                            onClick={() => handleDeleteCollection(activeCollection.id)}
                                            className="px-3 py-1 bg-red-600/20 hover:bg-red-600/40 text-red-400 text-sm rounded-lg"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>

                                {/* Import Area */}
                                {showImport && (
                                    <div className="mb-4 p-3 bg-slate-800 rounded-lg border border-slate-700">
                                        <p className="text-sm text-slate-400 mb-2">Paste sentences (one per line):</p>
                                        <textarea
                                            value={importText}
                                            onChange={(e) => setImportText(e.target.value)}
                                            placeholder="Hello, how are you today?\nThis is another sentence.\nPractice makes perfect."
                                            className="w-full p-2 bg-slate-900 border border-slate-600 rounded-lg text-white text-sm resize-none"
                                            rows={4}
                                        />
                                        <button
                                            onClick={handleImport}
                                            className="mt-2 px-4 py-2 bg-emerald-600 text-white text-sm rounded-lg"
                                        >
                                            Import Cards
                                        </button>
                                    </div>
                                )}

                                {/* Add New Card */}
                                <div className="flex gap-2 mb-4">
                                    <input
                                        value={newCardText}
                                        onChange={(e) => setNewCardText(e.target.value)}
                                        placeholder="Enter a practice sentence..."
                                        className="flex-1 px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white"
                                        onKeyDown={(e) => e.key === 'Enter' && handleAddCard()}
                                    />
                                    <button
                                        onClick={handleAddCard}
                                        className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg flex items-center gap-1"
                                    >
                                        <Plus size={18} /> Add
                                    </button>
                                </div>

                                {/* Cards List */}
                                <div className="space-y-2">
                                    {activeCollection.cards?.map(card => (
                                        <div
                                            key={card.id}
                                            className="flex items-start gap-3 p-3 bg-slate-800 border border-slate-700 rounded-lg hover:border-slate-600 transition-colors"
                                        >
                                            <button
                                                onClick={() => handleToggleStar(card.id)}
                                                className={card.starred ? 'text-amber-400' : 'text-slate-600'}
                                            >
                                                <Star size={18} fill={card.starred ? 'currentColor' : 'none'} />
                                            </button>
                                            <p className="flex-1 text-white">{card.text}</p>
                                            <button
                                                onClick={() => handleDeleteCard(card.id)}
                                                className="text-slate-500 hover:text-red-400"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    ))}
                                </div>

                                {activeCollection.cards?.length === 0 && (
                                    <div className="text-center py-8 text-slate-500">
                                        <FileText size={32} className="mx-auto mb-2 opacity-50" />
                                        <p>No cards in this collection</p>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="flex items-center justify-center h-full text-slate-500">
                                <div className="text-center">
                                    <FolderPlus size={48} className="mx-auto mb-4 opacity-50" />
                                    <p>Create a collection to get started</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CustomCardEditor;
