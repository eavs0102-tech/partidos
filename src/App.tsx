import { useState, useEffect } from 'react';
import { Party } from './types/Party';
import { PartyForm } from './components/PartyForm';
import { Dashboard } from './components/Dashboard';

import { Flag, MapPin } from 'lucide-react';

const API_URL = 'http://localhost:3001/api';

function App() {
  const [parties, setParties] = useState<Party[]>([]);
  const [editingParty, setEditingParty] = useState<Party | null>(null);
  const [activeTab, setActiveTab] = useState<'registro' | 'dashboard'>('registro');

  const fetchParties = async () => {
    try {
      const response = await fetch(`${API_URL}/parties`);
      if (!response.ok) {
        throw new Error('Error al cargar los partidos');
      }
      const result = await response.json();
      setParties(result.data);
    } catch (error) {
      console.error(error);
      // Aquí podrías manejar el error en la UI
    }
  };

  useEffect(() => {
    fetchParties();
  }, []);

  const handleAddParty = async (partyData: Omit<Party, 'id'>) => {
    try {
      const response = await fetch(`${API_URL}/parties`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(partyData),
      });

      if (!response.ok) {
        throw new Error('Error al registrar el partido');
      }

      await response.json();
      await fetchParties(); // Recargar la lista de partidos
      setActiveTab('dashboard');
    } catch (error) {
      console.error(error);
      // Aquí podrías manejar el error en la UI
    }
  };

  const handleUpdateParty = (updatedParty: Party) => {
    setParties(prev => prev.map(party => 
      party.id === updatedParty.id ? updatedParty : party
    ));
    setEditingParty(null);
    setActiveTab('dashboard');
  };

  const handleEditParty = (party: Party) => {
    setEditingParty(party);
    setActiveTab('registro');
  };

  const handleDeleteParty = (id: string) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este partido político?')) {
      setParties(prev => prev.filter(party => party.id !== id));
    }
  };

  const handleCancelEdit = () => {
    setEditingParty(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <Flag className="text-red-600" size={32} />
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  Registro de Partidos Políticos
                </h1>
                <div className="flex items-center gap-1 text-sm text-gray-600">
                  <MapPin size={14} />
                  <span>Cusco, Perú</span>
                </div>
              </div>
            </div>
            
            <nav className="flex space-x-4">
              <button
                onClick={() => setActiveTab('registro')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === 'registro'
                    ? 'bg-red-600 text-white'
                    : 'text-gray-600 hover:text-red-600 hover:bg-red-50'
                }`}
              >
                Registro
              </button>
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === 'dashboard'
                    ? 'bg-red-600 text-white'
                    : 'text-gray-600 hover:text-red-600 hover:bg-red-50'
                }`}
              >
                Dashboard
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'registro' ? (
          <PartyForm
            onAddParty={handleAddParty as any}
            editingParty={editingParty}
            onUpdateParty={handleUpdateParty}
            onCancelEdit={handleCancelEdit}
          />
        ) : (
          <Dashboard
            parties={parties}
            onEditParty={handleEditParty}
            onDeleteParty={handleDeleteParty}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-600">
            <p>© 2025 Sistema de Registro de Partidos Políticos - Región Cusco</p>
            <p className="text-sm mt-2">
              Desarrollado para la gestión democrática y transparente de organizaciones políticas
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;