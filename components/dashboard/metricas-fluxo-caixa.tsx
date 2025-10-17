'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowUpRight, ArrowDownRight, Wallet, TrendingUp } from 'lucide-react'
import type { MetricasFluxoCaixa } from '@/types'

interface MetricasFluxoCaixaProps {
  metricas: MetricasFluxoCaixa
}

export function MetricasFluxoCaixaComponent({ metricas }: MetricasFluxoCaixaProps) {
  const formatarMoeda = (valor: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor)
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {/* Total Sacado Hoje */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Total Sacado Hoje
          </CardTitle>
          <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {formatarMoeda(metricas.total_sacado_dia)}
          </div>
          <p className="text-xs text-muted-foreground">
            {metricas.total_movimentacoes} {metricas.total_movimentacoes === 1 ? 'movimentação' : 'movimentações'}
          </p>
        </CardContent>
      </Card>

      {/* Total Sacado Mês */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Total Sacado no Mês
          </CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {formatarMoeda(metricas.total_sacado_mes)}
          </div>
          <p className="text-xs text-muted-foreground">
            Acumulado mensal
          </p>
        </CardContent>
      </Card>

      {/* Saldo Pix Out (Sellers) */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Saldo Pix Out (Sellers)
          </CardTitle>
          <Wallet className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {formatarMoeda(metricas.saldo_pixout)}
          </div>
          <p className="text-xs text-muted-foreground">
            Disponível para saques
          </p>
        </CardContent>
      </Card>

      {/* Lucro Disponível */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Lucro Disponível
          </CardTitle>
          <ArrowDownRight className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {formatarMoeda(metricas.lucro_disponivel)}
          </div>
          <p className="text-xs text-muted-foreground">
            Saldo em conta empresa
          </p>
        </CardContent>
      </Card>
    </div>
  )
}


