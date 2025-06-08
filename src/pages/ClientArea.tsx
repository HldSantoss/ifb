
import { useState, useEffect } from 'react';
import { User, FileText, CreditCard, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface Cliente {
  id: string;
  nome: string;
  email: string;
  cpf: string;
  telefone: string;
  data_nascimento: string;
}

interface Boleto {
  id: string;
  numero_boleto: string;
  valor: number;
  data_vencimento: string;
  descricao: string;
  status: string;
  empreendimento: {
    nome: string;
  };
}

const ClientArea = () => {
  const { toast } = useToast();
  const [cpf, setCpf] = useState('');
  const [cliente, setCliente] = useState<Cliente | null>(null);
  const [boletos, setBoletos] = useState<Boleto[]>([]);
  const [loading, setLoading] = useState(false);

  const buscarCliente = async () => {
    if (!cpf) {
      toast({
        title: "Erro",
        description: "Por favor, insira o CPF.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const { data: clienteData, error: clienteError } = await (supabase as any)
        .from('clientes')
        .select('*')
        .eq('cpf', cpf)
        .single();

      if (clienteError || !clienteData) {
        toast({
          title: "Cliente não encontrado",
          description: "Verifique o CPF informado.",
          variant: "destructive"
        });
        setCliente(null);
        setBoletos([]);
        return;
      }

      setCliente(clienteData);
      
      // Buscar boletos do cliente
      const { data: boletosData, error: boletosError } = await (supabase as any)
        .from('boletos')
        .select(`
          *,
          empreendimento:empreendimento_id (
            nome
          )
        `)
        .eq('cliente_id', clienteData.id)
        .order('data_vencimento', { ascending: false });

      if (boletosError) {
        console.error('Erro ao buscar boletos:', boletosError);
        setBoletos([]);
      } else {
        setBoletos(boletosData || []);
      }

      toast({
        title: "Cliente encontrado!",
        description: `Bem-vindo, ${clienteData.nome}`,
      });

    } catch (error) {
      console.error('Erro ao buscar cliente:', error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao buscar os dados.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pago':
        return 'bg-green-100 text-green-800';
      case 'pendente':
        return 'bg-yellow-100 text-yellow-800';
      case 'vencido':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl font-bold mb-4 flex items-center justify-center">
              <User className="w-8 h-8 mr-3" />
              Área do Cliente
            </h1>
            <p className="text-gray-300">
              Acesse suas informações e acompanhe seus boletos
            </p>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            {/* Search Form */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Buscar Cliente</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4">
                  <Input
                    placeholder="Digite seu CPF (000.000.000-00)"
                    value={cpf}
                    onChange={(e) => setCpf(e.target.value)}
                    className="flex-1"
                  />
                  <Button 
                    onClick={buscarCliente}
                    disabled={loading}
                    className="bg-black hover:bg-gray-800"
                  >
                    {loading ? 'Buscando...' : 'Buscar'}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Client Info */}
            {cliente && (
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <User className="w-5 h-5 mr-2" />
                    Informações do Cliente
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <strong>Nome:</strong> {cliente.nome}
                    </div>
                    <div>
                      <strong>Email:</strong> {cliente.email}
                    </div>
                    <div>
                      <strong>CPF:</strong> {cliente.cpf}
                    </div>
                    <div>
                      <strong>Telefone:</strong> {cliente.telefone || 'Não informado'}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Boletos */}
            {cliente && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <FileText className="w-5 h-5 mr-2" />
                    Seus Boletos
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {boletos.length > 0 ? (
                    <div className="space-y-4">
                      {boletos.map((boleto) => (
                        <div
                          key={boleto.id}
                          className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                        >
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h3 className="font-semibold text-lg">
                                {boleto.numero_boleto}
                              </h3>
                              <p className="text-gray-600">
                                {boleto.empreendimento?.nome || 'Empreendimento não especificado'}
                              </p>
                            </div>
                            <Badge className={getStatusColor(boleto.status)}>
                              {boleto.status}
                            </Badge>
                          </div>
                          
                          <div className="grid md:grid-cols-3 gap-4 text-sm">
                            <div className="flex items-center">
                              <CreditCard className="w-4 h-4 mr-2 text-gray-500" />
                              <span>
                                <strong>Valor:</strong> {formatCurrency(boleto.valor)}
                              </span>
                            </div>
                            <div className="flex items-center">
                              <Calendar className="w-4 h-4 mr-2 text-gray-500" />
                              <span>
                                <strong>Vencimento:</strong> {formatDate(boleto.data_vencimento)}
                              </span>
                            </div>
                            <div>
                              <strong>Descrição:</strong> {boleto.descricao}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>Nenhum boleto encontrado para este cliente.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default ClientArea;
