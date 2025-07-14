import { useState, useEffect } from 'react';
import { Shield, Search, MessageCircle, User, Lock, TrendingUp, TrendingDown, DollarSign, Calendar, AlertTriangle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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

interface DashboardStats {
  totalInvoices: number;
  totalAmount: number;
  paidInvoices: number;
  paidAmount: number;
  pendingInvoices: number;
  pendingAmount: number;
  overdueInvoices: number;
  overdueAmount: number;
  whatsappSent: number;
  whatsappPending: number;
  whatsappFailed: number;
}

const WhatsAppAdmin = () => {
  const { toast } = useToast();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [dashboardLoading, setDashboardLoading] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [loginData, setLoginData] = useState({
    password: ''
  });
  const [searchData, setSearchData] = useState({
    cpf: ''
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatCPF = (cpf: string) => {
    const numbers = cpf.replace(/\D/g, '');
    return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  };

  const handleCPFChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCPF(e.target.value);
    setSearchData({...searchData, cpf: formatted});
  };

  const loadDashboardStats = async () => {
    setDashboardLoading(true);
    
    try {
      // Buscar todos os boletos
      const { data: allInvoices, error } = await supabase
        .from('invoices')
        .select('*');

      if (error) {
        console.error('Erro ao carregar estatísticas:', error);
        return;
      }

      const invoices = allInvoices || [];
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const stats: DashboardStats = {
        totalInvoices: invoices.length,
        totalAmount: invoices.reduce((sum, inv) => sum + inv.amount, 0),
        paidInvoices: invoices.filter(inv => inv.status === 'paid').length,
        paidAmount: invoices.filter(inv => inv.status === 'paid').reduce((sum, inv) => sum + inv.amount, 0),
        pendingInvoices: invoices.filter(inv => inv.status === 'pending').length,
        pendingAmount: invoices.filter(inv => inv.status === 'pending').reduce((sum, inv) => sum + inv.amount, 0),
        overdueInvoices: invoices.filter(inv => {
          const dueDate = new Date(inv.due_date);
          return inv.status !== 'paid' && dueDate < today;
        }).length,
        overdueAmount: invoices.filter(inv => {
          const dueDate = new Date(inv.due_date);
          return inv.status !== 'paid' && dueDate < today;
        }).reduce((sum, inv) => sum + inv.amount, 0),
        whatsappSent: invoices.filter(inv => inv.whatsapp_sent).length,
        whatsappPending: invoices.filter(inv => !inv.whatsapp_sent && inv.whatsapp_attempts === 0).length,
        whatsappFailed: invoices.filter(inv => !inv.whatsapp_sent && inv.whatsapp_attempts > 0).length,
      };

      setDashboardStats(stats);
      
    } catch (error) {
      console.error('Erro ao carregar dashboard:', error);
    } finally {
      setDashboardLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadDashboardStats();
    }
  }, [isAuthenticated]);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Verificar senha do sistema
      if (loginData.password !== '2345') {
        toast({
          title: "Senha incorreta",
          description: "Verifique a senha do sistema",
          variant: "destructive"
        });
        return;
      }

      setIsAuthenticated(true);
      toast({
        title: "Acesso liberado!",
        description: "Bem-vindo à área administrativa"
      });
      
    } catch (error) {
      console.error('💥 Erro no login admin:', error);
      toast({
        title: "Erro no login",
        description: "Erro inesperado",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClientSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setSearchLoading(true);
    
    try {
      console.log('🔍 Buscando cliente com CPF:', searchData.cpf);

      const { data: clientData, error: clientError } = await supabase
        .from('clients')
        .select('*')
        .eq('cpf', searchData.cpf)
        .maybeSingle();

      if (clientError) {
        toast({
          title: "Erro no sistema",
          description: "Erro ao consultar dados do cliente",
          variant: "destructive"
        });
        return;
      }

      if (!clientData) {
        toast({
          title: "Cliente não encontrado",
          description: "Verifique o CPF informado",
          variant: "destructive"
        });
        setSelectedClient(null);
        setInvoices([]);
        return;
      }

      setSelectedClient(clientData);
      
      // Buscar boletos do cliente com dados de WhatsApp
      const { data: invoicesData, error: invoicesError } = await supabase
        .from('invoices')
        .select('*')
        .eq('client_id', clientData.id)
        .order('due_date', { ascending: false });

      if (invoicesError) {
        console.error('Erro ao carregar boletos:', invoicesError);
        toast({
          title: "Aviso",
          description: "Erro ao carregar boletos",
          variant: "default"
        });
        setInvoices([]);
      } else {
        setInvoices(invoicesData || []);
      }

      toast({
        title: "Cliente encontrado!",
        description: `Cliente: ${clientData.name}`
      });
      
    } catch (error) {
      console.error('💥 Erro na busca:', error);
      toast({
        title: "Erro na busca",
        description: "Erro inesperado",
        variant: "destructive"
      });
    } finally {
      setSearchLoading(false);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setSelectedClient(null);
    setInvoices([]);
    setLoginData({ password: '' });
    setSearchData({ cpf: '' });
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="container mx-auto px-4">
          <div className="max-w-md mx-auto">
            <Card className="shadow-lg">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl flex items-center justify-center">
                  <Shield className="w-6 h-6 mr-2" />
                  Administração WhatsApp
                </CardTitle>
                <p className="text-gray-600">
                  Acesse a área administrativa para gerenciar envios
                </p>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAdminLogin} className="space-y-6">
                  <div>
                    <label htmlFor="password" className="block text-sm font-medium mb-2">
                      Senha do Sistema *
                    </label>
                    <Input
                      id="password"
                      type="password"
                      value={loginData.password}
                      onChange={(e) => setLoginData({...loginData, password: e.target.value})}
                      placeholder="Digite a senha do sistema"
                      required
                      className="w-full"
                    />
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    disabled={loading}
                  >
                    <Lock className="w-4 h-4 mr-2" />
                    {loading ? 'Acessando...' : 'Acessar'}
                  </Button>
                  
                  <div className="text-xs text-gray-500 mt-4 p-3 bg-gray-50 rounded">
                    <strong>🔐 SENHA DO SISTEMA:</strong><br/>
                    2345
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
      <section className="bg-gradient-to-r from-blue-900 to-blue-700 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold mb-2 flex items-center">
                <MessageCircle className="w-8 h-8 mr-3" />
                Administração WhatsApp
              </h1>
              <p className="text-xl opacity-90">Gerenciar envios de boletos via WhatsApp</p>
            </div>
            <Button 
              onClick={handleLogout}
              variant="outline" 
              className="border-white text-white hover:bg-white hover:text-blue-700"
            >
              Sair
            </Button>
          </div>
        </div>
      </section>

      {/* Dashboard */}
      <section className="py-8 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Dashboard Geral</h2>
            <p className="text-gray-600">Visão geral de todos os boletos do sistema</p>
          </div>

          {dashboardLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Carregando estatísticas...</p>
            </div>
          ) : dashboardStats ? (
            <>
              {/* Cards principais */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <Card className="border-l-4 border-l-blue-500">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Total de Boletos</p>
                        <p className="text-3xl font-bold text-blue-600">{dashboardStats.totalInvoices}</p>
                        <p className="text-sm text-gray-500">{formatCurrency(dashboardStats.totalAmount)}</p>
                      </div>
                      <Calendar className="w-8 h-8 text-blue-500" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-l-4 border-l-green-500">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Boletos Pagos</p>
                        <p className="text-3xl font-bold text-green-600">{dashboardStats.paidInvoices}</p>
                        <p className="text-sm text-gray-500">{formatCurrency(dashboardStats.paidAmount)}</p>
                      </div>
                      <CheckCircle className="w-8 h-8 text-green-500" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-l-4 border-l-yellow-500">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">A Receber</p>
                        <p className="text-3xl font-bold text-yellow-600">{dashboardStats.pendingInvoices}</p>
                        <p className="text-sm text-gray-500">{formatCurrency(dashboardStats.pendingAmount)}</p>
                      </div>
                      <TrendingUp className="w-8 h-8 text-yellow-500" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-l-4 border-l-red-500">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Vencidos</p>
                        <p className="text-3xl font-bold text-red-600">{dashboardStats.overdueInvoices}</p>
                        <p className="text-sm text-gray-500">{formatCurrency(dashboardStats.overdueAmount)}</p>
                      </div>
                      <AlertTriangle className="w-8 h-8 text-red-500" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Cards WhatsApp */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="border-l-4 border-l-green-500">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">WhatsApp Enviados</p>
                        <p className="text-3xl font-bold text-green-600">{dashboardStats.whatsappSent}</p>
                        <p className="text-sm text-gray-500">
                          {dashboardStats.totalInvoices > 0 
                            ? `${Math.round((dashboardStats.whatsappSent / dashboardStats.totalInvoices) * 100)}% do total`
                            : '0% do total'
                          }
                        </p>
                      </div>
                      <MessageCircle className="w-8 h-8 text-green-500" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-l-4 border-l-yellow-500">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">WhatsApp Pendentes</p>
                        <p className="text-3xl font-bold text-yellow-600">{dashboardStats.whatsappPending}</p>
                        <p className="text-sm text-gray-500">Aguardando envio</p>
                      </div>
                      <TrendingUp className="w-8 h-8 text-yellow-500" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-l-4 border-l-red-500">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">WhatsApp Falharam</p>
                        <p className="text-3xl font-bold text-red-600">{dashboardStats.whatsappFailed}</p>
                        <p className="text-sm text-gray-500">Necessitam reenvio</p>
                      </div>
                      <TrendingDown className="w-8 h-8 text-red-500" />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <AlertTriangle className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600">Erro ao carregar estatísticas</p>
            </div>
          )}
        </div>
      </section>

      {/* Search Client */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Search className="w-5 h-5 mr-2" />
                Buscar Cliente
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleClientSearch} className="flex gap-4">
                <div className="flex-1">
                  <Input
                    type="text"
                    value={searchData.cpf}
                    onChange={handleCPFChange}
                    placeholder="Digite o CPF do cliente (000.000.000-00)"
                    maxLength={14}
                    required
                    className="w-full"
                  />
                </div>
                <Button 
                  type="submit" 
                  disabled={searchLoading}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Search className="w-4 h-4 mr-2" />
                  {searchLoading ? 'Buscando...' : 'Buscar'}
                </Button>
              </form>
              
              <div className="text-xs text-gray-500 mt-2">
                <strong>CPF de teste:</strong> 123.456.789-00
              </div>
            </CardContent>
          </Card>

          {/* Client Info */}
          {selectedClient && (
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="w-5 h-5 mr-2" />
                  Cliente Selecionado
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Nome Completo</p>
                    <p className="font-semibold">{selectedClient.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">E-mail</p>
                    <p className="font-semibold">{selectedClient.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">CPF</p>
                    <p className="font-semibold">{selectedClient.cpf}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Telefone</p>
                    <p className="font-semibold">{selectedClient.phone || 'Não informado'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* WhatsApp Management */}
          {selectedClient && invoices.length > 0 && (
            <Card>
              <CardContent className="p-6">
                <WhatsAppSender 
                  invoices={invoices}
                  clientName={selectedClient.name}
                  onInvoicesUpdate={setInvoices}
                />
              </CardContent>
            </Card>
          )}

          {/* No invoices message */}
          {selectedClient && invoices.length === 0 && (
            <Card>
              <CardContent className="p-6">
                <div className="text-center py-8">
                  <MessageCircle className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-600">Nenhum boleto encontrado para este cliente.</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </section>
    </div>
  );
};

export default WhatsAppAdmin;