import { createContext, useContext, useState, useEffect } from 'react';
import { indexedDB } from '../services/IndexedDBManager';

const ClientContext = createContext();

export const useClient = () => useContext(ClientContext);

export const ClientProvider = ({ children }) => {
    const [clients, setClients] = useState([]);
    const [activeClient, setActiveClient] = useState(null);

    useEffect(() => {
        const loadClients = async () => {
            try {
                await indexedDB.ensureReady();
                const savedClients = await indexedDB.getClients();
                if (savedClients) setClients(savedClients);
            } catch (e) {
                console.error("Failed to load clients:", e);
            }
        };
        loadClients();
    }, []);

    const addClient = async (clientData) => {
        const newClient = { ...clientData, id: crypto.randomUUID(), createdAt: new Date().toISOString() };
        await indexedDB.saveClient(newClient);
        setClients(prev => [...prev, newClient]);
        return newClient;
    };

    const deleteClient = async (clientId) => {
        await indexedDB.deleteClient(clientId);
        setClients(prev => prev.filter(c => c.id !== clientId));
        if (activeClient?.id === clientId) setActiveClient(null);
    };

    const updateClient = async (client) => {
        await indexedDB.saveClient(client);
        setClients(prev => prev.map(c => c.id === client.id ? client : c));
        if (activeClient?.id === client.id) setActiveClient(client);
    };

    const value = {
        clients,
        activeClient,
        setActiveClient,
        addClient,
        deleteClient,
        updateClient
    };

    return <ClientContext.Provider value={value}>{children}</ClientContext.Provider>;
};
