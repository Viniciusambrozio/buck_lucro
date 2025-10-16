import { CalculoInput } from './validations/calculo'
import { Adquirente } from '@/types'

/**
 * Calcula o lucro considerando as adquirentes configuradas e os valores fixos
 * 
 * @param valores - Valores das contas e sellers
 * @param adquirentes - Lista de adquirentes ativas
 * @returns O lucro calculado
 */
export function calcularLucro(valores: CalculoInput & { _totalAdquirentes?: number }, adquirentes?: Adquirente[]): number {
  const { woovi_white, woovi_pixout, nomadfy, pluggou, sellers, _totalAdquirentes } = valores
  
  // Se fornecido um valor total direto (para adquirentes dinâmicas), usamos ele
  if (_totalAdquirentes !== undefined) {
    const lucro = _totalAdquirentes - sellers
    return Number(lucro.toFixed(2))
  }
  
  // Caso contrário, usamos a lógica padrão para compatibilidade
  // Se não existirem adquirentes configuradas, usamos o cálculo padrão
  if (!adquirentes || adquirentes.length === 0) {
    const lucro = (woovi_white + woovi_pixout + nomadfy + pluggou) - sellers
    return Number(lucro.toFixed(2))
  }
  
  // Calcular total de adquirentes ativas: Soma dos valores fixos
  const totalAdquirentes = woovi_white + woovi_pixout + nomadfy + pluggou
  
  // Calculo do lucro: Total de adquirentes - Saldo de Sellers
  const lucro = totalAdquirentes - sellers
  
  // Retorna com 2 casas decimais
  return Number(lucro.toFixed(2))
}

/**
 * Formata um valor monetário para exibição
 * @param valor - Valor a ser formatado
 * @returns String formatada como moeda brasileira
 */
export function formatarMoeda(valor: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(valor)
}



