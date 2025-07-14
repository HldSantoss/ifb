import { useState } from 'react';
import { Shield, Search, MessageCircle, User, Lock } from 'lucide-react';
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

const WhatsAppAdmin = () => {
  const { toast } = useToast();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loginData, setLoginData] = useState({
    password: ''
  });
  const [searchData, setSearchData] = useState({
    cpf: ''
  });

  const formatCPF = (cpf: string) => {
    const numbers = cpf.replace(/\D/g, '');
    return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  };

  const handleCPFChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCPF(e.target.value);
    setSearchData({...searchData, cpf: formatted});
  };

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