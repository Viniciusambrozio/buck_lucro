'use client'

import React, { useEffect, useState } from 'react'
import { Input } from './input'
import { cn } from '@/lib/utils'

interface CurrencyInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  onValueChange?: (value: number) => void
  value?: number
  decimals?: number
}

// Utilidades de formatação/parsing pt-BR
const formatBRL = (value: number, decimals: number) =>
  new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(isFinite(value) ? value : 0)

const parseBR = (raw: string): number => {
  if (!raw) return 0
  const cleaned = raw
    .replace(/\s+/g, '')
    .replace(/R\$/gi, '')
    .replace(/\./g, '') // remove separador de milhar
    .replace(',', '.') // vírgula como decimal
  const n = parseFloat(cleaned)
  return isNaN(n) ? 0 : n
}

export function CurrencyInput({
  onValueChange,
  value = 0,
  decimals = 2,
  className,
  onBlur,
  onFocus,
  ...props
}: CurrencyInputProps) {
  const [display, setDisplay] = useState('')
  const [focused, setFocused] = useState(false)

  // Atualiza a exibição quando o valor externo mudar
  useEffect(() => {
    if (!focused) {
      setDisplay(formatBRL(value, decimals))
    }
  }, [value, decimals, focused])

  // Mudanças enquanto digita: não formatar, apenas sanitizar
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value
    // Permite apenas dígitos e uma vírgula/ponto para decimais
    const sanitized = raw
      .replace(/[^\d.,]/g, '')
      .replace(/([.,])(.*)[.,]/, '$1$2') // apenas um separador decimal
    setDisplay(sanitized)

    const numeric = parseBR(sanitized)
    onValueChange?.(numeric)
  }

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    setFocused(true)
    // Mostra número sem prefixo/símbolos para facilitar edição
    const n = parseBR(display)
    const asEditing = n === 0 ? '' : n.toString().replace('.', ',')
    setDisplay(asEditing)
    onFocus?.(e)
  }

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setFocused(false)
    const n = parseBR(display)
    setDisplay(formatBRL(n, decimals))
    onBlur?.(e)
  }

  return (
    <Input
      {...props}
      type="text"
      inputMode="decimal"
      value={display}
      onChange={handleChange}
      onFocus={handleFocus}
      onBlur={handleBlur}
      className={cn(
        'bg-background border-input focus:ring-2 focus:ring-ring focus:border-input',
        className,
      )}
    />
  )
}
