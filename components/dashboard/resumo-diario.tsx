import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatarMoeda } from '@/lib/calculos'
import { TrendingUp, Calendar, Wallet, BarChart4 } from 'lucide-react'

interface ResumoDiarioProps {
  lucro_total: number
  media_por_horario: number
  numero_registros: number
  
  // Novos KPIs
  lucro_semanal?: number
  lucro_mensal?: number
  total_saque?: number
  total_faturamento?: number
}

/**
 * Componente de Resumo Diário e KPIs Gerais
 * Exibe estatísticas consolidadas do dia e métricas gerais
 */
export function ResumoDiario({
  lucro_total,
  media_por_horario,
  numero_registros,
  lucro_semanal = 0,
  lucro_mensal = 0,
  total_saque = 0,
  total_faturamento = 0,
}: ResumoDiarioProps) {
  return (
    <div className="space-y-6 mb-8">
      {/* Título da seção */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Visão Geral</h2>
        <p className="text-sm text-muted-foreground">
          Resumo das suas métricas diárias, semanais e mensais
        </p>
      </div>

      {/* KPIs Diários */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Lucro Total do Dia
            </CardTitle>
            <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center">
              <TrendingUp className="h-4 w-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatarMoeda(lucro_total)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Lucro Semanal
            </CardTitle>
            <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center">
              <Calendar className="h-4 w-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatarMoeda(lucro_semanal)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Lucro Mensal
            </CardTitle>
            <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center">
              <BarChart4 className="h-4 w-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatarMoeda(lucro_mensal)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Média por Horário
            </CardTitle>
            <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center">
              <Calendar className="h-4 w-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatarMoeda(media_por_horario)}</p>
          </CardContent>
        </Card>
      </div>

      {/* KPIs de Totais */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total em Saques
            </CardTitle>
            <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center">
              <Wallet className="h-4 w-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatarMoeda(total_saque)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total em Faturamento
            </CardTitle>
            <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center">
              <BarChart4 className="h-4 w-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatarMoeda(total_faturamento)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Registros Feitos
            </CardTitle>
            <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center">
              <BarChart4 className="h-4 w-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{numero_registros}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}



