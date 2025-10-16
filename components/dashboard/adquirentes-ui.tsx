'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ListaAdquirentes } from './lista-adquirentes'
import { FormAdquirente } from './form-adquirente'
import { Adquirente } from '@/types'
import { buscarAdquirentes } from '@/app/actions/adquirentes'

interface AdquirentesUIProps {
  initialAdquirentes: Adquirente[]
  initialError: string | null
}

/**
 * Componente Cliente para UI de Adquirentes
 * Gerencia estados, formulários e eventos de UI
 */
export function AdquirentesUI({ 
  initialAdquirentes,
  initialError
}: AdquirentesUIProps) {
  const router = useRouter()
  const [adquirentes, setAdquirentes] = useState<Adquirente[]>(initialAdquirentes)
  const [formAberto, setFormAberto] = useState(false)
  const [adquirenteParaEditar, setAdquirenteParaEditar] = useState<Adquirente | null>(null)
  const [loading, setLoading] = useState(false)
  
  // Verificar erros de autenticação
  useEffect(() => {
    if (initialError === 'Usuário não autenticado') {
      router.push('/login')
    }
  }, [initialError, router])
  
  // Função para recarregar adquirentes após operações
  const recarregarAdquirentes = async () => {
    setLoading(true)
    try {
      const { adquirentes: novasAdquirentes, error } = await buscarAdquirentes()
      
      if (error === 'Usuário não autenticado') {
        router.push('/login')
        return
      }
      
      if (novasAdquirentes) {
        setAdquirentes(novasAdquirentes)
      }
    } catch (err) {
      console.error('Erro ao recarregar adquirentes:', err)
    } finally {
      setLoading(false)
    }
  }
  
  const handleAdicionarClick = () => {
    setAdquirenteParaEditar(null)
    setFormAberto(true)
  }
  
  const handleEditarClick = (adquirente: Adquirente) => {
    setAdquirenteParaEditar(adquirente)
    setFormAberto(true)
  }

  const handleViewClick = (adquirente: Adquirente) => {
    router.push(`/adquirentes/${adquirente.id}`)
  }
  
  const handleFormOpenChange = async (open: boolean) => {
    setFormAberto(open)
    if (!open) {
      // Quando fechar o modal, limpar o estado e recarregar
      setAdquirenteParaEditar(null)
      // Pequeno delay antes de recarregar para dar tempo da operação concluir
      setTimeout(() => {
        recarregarAdquirentes()
      }, 300)
    }
  }
  
  return (
    <div className={loading ? 'opacity-70 pointer-events-none' : ''}>
      <ListaAdquirentes 
        adquirentes={adquirentes} 
        onAddClick={handleAdicionarClick}
        onEditClick={handleEditarClick}
        onViewClick={handleViewClick}
      />
      
      <FormAdquirente 
        open={formAberto} 
        onOpenChange={handleFormOpenChange}
        adquirenteParaEditar={adquirenteParaEditar}
      />
    </div>
  )
}

