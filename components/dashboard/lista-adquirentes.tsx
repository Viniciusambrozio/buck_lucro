'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Adquirente, AdquirenteUpdate } from '@/types'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Trash2, Edit, Plus, Eye } from 'lucide-react'
import { atualizarAdquirente, excluirAdquirente } from '@/app/actions/adquirentes'

interface ListaAdquirentesProps {
  adquirentes: Adquirente[]
  onAddClick: () => void
  onEditClick: (adquirente: Adquirente) => void
  onViewClick: (adquirente: Adquirente) => void
}

/**
 * Componente que exibe a lista de adquirentes cadastradas
 */
export function ListaAdquirentes({ adquirentes, onAddClick, onEditClick, onViewClick }: ListaAdquirentesProps) {
  const [isLoading, setIsLoading] = useState<string | null>(null)

  // Alternar status de ativo/inativo da adquirente
  const handleToggleStatus = async (adquirente: Adquirente) => {
    setIsLoading(adquirente.id)
    
    const updateData: AdquirenteUpdate = {
      id: adquirente.id,
      ativo: !adquirente.ativo
    }
    
    const result = await atualizarAdquirente(updateData)
    
    if (result.success) {
      // Em vez de router.refresh, notificar o componente pai para atualizar
      onAddClick() // Reutilizando o callback para forçar o componente pai a atualizar
    } else {
      // Em caso de erro, mostrar alerta
      alert(`Erro ao atualizar status: ${result.error}`)
    }
    
    setIsLoading(null)
  }
  
  // Excluir uma adquirente
  const handleDelete = async (id: string, nome: string) => {
    // Confirmação de exclusão
    if (!confirm(`Deseja realmente excluir a adquirente "${nome}"?`)) {
      return
    }
    
    setIsLoading(id)
    
    const result = await excluirAdquirente(id)
    
    if (result.success) {
      // Em vez de router.refresh, notificar o componente pai para atualizar
      onAddClick() // Reutilizando o callback para forçar o componente pai a atualizar
    } else {
      // Em caso de erro, mostrar alerta
      alert(`Erro ao excluir adquirente: ${result.error}`)
    }
    
    setIsLoading(null)
  }

  return (
    <Card>
      <CardHeader className="bg-muted/30 border-b pb-4">
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2 text-xl">
            <span className="inline-block w-1 h-6 bg-primary mr-2 rounded-full"></span>
            Adquirentes Cadastradas
          </CardTitle>
          <Button onClick={onAddClick} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Adicionar
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {adquirentes.length === 0 ? (
          <div className="py-8 text-center">
            <p className="text-muted-foreground">
              Nenhuma adquirente cadastrada. Adicione sua primeira adquirente.
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {adquirentes.map((adquirente) => (
                <TableRow key={adquirente.id}>
                  <TableCell className="font-medium">{adquirente.nome}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={adquirente.tipo_pix === 'pix_in' ? 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'}>
                      {adquirente.tipo_pix === 'pix_in' ? 'Pix IN' : 'Pix OUT'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={
                      adquirente.categoria_operacao === 'white' ? 'bg-white text-black border-gray-300' : 
                      adquirente.categoria_operacao === 'gray' ? 'bg-gray-400 text-black border-gray-500' : 
                      'bg-black text-white border-black'
                    }>
                      {adquirente.categoria_operacao === 'white' ? 'White' : 
                       adquirente.categoria_operacao === 'gray' ? 'Gray' : 
                       adquirente.categoria_operacao === 'black' ? 'Black' : 'White'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Switch
                      checked={adquirente.ativo}
                      onCheckedChange={() => handleToggleStatus(adquirente)}
                      disabled={isLoading === adquirente.id}
                      aria-label="Alterar status"
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => onViewClick(adquirente)}
                        disabled={isLoading === adquirente.id}
                        title="Ver detalhes"
                      >
                        <Eye className="h-4 w-4" />
                        <span className="sr-only">Ver detalhes</span>
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => onEditClick(adquirente)}
                        disabled={isLoading === adquirente.id}
                      >
                        <Edit className="h-4 w-4" />
                        <span className="sr-only">Editar</span>
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleDelete(adquirente.id, adquirente.nome)}
                        disabled={isLoading === adquirente.id}
                        className="text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Excluir</span>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}
