import { useState } from 'react';
import { User, Lock, Calendar, CreditCard, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface Client {
  id: string;
  name: string;
  email: string;
  cpf: string;
  birth_date: string;
  phone: string | null;
}

interface Invoice {
  id: string;
  invoice_number: string;
  description: string;
  amount: number;
  due_date: string;
  status: string;
}

const ClientArea = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [client, setClient] = useState<Client | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loginData, setLoginData] = useState({
    cpf: '',
    birthDate: ''
  });

  const formatCPF = (cpf: string) => {
    // Remove tudo que não é dígito
    const numbers = cpf.replace(/\D/g, '');
    
    // Aplica a máscara
    return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  };

  const handleCPFChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCPF(e.target.value);
    setLoginData({...loginData, cpf: formatted});
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      console.log('🔑 Tentando fazer login com CPF:', loginData.cpf);
      console.log('🔑 Data de nascimento:', loginData.birthDate);
      
      // Primeiro, vamos verificar a conexão e listar todos os clientes
      console.log('🔌 Testando conexão com Supabase...');
      const { data: testConnection, error: connectionError } = await supabase
        .from('clients')
        .select('count', { count: 'exact', head: true });
      
      if (connectionError) {
        console.error('❌ Erro de conexão:', connectionError);
        toast({
          title: "Erro de conexão",
          description: "Não foi possível conectar ao banco de dados.",
          variant: "destructive"
        });
        return;
      }

      console.log('✅ Conexão estabelecida. Total de clientes:', testConnection);

      // Listar todos os clientes para debug
      const { data: allClients, error: listError } = await supabase
        .from('clients')
        .select('*');
      
      if (listError) {
        console.error('❌ Erro ao listar clientes:', listError);
      } else {
        console.log('📋 Todos os clientes na base:', allClients);
        console.log('📊 Quantidade de clientes encontrados:', allClients?.length || 0);
      }
      
      // Remove formatação do CPF para busca
      const cleanCPF = loginData.cpf.replace(/\D/g, '');
      console.log('🔍 CPF limpo para busca:', cleanCPF);
      console.log('🔍 CPF formatado:', loginData.cpf);
      console.log('🔍 Data de nascimento:', loginData.birthDate);
      
      // Buscar cliente por CPF (testando múltiplos formatos)
      const { data: clientData, error: clientError } = await supabase
        .from('clients')
        .select('*')
        .or(`cpf.eq.${loginData.cpf},cpf.eq.${cleanCPF}`)
        .eq('birth_date', loginData.birthDate);

      console.log('📊 Query executada - Resultado:', clientData);
      console.log('📊 Query executada - Erro:', clientError);

      if (clientError) {
        console.error('❌ Erro na consulta:', clientError);
        toast({
          title: "Erro no sistema",
          description: "Erro na consulta ao banco de dados. Tente novamente.",
          variant: "destructive"
        });
        return;
      }

      if (!clientData || clientData.length === 0) {
        console.log('❌ Nenhum cliente encontrado');
        
        // Fazer busca individual para debug
        const { data: cpfSearch } = await supabase
          .from('clients')
          .select('*')
          .or(`cpf.eq.${loginData.cpf},cpf.eq.${cleanCPF}`);
        
        const { data: dateSearch } = await supabase
          .from('clients')
          .select('*')
          .eq('birth_date', loginData.birthDate);
        
        console.log('🔍 Busca apenas por CPF:', cpfSearch);
        console.log('🔍 Busca apenas por data:', dateSearch);
        
        toast({
          title: "Dados não encontrados",
          description: "Verifique seu CPF e data de nascimento. Certifique-se de que estão corretos.",
          variant: "destructive"
        });
        return;
      }

      const foundClient = clientData[0];
      console.log('✅ Cliente encontrado:', foundClient);
      setClient(foundClient);
      
      // Buscar boletos do cliente
      const { data: invoicesData, error: invoicesError } = await supabase
        .from('invoices')
        .select('*')
        .eq('client_id', foundClient.id)
        .order('due_date', { ascending: false });

      if (invoicesError) {
        console.error('⚠️ Erro ao carregar boletos:', invoicesError);
      } else {
        console.log('📋 Boletos carregados:', invoicesData);
        setInvoices(invoicesData || []);
      }

      setIsAuthenticated(true);
      toast({
        title: "Login realizado com sucesso!",
        description: `Bem-vindo(a), ${foundClient.name}!`
      });
      
    } catch (error) {
      console.error('💥 Erro no login:', error);
      toast({
        title: "Erro no login",
        description: "Erro inesperado. Tente novamente mais tarde.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setClient(null);
    setInvoices([]);
    setLoginData({ cpf: '', birthDate: '' });
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
      case 'paid':
        return 'text-green-600 bg-green-100';
      case 'pending':
        return 'text-yellow-600 bg-yellow-100';
      case 'overdue':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'paid':
        return 'Pago';
      case 'pending':
        return 'Pendente';
      case 'overdue':
        return 'Vencido';
      default:
        return status;
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="container mx-auto px-4">
          <div className="max-w-md mx-auto">
            <Card className="shadow-lg">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl flex items-center justify-center">
                  <User className="w-6 h-6 mr-2" />
                  Área do Cliente
                </CardTitle>
                <p className="text-gray-600">
                  Acesse sua área do cliente para visualizar seus boletos
                </p>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleLogin} className="space-y-6">
                  <div>
                    <label htmlFor="cpf" className="block text-sm font-medium mb-2">
                      CPF *
                    </label>
                    <Input
                      id="cpf"
                      type="text"
                      value={loginData.cpf}
                      onChange={handleCPFChange}
                      placeholder="000.000.000-00"
                      maxLength={14}
                      required
                      className="w-full"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Digite apenas os números ou use a formatação com pontos e hífen
                    </p>
                  </div>
                  
                  <div>
                    <label htmlFor="birthDate" className="block text-sm font-medium mb-2">
                      Data de Nascimento *
                    </label>
                    <Input
                      id="birthDate"
                      type="date"
                      value={loginData.birthDate}
                      onChange={(e) => setLoginData({...loginData, birthDate: e.target.value})}
                      required
                      className="w-full"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Use o formato DD/MM/AAAA
                    </p>
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full bg-black hover:bg-gray-800"
                    disabled={loading}
                  >
                    <Lock className="w-4 h-4 mr-2" />
                    {loading ? 'Acessando...' : 'Acessar'}
                  </Button>
                  
                  <div className="text-xs text-gray-500 mt-4 p-3 bg-gray-50 rounded">
                    <strong>Dados de teste:</strong><br/>
                    CPF: 123.456.789-00<br/>
                    Data: 1995-12-19<br/><br/>
                    CPF: 987.654.321-00<br/>
                    Data: 1990-05-15
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <section className="bg-gradient-to-r from-gray-900 to-black text-white py-12">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold mb-2">Área do Cliente</h1>
              <p className="text-xl opacity-90">Bem-vindo(a), {client?.name}!</p>
            </div>
            <Button 
              onClick={handleLogout}
              variant="outline" 
              className="border-white text-white hover:bg-white hover:text-black"
            >
              Sair
            </Button>
          </div>
        </div>
      </section>

      {/* Client Info */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="w-5 h-5 mr-2" />
                Suas Informações
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Nome Completo</p>
                  <p className="font-semibold">{client?.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">E-mail</p>
                  <p className="font-semibold">{client?.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">CPF</p>
                  <p className="font-semibold">{client?.cpf}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Telefone</p>
                  <p className="font-semibold">{client?.phone || 'Não informado'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Invoices */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CreditCard className="w-5 h-5 mr-2" />
                Seus Boletos
              </CardTitle>
            </CardHeader>
            <CardContent>
              {invoices.length > 0 ? (
                <div className="space-y-4">
                  {invoices.map((invoice) => (
                    <div key={invoice.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-semibold text-lg">
                            Boleto #{invoice.invoice_number}
                          </h3>
                          <p className="text-gray-600">{invoice.description}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(invoice.status)}`}>
                          {getStatusText(invoice.status)}
                        </span>
                      </div>
                      
                      <div className="grid md:grid-cols-3 gap-4 mt-4">
                        <div>
                          <p className="text-sm text-gray-600">Valor</p>
                          <p className="font-semibold text-lg">{formatCurrency(invoice.amount)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Vencimento</p>
                          <p className="font-semibold">{formatDate(invoice.due_date)}</p>
                        </div>
                        <div className="flex items-end">
                          <Button size="sm" className="bg-black hover:bg-gray-800">
                            <FileText className="w-4 h-4 mr-1" />
                            Visualizar
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <CreditCard className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-600">Nenhum boleto encontrado.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default ClientArea;
