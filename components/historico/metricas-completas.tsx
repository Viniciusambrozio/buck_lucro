'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Calendar,
  TrendingUp,
  TrendingDown,
  DollarSign,
  BarChart3,
  Clock,
  Target,
  Wallet
} from 'lucide-react'
import { formatarMoeda } from '@/lib/calculos'
import { ResumoDia } from '@/app/actions/historico'
import { format, parseISO, startOfWeek, endOfWeek, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface MetricasCompletasProps {
  historico: ResumoDia[]
}

interface KPIMetrics {
  // Totais gerais
  lucroTotal: number
  totalRegistros: number
  totalDias: number
  mediaDiaria: number
  
  // Semanal
  lucroSemanal: number
  registrosSemanal: number
  
  // Mensal
  lucroMensal: number
  registrosMensal: number
  
  // Tendências
  melhorDia: { data: string; lucro: number }
  piorDia: { data: string; lucro: number }
  diasComLucro: number
  diasComPrejuizo: number
  
  // Estatísticas
  maiorLucro: number
  menorLucro: number
  mediaLucro: number
}

export function MetricasCompletas({ historico }: MetricasCompletasProps) {
  
  const calcularMetricas = (): KPIMetrics => {
    if (historico.length === 0) {
      return {
        lucroTotal: 0,
        totalRegistros: 0,
        totalDias: 0,
        mediaDiaria: 0,
        lucroSemanal: 0,
        registrosSemanal: 0,
        lucroMensal: 0,
        registrosMensal: 0,
        melhorDia: { data: '', lucro: 0 },
        piorDia: { data: '', lucro: 0 },
        diasComLucro: 0,
        diasComPrejuizo: 0,
        maiorLucro: 0,
        menorLucro: 0,
        mediaLucro: 0
      }
    }

    const agora = new Date()
    const inicioSemana = startOfWeek(agora, { locale: ptBR })
    const fimSemana = endOfWeek(agora, { locale: ptBR })
    const inicioMes = startOfMonth(agora)
    const fimMes = endOfMonth(agora)

    // Calcular totais gerais
    const lucroTotal = historico.reduce((acc, dia) => acc + dia.total_lucro, 0)
    const totalRegistros = historico.reduce((acc, dia) => acc + dia.total_registros, 0)
    const totalDias = historico.length
    const mediaDiaria = totalDias > 0 ? lucroTotal / totalDias : 0

    // Calcular métricas semanais
    const dadosSemanal = historico.filter(dia => {
      const dataDia = parseISO(dia.data)
      return isWithinInterval(dataDia, { start: inicioSemana, end: fimSemana })
    })
    const lucroSemanal = dadosSemanal.reduce((acc, dia) => acc + dia.total_lucro, 0)
    const registrosSemanal = dadosSemanal.reduce((acc, dia) => acc + dia.total_registros, 0)

    // Calcular métricas mensais
    const dadosMensal = historico.filter(dia => {
      const dataDia = parseISO(dia.data)
      return isWithinInterval(dataDia, { start: inicioMes, end: fimMes })
    })
    const lucroMensal = dadosMensal.reduce((acc, dia) => acc + dia.total_lucro, 0)
    const registrosMensal = dadosMensal.reduce((acc, dia) => acc + dia.total_registros, 0)

    // Encontrar melhor e pior dia
    const melhorDia = historico.reduce((melhor, dia) => 
      dia.total_lucro > melhor.lucro ? { data: dia.data, lucro: dia.total_lucro } : melhor,
      { data: historico[0]?.data || '', lucro: historico[0]?.total_lucro || 0 }
    )
    
    const piorDia = historico.reduce((pior, dia) => 
      dia.total_lucro < pior.lucro ? { data: dia.data, lucro: dia.total_lucro } : pior,
      { data: historico[0]?.data || '', lucro: historico[0]?.total_lucro || 0 }
    )

    // Contar dias com lucro e prejuízo
    const diasComLucro = historico.filter(dia => dia.total_lucro > 0).length
    const diasComPrejuizo = historico.filter(dia => dia.total_lucro < 0).length

    // Estatísticas de lucro
    const lucros = historico.map(dia => dia.total_lucro)
    const maiorLucro = Math.max(...lucros)
    const menorLucro = Math.min(...lucros)
    const mediaLucro = lucros.reduce((acc, lucro) => acc + lucro, 0) / lucros.length

    return {
      lucroTotal,
      totalRegistros,
      totalDias,
      mediaDiaria,
      lucroSemanal,
      registrosSemanal,
      lucroMensal,
      registrosMensal,
      melhorDia,
      piorDia,
      diasComLucro,
      diasComPrejuizo,
      maiorLucro,
      menorLucro,
      mediaLucro
    }
  }

  const metricas = calcularMetricas()

  return (
    <div className="space-y-6">
      {/* KPIs Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Lucro Total</p>
                <p className="text-2xl font-bold">{formatarMoeda(metricas.lucroTotal)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Lucro Semanal</p>
                <p className="text-2xl font-bold">{formatarMoeda(metricas.lucroSemanal)}</p>
              </div>
              <Calendar className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Lucro Mensal</p>
                <p className="text-2xl font-bold">{formatarMoeda(metricas.lucroMensal)}</p>
              </div>
              <BarChart3 className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Média Diária</p>
                <p className="text-2xl font-bold">{formatarMoeda(metricas.mediaDiaria)}</p>
              </div>
              <Target className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Estatísticas Detalhadas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              Melhor Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                {metricas.melhorDia.data ? format(parseISO(metricas.melhorDia.data), 'dd/MM/yyyy', { locale: ptBR }) : 'N/A'}
              </p>
              <p className="text-xl font-bold text-green-600">
                {formatarMoeda(metricas.melhorDia.lucro)}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingDown className="h-5 w-5 text-red-600" />
              Pior Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                {metricas.piorDia.data ? format(parseISO(metricas.piorDia.data), 'dd/MM/yyyy', { locale: ptBR }) : 'N/A'}
              </p>
              <p className="text-xl font-bold text-red-600">
                {formatarMoeda(metricas.piorDia.lucro)}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Wallet className="h-5 w-5 text-blue-600" />
              Resumo Geral
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Dias com Lucro:</span>
                <Badge variant="outline" className="bg-green-50 text-green-700">
                  {metricas.diasComLucro}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Dias com Prejuízo:</span>
                <Badge variant="outline" className="bg-red-50 text-red-700">
                  {metricas.diasComPrejuizo}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Total de Dias:</span>
                <span className="font-medium">{metricas.totalDias}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Métricas de Registros */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Registros</p>
                <p className="text-2xl font-bold">{metricas.totalRegistros}</p>
              </div>
              <Clock className="h-8 w-8 text-indigo-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Registros Semanal</p>
                <p className="text-2xl font-bold">{metricas.registrosSemanal}</p>
              </div>
              <Calendar className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Registros Mensal</p>
                <p className="text-2xl font-bold">{metricas.registrosMensal}</p>
              </div>
              <BarChart3 className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Média por Dia</p>
                <p className="text-2xl font-bold">
                  {metricas.totalDias > 0 ? (metricas.totalRegistros / metricas.totalDias).toFixed(1) : '0'}
                </p>
              </div>
              <Target className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Estatísticas Avançadas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Estatísticas Avançadas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <h4 className="font-medium text-sm text-muted-foreground">Maior Lucro Único</h4>
              <p className="text-2xl font-bold text-green-600">
                {formatarMoeda(metricas.maiorLucro)}
              </p>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium text-sm text-muted-foreground">Menor Lucro Único</h4>
              <p className="text-2xl font-bold text-red-600">
                {formatarMoeda(metricas.menorLucro)}
              </p>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium text-sm text-muted-foreground">Média de Lucro</h4>
              <p className="text-2xl font-bold">
                {formatarMoeda(metricas.mediaLucro)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
