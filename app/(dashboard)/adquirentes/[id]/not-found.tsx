import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Search } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <Card>
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
            <Search className="h-6 w-6 text-muted-foreground" />
          </div>
          <CardTitle className="text-2xl">Adquirente não encontrada</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-muted-foreground">
            A adquirente que você está procurando não foi encontrada ou não existe.
          </p>
          <div className="flex justify-center gap-2">
            <Button variant="outline" asChild>
              <Link href="/adquirentes">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar para Adquirentes
              </Link>
            </Button>
            <Button asChild>
              <Link href="/dashboard">
                Ir para Dashboard
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
