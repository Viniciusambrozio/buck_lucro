'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { 
  Calendar,
  TrendingUp,
  TrendingDown,
  DollarSign,
  BarChart3,
  Clock,
  Target,
  ArrowLeft,
  Eye
} from 'lucide-react'
import { formatarMoeda } from '@/lib/calculos'
import { Adquirente } from '@/types'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { useRouter } from 'next/navigation'
import { HistoricoItem } from '@/app/actions/historico'

interface DetalhesAdquirenteProps {
  adquirente: Adquirente
  calculos: HistoricoItem[]
}

export function DetalhesAdquirente({ adquirente, calculos }: DetalhesAdquirenteProps) {
  const router = useRouter()

  // Calcular KPIs específicos da adquirente
  const calcularKPIs = () => {
    if (calculos.length === 0) {
      return {
        totalFaturamento: 0,
        totalRegistros: 0,
        mediaPorRegistro: 0,
        maiorValor: 0,
        menorValor: 0,
        primeiroRegistro: null,
        ultimoRegistro: null,
        diasComAtividade: 0,
        tendencia: 'estavel'
      }
    }

    // Mapear valores baseado no nome da adquirente
    const nomeAdquirente = adquirente.nome.toLowerCase()
    const valores = calculos.map(calculo => {
      if (nomeAdquirente.includes('woovi') && nomeAdquirente.includes('gnvn')) {
        return calculo.woovi_white
      } else if (nomeAdquirente.includes('woovi') && (nomeAdquirente.includes('royalt') || nomeAdquirente.includes('tech'))) {
        return calculo.woovi_pixout
      } else if (nomeAdquirente.includes('nomad')) {
        return calculo.nomadfy
      } else if (nomeAdquirente.includes('pluggou')) {
        return calculo.pluggou
      }
      return 0
    })

    const totalFaturamento = valores.reduce((acc, valor) => acc + valor, 0)
    const totalRegistros = calculos.length
    const mediaPorRegistro = totalRegistros > 0 ? totalFaturamento / totalRegistros : 0
    const maiorValor = Math.max(...valores)
    const menorValor = Math.min(...valores.filter(v => v > 0))
    
    // Datas únicas de atividade
    const datasUnicas = new Set(calculos.map(calculo => calculo.data))
    const diasComAtividade = datasUnicas.size

    // Calcular tendência (comparando primeira metade com segunda metade)
    const metade = Math.floor(valores.length / 2)
    const primeiraMetade = valores.slice(0, metade)
    const segundaMetade = valores.slice(metade)
    
    const mediaPrimeira = primeiraMetade.reduce((a, b) => a + b, 0) / primeiraMetade.length
    const mediaSegunda = segundaMetade.reduce((a, b) => a + b, 0) / segundaMetade.length
    
    let tendencia = 'estavel'
    if (mediaSegunda > mediaPrimeira * 1.1) tendencia = 'crescimento'
    else if (mediaSegunda < mediaPrimeira * 0.9) tendencia = 'queda'

    return {
      totalFaturamento,
      totalRegistros,
      mediaPorRegistro,
      maiorValor,
      menorValor,
      primeiroRegistro: calculos[calculos.length - 1],
      ultimoRegistro: calculos[0],
      diasComAtividade,
      tendencia
    }
  }

  const kpis = calcularKPIs()

  const getTendenciaIcon = () => {
    switch (kpis.tendencia) {
      case 'crescimento': return <TrendingUp className="h-4 w-4 text-green-600" />
      case 'queda': return <TrendingDown className="h-4 w-4 text-red-600" />
      default: return <BarChart3 className="h-4 w-4 text-blue-600" />
    }
  }

  const getTendenciaColor = () => {
    switch (kpis.tendencia) {
      case 'crescimento': return 'text-green-600'
      case 'queda': return 'text-red-600'
      default: return 'text-blue-600'
    }
  }

  const getTendenciaText = () => {
    switch (kpis.tendencia) {
      case 'crescimento': return 'Em crescimento'
      case 'queda': return 'Em queda'
      default: return 'Estável'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header com informações básicas */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.back()}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </Button>
              <div>
                <CardTitle className="text-2xl">{adquirente.nome}</CardTitle>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="outline" className={adquirente.tipo_pix === 'pix_in' ? 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'}>
                    {adquirente.tipo_pix === 'pix_in' ? 'Pix IN' : 'Pix OUT'}
                  </Badge>
                  <Badge variant="outline" className={
                    adquirente.categoria_operacao === 'white' ? 'bg-white text-black border-gray-300' : 
                    adquirente.categoria_operacao === 'gray' ? 'bg-gray-400 text-black border-gray-500' : 
                    'bg-black text-white border-black'
                  }>
                    {adquirente.categoria_operacao === 'white' ? 'White' : 
                     adquirente.categoria_operacao === 'gray' ? 'Gray' : 
                     adquirente.categoria_operacao === 'black' ? 'Black' : 'White'}
                  </Badge>
                  <Badge variant={adquirente.ativo ? 'default' : 'secondary'}>
                    {adquirente.ativo ? 'Ativa' : 'Inativa'}
                  </Badge>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {getTendenciaIcon()}
              <span className={`text-sm font-medium ${getTendenciaColor()}`}>
                {getTendenciaText()}
              </span>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* KPIs Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Faturamento Total</p>
                <p className="text-2xl font-bold">{formatarMoeda(kpis.totalFaturamento)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total de Registros</p>
                <p className="text-2xl font-bold">{kpis.totalRegistros}</p>
              </div>
              <Clock className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Média por Registro</p>
                <p className="text-2xl font-bold">{formatarMoeda(kpis.mediaPorRegistro)}</p>
              </div>
              <Target className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Dias com Atividade</p>
                <p className="text-2xl font-bold">{kpis.diasComAtividade}</p>
              </div>
              <Calendar className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Estatísticas Detalhadas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              Melhor Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Maior valor registrado</p>
              <p className="text-2xl font-bold text-green-600">
                {formatarMoeda(kpis.maiorValor)}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingDown className="h-5 w-5 text-red-600" />
              Menor Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Menor valor registrado</p>
              <p className="text-2xl font-bold text-red-600">
                {formatarMoeda(kpis.menorValor)}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Cronologia */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Cronologia de Atividades
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <h4 className="font-medium text-sm text-muted-foreground">Primeiro Registro</h4>
              {kpis.primeiroRegistro ? (
                <div>
                  <p className="font-medium">
                    {format(parseISO(kpis.primeiroRegistro.data), 'dd/MM/yyyy', { locale: ptBR })}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {kpis.primeiroRegistro.horario}
                  </p>
                </div>
              ) : (
                <p className="text-muted-foreground">Nenhum registro</p>
              )}
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium text-sm text-muted-foreground">Último Registro</h4>
              {kpis.ultimoRegistro ? (
                <div>
                  <p className="font-medium">
                    {format(parseISO(kpis.ultimoRegistro.data), 'dd/MM/yyyy', { locale: ptBR })}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {kpis.ultimoRegistro.horario}
                  </p>
                </div>
              ) : (
                <p className="text-muted-foreground">Nenhum registro</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Histórico de Registros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Histórico de Registros
          </CardTitle>
        </CardHeader>
        <CardContent>
          {calculos.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              Nenhum registro encontrado para esta adquirente
            </p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Horário</TableHead>
                    <TableHead className="text-right">Valor</TableHead>
                    <TableHead className="text-right">Lucro Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {calculos.slice(0, 10).map((calculo) => {
                    const nomeAdquirente = adquirente.nome.toLowerCase()
                    let valor = 0
                    
                    if (nomeAdquirente.includes('woovi') && nomeAdquirente.includes('gnvn')) {
                      valor = calculo.woovi_white
                    } else if (nomeAdquirente.includes('woovi') && (nomeAdquirente.includes('royalt') || nomeAdquirente.includes('tech'))) {
                      valor = calculo.woovi_pixout
                    } else if (nomeAdquirente.includes('nomad')) {
                      valor = calculo.nomadfy
                    } else if (nomeAdquirente.includes('pluggou')) {
                      valor = calculo.pluggou
                    }
                    
                    return (
                      <TableRow key={calculo.id}>
                        <TableCell>
                          {format(parseISO(calculo.data), 'dd/MM/yyyy', { locale: ptBR })}
                        </TableCell>
                        <TableCell>{calculo.horario}</TableCell>
                        <TableCell className="text-right font-medium">
                          {formatarMoeda(valor)}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatarMoeda(calculo.lucro)}
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
              {calculos.length > 10 && (
                <p className="text-sm text-muted-foreground mt-4 text-center">
                  Mostrando os 10 registros mais recentes de {calculos.length} total
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
