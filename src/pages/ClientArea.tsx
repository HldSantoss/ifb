
import { useState, useEffect } from 'react';
import { User, Lock, Calendar, CreditCard, FileText, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import WhatsAppSender from '@/components/WhatsAppSender';

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
  whatsapp_sent: boolean;
  whatsapp_sent_at: string | null;
  whatsapp_error: string | null;
  whatsapp_attempts: number;
}

const ClientArea = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [client, setClient] = useState<Client | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loginData, setLoginData] = useState({
    cpf: ''
  });

  const formatCPF = (cpf: string) => {
    const numbers = cpf.replace(/\D/g, '');
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
      console.log('🔍 Tentando login com CPF:', loginData.cpf);

      const { data: clientData, error: clientError } = await supabase
        .from('clients')
        .select('*')
        .eq('cpf', loginData.cpf)
        .maybeSingle();

      if (clientError) {
        toast({
          title: "Erro no sistema",
          description: "Erro ao consultar dados",
          variant: "destructive"
        });
        return;
      }

      if (!clientData) {
        toast({
          title: "CPF não encontrado",
          description: "Verifique seu CPF",
          variant: "destructive"
        });
        return;
      }

      setClient(clientData);
      
      const { data: invoicesData } = await supabase
        .from('invoices')
        .select('*')
        .eq('client_id', clientData.id)
        .order('due_date', { ascending: false });

      setInvoices(invoicesData || []);
      setIsAuthenticated(true);
      
      toast({
        title: "Acesso liberado!",
        description: `Bem-vindo(a), ${clientData.name}!`
      });
      
    } catch (error) {
      console.error('💥 Erro no login:', error);
      toast({
        title: "Erro no login",
        description: "Erro inesperado",
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
    setLoginData({ cpf: '' });
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

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando área do cliente...</p>
        </div>
      </div>
    );
  }

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
                    <strong>📋 CPF DE TESTE:</strong><br/>
                    123.456.789-00
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

          {/* Boletos com abas */}
          <Tabs defaultValue="boletos" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="boletos" className="flex items-center">
                <CreditCard className="w-4 h-4 mr-2" />
                Seus Boletos
              </TabsTrigger>
              <TabsTrigger value="whatsapp" className="flex items-center">
                <MessageCircle className="w-4 h-4 mr-2" />
                Envio WhatsApp
              </TabsTrigger>
            </TabsList>

            <TabsContent value="boletos">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <CreditCard className="w-5 h-5 mr-2" />
                    Lista de Boletos
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
            </TabsContent>

            <TabsContent value="whatsapp">
              <Card>
                <CardContent className="p-6">
                  <WhatsAppSender 
                    invoices={invoices}
                    clientName={client?.name || ''}
                    onInvoicesUpdate={setInvoices}
                  />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </section>
    </div>
  );
};

export default ClientArea;
