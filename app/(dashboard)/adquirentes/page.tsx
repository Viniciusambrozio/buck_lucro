import { buscarAdquirentes } from '@/app/actions/adquirentes'
import { AdquirentesUI } from '@/components/dashboard/adquirentes-ui'

/**
 * Página de Gerenciamento de Adquirentes (Servidor)
 * Responsável apenas por buscar os dados de forma assíncrona
 */
export default async function AdquirentesPage() {
  // Buscar adquirentes do servidor (componente de servidor pode ser async)
  const { adquirentes = [], error } = await buscarAdquirentes()
  
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Adquirentes</h1>
      <p className="text-muted-foreground">
        Gerencie as adquirentes que serão consideradas no cálculo do lucro operacional.
      </p>
      
      {/* Passamos os dados para o componente de UI cliente */}
      <AdquirentesUI initialAdquirentes={adquirentes || []} initialError={error} />
    </div>
  )
}