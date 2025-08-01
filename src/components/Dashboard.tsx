import React, { useState } from 'react';
import { Party, IDEOLOGIAS } from '../types/Party';
import { BarChart3, Edit2, Trash2, Filter, Users } from 'lucide-react';

interface DashboardProps {
  parties: Party[];
  onEditParty: (party: Party) => void;
  onDeleteParty: (id: number) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ parties, onEditParty, onDeleteParty }) => {
  const [filterIdeologia, setFilterIdeologia] = useState<string>('');

  const filteredParties = parties.filter(party => 
    !filterIdeologia || party.ideologia === filterIdeologia
  );

  const getIdeologiaStats = () => {
    const stats: Record<string, number> = {};
    parties.forEach(party => {
      if (party.ideologia) {
        stats[party.ideologia] = (stats[party.ideologia] || 0) + 1;
      }
    });
    return stats;
  };

  const ideologiaStats = getIdeologiaStats();
  const maxCount = Math.max(...Object.values(ideologiaStats), 1);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-PE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getIdeologiaLabel = (value: string) => {
    return IDEOLOGIAS.find(i => i.value === value)?.label || value;
  };

  return (
    <div className="space-y-8">
      {/* Header con estadísticas */}
      <div className="bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold mb-2">Dashboard de Partidos Políticos</h2>
            <p className="text-red-100">Región Cusco, Perú</p>
          </div>
          <div className="text-center">
            <div className="flex items-center gap-2 mb-2">
              <Users size={24} />
              <span className="text-2xl font-bold">{parties.length}</span>
            </div>
            <p className="text-red-100">Partidos Registrados</p>
          </div>
        </div>
      </div>

      {/* Gráfico de Ideologías */}
      {Object.keys(ideologiaStats).length > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <BarChart3 className="text-red-600" size={24} />
            Distribución por Ideología Política
          </h3>
          <div className="space-y-3">
            {Object.entries(ideologiaStats).map(([ideologia, count]) => (
              <div key={ideologia} className="flex items-center gap-4">
                <div className="w-32 text-sm font-medium text-gray-700">
                  {getIdeologiaLabel(ideologia)}
                </div>
                <div className="flex-1 bg-gray-200 rounded-full h-6 relative">
                  <div
                    className="bg-gradient-to-r from-red-500 to-red-600 h-6 rounded-full flex items-center justify-end pr-2"
                    style={{ width: `${(count / maxCount) * 100}%` }}
                  >
                    <span className="text-white text-xs font-bold">{count}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filtros */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <div className="flex items-center gap-2">
            <Filter className="text-gray-600" size={20} />
            <span className="font-semibold text-gray-700">Filtrar por:</span>
          </div>
          <select
            value={filterIdeologia}
            onChange={(e) => setFilterIdeologia(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
          >
            <option value="">Todas las ideologías</option>
            {IDEOLOGIAS.map(ideologia => (
              <option key={ideologia.value} value={ideologia.value}>
                {ideologia.label}
              </option>
            ))}
          </select>
          {filterIdeologia && (
            <span className="text-sm text-gray-600">
              Mostrando {filteredParties.length} de {parties.length} partidos
            </span>
          )}
        </div>
      </div>

      {/* Tabla de Partidos */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-xl font-bold text-gray-800">
            Lista de Partidos Políticos Registrados
          </h3>
        </div>
        
        {filteredParties.length === 0 ? (
          <div className="p-12 text-center">
            <Users className="mx-auto text-gray-400 mb-4" size={48} />
            <p className="text-gray-500 text-lg">
              {filterIdeologia ? 'No hay partidos con esta ideología' : 'No hay partidos registrados aún'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Logo
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Partido
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Ideología
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Fundación
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Sede
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Color
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredParties.map((party) => (
                  <tr key={party.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      {party.logoUrl ? (
                        <img
                          src={party.logoUrl}
                          alt={`Logo de ${party.nombre}`}
                          className="w-12 h-12 object-cover rounded-lg shadow-sm"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                          <span className="text-gray-400 text-xs font-bold">
                            {party.sigla.substring(0, 2)}
                          </span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-semibold text-gray-900">{party.nombre}</div>
                        <div className="text-sm text-gray-500">{party.sigla}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {party.ideologia ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {getIdeologiaLabel(party.ideologia)}
                        </span>
                      ) : (
                        <span className="text-gray-400">No especificada</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {formatDate(party.fechaFundacion)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {party.sedePrincipal}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-6 h-6 rounded-full border-2 border-gray-300"
                          style={{ backgroundColor: party.colorRepresentativo }}
                        ></div>
                        <span className="text-sm text-gray-600">{party.colorRepresentativo}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => onEditParty(party)}
                          className="text-blue-600 hover:text-blue-900 p-2 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Editar partido"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => onDeleteParty(Number(party.id))}
                          className="text-red-600 hover:text-red-900 p-2 hover:bg-red-50 rounded-lg transition-colors"
                          title="Eliminar partido"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};