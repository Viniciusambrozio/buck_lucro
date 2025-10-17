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

// ============================================
// TIPOS PARA FLUXO DE CAIXA
// ============================================

export type TipoConta = 'empresa' | 'pix_in' | 'pix_out';
export type TipoMovimentacao = 'empresa_para_pixout' | 'pixin_para_pixout' | 'pixin_para_empresa';

export interface Conta {
  id: string
  user_id: string
  nome: string
  tipo: TipoConta
  adquirente_id?: string | null
  saldo_atual: number
  ativo: boolean
  created_at: string
  updated_at: string
}

export interface ContaInput {
  nome: string
  tipo: TipoConta
  adquirente_id?: string | null
  saldo_atual?: number
  ativo?: boolean
}

export interface ContaUpdate {
  id: string
  nome?: string
  tipo?: TipoConta
  adquirente_id?: string | null
  saldo_atual?: number
  ativo?: boolean
}

export interface Movimentacao {
  id: string
  user_id: string
  data: string
  horario: string
  conta_origem_id: string
  conta_destino_id: string
  valor: number
  tipo_movimentacao: TipoMovimentacao
  observacao?: string | null
  created_at: string
}

export interface MovimentacaoInput {
  data: string
  horario: string
  conta_origem_id: string
  conta_destino_id: string
  valor: number
  tipo_movimentacao: TipoMovimentacao
  observacao?: string
}

export interface MovimentacaoDetalhada extends Movimentacao {
  origem_nome: string
  origem_tipo: TipoConta
  destino_nome: string
  destino_tipo: TipoConta
}

export interface SnapshotSaldo {
  id: string
  conta_id: string
  user_id: string
  data: string
  horario: string
  saldo: number
  created_at: string
}

export interface ResumoMovimentacoes {
  data: string
  tipo_movimentacao: TipoMovimentacao
  quantidade: number
  total_movimentado: number
}

export interface SaldoConsolidado {
  tipo: TipoConta
  quantidade_contas: number
  saldo_total: number
}

export interface MetricasFluxoCaixa {
  total_sacado_dia: number
  total_sacado_mes: number
  saldo_pixout: number
  lucro_disponivel: number
  total_movimentacoes: number
}

export interface DadosGraficoLucro {
  data: string
  horario: string
  lucro: number
  label: string // formato: "DD/MM HH:mm"
}


