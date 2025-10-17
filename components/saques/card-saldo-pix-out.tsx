'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Wallet, Edit2, Save, X } from 'lucide-react'
import { atualizarSaldoSellers } from '@/app/actions/saques'
import { useRouter } from 'next/navigation'
import type { SaldoPixOut } from '@/app/actions/saques'

interface CardSaldoPixOutProps {
  saldo: SaldoPixOut
}

export function CardSaldoPixOut({ saldo }: CardSaldoPixOutProps) {
  const router = useRouter()
  const [editando, setEditando] = useState(false)
  const [novoSaldoSellers, setNovoSaldoSellers] = useState(
    saldo.saldo_sellers.toString()
  )
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

  const formatarMoeda = (valor: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(valor)
  }

  const handleSalvar = async () => {
    setErro(null)
    setLoading(true)

    try {
      const valor = parseFloat(novoSaldoSellers.replace(/[^\d,]/g, '').replace(',', '.'))

      if (isNaN(valor) || valor < 0) {
        setErro('Valor inválido')
        setLoading(false)
        return
      }

      if (valor > saldo.saldo_total) {
        setErro('Saldo dos sellers não pode ser maior que o saldo total')
        setLoading(false)
        return
      }

      const result = await atualizarSaldoSellers(valor)

      if (!result.success) {
        setErro(result.error || 'Erro ao atualizar saldo')
        setLoading(false)
        return
      }

      setEditando(false)
      router.refresh()
    } catch (error) {
      console.error('Erro ao atualizar saldo:', error)
      setErro('Erro inesperado')
    } finally {
      setLoading(false)
    }
  }

  const handleCancelar = () => {
    setNovoSaldoSellers(saldo.saldo_sellers.toString())
    setEditando(false)
    setErro(null)
  }

  return (
    <Card className="p-6 hover:shadow-lg transition-shadow">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Wallet className="h-4 w-4" />
              Saldo Pix Out
            </p>
          </div>
          {!editando && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setEditando(true)}
              className="h-8 w-8 p-0"
            >
              <Edit2 className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Valores */}
        <div className="space-y-3">
          {/* Saldo Total */}
          <div>
            <p className="text-xs text-muted-foreground">Saldo Total</p>
            <p className="text-2xl font-bold">{formatarMoeda(saldo.saldo_total)}</p>
          </div>

          {/* Saldo Sellers */}
          <div className="border-t pt-3">
            {editando ? (
              <div className="space-y-2">
                <Label htmlFor="saldo-sellers" className="text-xs">
                  Saldo dos Sellers
                </Label>
                <Input
                  id="saldo-sellers"
                  type="text"
                  value={novoSaldoSellers}
                  onChange={(e) => setNovoSaldoSellers(e.target.value)}
                  placeholder="R$ 0,00"
                  className="h-9"
                />
                {erro && <p className="text-xs text-red-600">{erro}</p>}
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={handleSalvar}
                    disabled={loading}
                    className="flex-1"
                  >
                    <Save className="h-3 w-3 mr-1" />
                    Salvar
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleCancelar}
                    disabled={loading}
                    className="flex-1"
                  >
                    <X className="h-3 w-3 mr-1" />
                    Cancelar
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <p className="text-xs text-muted-foreground">Saldo dos Sellers</p>
                <p className="text-lg font-semibold text-orange-600">
                  {formatarMoeda(saldo.saldo_sellers)}
                </p>
              </>
            )}
          </div>

          {/* Saldo Disponível (Lucro) */}
          {!editando && (
            <div className="border-t pt-3">
              <p className="text-xs text-muted-foreground">
                Saldo Disponível (Seu Lucro)
              </p>
              <p className="text-xl font-bold text-green-600">
                {formatarMoeda(saldo.saldo_disponivel)}
              </p>
            </div>
          )}
        </div>
      </div>
    </Card>
  )
}


