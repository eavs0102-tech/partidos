import React, { useState, useEffect } from 'react';
import { Party, IDEOLOGIAS, COLORES_POLITICOS } from '../types/Party';

import { Plus, Upload, X } from 'lucide-react';

interface PartyFormProps {
  onAddParty: (party: Omit<Party, 'id'>) => void;
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
    nombre: editingParty?.nombre || '',
    sigla: editingParty?.sigla || '',
    ideologia: editingParty?.ideologia || '',
    fechaFundacion: editingParty?.fechaFundacion || '',
    sede: editingParty?.sede || '',
    color: editingParty?.color || '#DC2626',
    logo: null,
    logoUrl: editingParty?.logoUrl || ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (editingParty) {
      // Formatear la fecha que viene de la BD (puede ser un string largo) a YYYY-MM-DD que el input[type=date] necesita
      const formattedDate = editingParty.fechaFundacion
        ? new Date(editingParty.fechaFundacion).toISOString().split('T')[0]
        : '';

      setFormData({
        nombre: editingParty.nombre || '',
        sigla: editingParty.sigla || '',
        ideologia: editingParty.ideologia || '',
        fechaFundacion: formattedDate,
        sede: editingParty.sede || '',
        color: editingParty.color || '#DC2626',
        logo: null, // El input de archivo no se puede pre-llenar por seguridad
        logoUrl: editingParty.logoUrl || ''
      });
    } else {
      // Si no hay partido para editar (ej. al cancelar), se resetea el formulario
      setFormData({
        nombre: '',
        sigla: '',
        ideologia: '',
        fechaFundacion: '',
        sede: '',
        color: '#DC2626',
        logo: null,
        logoUrl: ''
      });
    }
  }, [editingParty]); // Este efecto se ejecuta cada vez que 'editingParty' cambia

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Limpiar error cuando el usuario empiece a escribir
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

    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre del partido es obligatorio';
    }

    if (!formData.sigla.trim()) {
      newErrors.sigla = 'La sigla es obligatoria';
    } else if (formData.sigla.length > 10) {
      newErrors.sigla = 'La sigla no puede tener más de 10 caracteres';
    }

    if (!formData.fechaFundacion) {
      newErrors.fechaFundacion = 'La fecha de fundación es obligatoria';
    }

    if (!formData.sede.trim()) {
      newErrors.sede = 'La sede principal es obligatoria';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    // Crear una copia de los datos para no mutar el estado directamente
    const submissionData = { ...formData };

    // Asegurarse de que la fecha_fundacion esté en formato YYYY-MM-DD
    if (submissionData.fechaFundacion) {
      const date = new Date(submissionData.fechaFundacion);
      // Formatear a YYYY-MM-DD. Se suma 1 al mes porque getMonth() es 0-indexed.
      const year = date.getFullYear();
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const day = date.getDate().toString().padStart(2, '0');
      submissionData.fechaFundacion = `${year}-${month}-${day}`;
    }

    if (editingParty && onUpdateParty) {
      onUpdateParty({ ...submissionData, id: editingParty.id }, formData.logo as File | null);
    } else {
      onAddParty(submissionData);
    }

    // Resetear formulario solo si no estamos editando
    if (!editingParty) {
      setFormData({
        nombre: '',
        sigla: '',
        ideologia: '',
        fechaFundacion: '',
        sede: '',
        color: '#DC2626',
        logo: null,
        logoUrl: ''
      });
    }
    setErrors({});
  };

  const handleCancel = () => {
    if (onCancelEdit) {
      onCancelEdit();
    }
    setFormData({
      nombre: '',
      sigla: '',
      ideologia: '',
      fechaFundacion: '',
      sede: '',
      color: '#DC2626',
      logo: null,
      logoUrl: ''
    });
    setErrors({});
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
        <Plus className="text-red-600" size={24} />
        {editingParty ? 'Editar Partido Político' : 'Registrar Nuevo Partido Político'}
      </h2>
      
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Nombre del Partido *
          </label>
          <input
            type="text"
            name="nombre"
            value={formData.nombre}
            onChange={handleInputChange}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors ${
              errors.nombre ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Ej: Cusco Unido"
          />
          {errors.nombre && <p className="text-red-500 text-sm mt-1">{errors.nombre}</p>}
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Sigla o Abreviatura *
          </label>
          <input
            type="text"
            name="sigla"
            value={formData.sigla}
            onChange={handleInputChange}
            maxLength={10}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors ${
              errors.sigla ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Ej: CU"
          />
          {errors.sigla && <p className="text-red-500 text-sm mt-1">{errors.sigla}</p>}
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Ideología Política
          </label>
          <select
            name="ideologia"
            value={formData.ideologia}
            onChange={handleInputChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
          >
            <option value="">Seleccionar ideología</option>
            {IDEOLOGIAS.map(ideologia => (
              <option key={ideologia.value} value={ideologia.value}>
                {ideologia.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Fecha de Fundación *
          </label>
          <input
            type="date"
            name="fechaFundacion"
            value={formData.fechaFundacion}
            onChange={handleInputChange}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors ${
              errors.fechaFundacion ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.fechaFundacion && <p className="text-red-500 text-sm mt-1">{errors.fechaFundacion}</p>}
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Sede Principal *
          </label>
          <input
            type="text"
            name="sede"
            value={formData.sede}
            onChange={handleInputChange}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors ${
              errors.sede ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Ej: Plaza de Armas, Cusco"
          />
          {errors.sede && <p className="text-red-500 text-sm mt-1">{errors.sede}</p>}
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Color Representativo
          </label>
          <div className="flex gap-2">
            <input
              type="color"
              name="color"
              value={formData.color}
              onChange={handleInputChange}
              className="w-16 h-12 border border-gray-300 rounded-lg cursor-pointer"
            />
            <select
              name="color"
              value={formData.color}
              onChange={handleInputChange}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
            >
              {COLORES_POLITICOS.map(color => (
                <option key={color.value} value={color.value}>
                  {color.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Logo del Partido
          </label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-red-500 transition-colors">
            <input
              type="file"
              accept=".jpg,.jpeg,.png"
              onChange={handleFileChange}
              className="hidden"
              id="logo-upload"
            />
            <label htmlFor="logo-upload" className="cursor-pointer">
              {formData.logoUrl ? (
                <div className="flex items-center justify-center gap-4">
                  <img 
                    src={formData.logoUrl} 
                    alt="Logo preview" 
                    className="w-16 h-16 object-cover rounded-lg"
                  />
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
          <button
            type="submit"
            className="flex-1 bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors font-semibold"
          >
            {editingParty ? 'Actualizar Partido' : 'Registrar Partido'}
          </button>
          
          {editingParty && (
            <button
              type="button"
              onClick={handleCancel}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-semibold flex items-center gap-2"
            >
              <X size={18} />
              Cancelar
            </button>
          )}
        </div>
      </form>
    </div>
  );
};