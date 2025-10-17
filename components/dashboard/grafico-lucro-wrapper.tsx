'use client'

import { useState, useEffect, useTransition } from 'react'
import { GraficoLucroHorario } from './grafico-lucro-horario'
import type { DadosGraficoLucro } from '@/types'
import { format } from 'date-fns'

interface GraficoLucroWrapperProps {
  dadosIniciais: DadosGraficoLucro[]
  dataInicial: Date
}

export function GraficoLucroWrapper({ dadosIniciais, dataInicial }: GraficoLucroWrapperProps) {
  const [periodo, setPeriodo] = useState<'dia' | 'mes'>('dia')
  const [dataAtual, setDataAtual] = useState(dataInicial)
  const [dados, setDados] = useState(dadosIniciais)
  const [isPending, startTransition] = useTransition()

  // Atualiza dados quando o período ou data mudam
  useEffect(() => {
    startTransition(async () => {
      try {
        if (periodo === 'dia') {
          const dataStr = format(dataAtual, 'yyyy-MM-dd')
          const response = await fetch(`/api/graficos/dia?data=${dataStr}`)
          const novos = await response.json()
          setDados(novos)
        } else {
          const ano = dataAtual.getFullYear()
          const mes = dataAtual.getMonth() + 1
          const response = await fetch(`/api/graficos/mes?ano=${ano}&mes=${mes}`)
          const novos = await response.json()
          setDados(novos)
        }
      } catch (error) {
        console.error('Erro ao buscar dados do gráfico:', error)
      }
    })
  }, [periodo, dataAtual])

  return (
    <GraficoLucroHorario
      dados={dados}
      periodo={periodo}
      onMudarPeriodo={setPeriodo}
      dataAtual={dataAtual}
      onMudarData={setDataAtual}
    />
  )
}


