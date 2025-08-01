import { useState, useEffect } from 'react';
import { Party } from './types/Party';
import { PartyForm } from './components/PartyForm';
import { Dashboard } from './components/Dashboard';

import { Flag, MapPin } from 'lucide-react';

const API_URL = 'https://partidos-74j4.onrender.com/api';

function App() {
  const [parties, setParties] = useState<Party[]>([]);
  const [editingParty, setEditingParty] = useState<Party | null>(null);
  const [activeTab, setActiveTab] = useState<'registro' | 'dashboard'>('registro');

  const fetchParties = async () => {
    try {
      const response = await fetch(`${API_URL}/parties`);
      const data = await response.json();
      // Mapeo de snake_case (API) a camelCase (estado de React)
      const mappedData = data.map((party: any) => ({
        id: parseInt(party.id, 10),
        nombre: party.nombre,
        sigla: party.sigla,
        ideologia: party.ideologia,
        fechaFundacion: party.fecha_fundacion,
        sedePrincipal: party.sede_principal,
        colorRepresentativo: party.color_representativo,
        logoUrl: party.logo_url
      }));
      setParties(mappedData);
    } catch (error) {
      console.error('Error al cargar los partidos:', error);
      setParties([]); // Asegurarse de que parties sea un array en caso de error
    }
  };

  useEffect(() => {
    fetchParties();
  }, []);

  const handleAddParty = async (partyData: Omit<Party, 'id' | 'logoUrl'>, logoFile: File | null) => {
    try {
      const formData = new FormData();

      // Mapeo de camelCase (estado de React) a snake_case (API)
      formData.append('nombre', partyData.nombre);
      formData.append('sigla', partyData.sigla);
      formData.append('ideologia', partyData.ideologia);
      formData.append('fecha_fundacion', partyData.fechaFundacion);
      formData.append('sede_principal', partyData.sedePrincipal);
      formData.append('color_representativo', partyData.colorRepresentativo);

      if (logoFile) {
        formData.append('logo', logoFile);
      }

      const response = await fetch(`${API_URL}/parties`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Error al registrar el partido');
      }

      await response.json();
      await fetchParties();
      setActiveTab('dashboard');
    } catch (error) {
      console.error(error);
    }
  };

    const handleDeleteParty = async (id: number) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar este partido?')) {
      return;
    }
    try {
      const response = await fetch(`${API_URL}/parties/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Error desconocido al eliminar' }));
        throw new Error(errorData.message);
      }
      fetchParties();
    } catch (error) {
      console.error('Error en handleDeleteParty:', error);
    }
  };

  const handleUpdateParty = async (updatedParty: Party, logoFile: File | null) => {
    try {
      const formData = new FormData();

      formData.append('nombre', updatedParty.nombre);
      formData.append('sigla', updatedParty.sigla);
      formData.append('ideologia', updatedParty.ideologia);
      formData.append('fecha_fundacion', updatedParty.fechaFundacion);
      formData.append('sede_principal', updatedParty.sedePrincipal);
      formData.append('color_representativo', updatedParty.colorRepresentativo);

      if (logoFile) {
        formData.append('logo', logoFile);
      }

      const response = await fetch(`${API_URL}/parties/${updatedParty.id}`, {
        method: 'PUT',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Error al actualizar el partido');
      }

      await response.json();
      await fetchParties();
      setEditingParty(null);
      setActiveTab('dashboard');
    } catch (error) {
      console.error(error);
    }
  };

  const handleEditParty = (party: Party) => {
    setEditingParty(party);
    setActiveTab('registro');
  };

  const handleCancelEdit = () => {
    setEditingParty(null);
    setActiveTab('dashboard');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <Flag className="text-red-600" size={32} />
              <div>
                <h1 className="text-xl font-bold text-gray-900">Partidos Políticos Cusco</h1>
                <div className="flex items-center gap-1 text-sm text-gray-600">
                  <MapPin size={14} />
                  <span>Cusco, Perú</span>
                </div>
              </div>
            </div>
            <nav className="flex space-x-4">
              <button
                onClick={() => { setEditingParty(null); setActiveTab('registro'); }}
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

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'registro' ? (
          <PartyForm
            onAddParty={handleAddParty}
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

      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-600">
            <p>© 2025 Sistema de Registro de Partidos Políticos - Región Cusco</p>
            <p className="text-sm mt-2">Desarrollado para la gestión democrática y transparente de organizaciones políticas</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;