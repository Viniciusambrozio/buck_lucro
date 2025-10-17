'use client'

import { Card } from '@/components/ui/card'
import { TrendingUp, TrendingDown } from 'lucide-react'

interface CardSaqueRealizadoProps {
  totalSacado: number
  totalLucro: number
  variacao?: number // Percentual de variação em relação ao período anterior
}

export function CardSaqueRealizado({
  totalSacado,
  totalLucro,
  variacao,
}: CardSaqueRealizadoProps) {

  const formatarMoeda = (valor: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(valor)
  }

  return (
    <>
      <Card className="p-6 hover:shadow-lg transition-shadow">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                💰 Saque Realizado
              </p>
              <h2 className="text-3xl font-bold tracking-tight mt-2">
                {formatarMoeda(totalSacado)}
              </h2>
            </div>
            {variacao !== undefined && (
              <div
                className={`flex items-center gap-1 text-sm font-medium ${
                  variacao >= 0 ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {variacao >= 0 ? (
                  <TrendingUp className="h-4 w-4" />
                ) : (
                  <TrendingDown className="h-4 w-4" />
                )}
                <span>{Math.abs(variacao).toFixed(1)}%</span>
              </div>
            )}
          </div>

          {/* Lucro */}
          <div className="border-t pt-4">
            <p className="text-xs text-muted-foreground mb-1">Lucro Sacado</p>
            <p className="text-xl font-semibold text-green-600">
              {formatarMoeda(totalLucro)}
            </p>
          </div>

        </div>
      </Card>
    </>
  )
}


