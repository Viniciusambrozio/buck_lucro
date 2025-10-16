import { z } from 'zod'

/**
 * Schema de validação para o formulário de cálculo de lucro
 * Todos os valores devem ser números não-negativos
 */
export const calculoSchema = z.object({
  woovi_white: z.number().min(0, 'Valor deve ser maior ou igual a zero'),
  woovi_pixout: z.number().min(0, 'Valor deve ser maior ou igual a zero'),
  nomadfy: z.number().min(0, 'Valor deve ser maior ou igual a zero'),
  pluggou: z.number().min(0, 'Valor deve ser maior ou igual a zero'),
  sellers: z.number().min(0, 'Valor deve ser maior ou igual a zero'),
})

/**
 * Schema de validação para configuração de horários
 * Os horários devem estar em formato HH:MM
 */
export const horariosSchema = z.object({
  horario_1: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Formato inválido (HH:MM)'),
  horario_2: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Formato inválido (HH:MM)'),
  horario_3: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Formato inválido (HH:MM)'),
  horario_4: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Formato inválido (HH:MM)'),
})

/**
 * Schema de validação para login
 */
export const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
})

export type CalculoInput = z.infer<typeof calculoSchema>
export type HorariosInput = z.infer<typeof horariosSchema>
export type LoginInput = z.infer<typeof loginSchema>




