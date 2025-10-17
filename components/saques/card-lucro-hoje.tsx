'use client'

import { Card } from '@/components/ui/card'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

interface CardLucroHojeProps {
  lucroHoje: number
  variacao?: number // Percentual de variação em relação a ontem
}

export function CardLucroHoje({ lucroHoje, variacao }: CardLucroHojeProps) {
  const formatarMoeda = (valor: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(valor)
  }

  const getVariacaoIcon = () => {
    if (variacao === undefined || variacao === 0) {
      return <Minus className="h-4 w-4" />
    }
    return variacao > 0 ? (
      <TrendingUp className="h-4 w-4" />
    ) : (
      <TrendingDown className="h-4 w-4" />
    )
  }

  const getVariacaoColor = () => {
    if (variacao === undefined || variacao === 0) {
      return 'text-muted-foreground'
    }
    return variacao > 0 ? 'text-green-600' : 'text-red-600'
  }

  return (
    <Card className="p-6 hover:shadow-lg transition-shadow">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              📈 Lucro Hoje
            </p>
            <h2 className="text-3xl font-bold tracking-tight mt-2 text-green-600">
              {formatarMoeda(lucroHoje)}
            </h2>
          </div>
        </div>

        {/* Variação */}
        {variacao !== undefined && (
          <div className="border-t pt-4">
            <div className={`flex items-center gap-1 text-sm font-medium ${getVariacaoColor()}`}>
              {getVariacaoIcon()}
              <span>
                {variacao > 0 ? '+' : ''}
                {variacao.toFixed(1)}% vs ontem
              </span>
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}


