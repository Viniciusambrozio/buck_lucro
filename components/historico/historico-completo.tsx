'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from '@/components/ui/dialog'
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
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
  Filter,
  Edit,
  Trash2,
  ChevronDown,
  ChevronRight,
  Search,
  RefreshCw
} from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { formatarMoeda } from '@/lib/calculos'
import { 
  buscarHistoricoPorPeriodo, 
  excluirCalculo, 
  atualizarCalculo,
  ResumoDia,
  HistoricoItem 
} from '@/app/actions/historico'
import { MetricasCompletas } from './metricas-completas'
import { GraficoTendencias } from './grafico-tendencias'
import { useRouter } from 'next/navigation'

interface HistoricoCompletoProps {
  historico: ResumoDia[]
}

export function HistoricoCompleto({ historico: historicoInicial }: HistoricoCompletoProps) {
  const router = useRouter()
  const [historico, setHistorico] = useState<ResumoDia[]>(historicoInicial)
  const [historicoFiltrado, setHistoricoFiltrado] = useState<ResumoDia[]>(historicoInicial)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Estados para filtros
  const [dataInicio, setDataInicio] = useState('')
  const [dataFim, setDataFim] = useState('')
  const [buscaTexto, setBuscaTexto] = useState('')
  
  // Estados para diálogos
  const [calculoParaEditar, setCalculoParaEditar] = useState<HistoricoItem | null>(null)
  const [calculoParaExcluir, setCalculoParaExcluir] = useState<HistoricoItem | null>(null)
  const [diasExpandidos, setDiasExpandidos] = useState<Set<string>>(new Set())
  
  // Estados para edição
  const [editandoCalculo, setEditandoCalculo] = useState(false)
  const [valoresEdicao, setValoresEdicao] = useState({
    woovi_white: 0,
    woovi_pixout: 0,
    nomadfy: 0,
    pluggou: 0,
    sellers: 0,
    horario: ''
  })

  // Aplicar filtros
  useEffect(() => {
    let resultado = [...historico]
    
    // Filtro por período
    if (dataInicio || dataFim) {
      resultado = resultado.filter(dia => {
        const dataDia = parseISO(dia.data)
        const inicio = dataInicio ? parseISO(dataInicio) : null
        const fim = dataFim ? parseISO(dataFim) : null
        
        if (inicio && dataDia < inicio) return false
        if (fim && dataDia > fim) return false
        return true
      })
    }
    
    // Filtro por texto (busca em valores)
    if (buscaTexto) {
      resultado = resultado.filter(dia => 
        dia.calculos.some(calc => 
          calc.lucro.toString().includes(buscaTexto) ||
          calc.sellers.toString().includes(buscaTexto) ||
          calc.horario.includes(buscaTexto)
        )
      )
    }
    
    setHistoricoFiltrado(resultado)
  }, [historico, dataInicio, dataFim, buscaTexto])

  const aplicarFiltros = async () => {
    if (!dataInicio && !dataFim) {
      setHistorico(historicoInicial)
      return
    }
    
    setLoading(true)
    setError(null)
    
    try {
      const result = await buscarHistoricoPorPeriodo(dataInicio, dataFim)
      if (result.error) {
        setError(result.error)
      } else {
        setHistorico(result.historico || [])
      }
    } catch {
      setError('Erro ao aplicar filtros')
    } finally {
      setLoading(false)
    }
  }

  const limparFiltros = () => {
    setDataInicio('')
    setDataFim('')
    setBuscaTexto('')
    setHistorico(historicoInicial)
  }

  const toggleDiaExpandido = (data: string) => {
    const novosExpandidos = new Set(diasExpandidos)
    if (novosExpandidos.has(data)) {
      novosExpandidos.delete(data)
    } else {
      novosExpandidos.add(data)
    }
    setDiasExpandidos(novosExpandidos)
  }

  const abrirEdicao = (calculo: HistoricoItem) => {
    setCalculoParaEditar(calculo)
    setValoresEdicao({
      woovi_white: calculo.woovi_white,
      woovi_pixout: calculo.woovi_pixout,
      nomadfy: calculo.nomadfy,
      pluggou: calculo.pluggou,
      sellers: calculo.sellers,
      horario: calculo.horario
    })
  }

  const salvarEdicao = async () => {
    if (!calculoParaEditar) return
    
    setEditandoCalculo(true)
    setError(null)
    
    try {
      const result = await atualizarCalculo(calculoParaEditar.id, valoresEdicao)
      if (result.error) {
        setError(result.error)
      } else {
        setCalculoParaEditar(null)
        router.refresh()
      }
    } catch {
      setError('Erro ao salvar edição')
    } finally {
      setEditandoCalculo(false)
    }
  }

  const confirmarExclusao = async () => {
    if (!calculoParaExcluir) return
    
    setLoading(true)
    setError(null)
    
    try {
      const result = await excluirCalculo(calculoParaExcluir.id)
      if (result.error) {
        setError(result.error)
      } else {
        setCalculoParaExcluir(null)
        router.refresh()
      }
    } catch {
      setError('Erro ao excluir cálculo')
    } finally {
      setLoading(false)
    }
  }


  return (
    <div className="space-y-6">
      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros e Busca
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dataInicio">Data Início</Label>
              <Input
                id="dataInicio"
                type="date"
                value={dataInicio}
                onChange={(e) => setDataInicio(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dataFim">Data Fim</Label>
              <Input
                id="dataFim"
                type="date"
                value={dataFim}
                onChange={(e) => setDataFim(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="busca">Buscar</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="busca"
                  placeholder="Valores, horários..."
                  value={buscaTexto}
                  onChange={(e) => setBuscaTexto(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button onClick={aplicarFiltros} disabled={loading}>
              {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Filter className="h-4 w-4" />}
              Aplicar Filtros
            </Button>
            <Button variant="outline" onClick={limparFiltros}>
              Limpar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* KPIs Completos */}
      <MetricasCompletas historico={historicoFiltrado} />

      {/* Gráfico de Tendências */}
      <GraficoTendencias historico={historicoFiltrado} />

      {/* Histórico por Dia */}
      <div className="space-y-4">
        {historicoFiltrado.map((dia) => (
          <Card key={dia.data}>
            <CardHeader 
              className="cursor-pointer hover:bg-muted/50 transition-colors"
              onClick={() => toggleDiaExpandido(dia.data)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {diasExpandidos.has(dia.data) ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                  <CardTitle className="text-lg">
                    {format(parseISO(dia.data), 'dd/MM/yyyy', { locale: ptBR })}
                  </CardTitle>
                </div>
                <div className="flex items-center gap-4">
                  <Badge variant="outline">
                    {dia.total_registros} registro{dia.total_registros !== 1 ? 's' : ''}
                  </Badge>
                  <Badge variant={dia.total_lucro >= 0 ? 'default' : 'destructive'}>
                    {formatarMoeda(dia.total_lucro)}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            
            {diasExpandidos.has(dia.data) && (
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Horário</TableHead>
                      {(dia.adquirentes || adquirentes).map(adquirente => (
                        <TableHead key={adquirente.id} className="text-right">
                          <div className={`flex items-center justify-end gap-1 ${!adquirente.ativo ? 'opacity-60' : ''}`}>
                            {!adquirente.ativo && (
                              <span className="text-xs text-muted-foreground" title="Adquirente desativada">
                                ⚠️
                              </span>
                            )}
                            <span className={!adquirente.ativo ? 'line-through' : ''}>
                              {adquirente.nome}
                            </span>
                            {!adquirente.ativo && (
                              <Badge variant="secondary" className="text-xs ml-2">
                                Desativada
                              </Badge>
                            )}
                          </div>
                        </TableHead>
                      ))}
                      <TableHead className="text-right">Sellers</TableHead>
                      <TableHead className="text-right">Lucro</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {dia.calculos.map((calculo) => (
                      <TableRow key={calculo.id}>
                        <TableCell>{calculo.horario}</TableCell>
                        {(dia.adquirentes || adquirentes).map(adquirente => {
                          let valorAdquirente = 0;
                          const nomeLowerCase = adquirente.nome.toLowerCase();
                          if (nomeLowerCase.includes('woovi') && nomeLowerCase.includes('gnvn')) {
                            valorAdquirente = Number(calculo.woovi_white);
                          } else if (nomeLowerCase.includes('woovi') && (nomeLowerCase.includes('royalt') || nomeLowerCase.includes('tech'))) {
                            valorAdquirente = Number(calculo.woovi_pixout);
                          } else if (nomeLowerCase.includes('nomad')) {
                            valorAdquirente = Number(calculo.nomadfy);
                          } else if (nomeLowerCase.includes('pluggou')) {
                            valorAdquirente = Number(calculo.pluggou);
                          }
                          return (
                            <TableCell key={adquirente.id} className="text-right">
                              {formatarMoeda(valorAdquirente)}
                            </TableCell>
                          );
                        })}
                        <TableCell className="text-right">{formatarMoeda(calculo.sellers)}</TableCell>
                        <TableCell className="text-right font-bold">
                          {formatarMoeda(calculo.lucro)}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => abrirEdicao(calculo)}
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setCalculoParaExcluir(calculo)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            )}
          </Card>
        ))}
      </div>

      {/* Diálogo de Edição */}
      <Dialog open={!!calculoParaEditar} onOpenChange={() => setCalculoParaEditar(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Cálculo</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="woovi_white">Woovi (GNVN)</Label>
                <Input
                  id="woovi_white"
                  type="number"
                  step="0.01"
                  value={valoresEdicao.woovi_white}
                  onChange={(e) => setValoresEdicao(prev => ({ ...prev, woovi_white: Number(e.target.value) }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="woovi_pixout">Woovi (ROYALT)</Label>
                <Input
                  id="woovi_pixout"
                  type="number"
                  step="0.01"
                  value={valoresEdicao.woovi_pixout}
                  onChange={(e) => setValoresEdicao(prev => ({ ...prev, woovi_pixout: Number(e.target.value) }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nomadfy">NomadFy</Label>
                <Input
                  id="nomadfy"
                  type="number"
                  step="0.01"
                  value={valoresEdicao.nomadfy}
                  onChange={(e) => setValoresEdicao(prev => ({ ...prev, nomadfy: Number(e.target.value) }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pluggou">Pluggou</Label>
                <Input
                  id="pluggou"
                  type="number"
                  step="0.01"
                  value={valoresEdicao.pluggou}
                  onChange={(e) => setValoresEdicao(prev => ({ ...prev, pluggou: Number(e.target.value) }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sellers">Sellers</Label>
                <Input
                  id="sellers"
                  type="number"
                  step="0.01"
                  value={valoresEdicao.sellers}
                  onChange={(e) => setValoresEdicao(prev => ({ ...prev, sellers: Number(e.target.value) }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="horario">Horário</Label>
                <Input
                  id="horario"
                  value={valoresEdicao.horario}
                  onChange={(e) => setValoresEdicao(prev => ({ ...prev, horario: e.target.value }))}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCalculoParaEditar(null)}>
              Cancelar
            </Button>
            <Button onClick={salvarEdicao} disabled={editandoCalculo}>
              {editandoCalculo ? 'Salvando...' : 'Salvar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diálogo de Confirmação de Exclusão */}
      <AlertDialog open={!!calculoParaExcluir} onOpenChange={() => setCalculoParaExcluir(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este cálculo? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmarExclusao} disabled={loading}>
              {loading ? 'Excluindo...' : 'Excluir'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Mensagem de Erro */}
      {error && (
        <div className="bg-destructive/10 text-destructive p-3 rounded-md text-sm border border-destructive/20">
          {error}
        </div>
      )}
    </div>
  )
}
