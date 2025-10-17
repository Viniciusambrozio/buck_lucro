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
 * Função para validar e normalizar horário
 */
function validarHorario(horario: string): string {
  if (!horario || typeof horario !== 'string') {
    throw new Error('Horário inválido')
  }
  
  // Se já está no formato HH:MM, validar
  if (/^\d{2}:\d{2}$/.test(horario)) {
    const [hora, minuto] = horario.split(':').map(Number)
    if (hora >= 0 && hora <= 23 && minuto >= 0 && minuto <= 59) {
      return horario
    }
  }
  
  // Se está no formato H:MM, converter para HH:MM
  if (/^\d{1,2}:\d{2}$/.test(horario)) {
    const [hora, minuto] = horario.split(':')
    const horaNum = parseInt(hora)
    const minutoNum = parseInt(minuto)
    
    if (horaNum >= 0 && horaNum <= 23 && minutoNum >= 0 && minutoNum <= 59) {
      return `${hora.padStart(2, '0')}:${minuto}`
    }
  }
  
  throw new Error('Formato de horário inválido')
}

/**
 * Schema de validação para configuração de horários
 * Validação mais robusta que aceita diferentes formatos
 */
export const horariosSchema = z.object({
  horario_1: z.string().transform(validarHorario),
  horario_2: z.string().transform(validarHorario),
  horario_3: z.string().transform(validarHorario),
  horario_4: z.string().transform(validarHorario),
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





