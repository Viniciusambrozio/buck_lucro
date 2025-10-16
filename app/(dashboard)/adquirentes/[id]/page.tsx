import { buscarAdquirentePorId } from '@/app/actions/adquirentes'
import { buscarCalculosPorAdquirente } from '@/app/actions/historico'
import { DetalhesAdquirente } from '@/components/adquirentes/detalhes-adquirente'
import { notFound, redirect } from 'next/navigation'

interface DetalhesAdquirentePageProps {
  params: {
    id: string
  }
}

/**
 * Página de detalhes de uma adquirente específica
 */
export default async function DetalhesAdquirentePage({ params }: DetalhesAdquirentePageProps) {
  // Buscar dados da adquirente
  const adquirenteResult = await buscarAdquirentePorId(params.id)
  
  // Verificar se a adquirente existe
  if (adquirenteResult.error === 'Adquirente não encontrada' || !adquirenteResult.adquirente) {
    notFound()
  }
  
  // Verificar autenticação
  if (adquirenteResult.error === 'Usuário não autenticado') {
    redirect('/login')
  }

  // Buscar cálculos relacionados à adquirente
  const calculosResult = await buscarCalculosPorAdquirente(params.id)
  
  if (calculosResult.error === 'Usuário não autenticado') {
    redirect('/login')
  }

  const adquirente = adquirenteResult.adquirente
  const calculos = calculosResult.calculos || []

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{adquirente.nome}</h1>
          <p className="text-muted-foreground">
            Detalhes completos e KPIs da adquirente
          </p>
        </div>
      </div>

      <DetalhesAdquirente adquirente={adquirente} calculos={calculos} />
    </div>
  )
}
