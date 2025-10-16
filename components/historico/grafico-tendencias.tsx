'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { ResumoDia } from '@/app/actions/historico'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface GraficoTendenciasProps {
  historico: ResumoDia[]
}

export function GraficoTendencias({ historico }: GraficoTendenciasProps) {
  if (historico.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Gráfico de Tendências</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            Nenhum dado disponível para exibir o gráfico
          </p>
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
    if (tendencia > 0) return <TrendingUp className="h-4 w-4 text-green-600" />
    if (tendencia < 0) return <TrendingDown className="h-4 w-4 text-red-600" />
    return <Minus className="h-4 w-4 text-gray-600" />
  }

  const getTendenciaColor = () => {
    if (tendencia > 0) return 'text-green-600'
    if (tendencia < 0) return 'text-red-600'
    return 'text-gray-600'
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Tendências dos Últimos 7 Dias
          <div className="flex items-center gap-1 ml-auto">
            {getTendenciaIcon()}
            <span className={`text-sm font-medium ${getTendenciaColor()}`}>
              {tendencia > 0 ? 'Crescimento' : tendencia < 0 ? 'Queda' : 'Estável'}
            </span>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Gráfico de barras simples */}
          <div className="flex items-end justify-between h-48 gap-2">
            {ultimosDias.map((dia) => {
              const altura = range > 0 ? 
                ((dia.total_lucro - minLucro) / range) * 100 : 50
              
              return (
                <div key={dia.data} className="flex flex-col items-center flex-1">
                  <div className="flex flex-col items-center gap-2 w-full">
                    {/* Barra */}
                    <div 
                      className={`w-full rounded-t transition-all duration-300 ${
                        dia.total_lucro >= 0 
                          ? 'bg-green-500 hover:bg-green-600' 
                          : 'bg-red-500 hover:bg-red-600'
                      }`}
                      style={{ height: `${Math.max(altura, 5)}%` }}
                      title={`${format(parseISO(dia.data), 'dd/MM/yyyy', { locale: ptBR })}: R$ ${dia.total_lucro.toFixed(2)}`}
                    />
                    
                    {/* Valor */}
                    <div className="text-xs text-center">
                      <div className="font-medium">
                        R$ {Math.abs(dia.total_lucro).toFixed(0)}
                      </div>
                    </div>
                  </div>
                  
                  {/* Data */}
                  <div className="text-xs text-muted-foreground mt-2 transform -rotate-45 origin-left">
                    {format(parseISO(dia.data), 'dd/MM', { locale: ptBR })}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Estatísticas do período */}
          <div className="grid grid-cols-3 gap-4 pt-4 border-t">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Maior Lucro</p>
              <p className="font-bold text-green-600">
                R$ {Math.max(...lucros).toFixed(2)}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Menor Lucro</p>
              <p className="font-bold text-red-600">
                R$ {Math.min(...lucros).toFixed(2)}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Média</p>
              <p className="font-bold">
                R$ {(lucros.reduce((a, b) => a + b, 0) / lucros.length).toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
