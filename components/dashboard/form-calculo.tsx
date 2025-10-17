'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { salvarCalculo } from '@/app/actions/calculos'
import { calcularLucro, formatarMoeda } from '@/lib/calculos'
import { useRouter } from 'next/navigation'
import { CurrencyInput } from '@/components/ui/currency-input'
import { ArrowRight, Calculator, Save, Clock } from 'lucide-react'
import { buscarAdquirentesAtivas } from '@/app/actions/adquirentes'
import { buscarHorarios } from '@/app/actions/horarios'
import { Adquirente } from '@/types'

/**
 * Formulário de Lançamento de Cálculo
 * Permite inserir valores e calcular o lucro
 */
export function FormCalculo() {
  const router = useRouter()
  // Objeto para armazenar os valores das adquirentes de forma dinâmica
  const [valoresAdquirentes, setValoresAdquirentes] = useState<Record<string, number>>({})
  
  // Valores para compatibilidade e para sellers
  const [valores, setValores] = useState({
    woovi_white: 0,
    woovi_pixout: 0,
    nomadfy: 0,
    pluggou: 0,
    sellers: 0,
  })
  const [lucroCalculado, setLucroCalculado] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [adquirentes, setAdquirentes] = useState<Adquirente[]>([])
  const [carregandoAdquirentes, setCarregandoAdquirentes] = useState(true)
  const [horarios, setHorarios] = useState<{ horario_1: string; horario_2: string; horario_3: string; horario_4: string } | null>(null)
  const [horarioSelecionado, setHorarioSelecionado] = useState<string>("")
  const [carregandoHorarios, setCarregandoHorarios] = useState(true)
  
  // Buscar adquirentes ativas ao montar o componente
  useEffect(() => {
    async function carregarAdquirentes() {
      try {
        const { adquirentes: listaAdquirentes, error } = await buscarAdquirentesAtivas()
        
        if (error) {
          console.error('Erro ao buscar adquirentes:', error)
        } else if (listaAdquirentes) {
          setAdquirentes(listaAdquirentes)
        }
      } catch (err) {
        console.error('Falha ao buscar adquirentes:', err)
      } finally {
        setCarregandoAdquirentes(false)
      }
    }
    
    carregarAdquirentes()
  }, [])

  // Buscar e configurar horários
  useEffect(() => {
    async function carregarHorarios() {
      try {
        // Definir horários padrão caso a API falhe
        const horariosDefault = {
          horario_1: '09:00',
          horario_2: '13:00',
          horario_3: '18:00',
          horario_4: '22:00',
        }

        // Buscar horários da API
        const result = await buscarHorarios()
        
        // Usar horários da API ou padrão
        const horariosConfig = (result && result.horarios) ? result.horarios : horariosDefault
        
        console.log('Horários carregados:', horariosConfig) // Debug
        
        setHorarios(horariosConfig)
        
        // Selecionar o horário mais próximo do atual automaticamente
        const agora = new Date()
        const horaAtual = String(agora.getHours()).padStart(2, '0') + ":" + String(agora.getMinutes()).padStart(2, '0')
        const horariosArray = [
          horariosConfig.horario_1,
          horariosConfig.horario_2,
          horariosConfig.horario_3,
          horariosConfig.horario_4,
        ]
        
        console.log('Hora atual:', horaAtual, 'Horários disponíveis:', horariosArray) // Debug
        
        // Encontrar o horário mais próximo ao atual
        let horarioProximo = horariosArray[0]
        for (const h of horariosArray) {
          if (h >= horaAtual) {
            horarioProximo = h
            break
          }
        }
        
        console.log('Horário selecionado:', horarioProximo) // Debug
        setHorarioSelecionado(horarioProximo)
      } catch (err) {
        console.error('Falha ao configurar horários:', err)
        
        // Definir horários padrão em caso de erro
        const horariosDefault = {
          horario_1: '09:00',
          horario_2: '13:00',
          horario_3: '18:00',
          horario_4: '22:00',
        }
        
        setHorarios(horariosDefault)
        setHorarioSelecionado('09:00')
      } finally {
        setCarregandoHorarios(false)
      }
    }
    
    carregarHorarios()
  }, [])

  const handleInputChange = (field: string, value: number) => {
    if (field === 'sellers') {
      setValores(prev => ({ ...prev, sellers: value }))
    } else {
      // Atualiza o valor da adquirente no estado dinâmico
      setValoresAdquirentes(prev => ({ ...prev, [field]: value }))
      
      // Mantém a compatibilidade com o estado antigo
      if (field === 'Woovi (GNVN)') setValores(prev => ({ ...prev, woovi_white: value }))
      if (field === 'Woovi (ROYALT TECH)') setValores(prev => ({ ...prev, woovi_pixout: value }))
      if (field === 'NomadFy') setValores(prev => ({ ...prev, nomadfy: value }))
      if (field === 'Pluggou') setValores(prev => ({ ...prev, pluggou: value }))
    }
    
    setLucroCalculado(null) // Resetar lucro ao alterar valores
  }

  const handleCalcular = () => {
    // Converter os valores dinâmicos para o formato esperado pelo calcularLucro
    // para manter compatibilidade com a função existente
    // Calcula o total de adquirentes de forma dinâmica
    const totalAdquirentes = Object.values(valoresAdquirentes).reduce((acc, valor) => acc + valor, 0)
    
    // Usamos um objeto simplificado para o cálculo, já que só precisamos do total e sellers
    const valoresCalculados = {
      woovi_white: 0, // Campos obrigatórios pelo schema
      woovi_pixout: 0,
      nomadfy: 0,
      pluggou: 0,
      // Adicionamos um campo personalizado para o total
      _totalAdquirentes: totalAdquirentes,
      sellers: valores.sellers,
    }
    
    const lucro = calcularLucro(valoresCalculados, adquirentes)
    setLucroCalculado(lucro)
    setError(null)
  }

  const handleSalvar = async () => {
    if (lucroCalculado === null) {
      setError('Calcule o lucro antes de salvar')
      return
    }
    
    if (!horarioSelecionado) {
      setError('Selecione um horário antes de salvar')
      return
    }

    setLoading(true)
    setError(null)

    // Mapeamento dinâmico para garantir compatibilidade com o banco de dados
    // Garantimos um valor padrão para cada campo do banco de dados
    const valoresParaSalvar = {
      woovi_white: 0,
      woovi_pixout: 0,
      nomadfy: 0,
      pluggou: 0,
      sellers: valores.sellers,
      horario: horarioSelecionado
    }
    
    // Mapeamos dinamicamente as adquirentes cadastradas para os campos existentes
    adquirentes.forEach(adquirente => {
      const valor = valoresAdquirentes[adquirente.nome] || 0
      
      // Tentamos mapear por nome
      if (adquirente.nome.toLowerCase().includes('woovi') && adquirente.nome.toLowerCase().includes('gnvn')) {
        valoresParaSalvar.woovi_white = valor
      } 
      else if (adquirente.nome.toLowerCase().includes('woovi') && (adquirente.nome.toLowerCase().includes('royalt') || adquirente.nome.toLowerCase().includes('tech'))) {
        valoresParaSalvar.woovi_pixout = valor
      } 
      else if (adquirente.nome.toLowerCase().includes('nomad')) {
        valoresParaSalvar.nomadfy = valor
      } 
      else if (adquirente.nome.toLowerCase().includes('pluggou')) {
        valoresParaSalvar.pluggou = valor
      }
      // Se não houver match, tentamos mapear pelo tipo
      else if (adquirente.tipo_pix === 'pix_in' && valoresParaSalvar.woovi_white === 0) {
        valoresParaSalvar.woovi_white = valor
      }
      else if (adquirente.tipo_pix === 'pix_out' && valoresParaSalvar.woovi_pixout === 0) {
        valoresParaSalvar.woovi_pixout = valor
      }
    })

    const result = await salvarCalculo(valoresParaSalvar)

    if (result.error) {
      setError(result.error)
      setLoading(false)
      return
    }

    // Resetar formulário
    setValores({
      woovi_white: 0,
      woovi_pixout: 0,
      nomadfy: 0,
      pluggou: 0,
      sellers: 0,
    })
    setValoresAdquirentes({}) // Limpar os valores dinâmicos também
    setLucroCalculado(null)
    setLoading(false)

    // Atualizar página
    router.refresh()
  }

  // Calcular total de entradas usando os valores dinâmicos
  const totalEntradas = adquirentes.reduce((acc, adquirente) => {
    const valor = valoresAdquirentes[adquirente.nome] || 0
    return acc + valor
  }, 0)

  return (
    <Card className="shadow-md border-gray-200 dark:border-gray-800">
      <CardHeader className="bg-muted/30 border-b pb-4">
        <CardTitle className="flex items-center gap-2 text-xl">
          <span className="inline-block w-1 h-6 bg-primary mr-2 rounded-full"></span>
          Novo Lançamento
        </CardTitle>
        <CardDescription>
          Informe os valores de cada conta para calcular o lucro
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5 pt-5">
        {carregandoAdquirentes ? (
          <div className="py-4 text-center text-muted-foreground">
            Carregando adquirentes...
          </div>
        ) : adquirentes.length === 0 ? (
          <div className="py-4 text-center text-muted-foreground">
            Nenhuma adquirente ativa. Adicione adquirentes na tela de configuração.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {adquirentes.map((adquirente) => (
              <div key={adquirente.id} className="space-y-2">
                <Label htmlFor={`adquirente-${adquirente.id}`} className="font-medium flex items-center justify-between">
                  {adquirente.nome}
                  <div className="flex gap-1">
                    <Badge variant="outline" className={adquirente.tipo_pix === 'pix_in' ? 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'}>
                      {adquirente.tipo_pix === 'pix_in' ? 'Pix IN' : 'Pix OUT'}
                    </Badge>
                    <Badge variant="outline" className={
                      adquirente.categoria_operacao === 'white' ? 'bg-white text-black border-gray-300' : 
                      adquirente.categoria_operacao === 'gray' ? 'bg-gray-400 text-black border-gray-500' : 
                      'bg-black text-white border-black'
                    }>
                      {adquirente.categoria_operacao === 'white' ? 'White' : 
                       adquirente.categoria_operacao === 'gray' ? 'Gray' : 
                       adquirente.categoria_operacao === 'black' ? 'Black' : 'White'}
                    </Badge>
                  </div>
                </Label>
                <CurrencyInput
                  id={`adquirente-${adquirente.id}`}
                  value={valoresAdquirentes[adquirente.nome] || 0}
                  onValueChange={(value) => handleInputChange(adquirente.nome, value)}
                  aria-label={`${adquirente.nome} value`}
                  className="transition-all duration-200 hover:border-gray-400 dark:hover:border-gray-600"
                />
              </div>
            ))}
          </div>
        )}

        {/* Resumo de entradas */}
        <div className="rounded-md bg-muted/50 p-3 border">
          <p className="text-sm text-muted-foreground">Total de entradas:</p>
          <p className="font-semibold">{formatarMoeda(totalEntradas)}</p>
        </div>
        
        {/* Horário do Cálculo */}
        <div className="space-y-2 pt-2 border-t">
          <Label htmlFor="horario" className="font-medium flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Horário do Cálculo
          </Label>
          {carregandoHorarios ? (
            <div className="h-10 flex items-center text-sm text-muted-foreground">
              Carregando horários...
            </div>
          ) : (
            <div className="grid grid-cols-4 gap-2">
              {horarios ? [
                { id: 'horario_1', valor: horarios.horario_1, label: '1º Horário' },
                { id: 'horario_2', valor: horarios.horario_2, label: '2º Horário' },
                { id: 'horario_3', valor: horarios.horario_3, label: '3º Horário' },
                { id: 'horario_4', valor: horarios.horario_4, label: '4º Horário' },
              ].map((h) => (
                <Button
                  key={h.id}
                  type="button"
                  variant={horarioSelecionado === h.valor ? "default" : "outline"}
                  className={`text-sm px-2 ${horarioSelecionado === h.valor ? 'ring-2 ring-primary' : ''}`}
                  onClick={() => setHorarioSelecionado(h.valor)}
                >
                  {h.valor}
                </Button>
              )) : (
                <div className="col-span-4 text-center py-2 text-sm text-muted-foreground">
                  Não foi possível carregar os horários
                </div>
              )}
            </div>
          )}
        </div>

        {/* Sellers com ícone */}
        <div className="space-y-2 pt-2 border-t">
          <Label htmlFor="sellers" className="font-medium flex items-center gap-2">
            <ArrowRight className="h-4 w-4" />
            Saldo de Sellers
          </Label>
          <CurrencyInput
            id="sellers"
            value={valores.sellers}
            onValueChange={(value) => handleInputChange('sellers', value)}
            aria-label="Sellers value"
            className="transition-all duration-200 hover:border-gray-400 dark:hover:border-gray-600"
          />
        </div>

        {adquirentes.length > 0 && (
          <div className="rounded-md bg-accent/40 p-3 border">
            <p className="text-sm font-medium mb-1 flex items-center gap-2">
              <span className="w-2 h-2 bg-primary rounded-full"></span>
              Adquirentes Ativas: {adquirentes.length}
            </p>
            <p className="text-xs text-muted-foreground">
              {adquirentes.map(a => a.nome).join(', ')}
            </p>
          </div>
        )}

        {lucroCalculado !== null && (
          <div className="bg-muted p-4 rounded-md border shadow-sm">
            <div className="flex justify-between items-center mb-1">
              <p className="text-sm font-medium">Lucro Operacional:</p>
              <p className="text-xs text-muted-foreground">
                {new Date().toLocaleString('pt-BR')}
              </p>
            </div>
            <p className="text-3xl font-bold tracking-tight">
              {formatarMoeda(lucroCalculado)}
            </p>
          </div>
        )}

        {error && (
          <div className="bg-destructive/10 text-destructive p-3 rounded-md text-sm border border-destructive/20">
            {error}
          </div>
        )}
      </CardContent>
      
      <CardFooter className="flex gap-3 pt-2 border-t">
        <Button 
          onClick={handleCalcular} 
          variant="outline" 
          className="flex-1 gap-2 hover:bg-muted"
        >
          <Calculator className="h-4 w-4" />
          Calcular
        </Button>
        <Button
          onClick={handleSalvar}
          disabled={lucroCalculado === null || loading}
          className="flex-1 gap-2"
        >
          <Save className="h-4 w-4" />
          {loading ? 'Salvando...' : 'Salvar'}
        </Button>
      </CardFooter>
    </Card>
  )
}



