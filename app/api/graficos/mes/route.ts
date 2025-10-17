import { NextRequest, NextResponse } from 'next/server'
import { buscarDadosGraficoMes } from '@/app/actions/graficos'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const ano = searchParams.get('ano')
    const mes = searchParams.get('mes')

    if (!ano || !mes) {
      return NextResponse.json({ error: 'Ano e mês não fornecidos' }, { status: 400 })
    }

    const dados = await buscarDadosGraficoMes(parseInt(ano), parseInt(mes))
    return NextResponse.json(dados)
  } catch (error) {
    console.error('Erro na API de gráfico por mês:', error)
    return NextResponse.json({ error: 'Erro ao buscar dados' }, { status: 500 })
  }
}


