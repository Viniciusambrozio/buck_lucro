import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { formatarMoeda } from '@/lib/calculos'
import { Adquirente, Calculo } from '@/types'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Badge } from '../ui/badge'

interface HistoricoCalculosProps {
  calculos: Calculo[]
  adquirentes: Adquirente[]
}

/**
 * Componente de Histórico de Cálculos
 * Exibe tabela com todos os cálculos do dia
 */
export function HistoricoCalculos({ calculos, adquirentes }: HistoricoCalculosProps) {
  if (calculos.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Histórico do Dia</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            Nenhum cálculo registrado hoje
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Histórico do Dia</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Horário</TableHead>
                {adquirentes.map(adquirente => (
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
                <TableHead className="text-right font-bold">💰 Lucro</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {calculos.map((calculo) => (
                <TableRow key={calculo.id}>
                  <TableCell>
                    {format(parseISO(calculo.data), 'dd/MM/yyyy', { locale: ptBR })}
                  </TableCell>
                  <TableCell>{calculo.horario}</TableCell>
                  {adquirentes.map(adquirente => {
                    // Mapear o nome da adquirente para a propriedade correspondente no cálculo
                    let valorAdquirente = 0;
                    
                    // Tentamos mapear por nome com verificação mais flexível
                    const nomeLowerCase = adquirente.nome.toLowerCase();
                    if (nomeLowerCase.includes('woovi') && nomeLowerCase.includes('gnvn')) {
                      valorAdquirente = Number(calculo.woovi_white);
                    }
                    else if (nomeLowerCase.includes('woovi') && (nomeLowerCase.includes('royalt') || nomeLowerCase.includes('tech'))) {
                      valorAdquirente = Number(calculo.woovi_pixout);
                    }
                    else if (nomeLowerCase.includes('nomad')) {
                      valorAdquirente = Number(calculo.nomadfy);
                    }
                    else if (nomeLowerCase.includes('pluggou')) {
                      valorAdquirente = Number(calculo.pluggou);
                    }
                    // Mapeamento por tipo para adquirentes novas
                    else if (adquirente.tipo_pix === 'pix_in' && calculo.woovi_white > 0) {
                      valorAdquirente = Number(calculo.woovi_white);
                    }
                    else if (adquirente.tipo_pix === 'pix_out' && calculo.woovi_pixout > 0) {
                      valorAdquirente = Number(calculo.woovi_pixout);
                    }
                    
                    return (
                      <TableCell key={adquirente.id} className="text-right">
                        {formatarMoeda(valorAdquirente)}
                      </TableCell>
                    );
                  })}
                  <TableCell className="text-right">
                    {formatarMoeda(Number(calculo.sellers))}
                  </TableCell>
                  <TableCell className="text-right font-bold">
                    {formatarMoeda(Number(calculo.lucro))}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}




