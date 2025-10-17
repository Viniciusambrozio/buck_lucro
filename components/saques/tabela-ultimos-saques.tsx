'use client'

import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { ArrowRight, Clock } from 'lucide-react'
import type { Saque } from '@/app/actions/saques'

interface TabelaUltimosSaquesProps {
  saques: (Saque & {
    adquirente_origem?: { nome: string } | null
    adquirente_destino?: { nome: string } | null
  })[]
  limite?: number
}

export function TabelaUltimosSaques({ saques, limite = 10 }: TabelaUltimosSaquesProps) {
  const formatarMoeda = (valor: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(valor)
  }

  const formatarData = (data: string) => {
    const date = new Date(data)
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date)
  }

  const getNomeConta = (
    tipo: string,
    adquirente?: { nome: string } | null
  ): string => {
    switch (tipo) {
      case 'pix_in':
        return adquirente ? adquirente.nome : 'Pix In'
      case 'pix_out':
        return 'Pix Out'
      case 'conta_empresa':
        return 'Conta Empresa'
      default:
        return tipo
    }
  }

  const getTipoOperacaoBadge = (tipo: string) => {
    switch (tipo) {
      case 'lucro':
        return (
          <Badge variant="default" className="bg-green-500">
            💰 Lucro
          </Badge>
        )
      case 'transferencia':
        return <Badge variant="secondary">🔄 Transferência</Badge>
      case 'garantia_saldo':
        return <Badge variant="outline">🏦 Garantia</Badge>
      default:
        return <Badge>{tipo}</Badge>
    }
  }

  const saquesLimitados = saques.slice(0, limite)

  return (
    <Card className="p-6">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Últimos Saques
          </h3>
          {saques.length > limite && (
            <span className="text-sm text-muted-foreground">
              Mostrando {limite} de {saques.length}
            </span>
          )}
        </div>

        {/* Tabela */}
        {saquesLimitados.length > 0 ? (
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data/Hora</TableHead>
                  <TableHead>Movimentação</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead className="text-right">Valor</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {saquesLimitados.map((saque) => (
                  <TableRow key={saque.id}>
                    <TableCell className="font-medium">
                      {formatarData(saque.created_at)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="text-sm">
                          {getNomeConta(saque.origem, saque.adquirente_origem)}
                        </span>
                        <ArrowRight className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">
                          {getNomeConta(saque.destino, saque.adquirente_destino)}
                        </span>
                      </div>
                      {saque.observacoes && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {saque.observacoes}
                        </p>
                      )}
                    </TableCell>
                    <TableCell>{getTipoOperacaoBadge(saque.tipo_operacao)}</TableCell>
                    <TableCell className="text-right font-semibold">
                      {formatarMoeda(Number(saque.valor))}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="h-[200px] flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <p className="text-lg font-medium">Nenhum saque registrado</p>
              <p className="text-sm mt-1">
                Registre seu primeiro saque para começar
              </p>
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}


