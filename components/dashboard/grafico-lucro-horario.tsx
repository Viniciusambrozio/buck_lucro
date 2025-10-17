'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Calendar, TrendingUp, Activity } from 'lucide-react'
import type { DadosGraficoLucro } from '@/types'
import { format, parse } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface GraficoLucroHorarioProps {
  dados: DadosGraficoLucro[]
  periodo: 'dia' | 'mes'
  onMudarPeriodo: (periodo: 'dia' | 'mes') => void
  dataAtual: Date
  onMudarData: (data: Date) => void
}

export function GraficoLucroHorario({
  dados,
  periodo,
  onMudarPeriodo,
  dataAtual,
  onMudarData
}: GraficoLucroHorarioProps) {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null)

  // Formata moeda
  const formatarMoeda = (valor: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2
    }).format(valor)
  }

  // Calcula valores para o gráfico
  const valores = dados.map(d => d.lucro)
  const valorMaximo = Math.max(...valores, 0)
  const valorMinimo = Math.min(...valores, 0)
  const amplitude = valorMaximo - valorMinimo || 1

  // Dimensões do gráfico
  const largura = 800
  const altura = 300
  const padding = { top: 20, right: 20, bottom: 40, left: 60 }
  const larguraGrafico = largura - padding.left - padding.right
  const alturaGrafico = altura - padding.top - padding.bottom

  // Gera pontos para a linha
  const gerarPontos = () => {
    if (dados.length === 0) return ''
    
    const pontos = dados.map((d, i) => {
      const x = padding.left + (i / (dados.length - 1 || 1)) * larguraGrafico
      const y = padding.top + ((valorMaximo - d.lucro) / amplitude) * alturaGrafico
      return `${x},${y}`
    })

    return pontos.join(' ')
  }

  // Gera pontos para a área preenchida
  const gerarArea = () => {
    if (dados.length === 0) return ''
    
    const pontos = dados.map((d, i) => {
      const x = padding.left + (i / (dados.length - 1 || 1)) * larguraGrafico
      const y = padding.top + ((valorMaximo - d.lucro) / amplitude) * alturaGrafico
      return `${x},${y}`
    })

    const baseY = padding.top + alturaGrafico
    const primeiroX = padding.left
    const ultimoX = padding.left + larguraGrafico

    return `${primeiroX},${baseY} ${pontos.join(' ')} ${ultimoX},${baseY}`
  }

  // Navegação de data
  const proximoDia = () => {
    const novadata = new Date(dataAtual)
    novadata.setDate(novadata.getDate() + 1)
    onMudarData(novadata)
  }

  const diaAnterior = () => {
    const novadata = new Date(dataAtual)
    novadata.setDate(novadata.getDate() - 1)
    onMudarData(novadata)
  }

  const proximoMes = () => {
    const novadata = new Date(dataAtual)
    novadata.setMonth(novadata.getMonth() + 1)
    onMudarData(novadata)
  }

  const mesAnterior = () => {
    const novadata = new Date(dataAtual)
    novadata.setMonth(novadata.getMonth() - 1)
    onMudarData(novadata)
  }

  const lucroTotal = dados.reduce((sum, d) => sum + d.lucro, 0)
  const lucroMedio = dados.length > 0 ? lucroTotal / dados.length : 0

  return (
    <Card className="shadow-sm border-border/40">
      <CardHeader className="space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Activity className="h-5 w-5 text-primary" />
              </div>
              Evolução do Lucro
            </CardTitle>
            <CardDescription className="ml-11 mt-1">
              {periodo === 'dia' 
                ? format(dataAtual, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })
                : format(dataAtual, "MMMM 'de' yyyy", { locale: ptBR })}
            </CardDescription>
          </div>
          <div className="flex items-center gap-3">
            {/* Botões de navegação de data */}
            <div className="flex items-center gap-1 bg-muted/50 rounded-lg border p-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 hover:bg-background"
                onClick={periodo === 'dia' ? diaAnterior : mesAnterior}
              >
                ←
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 hover:bg-background"
                onClick={periodo === 'dia' ? proximoDia : proximoMes}
              >
                →
              </Button>
            </div>

            {/* Toggle período */}
            <div className="flex gap-1 bg-muted/50 p-1 rounded-lg border">
              <Button
                variant={periodo === 'dia' ? 'default' : 'ghost'}
                size="sm"
                className="h-8"
                onClick={() => onMudarPeriodo('dia')}
              >
                Dia
              </Button>
              <Button
                variant={periodo === 'mes' ? 'default' : 'ghost'}
                size="sm"
                className="h-8"
                onClick={() => onMudarPeriodo('mes')}
              >
                Mês
              </Button>
            </div>
          </div>
        </div>

        {/* Métricas do gráfico */}
        {dados.length > 0 && (
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 p-3 rounded-lg border border-green-200/50 dark:border-green-800/30">
              <div className="text-xs font-medium text-green-600 dark:text-green-400 mb-1">Lucro Total</div>
              <div className="text-lg font-bold text-green-700 dark:text-green-300">{formatarMoeda(lucroTotal)}</div>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20 p-3 rounded-lg border border-blue-200/50 dark:border-blue-800/30">
              <div className="text-xs font-medium text-blue-600 dark:text-blue-400 mb-1">Lucro Médio</div>
              <div className="text-lg font-bold text-blue-700 dark:text-blue-300">{formatarMoeda(lucroMedio)}</div>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-950/20 dark:to-violet-950/20 p-3 rounded-lg border border-purple-200/50 dark:border-purple-800/30">
              <div className="text-xs font-medium text-purple-600 dark:text-purple-400 mb-1">Registros</div>
              <div className="text-lg font-bold text-purple-700 dark:text-purple-300">{dados.length}</div>
            </div>
          </div>
        )}
      </CardHeader>
      
      <CardContent>
        {dados.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[350px]">
            <div className="text-center space-y-3">
              <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center">
                <TrendingUp className="h-8 w-8 text-muted-foreground" />
              </div>
              <p className="text-lg font-semibold">Nenhum dado disponível</p>
              <p className="text-sm text-muted-foreground">
                Aguardando registros para este período
              </p>
            </div>
          </div>
        ) : (
          <div className="w-full overflow-x-auto">
            <div className="min-w-[600px]">
              <svg
                width={largura}
                height={altura}
                className="w-full"
                viewBox={`0 0 ${largura} ${altura}`}
              >
                <defs>
                  {/* Gradiente para a área */}
                  <linearGradient id="areaGradient" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#744df1" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#744df1" stopOpacity="0.05" />
                  </linearGradient>
                  
                  {/* Gradiente para a linha */}
                  <linearGradient id="lineGradient" x1="0" x2="1" y1="0" y2="0">
                    <stop offset="0%" stopColor="#744df1" stopOpacity="0.8" />
                    <stop offset="50%" stopColor="#744df1" />
                    <stop offset="100%" stopColor="#744df1" stopOpacity="0.8" />
                  </linearGradient>

                  {/* Filtro de sombra */}
                  <filter id="dropShadow">
                    <feGaussianBlur in="SourceAlpha" stdDeviation="2" />
                    <feOffset dx="0" dy="2" result="offsetblur" />
                    <feComponentTransfer>
                      <feFuncA type="linear" slope="0.2" />
                    </feComponentTransfer>
                    <feMerge>
                      <feMergeNode />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>

                {/* Grid horizontal */}
                {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
                  const y = padding.top + ratio * alturaGrafico
                  const valor = valorMaximo - ratio * amplitude
                  return (
                    <g key={i} opacity={0.4}>
                      <line
                        x1={padding.left}
                        y1={y}
                        x2={largura - padding.right}
                        y2={y}
                        stroke="currentColor"
                        className="stroke-muted-foreground/30"
                        strokeWidth="1"
                        strokeDasharray="4 4"
                      />
                      <text
                        x={padding.left - 10}
                        y={y + 4}
                        textAnchor="end"
                        fontSize="11"
                        className="fill-muted-foreground"
                        fontWeight="500"
                      >
                        {formatarMoeda(valor)}
                      </text>
                    </g>
                  )
                })}

                {/* Área preenchida com gradiente */}
                <polygon
                  points={gerarArea()}
                  fill="url(#areaGradient)"
                />

                {/* Linha do gráfico com sombra */}
                <polyline
                  points={gerarPontos()}
                  fill="none"
                  stroke="url(#lineGradient)"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  filter="url(#dropShadow)"
                />

                {/* Pontos interativos */}
                {dados.map((d, i) => {
                  const x = padding.left + (i / (dados.length - 1 || 1)) * larguraGrafico
                  const y = padding.top + ((valorMaximo - d.lucro) / amplitude) * alturaGrafico
                  const isHover = hoverIndex === i

                  return (
                    <g key={i}>
                      {/* Ponto principal - sempre visível */}
                      <circle
                        cx={x}
                        cy={y}
                        r="6"
                        fill="hsl(var(--background))"
                        stroke="#744df1"
                        strokeWidth="3"
                        className="cursor-pointer"
                        onMouseEnter={() => setHoverIndex(i)}
                        onMouseLeave={() => setHoverIndex(null)}
                        filter="url(#dropShadow)"
                      />
                      
                      {/* Tooltip moderno */}
                      {isHover && (
                        <g>
                          {/* Verifica se o tooltip deve aparecer acima ou abaixo */}
                          {y < 100 ? (
                            // Tooltip abaixo do ponto (quando está no topo)
                            <g>
                              <rect
                                x={x - 65}
                                y={y + 20}
                                width="130"
                                height="50"
                                fill="hsl(var(--popover))"
                                stroke="hsl(var(--border))"
                                strokeWidth="1.5"
                                rx="8"
                                filter="url(#dropShadow)"
                              />
                              <text
                                x={x}
                                y={y + 36}
                                textAnchor="middle"
                                fontSize="10"
                                className="fill-muted-foreground"
                                fontWeight="500"
                              >
                                {d.label}
                              </text>
                              <text
                                x={x}
                                y={y + 52}
                                textAnchor="middle"
                                fontSize="14"
                                className="fill-foreground"
                                fontWeight="700"
                              >
                                {formatarMoeda(d.lucro)}
                              </text>
                              {/* Seta apontando para cima */}
                              <polygon
                                points={`${x-8},${y+15} ${x+8},${y+15} ${x},${y+25}`}
                                fill="hsl(var(--popover))"
                                stroke="hsl(var(--border))"
                                strokeWidth="1.5"
                              />
                            </g>
                          ) : (
                            // Tooltip acima do ponto (comportamento normal)
                            <g>
                              <rect
                                x={x - 65}
                                y={y - 65}
                                width="130"
                                height="50"
                                fill="hsl(var(--popover))"
                                stroke="hsl(var(--border))"
                                strokeWidth="1.5"
                                rx="8"
                                filter="url(#dropShadow)"
                              />
                              <text
                                x={x}
                                y={y - 44}
                                textAnchor="middle"
                                fontSize="10"
                                className="fill-muted-foreground"
                                fontWeight="500"
                              >
                                {d.label}
                              </text>
                              <text
                                x={x}
                                y={y - 28}
                                textAnchor="middle"
                                fontSize="14"
                                className="fill-foreground"
                                fontWeight="700"
                              >
                                {formatarMoeda(d.lucro)}
                              </text>
                              {/* Seta apontando para baixo */}
                              <polygon
                                points={`${x-8},${y-10} ${x+8},${y-10} ${x},${y}`}
                                fill="hsl(var(--popover))"
                                stroke="hsl(var(--border))"
                                strokeWidth="1.5"
                              />
                            </g>
                          )}
                        </g>
                      )}
                    </g>
                  )
                })}

                {/* Labels do eixo X */}
                {dados.map((d, i) => {
                  // Mostra apenas alguns labels para não ficar poluído
                  if (dados.length > 10 && i % Math.ceil(dados.length / 10) !== 0) return null

                  const x = padding.left + (i / (dados.length - 1 || 1)) * larguraGrafico
                  const y = altura - padding.bottom + 20

                  return (
                    <text
                      key={i}
                      x={x}
                      y={y}
                      textAnchor="middle"
                      fontSize="11"
                      className="fill-muted-foreground"
                      fontWeight="500"
                    >
                      {periodo === 'dia' ? d.horario : d.label.split(' ')[0]}
                    </text>
                  )
                })}
              </svg>
            </div>
          </div>
        )}
      </CardContent>

    </Card>
  )
}

