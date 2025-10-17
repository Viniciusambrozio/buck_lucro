'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { CurrencyInput } from '@/components/ui/currency-input'
import { useRouter } from 'next/navigation'
import { registrarSaque, type TipoConta, type TipoOperacao } from '@/app/actions/saques'
import { obterAdquirentes, type Adquirente } from '@/app/actions/adquirentes'

interface ModalRegistrarSaqueProps {
  aberto: boolean
  onFechar: () => void
}

export function ModalRegistrarSaque({ aberto, onFechar }: ModalRegistrarSaqueProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  const [adquirentes, setAdquirentes] = useState<Adquirente[]>([])

  // Form state
  const [valor, setValor] = useState('')
  const [origem, setOrigem] = useState<TipoConta | ''>('')
  const [destino, setDestino] = useState<TipoConta | ''>('')
  const [tipoOperacao, setTipoOperacao] = useState<TipoOperacao>('lucro')
  const [adquirenteOrigemId, setAdquirenteOrigemId] = useState<string>('')
  const [adquirenteDestinoId, setAdquirenteDestinoId] = useState<string>('')
  const [observacoes, setObservacoes] = useState('')

  // Carregar adquirentes
  useEffect(() => {
    if (aberto) {
      carregarAdquirentes()
    }
  }, [aberto])

  const carregarAdquirentes = async () => {
    const result = await obterAdquirentes()
    if (result.success && result.data) {
      setAdquirentes(result.data)
    }
  }

  // Auto-detectar tipo de operação baseado em origem/destino
  useEffect(() => {
    if (origem && destino) {
      if (destino === 'conta_empresa' && (origem === 'pix_in' || origem === 'pix_out')) {
        setTipoOperacao('lucro')
      } else if (origem === 'conta_empresa' && destino === 'pix_out') {
        setTipoOperacao('garantia_saldo')
      } else if (origem === 'pix_in' && destino === 'pix_out') {
        setTipoOperacao('transferencia')
      } else {
        setTipoOperacao('transferencia')
      }
    }
  }, [origem, destino])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErro(null)
    setLoading(true)

    try {
      const valorNumerico = parseFloat(valor.replace(/[^\d,]/g, '').replace(',', '.'))

      if (!origem || !destino) {
        setErro('Selecione origem e destino')
        setLoading(false)
        return
      }

      const result = await registrarSaque({
        valor: valorNumerico,
        origem,
        destino,
        tipo_operacao: tipoOperacao,
        adquirente_origem_id: origem === 'pix_in' ? adquirenteOrigemId || null : null,
        adquirente_destino_id: destino === 'pix_in' ? adquirenteDestinoId || null : null,
        observacoes: observacoes || undefined,
      })

      if (!result.success) {
        setErro(result.error || 'Erro ao registrar saque')
        setLoading(false)
        return
      }

      // Sucesso - limpar form e fechar
      limparFormulario()
      onFechar()
      router.refresh()
    } catch (error) {
      console.error('Erro ao registrar saque:', error)
      setErro('Erro inesperado ao registrar saque')
    } finally {
      setLoading(false)
    }
  }

  const limparFormulario = () => {
    setValor('')
    setOrigem('')
    setDestino('')
    setTipoOperacao('lucro')
    setAdquirenteOrigemId('')
    setAdquirenteDestinoId('')
    setObservacoes('')
    setErro(null)
  }

  const adquirentesPixIn = adquirentes.filter((a) => a.categoria === 'pix_in')

  return (
    <Dialog open={aberto} onOpenChange={onFechar}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>💸 Registrar Novo Saque</DialogTitle>
            <DialogDescription>
              Registre movimentações entre suas contas (Pix In, Pix Out, Conta Empresa)
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Valor */}
            <div className="space-y-2">
              <Label htmlFor="valor">Valor do Saque</Label>
              <CurrencyInput
                id="valor"
                value={valor}
                onChange={setValor}
                placeholder="R$ 0,00"
                required
              />
            </div>

            {/* Origem */}
            <div className="space-y-3">
              <Label>Origem</Label>
              <RadioGroup value={origem} onValueChange={(v) => setOrigem(v as TipoConta)}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="pix_in" id="origem-pix-in" />
                  <Label htmlFor="origem-pix-in" className="font-normal cursor-pointer">
                    Pix In (Adquirente)
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="pix_out" id="origem-pix-out" />
                  <Label htmlFor="origem-pix-out" className="font-normal cursor-pointer">
                    Pix Out
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="conta_empresa" id="origem-empresa" />
                  <Label htmlFor="origem-empresa" className="font-normal cursor-pointer">
                    Conta Empresa
                  </Label>
                </div>
              </RadioGroup>

              {/* Select de Adquirente se origem for pix_in */}
              {origem === 'pix_in' && adquirentesPixIn.length > 0 && (
                <div className="ml-6 mt-2">
                  <select
                    value={adquirenteOrigemId}
                    onChange={(e) => setAdquirenteOrigemId(e.target.value)}
                    className="w-full p-2 border rounded-md"
                    required
                  >
                    <option value="">Selecione a adquirente...</option>
                    {adquirentesPixIn.map((adq) => (
                      <option key={adq.id} value={adq.id}>
                        {adq.nome} - Saldo: R${' '}
                        {adq.saldo_atual?.toFixed(2) || '0,00'}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Destino */}
            <div className="space-y-3">
              <Label>Destino</Label>
              <RadioGroup value={destino} onValueChange={(v) => setDestino(v as TipoConta)}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="pix_in" id="destino-pix-in" />
                  <Label htmlFor="destino-pix-in" className="font-normal cursor-pointer">
                    Pix In (Adquirente)
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="pix_out" id="destino-pix-out" />
                  <Label htmlFor="destino-pix-out" className="font-normal cursor-pointer">
                    Pix Out
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="conta_empresa" id="destino-empresa" />
                  <Label htmlFor="destino-empresa" className="font-normal cursor-pointer">
                    Conta Empresa
                  </Label>
                </div>
              </RadioGroup>

              {/* Select de Adquirente se destino for pix_in */}
              {destino === 'pix_in' && adquirentesPixIn.length > 0 && (
                <div className="ml-6 mt-2">
                  <select
                    value={adquirenteDestinoId}
                    onChange={(e) => setAdquirenteDestinoId(e.target.value)}
                    className="w-full p-2 border rounded-md"
                    required
                  >
                    <option value="">Selecione a adquirente...</option>
                    {adquirentesPixIn.map((adq) => (
                      <option key={adq.id} value={adq.id}>
                        {adq.nome}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Tipo de Operação (auto-detectado, mas pode ser alterado) */}
            <div className="space-y-3">
              <Label>Tipo de Operação</Label>
              <RadioGroup
                value={tipoOperacao}
                onValueChange={(v) => setTipoOperacao(v as TipoOperacao)}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="lucro" id="tipo-lucro" />
                  <Label htmlFor="tipo-lucro" className="font-normal cursor-pointer">
                    💰 Saque de Lucro
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="transferencia" id="tipo-transferencia" />
                  <Label
                    htmlFor="tipo-transferencia"
                    className="font-normal cursor-pointer"
                  >
                    🔄 Transferência
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="garantia_saldo" id="tipo-garantia" />
                  <Label htmlFor="tipo-garantia" className="font-normal cursor-pointer">
                    🏦 Garantia de Saldo (Empresa → Pix Out)
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {/* Observações */}
            <div className="space-y-2">
              <Label htmlFor="observacoes">Observações (opcional)</Label>
              <textarea
                id="observacoes"
                value={observacoes}
                onChange={(e) => setObservacoes(e.target.value)}
                placeholder="Adicione observações sobre este saque..."
                className="w-full p-2 border rounded-md min-h-[80px]"
              />
            </div>

            {/* Mensagem de Erro */}
            {erro && (
              <div className="bg-red-50 border border-red-200 text-red-800 rounded-md p-3 text-sm">
                {erro}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                limparFormulario()
                onFechar()
              }}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Registrando...' : 'Registrar Saque'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}


