'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { salvarHorarios } from '@/app/actions/horarios'
import { useRouter } from 'next/navigation'

interface ConfigHorariosProps {
  horariosIniciais: {
    horario_1: string
    horario_2: string
    horario_3: string
    horario_4: string
  }
}

/**
 * Componente de Configuração de Horários
 * Permite definir os 4 horários diários personalizados
 */
export function ConfigHorarios({ horariosIniciais }: ConfigHorariosProps) {
  const router = useRouter()
  const [horarios, setHorarios] = useState(horariosIniciais)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleInputChange = (field: string, value: string) => {
    setHorarios((prev) => ({ ...prev, [field]: value }))
    setSuccess(false)
    setError(null)
  }

  const handleSalvar = async () => {
    setLoading(true)
    setError(null)
    setSuccess(false)

    const result = await salvarHorarios(horarios)

    if (result.error) {
      setError(result.error)
      setLoading(false)
      return
    }

    setSuccess(true)
    setLoading(false)
    router.refresh()
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Configuração de Horários</CardTitle>
        <CardDescription>
          Defina os horários para os 4 registros diários (em ordem crescente)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="space-y-2">
            <Label htmlFor="horario_1">1º Horário</Label>
            <Input
              id="horario_1"
              type="time"
              value={horarios.horario_1}
              onChange={(e) => handleInputChange('horario_1', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="horario_2">2º Horário</Label>
            <Input
              id="horario_2"
              type="time"
              value={horarios.horario_2}
              onChange={(e) => handleInputChange('horario_2', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="horario_3">3º Horário</Label>
            <Input
              id="horario_3"
              type="time"
              value={horarios.horario_3}
              onChange={(e) => handleInputChange('horario_3', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="horario_4">4º Horário</Label>
            <Input
              id="horario_4"
              type="time"
              value={horarios.horario_4}
              onChange={(e) => handleInputChange('horario_4', e.target.value)}
            />
          </div>
        </div>

        {error && (
          <div className="bg-destructive/10 text-destructive p-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-secondary text-secondary-foreground p-3 rounded-lg text-sm">
            Horários salvos com sucesso!
          </div>
        )}

        <Button onClick={handleSalvar} disabled={loading} className="w-full md:w-auto">
          {loading ? 'Salvando...' : 'Salvar Horários'}
        </Button>
      </CardContent>
    </Card>
  )
}




