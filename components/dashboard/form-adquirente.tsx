'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Switch } from '@/components/ui/switch'
import { Adquirente, AdquirenteInput } from '@/types'
import { adicionarAdquirente, atualizarAdquirente } from '@/app/actions/adquirentes'
import { useRouter } from 'next/navigation'
import { Save } from 'lucide-react'

interface FormAdquirenteProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  adquirenteParaEditar?: Adquirente | null
}

/**
 * Formulário para adicionar ou editar adquirentes
 */
export function FormAdquirente({ open, onOpenChange, adquirenteParaEditar }: FormAdquirenteProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState<AdquirenteInput>({
    nome: '',
    tipo_pix: 'pix_in',
    categoria_operacao: 'white',
    ativo: true,
  })

  // Preencher o formulário quando estiver editando
  useEffect(() => {
    if (adquirenteParaEditar) {
      setFormData({
        nome: adquirenteParaEditar.nome,
        tipo_pix: adquirenteParaEditar.tipo_pix,
        categoria_operacao: adquirenteParaEditar.categoria_operacao || 'white',
        ativo: adquirenteParaEditar.ativo,
      })
    } else {
      // Reset quando for um novo cadastro
      setFormData({
        nome: '',
        tipo_pix: 'pix_in',
        categoria_operacao: 'white',
        ativo: true,
      })
    }
    // Limpar erro quando abrir/fechar o diálogo
    setError(null)
  }, [adquirenteParaEditar, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      let result;
      
      if (adquirenteParaEditar) {
        // Atualização
        result = await atualizarAdquirente({
          id: adquirenteParaEditar.id,
          nome: formData.nome,
          tipo_pix: formData.tipo_pix,
          categoria_operacao: formData.categoria_operacao,
          ativo: formData.ativo,
        })
      } else {
        // Novo cadastro
        result = await adicionarAdquirente(formData)
      }

      if (result.success) {
        onOpenChange(false) // Fecha o diálogo
        router.refresh() // Atualiza os dados da página
      } else {
        setError(result.error || 'Erro ao salvar adquirente')
      }
    } catch (err) {
      setError('Erro ao processar a solicitação')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement> | { target: { name: string; value: string | boolean } }
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleTipoPixChange = (value: string) => {
    setFormData((prev) => ({ ...prev, tipo_pix: value as 'pix_in' | 'pix_out' }))
  }

  const handleCategoriaOperacaoChange = (value: string) => {
    setFormData((prev) => ({ ...prev, categoria_operacao: value as 'white' | 'gray' | 'black' }))
  }

  const handleAtivoChange = (checked: boolean) => {
    setFormData((prev) => ({ ...prev, ativo: checked }))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {adquirenteParaEditar ? 'Editar Adquirente' : 'Nova Adquirente'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="nome">Nome da Adquirente</Label>
            <Input
              id="nome"
              name="nome"
              value={formData.nome}
              onChange={handleChange}
              placeholder="Ex: Woovi, NomadFy, etc."
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Tipo de PIX</Label>
            <RadioGroup
              value={formData.tipo_pix}
              onValueChange={handleTipoPixChange}
              className="flex gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="pix_in" id="pix_in" />
                <Label htmlFor="pix_in" className="cursor-pointer">PIX IN</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="pix_out" id="pix_out" />
                <Label htmlFor="pix_out" className="cursor-pointer">PIX OUT</Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label>Categoria de Operação</Label>
            <RadioGroup
              value={formData.categoria_operacao || 'white'}
              onValueChange={handleCategoriaOperacaoChange}
              className="flex flex-col gap-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="white" id="white" />
                <Label htmlFor="white" className="cursor-pointer">White (Operações com pouco med)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="gray" id="gray" />
                <Label htmlFor="gray" className="cursor-pointer">Gray (Operações com med controlado)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="black" id="black" />
                <Label htmlFor="black" className="cursor-pointer">Black (Operações com mais med)</Label>
              </div>
            </RadioGroup>
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="ativo">Ativa para cálculos</Label>
            <Switch
              id="ativo"
              checked={formData.ativo}
              onCheckedChange={handleAtivoChange}
            />
          </div>

          {error && (
            <div className="bg-destructive/10 text-destructive p-3 rounded-md text-sm">
              {error}
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              <Save className="h-4 w-4 mr-2" />
              {loading ? 'Salvando...' : 'Salvar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

