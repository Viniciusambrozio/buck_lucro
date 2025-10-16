/**
 * Tipos TypeScript para o Sistema de Cálculo de Lucro BuckPay
 */

export interface Calculo {
  id: string
  user_id: string
  data: string
  horario: string
  woovi_white: number
  woovi_pixout: number
  nomadfy: number
  pluggou: number
  sellers: number
  lucro: number
  created_at: string
}

export interface HorariosConfig {
  id: string
  user_id: string
  horario_1: string
  horario_2: string
  horario_3: string
  horario_4: string
  updated_at: string
}

export interface CalculoInput {
  woovi_white: number
  woovi_pixout: number
  nomadfy: number
  pluggou: number
  sellers: number
}

export interface ResumoDiario {
  lucro_total: number
  media_por_horario: number
  numero_registros: number
}

export interface MetricasGerais {
  lucro_semanal: number
  lucro_mensal: number
  total_saque: number
  total_faturamento: number
  total_registros: number
}

export type TipoPix = 'pix_in' | 'pix_out';
export type CategoriaOperacao = 'white' | 'gray' | 'black';

export interface Adquirente {
  id: string
  user_id: string
  nome: string
  tipo_pix: TipoPix
  categoria_operacao?: CategoriaOperacao
  ativo: boolean
  created_at: string
  updated_at: string
}

export interface AdquirenteInput {
  nome: string
  tipo_pix: TipoPix
  categoria_operacao?: CategoriaOperacao
  ativo: boolean
}

export interface AdquirenteUpdate {
  id: string
  nome?: string
  tipo_pix?: TipoPix
  categoria_operacao?: CategoriaOperacao
  ativo?: boolean
}


