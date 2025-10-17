'use client'

import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { CurrencyInput } from '@/components/ui/currency-input'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { ArrowUpDown } from 'lucide-react'
import { criarMovimentacaoSimples } from '@/app/actions/movimentacoes-simples'
import type { Conta, TipoMovimentacao } from '@/types'

interface FormSaqueProps {
  contas: Conta[]
}

export function FormSaque({ contas }: FormSaqueProps) {
  const [isPending, startTransition] = useTransition()
  const [open, setOpen] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  const [sucesso, setSucesso] = useState(false)

  // Debug: verificar se as contas estão sendo carregadas
  console.log('FormSaque - Contas recebidas:', contas)

  // Estados do formulário
  const [valor, setValor] = useState<number>(0)
  const [tipoFluxo, setTipoFluxo] = useState<'empresa_pixout' | 'pixin_pixout' | 'pixin_empresa'>('pixin_empresa')
  const [contaOrigem, setContaOrigem] = useState<string>('')
  const [contaDestino, setContaDestino] = useState<string>('')
  const [observacao, setObservacao] = useState<string>('')

  // Filtra contas por tipo
  const contasEmpresa = (contas || []).filter(c => c.tipo === 'empresa' && c.ativo)
  const contasPixIn = (contas || []).filter(c => c.tipo === 'pix_in' && c.ativo)
  const contasPixOut = (contas || []).filter(c => c.tipo === 'pix_out' && c.ativo)

  // Determina quais contas mostrar baseado no tipo de fluxo
  const getContasOrigem = () => {
    if (tipoFluxo === 'empresa_pixout') return contasEmpresa
    return contasPixIn
  }

  const getContasDestino = () => {
    if (tipoFluxo === 'pixin_empresa') return contasEmpresa
    return contasPixOut
  }

  const resetForm = () => {
    setValor(0)
    setTipoFluxo('pixin_empresa')
    setContaOrigem('')
    setContaDestino('')
    setObservacao('')
    setErro(null)
    setSucesso(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErro(null)
    setSucesso(false)

    if (!contaOrigem || !contaDestino) {
      setErro('Selecione origem e destino')
      return
    }

    if (valor <= 0) {
      setErro('Valor deve ser maior que zero')
      return
    }

    if (contaOrigem === contaDestino) {
      setErro('Origem e destino devem ser diferentes')
      return
    }

    const tipoMovimentacao: TipoMovimentacao = 
      tipoFluxo === 'empresa_pixout' ? 'empresa_para_pixout' :
      tipoFluxo === 'pixin_pixout' ? 'pixin_para_pixout' :
      'pixin_para_empresa'

    startTransition(async () => {
      const resultado = await criarMovimentacaoSimples({
        valor,
        conta_origem_id: contaOrigem,
        conta_destino_id: contaDestino,
        tipo_movimentacao: tipoMovimentacao,
        observacao: observacao || undefined
      })

      if (resultado.success) {
        setSucesso(true)
        setTimeout(() => {
          setOpen(false)
          resetForm()
        }, 1500)
      } else {
        setErro(resultado.error || 'Erro ao registrar saque')
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="lg" className="w-full md:w-auto">
          <ArrowUpDown className="mr-2 h-4 w-4" />
          Registrar Saque
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Registrar Saque/Transferência</DialogTitle>
            <DialogDescription>
              Registre movimentações entre contas para controlar o fluxo de caixa
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {/* Tipo de Fluxo */}
            <div className="space-y-2">
              <Label>Tipo de Movimentação</Label>
              <div className="grid grid-cols-1 gap-2">
                <label className="flex items-center space-x-2 cursor-pointer border rounded-lg p-3 hover:bg-muted">
                  <input
                    type="radio"
                    name="tipo"
                    value="pixin_empresa"
                    checked={tipoFluxo === 'pixin_empresa'}
                    onChange={(e) => {
                      setTipoFluxo(e.target.value as any)
                      setContaOrigem('')
                      setContaDestino('')
                    }}
                    className="h-4 w-4"
                  />
                  <div>
                    <div className="font-medium">💰 Pix In → Empresa</div>
                    <div className="text-sm text-muted-foreground">Sacar lucro para conta empresa</div>
                  </div>
                </label>

                <label className="flex items-center space-x-2 cursor-pointer border rounded-lg p-3 hover:bg-muted">
                  <input
                    type="radio"
                    name="tipo"
                    value="pixin_pixout"
                    checked={tipoFluxo === 'pixin_pixout'}
                    onChange={(e) => {
                      setTipoFluxo(e.target.value as any)
                      setContaOrigem('')
                      setContaDestino('')
                    }}
                    className="h-4 w-4"
                  />
                  <div>
                    <div className="font-medium">🔄 Pix In → Pix Out</div>
                    <div className="text-sm text-muted-foreground">Transferir para conta sellers</div>
                  </div>
                </label>

                <label className="flex items-center space-x-2 cursor-pointer border rounded-lg p-3 hover:bg-muted">
                  <input
                    type="radio"
                    name="tipo"
                    value="empresa_pixout"
                    checked={tipoFluxo === 'empresa_pixout'}
                    onChange={(e) => {
                      setTipoFluxo(e.target.value as any)
                      setContaOrigem('')
                      setContaDestino('')
                    }}
                    className="h-4 w-4"
                  />
                  <div>
                    <div className="font-medium">🏦 Empresa → Pix Out</div>
                    <div className="text-sm text-muted-foreground">Adicionar saldo para sellers</div>
                  </div>
                </label>
              </div>
            </div>

            {/* Conta Origem */}
            <div className="space-y-2">
              <Label htmlFor="origem">
                Conta Origem
                {tipoFluxo === 'empresa_pixout' && (
                  <span className="text-sm text-muted-foreground ml-2">(Conta da Empresa)</span>
                )}
                {(tipoFluxo === 'pixin_empresa' || tipoFluxo === 'pixin_pixout') && (
                  <span className="text-sm text-muted-foreground ml-2">(Adquirentes Pix In)</span>
                )}
              </Label>
              <select
                id="origem"
                value={contaOrigem}
                onChange={(e) => setContaOrigem(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                required
              >
                <option value="">Selecione a origem</option>
                {getContasOrigem().map((conta) => (
                  <option key={conta.id} value={conta.id}>
                    {conta.nome} - {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(conta.saldo_atual || 0)}
                  </option>
                ))}
              </select>
            </div>

            {/* Conta Destino */}
            <div className="space-y-2">
              <Label htmlFor="destino">
                Conta Destino
                {tipoFluxo === 'pixin_empresa' && (
                  <span className="text-sm text-muted-foreground ml-2">(Conta da Empresa)</span>
                )}
                {(tipoFluxo === 'pixin_pixout' || tipoFluxo === 'empresa_pixout') && (
                  <span className="text-sm text-muted-foreground ml-2">(Adquirentes Pix Out)</span>
                )}
              </Label>
              <select
                id="destino"
                value={contaDestino}
                onChange={(e) => setContaDestino(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                required
              >
                <option value="">Selecione o destino</option>
                {getContasDestino().map((conta) => (
                  <option key={conta.id} value={conta.id}>
                    {conta.nome} - {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(conta.saldo_atual || 0)}
                  </option>
                ))}
              </select>
            </div>

            {/* Valor */}
            <div className="space-y-2">
              <Label htmlFor="valor">Valor</Label>
              <CurrencyInput
                id="valor"
                value={valor}
                onValueChange={setValor}
                required
              />
            </div>

            {/* Observação */}
            <div className="space-y-2">
              <Label htmlFor="observacao">Observação (opcional)</Label>
              <input
                id="observacao"
                type="text"
                value={observacao}
                onChange={(e) => setObservacao(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                placeholder="Adicione uma observação"
              />
            </div>

            {/* Mensagens */}
            {erro && (
              <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md border border-red-200">
                {erro}
              </div>
            )}
            {sucesso && (
              <div className="text-sm text-green-600 bg-green-50 p-3 rounded-md border border-green-200">
                Saque registrado com sucesso!
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isPending}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Salvando...' : 'Registrar Saque'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}


