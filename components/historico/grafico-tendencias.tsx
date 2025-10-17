'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { TrendingUp, TrendingDown, Minus, BarChart2 } from 'lucide-react'
import { ResumoDia } from '@/app/actions/historico'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { cn } from '@/lib/utils'

interface GraficoTendenciasProps {
  historico: ResumoDia[]
}

export function GraficoTendencias({ historico }: GraficoTendenciasProps) {
  if (historico.length === 0) {
    return (
      <Card className="shadow-sm border-border/40">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="p-2 bg-primary/10 rounded-lg">
              <BarChart2 className="h-5 w-5 text-primary" />
            </div>
            Tendências dos Últimos Dias
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center h-[300px]">
            <div className="text-center space-y-3">
              <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center">
                <BarChart2 className="h-8 w-8 text-muted-foreground" />
              </div>
              <p className="text-lg font-semibold">Nenhum dado disponível</p>
              <p className="text-sm text-muted-foreground">
                Registre operações para visualizar tendências
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Pegar os últimos 7 dias para o gráfico
  const ultimosDias = historico.slice(0, 7).reverse()
  const maxLucro = Math.max(...ultimosDias.map(dia => dia.total_lucro))
  const minLucro = Math.min(...ultimosDias.map(dia => dia.total_lucro))
  const range = maxLucro - minLucro

  // Calcular tendência
  const lucros = ultimosDias.map(dia => dia.total_lucro)
  const tendencia = lucros.length > 1 ? 
    (lucros[lucros.length - 1] - lucros[0]) / lucros.length : 0

  const getTendenciaIcon = () => {
    if (tendencia > 0) return <TrendingUp className="h-4 w-4" />
    if (tendencia < 0) return <TrendingDown className="h-4 w-4" />
    return <Minus className="h-4 w-4" />
  }

  const getTendenciaColor = () => {
    if (tendencia > 0) return 'default'
    if (tendencia < 0) return 'destructive'
    return 'secondary'
  }

  const getTendenciaClasses = () => {
    if (tendencia > 0) return 'bg-green-500 text-white hover:bg-green-600 border-green-600'
    if (tendencia < 0) return ''
    return ''
  }

  const getTendenciaTexto = () => {
    if (tendencia > 0) return 'Crescimento'
    if (tendencia < 0) return 'Queda'
    return 'Estável'
  }

  const formatarMoeda = (valor: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2
    }).format(valor)
  }

  return (
    <Card className="shadow-sm border-border/40">
      <CardHeader>
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2">
              <div className="p-2 bg-primary/10 rounded-lg">
                <BarChart2 className="h-5 w-5 text-primary" />
              </div>
              Tendências dos Últimos 7 Dias
            </CardTitle>
            <p className="text-sm text-muted-foreground ml-11">
              Evolução do desempenho diário
            </p>
          </div>
          <Badge variant={getTendenciaColor()} className={cn("gap-1.5 px-3 py-1.5", getTendenciaClasses())}>
            {getTendenciaIcon()}
            <span className="font-semibold">{getTendenciaTexto()}</span>
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Gráfico de barras aprimorado */}
          <div className="relative bg-gradient-to-b from-muted/20 to-transparent rounded-lg p-6 border">
            {/* Grid de fundo */}
            <div className="absolute inset-0 opacity-30 rounded-lg overflow-hidden">
              <div className="h-full w-full grid grid-rows-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="border-b border-dashed border-muted-foreground/20" />
                ))}
              </div>
            </div>

            <div className="relative flex items-end justify-between h-60 gap-3">
              {ultimosDias.map((dia, index) => {
                const altura = range > 0 ? 
                  ((dia.total_lucro - minLucro) / range) * 100 : 50
                const isPositivo = dia.total_lucro >= 0
                const isMaior = dia.total_lucro === maxLucro
                
                return (
                  <div key={dia.data} className="flex flex-col items-center flex-1 group">
                    <div className="flex flex-col items-center gap-3 w-full relative">
                      {/* Tooltip flutuante */}
                      <div className="absolute -top-2 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 group-hover:-translate-y-2 transition-all duration-300 pointer-events-none z-10 whitespace-nowrap">
                        <div className="bg-popover text-popover-foreground shadow-lg rounded-lg px-4 py-3 border">
                          <div className="text-xs text-muted-foreground mb-1">
                            {format(parseISO(dia.data), "dd 'de' MMMM", { locale: ptBR })}
                          </div>
                          <div className="text-lg font-bold text-primary">
                            {formatarMoeda(dia.total_lucro)}
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            {dia.total_operacoes} operações
                          </div>
                          {/* Seta do tooltip */}
                          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-popover border-r border-b rotate-45" />
                        </div>
                      </div>

                      {/* Barra com animação e gradiente */}
                      <div 
                        className={`w-full rounded-t-lg transition-all duration-500 cursor-pointer relative overflow-hidden
                          ${isPositivo 
                            ? 'bg-gradient-to-t from-green-500 via-green-400 to-green-300 hover:shadow-lg hover:shadow-green-500/30' 
                            : 'bg-gradient-to-t from-red-500 via-red-400 to-red-300 hover:shadow-lg hover:shadow-red-500/30'
                          }
                          ${isMaior ? 'ring-2 ring-yellow-400 shadow-lg' : ''}
                          hover:scale-105 group-hover:brightness-110
                        `}
                        style={{ 
                          height: `${Math.max(altura, 8)}%`,
                          animation: `growBar 0.8s ease-out ${index * 0.1}s both`
                        }}
                        title={`${format(parseISO(dia.data), 'dd/MM/yyyy', { locale: ptBR })}: ${formatarMoeda(dia.total_lucro)}`}
                      >
                        {/* Brilho no hover */}
                        <div className="absolute inset-0 bg-gradient-to-t from-transparent via-white/20 to-white/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        
                        {/* Badge de destaque */}
                        {isMaior && (
                          <div className="absolute -top-1 left-1/2 -translate-x-1/2">
                            <div className="bg-yellow-400 text-yellow-900 text-[10px] font-bold px-2 py-0.5 rounded-full shadow-md animate-pulse">
                              ★ Máx
                            </div>
                          </div>
                        )}
                      </div>
                      
                      {/* Valor compacto */}
                      <div className="text-xs text-center font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                        {formatarMoeda(Math.abs(dia.total_lucro))}
                      </div>
                    </div>
                    
                    {/* Data */}
                    <div className="text-xs text-muted-foreground mt-2 font-medium group-hover:text-foreground transition-colors">
                      {format(parseISO(dia.data), 'dd/MM', { locale: ptBR })}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Estatísticas do período aprimoradas */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 p-4 rounded-lg border border-green-200/50 dark:border-green-800/30">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
                <p className="text-xs font-medium text-green-600 dark:text-green-400">Maior Lucro</p>
              </div>
              <p className="text-xl font-bold text-green-700 dark:text-green-300">
                {formatarMoeda(Math.max(...lucros))}
              </p>
            </div>
            <div className="bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-950/20 dark:to-rose-950/20 p-4 rounded-lg border border-red-200/50 dark:border-red-800/30">
              <div className="flex items-center gap-2 mb-2">
                <TrendingDown className="h-4 w-4 text-red-600 dark:text-red-400" />
                <p className="text-xs font-medium text-red-600 dark:text-red-400">Menor Lucro</p>
              </div>
              <p className="text-xl font-bold text-red-700 dark:text-red-300">
                {formatarMoeda(Math.min(...lucros))}
              </p>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20 p-4 rounded-lg border border-blue-200/50 dark:border-blue-800/30">
              <div className="flex items-center gap-2 mb-2">
                <Minus className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <p className="text-xs font-medium text-blue-600 dark:text-blue-400">Média</p>
              </div>
              <p className="text-xl font-bold text-blue-700 dark:text-blue-300">
                {formatarMoeda(lucros.reduce((a, b) => a + b, 0) / lucros.length)}
              </p>
            </div>
          </div>
        </div>
      </CardContent>

      <style jsx>{`
        @keyframes growBar {
          from {
            height: 0;
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
      `}</style>
    </Card>
  )
}
