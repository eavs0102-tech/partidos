export interface Party {
  id: string;
  nombre: string;
  sigla: string;
  ideologia: string;
  fechaFundacion: string;
  sede: string;
  color: string;
  logo?: File | null;
  logoUrl?: string;
}

export type IdeologiaPolitica = 
  | 'izquierda'
  | 'derecha' 
  | 'centro'
  | 'conservador'
  | 'liberal'
  | 'socialdemocrata'
  | 'nacionalista'
  | 'regionalista';

export const IDEOLOGIAS: Array<{ value: IdeologiaPolitica; label: string }> = [
  { value: 'izquierda', label: 'Izquierda' },
  { value: 'derecha', label: 'Derecha' },
  { value: 'centro', label: 'Centro' },
  { value: 'conservador', label: 'Conservador' },
  { value: 'liberal', label: 'Liberal' },
  { value: 'socialdemocrata', label: 'Socialdemócrata' },
  { value: 'nacionalista', label: 'Nacionalista' },
  { value: 'regionalista', label: 'Regionalista' }
];

export const COLORES_POLITICOS = [
  { value: '#DC2626', label: 'Rojo' },
  { value: '#2563EB', label: 'Azul' },
  { value: '#16A34A', label: 'Verde' },
  { value: '#EA580C', label: 'Naranja' },
  { value: '#7C3AED', label: 'Morado' },
  { value: '#BE123C', label: 'Rosa' },
  { value: '#0891B2', label: 'Cian' },
  { value: '#65A30D', label: 'Lima' },
  { value: '#DC2626', label: 'Rojo Intenso' },
  { value: '#1F2937', label: 'Gris Oscuro' }
];