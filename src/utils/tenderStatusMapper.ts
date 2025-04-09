import { TenderStatus } from '@/types/types';

// Map of status strings to our standardized TenderStatus enum
const statusMap: Record<string, TenderStatus> = {
  // Status code 0: PRIOR_NOTICE (Anuncio previo)
  'Anuncio Previo': TenderStatus.PRIOR_NOTICE,
  'Alerta futura': TenderStatus.PRIOR_NOTICE,
  'Consulta preliminar del mercat': TenderStatus.PRIOR_NOTICE,
  'Anunci previ': TenderStatus.PRIOR_NOTICE,
  'Pendiente de apertura de plazo': TenderStatus.PRIOR_NOTICE,
  'Alerta temprana': TenderStatus.PRIOR_NOTICE,
  'Estado tramitación de anuncio previo': TenderStatus.PRIOR_NOTICE,
  'Anuncios de información previa': TenderStatus.PRIOR_NOTICE,
  'Anuncio previo': TenderStatus.PRIOR_NOTICE,
  
  // Status code 1: PUBLISHED (En plazo)
  'Licitaciones en plazo': TenderStatus.PUBLISHED,
  'Publicada': TenderStatus.PUBLISHED,
  'En prazo de presentación de ofertas': TenderStatus.PUBLISHED,
  'Anunci de licitació en termini': TenderStatus.PUBLISHED,
  'En plazo': TenderStatus.PUBLISHED,
  'Abierto': TenderStatus.PUBLISHED,
  'Plazo de presentación': TenderStatus.PUBLISHED,
  'Licitación (con plazo abierto)': TenderStatus.PUBLISHED,
  'En plazo de presentación': TenderStatus.PUBLISHED,
  
  // Status code 2: EVALUATION (En evaluación)
  'Evaluación': TenderStatus.EVALUATION,
  'Evaluación Previa': TenderStatus.EVALUATION,
  'Pendente de adxudicar': TenderStatus.EVALUATION,
  'Expedient en avaluació': TenderStatus.EVALUATION,
  'Pendiente de adjudicación': TenderStatus.EVALUATION,
  'Plazo cerrado': TenderStatus.EVALUATION,
  'Licitación (sin plazo abierto)': TenderStatus.EVALUATION,
  'Plazo cerrado, pendiente de adjudicación': TenderStatus.EVALUATION,
  
  // Status code 3: AWARDED (Adjudicada)
  'Adjudicación': TenderStatus.AWARDED,
  'Adjudicaciones': TenderStatus.AWARDED,
  'Formalizado / En ejecución': TenderStatus.AWARDED,
  'Adjudicada': TenderStatus.AWARDED,
  'Adjudicació': TenderStatus.AWARDED,
  'Adjudicado': TenderStatus.AWARDED,
  'Resoltos': TenderStatus.AWARDED,
  'Adjudicación Provisional': TenderStatus.AWARDED,
  'Parcialmente Adjudicada': TenderStatus.AWARDED,
  'Formalizada': TenderStatus.AWARDED,
  
  // Status code 4: SOLVED (Resuelta)
  'Resuelta / Parcialmente resuelta': TenderStatus.SOLVED,
  'Resuelta / Finalizada': TenderStatus.SOLVED,
  'Finalizado': TenderStatus.SOLVED,
  'Desierto': TenderStatus.SOLVED,
  'Contratos finalizados o resueltos': TenderStatus.SOLVED,
  'Modificados y complementarios': TenderStatus.SOLVED,
  
  // Status code 5: CANCELLED (Anulada)
  'Desistida': TenderStatus.CANCELLED,
  'Anulada': TenderStatus.CANCELLED,
  'Suspendida por recurso': TenderStatus.CANCELLED,
  'Suspendidos por recurso': TenderStatus.CANCELLED,
  'Anulado': TenderStatus.CANCELLED,
  'Desistimiento / Renuncia': TenderStatus.CANCELLED,
  'Suspensión por recurso': TenderStatus.CANCELLED,
  
  // Map the English description values too
  'Prior notice': TenderStatus.PRIOR_NOTICE,
  'Published': TenderStatus.PUBLISHED,
  'Evaluation': TenderStatus.EVALUATION,
  'Awarded': TenderStatus.AWARDED,
  'Solved': TenderStatus.SOLVED,
  'Canceled': TenderStatus.CANCELLED,
  
  // Map the codes as strings
  '0': TenderStatus.PRIOR_NOTICE,
  '1': TenderStatus.PUBLISHED,
  '2': TenderStatus.EVALUATION,
  '3': TenderStatus.AWARDED,
  '4': TenderStatus.SOLVED,
  '5': TenderStatus.CANCELLED,
};

/**
 * Maps a status string from the backend to our standardized TenderStatus enum
 * @param status The status string from the backend
 * @returns The standardized TenderStatus enum value, or PUBLISHED as default
 */
export function mapTenderStatus(status: string | null | undefined): TenderStatus {
  if (!status) return TenderStatus.PUBLISHED; // Default to PUBLISHED if no status

  // Try to match exactly
  const standardizedStatus = statusMap[status];
  if (standardizedStatus !== undefined) {
    return standardizedStatus;
  }
  
  // Try to match by lowercase
  const lowerStatus = status.toLowerCase();
  for (const [key, value] of Object.entries(statusMap)) {
    if (key.toLowerCase() === lowerStatus) {
      return value;
    }
  }
  
  // Try to match by inclusion
  for (const [key, value] of Object.entries(statusMap)) {
    if (lowerStatus.includes(key.toLowerCase())) {
      return value;
    }
  }
  
  // Default to PUBLISHED if no match
  return TenderStatus.PUBLISHED;
}

/**
 * Gets the translation key for a tender status
 * @param status The TenderStatus enum value
 * @returns The translation key string
 */
export function getTenderStatusTranslationKey(status: TenderStatus): string {
  switch(status) {
    case TenderStatus.PRIOR_NOTICE:
      return 'status.priorNotice';
    case TenderStatus.PUBLISHED:
      return 'status.published';
    case TenderStatus.EVALUATION:
      return 'status.evaluation';
    case TenderStatus.AWARDED:
      return 'status.awarded';
    case TenderStatus.SOLVED:
      return 'status.solved';
    case TenderStatus.CANCELLED:
      return 'status.canceled';
    default:
      return 'status.published';
  }
}

/**
 * Gets the CSS class for styling a tender status
 * @param status The TenderStatus enum value
 * @returns A string with CSS classes
 */
export function getTenderStatusClass(status: TenderStatus): string {
  switch(status) {
    case TenderStatus.PRIOR_NOTICE:
      return 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300';
    case TenderStatus.PUBLISHED:
      return 'bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300';
    case TenderStatus.EVALUATION:
      return 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300';
    case TenderStatus.AWARDED:
      return 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300';
    case TenderStatus.SOLVED:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    case TenderStatus.CANCELLED:
      return 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300';
    default:
      return 'bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300';
  }
} 