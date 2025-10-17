'use client'

import { useState, useEffect } from 'react'
import { GraficoLucroHorario } from './grafico-lucro-horario'
import { obterLucroPorHorario, obterLucroPorDia, type PeriodoFiltro } from '@/app/actions/saques'
import type { LucroPorHorario, LucroPorDia } from '@/app/actions/saques'

export function GraficoLucroHorarioWrapper() {
  const [periodo, setPeriodo] = useState<'dia' | 'mes'>('dia')
  const [data, setData] = useState(() => {
    const hoje = new Date()
    return periodo === 'dia'
      ? hoje.toISOString().split('T')[0] // YYYY-MM-DD
      : `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, '0')}` // YYYY-MM
  })
  const [dados, setDados] = useState<LucroPorHorario[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    carregarDados()
  }, [periodo, data])

  const carregarDados = async () => {
    setLoading(true)
    try {
      if (periodo === 'dia') {
        const result = await obterLucroPorHorario({ data })
        if (result.success && result.data) {
          setDados(result.data)
        }
      } else {
        const result = await obterLucroPorDia({ mes: data })
        if (result.success && result.data) {
          // Converter dados de dia para formato de horário (para reutilizar o componente)
          const dadosConvertidos: LucroPorHorario[] = result.data.map((d: LucroPorDia) => ({
            horario: d.dia,
            dia: d.dia,
            hora: new Date(d.dia).getDate(),
            lucro_horario: d.lucro_dia,
            num_saques_lucro: d.num_saques_lucro,
            num_operacoes_total: d.num_operacoes_total,
          }))
          setDados(dadosConvertidos)
        }
      }
    } catch (error) {
      console.error('Erro ao carregar dados do gráfico:', error)
    } finally {
      setLoading(false)
    }
  }

  const handlePeriodoChange = (novoPeriodo: 'dia' | 'mes') => {
    setPeriodo(novoPeriodo)
    // Ajustar formato da data
    const hoje = new Date()
    if (novoPeriodo === 'mes') {
      setData(`${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, '0')}`)
    } else {
      setData(hoje.toISOString().split('T')[0])
    }
  }

  if (loading) {
    return (
      <div className="h-[400px] flex items-center justify-center border rounded-lg">
        <p className="text-muted-foreground">Carregando gráfico...</p>
      </div>
    )
  }

  return (
    <GraficoLucroHorario
      dados={dados}
      periodo={periodo}
      data={data}
      onPeriodoChange={handlePeriodoChange}
      onDataChange={setData}
    />
  )
}


