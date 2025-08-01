import React, { useState, useEffect } from 'react';
import { Party, IDEOLOGIAS, COLORES_POLITICOS } from '../types/Party';
import { Plus, Upload, X } from 'lucide-react';

interface PartyFormProps {
  onAddParty: (party: Omit<Party, 'id' | 'logoUrl'>, logoFile: File | null) => void;
  editingParty?: Party | null;
  onUpdateParty?: (party: Party, logoFile: File | null) => void;
  onCancelEdit?: () => void;
}

export const PartyForm: React.FC<PartyFormProps> = ({ 
  onAddParty, 
  editingParty, 
  onUpdateParty, 
  onCancelEdit 
}) => {
  const [formData, setFormData] = useState<Omit<Party, 'id'>>({
    nombre: '',
    sigla: '',
    ideologia: '',
    fechaFundacion: '',
    sedePrincipal: '',
    colorRepresentativo: '#DC2626',
    logo: null,
    logoUrl: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (editingParty) {
      const formattedDate = editingParty.fechaFundacion
        ? new Date(editingParty.fechaFundacion).toISOString().split('T')[0]
        : '';
      setFormData({
        nombre: editingParty.nombre || '',
        sigla: editingParty.sigla || '',
        ideologia: editingParty.ideologia || '',
        fechaFundacion: formattedDate,
        sedePrincipal: editingParty.sedePrincipal || '',
        colorRepresentativo: editingParty.colorRepresentativo || '#DC2626',
        logo: null,
        logoUrl: editingParty.logoUrl || ''
      });
    } else {
      setFormData({
        nombre: '',
        sigla: '',
        ideologia: '',
        fechaFundacion: '',
        sedePrincipal: '',
        colorRepresentativo: '#DC2626',
        logo: null,
        logoUrl: ''
      });
    }
  }, [editingParty]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({ 
        ...prev, 
        logo: file,
        logoUrl: URL.createObjectURL(file)
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.nombre.trim()) newErrors.nombre = 'El nombre del partido es obligatorio';
    if (!formData.sigla.trim()) newErrors.sigla = 'La sigla es obligatoria';
    if (!formData.fechaFundacion) newErrors.fechaFundacion = 'La fecha de fundación es obligatoria';
    if (!formData.sedePrincipal.trim()) newErrors.sedePrincipal = 'La sede principal es obligatoria';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    const { logo, ...partyData } = formData;

    if (editingParty && onUpdateParty) {
      const partyToUpdate: Party = { ...editingParty, ...partyData };
      onUpdateParty(partyToUpdate, logo || null);
    } else {
      onAddParty(partyData, logo || null);
    }
  };

  const handleCancel = () => {
    if (onCancelEdit) onCancelEdit();
  };

  return (
    <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-200 max-w-4xl mx-auto">
      <h2 className="text-3xl font-bold text-gray-800 mb-2 flex items-center gap-3">
        <Plus className="text-red-600" />
        {editingParty ? 'Editar Partido Político' : 'Registrar Nuevo Partido Político'}
      </h2>
      <p className="text-gray-600 mb-8">Completa los campos para añadir una nueva organización a la base de datos.</p>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Nombre del Partido *</label>
          <input type="text" name="nombre" value={formData.nombre} onChange={handleInputChange} className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors ${errors.nombre ? 'border-red-500' : 'border-gray-300'}`} placeholder="Ej: Cusco Unido" />
          {errors.nombre && <p className="text-red-500 text-sm mt-1">{errors.nombre}</p>}
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Sigla o Abreviatura *</label>
          <input type="text" name="sigla" value={formData.sigla} onChange={handleInputChange} className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors ${errors.sigla ? 'border-red-500' : 'border-gray-300'}`} placeholder="Ej: CU" />
          {errors.sigla && <p className="text-red-500 text-sm mt-1">{errors.sigla}</p>}
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Ideología Política</label>
          <select name="ideologia" value={formData.ideologia} onChange={handleInputChange} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors">
            <option value="">Seleccionar ideología</option>
            {IDEOLOGIAS.map(ideologia => (<option key={ideologia.value} value={ideologia.value}>{ideologia.label}</option>))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Fecha de Fundación *</label>
          <input type="date" name="fechaFundacion" value={formData.fechaFundacion} onChange={handleInputChange} className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors ${errors.fechaFundacion ? 'border-red-500' : 'border-gray-300'}`} />
          {errors.fechaFundacion && <p className="text-red-500 text-sm mt-1">{errors.fechaFundacion}</p>}
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Sede Principal *</label>
          <input type="text" name="sedePrincipal" value={formData.sedePrincipal} onChange={handleInputChange} className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors ${errors.sedePrincipal ? 'border-red-500' : 'border-gray-300'}`} placeholder="Ej: Plaza de Armas, Cusco" />
          {errors.sedePrincipal && <p className="text-red-500 text-sm mt-1">{errors.sedePrincipal}</p>}
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Color Representativo</label>
          <div className="flex gap-2">
            <input type="color" name="colorRepresentativo" value={formData.colorRepresentativo} onChange={handleInputChange} className="w-16 h-12 border border-gray-300 rounded-lg cursor-pointer" />
            <select name="colorRepresentativo" value={formData.colorRepresentativo} onChange={handleInputChange} className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors">
              {COLORES_POLITICOS.map(color => (<option key={color.value} value={color.value}>{color.label}</option>))}
            </select>
          </div>
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-semibold text-gray-700 mb-2">Logo del Partido</label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-red-500 transition-colors">
            <input type="file" accept=".jpg,.jpeg,.png" onChange={handleFileChange} className="hidden" id="logo-upload" />
            <label htmlFor="logo-upload" className="cursor-pointer">
              {formData.logoUrl ? (
                <div className="flex items-center justify-center gap-4">
                  <img src={formData.logoUrl} alt="Logo preview" className="w-16 h-16 object-cover rounded-lg" />
                  <span className="text-green-600">Logo cargado correctamente</span>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <Upload className="text-gray-400" size={32} />
                  <span className="text-gray-600">Haz clic para subir logo (.jpg, .png)</span>
                </div>
              )}
            </label>
          </div>
        </div>

        <div className="md:col-span-2 flex gap-4 pt-4">
          <button type="submit" className="flex-1 bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors font-semibold">
            {editingParty ? 'Actualizar Partido' : 'Registrar Partido'}
          </button>
          {editingParty && (
            <button type="button" onClick={handleCancel} className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-semibold flex items-center gap-2">
              <X size={18} />
              Cancelar
            </button>
          )}
        </div>
      </form>
    </div>
  );
};