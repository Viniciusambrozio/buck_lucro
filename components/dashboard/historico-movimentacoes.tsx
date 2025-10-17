'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import type { MovimentacaoDetalhada } from '@/types'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { ArrowRight } from 'lucide-react'

interface HistoricoMovimentacoesProps {
  movimentacoes: MovimentacaoDetalhada[]
  titulo?: string
  descricao?: string
}

export function HistoricoMovimentacoes({ 
  movimentacoes, 
  titulo = "Histórico de Movimentações",
  descricao = "Últimas transferências e saques realizados"
}: HistoricoMovimentacoesProps) {
  const formatarMoeda = (valor: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor)
  }

  const formatarData = (data: string) => {
    return format(new Date(data), "dd 'de' MMMM", { locale: ptBR })
  }

  const getBadgeVariant = (tipo: string) => {
    switch (tipo) {
      case 'pixin_para_empresa':
        return 'default'
      case 'pixin_para_pixout':
        return 'secondary'
      case 'empresa_para_pixout':
        return 'outline'
      default:
        return 'default'
    }
  }

  const getTipoLabel = (tipo: string) => {
    switch (tipo) {
      case 'pixin_para_empresa':
        return 'Pix In → Empresa'
      case 'pixin_para_pixout':
        return 'Pix In → Pix Out'
      case 'empresa_para_pixout':
        return 'Empresa → Pix Out'
      default:
        return tipo
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{titulo}</CardTitle>
        <CardDescription>{descricao}</CardDescription>
      </CardHeader>
      <CardContent>
        {movimentacoes.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            Nenhuma movimentação registrada
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data/Hora</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Origem</TableHead>
                  <TableHead>Destino</TableHead>
                  <TableHead className="text-right">Valor</TableHead>
                  <TableHead>Observação</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {movimentacoes.map((mov) => (
                  <TableRow key={mov.id}>
                    <TableCell className="whitespace-nowrap">
                      <div className="font-medium">{formatarData(mov.data)}</div>
                      <div className="text-sm text-muted-foreground">{mov.horario.substring(0, 5)}</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getBadgeVariant(mov.tipo_movimentacao)}>
                        {getTipoLabel(mov.tipo_movimentacao)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{mov.origem_nome}</div>
                      <div className="text-xs text-muted-foreground capitalize">{mov.origem_tipo.replace('_', ' ')}</div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <ArrowRight className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <div className="font-medium">{mov.destino_nome}</div>
                          <div className="text-xs text-muted-foreground capitalize">{mov.destino_tipo.replace('_', ' ')}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-mono font-semibold">
                      {formatarMoeda(mov.valor)}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">
                      {mov.observacao || '-'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}


