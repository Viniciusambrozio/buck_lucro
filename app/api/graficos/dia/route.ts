import { NextRequest, NextResponse } from 'next/server'
import { buscarDadosGraficoDia } from '@/app/actions/graficos'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const data = searchParams.get('data')

    if (!data) {
      return NextResponse.json({ error: 'Data não fornecida' }, { status: 400 })
    }

    const dados = await buscarDadosGraficoDia(data)
    return NextResponse.json(dados)
  } catch (error) {
    console.error('Erro na API de gráfico por dia:', error)
    return NextResponse.json({ error: 'Erro ao buscar dados' }, { status: 500 })
  }
}


