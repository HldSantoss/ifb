
import { useState, useEffect } from 'react';
import { LogIn, User, Building, FileText, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface Client {
  id: string;
  cpf: string;
  birth_date: string;
  name: string;
  email: string;
  phone: string;
}

interface Project {
  id: string;
  name: string;
  unit: string;
  status: string;
  completion: string;
}

interface Invoice {
  id: string;
  amount: number;
  due_date: string;
  description: string;
  invoice_number: string;
  status: string;
  project: {
    name: string;
  };
}

const ClientArea = () => {
  const { toast } = useToast();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentClient, setCurrentClient] = useState<Client | null>(null);
  const [clientProjects, setClientProjects] = useState<Project[]>([]);
  const [clientInvoices, setClientInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    cpf: '',
    birthDate: ''
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Find client by CPF and birth date
      const { data: client, error } = await supabase
        .from('clients')
        .select('*')
        .eq('cpf', formData.cpf)
        .eq('birth_date', formData.birthDate)
        .single();

      if (error || !client) {
        toast({
          title: "Dados não encontrados",
          description: "CPF ou data de nascimento incorretos.",
          variant: "destructive"
        });
        return;
      }

      setCurrentClient(client);
      await loadClientData(client.id);
      setIsLoggedIn(true);
      
      toast({
        title: "Login realizado com sucesso!",
        description: `Bem-vindo, ${client.name}`,
      });
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: "Erro no login",
        description: "Ocorreu um erro ao tentar fazer login.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const loadClientData = async (clientId: string) => {
    try {
      // Load client projects
      const { data: purchases, error: purchasesError } = await supabase
        .from('purchases')
        .select(`
          project:projects (
            id,
            name,
            unit,
            status,
            completion
          )
        `)
        .eq('client_id', clientId);

      if (purchasesError) {
        console.error('Error loading purchases:', purchasesError);
      } else {
        const projects = purchases?.map(p => p.project).filter(Boolean) || [];
        setClientProjects(projects);
      }

      // Load client invoices
      const { data: invoices, error: invoicesError } = await supabase
        .from('invoices')
        .select(`
          *,
          project:projects (
            name
          )
        `)
        .eq('client_id', clientId)
        .eq('status', 'pending')
        .order('due_date', { ascending: true });

      if (invoicesError) {
        console.error('Error loading invoices:', invoicesError);
      } else {
        setClientInvoices(invoices || []);
      }
    } catch (error) {
      console.error('Error loading client data:', error);
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentClient(null);
    setClientProjects([]);
    setClientInvoices([]);
    setFormData({ cpf: '', birthDate: '' });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleDownloadInvoice = (invoiceNumber: string) => {
    // Simulate PDF download
    toast({
      title: "Download iniciado",
      description: `Baixando boleto ${invoiceNumber}...`,
    });
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

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-background">
        {/* Hero Section */}
        <section className="relative py-20 bg-gradient-to-r from-gray-900 to-black text-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-5xl font-bold mb-6 animate-fade-in">
                Área do Cliente
              </h1>
              <p className="text-xl opacity-90 animate-fade-in">
                Acesse suas informações e acompanhe seus empreendimentos
              </p>
            </div>
          </div>
        </section>

        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-md mx-auto">
              <Card className="shadow-lg">
                <CardHeader className="text-center">
                  <LogIn className="w-12 h-12 mx-auto mb-4 text-gray-600" />
                  <CardTitle className="text-2xl">Acesso do Cliente</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleLogin} className="space-y-6">
                    <div>
                      <label htmlFor="cpf" className="block text-sm font-medium mb-2">
                        CPF *
                      </label>
                      <Input
                        id="cpf"
                        name="cpf"
                        type="text"
                        value={formData.cpf}
                        onChange={handleChange}
                        required
                        className="w-full"
                        placeholder="000.000.000-00"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="birthDate" className="block text-sm font-medium mb-2">
                        Data de Nascimento *
                      </label>
                      <Input
                        id="birthDate"
                        name="birthDate"
                        type="date"
                        value={formData.birthDate}
                        onChange={handleChange}
                        required
                        className="w-full"
                      />
                    </div>
                    
                    <Button 
                      type="submit" 
                      className="w-full bg-black hover:bg-gray-800"
                      disabled={loading}
                    >
                      {loading ? 'Aguarde...' : 'Acessar'}
                    </Button>
                  </form>
                  
                  <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600 text-center">
                      <strong>Dados para teste:</strong><br />
                      CPF: 123.456.789-00<br />
                      Data: 1990-05-15
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <section className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">Olá, {currentClient?.name}!</h1>
              <p className="text-gray-300">Bem-vindo à sua área do cliente</p>
            </div>
            <Button onClick={handleLogout} variant="outline" className="text-black">
              Sair
            </Button>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Client Info */}
              <div className="lg:col-span-1">
                <Card className="shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <User className="w-5 h-5 mr-2" />
                      Seus Dados
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-600">Nome</label>
                      <p className="font-semibold">{currentClient?.name}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">CPF</label>
                      <p className="font-semibold">{currentClient?.cpf}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">E-mail</label>
                      <p className="font-semibold">{currentClient?.email}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Telefone</label>
                      <p className="font-semibold">{currentClient?.phone}</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Projects and Invoices */}
              <div className="lg:col-span-2 space-y-8">
                {/* Projects */}
                <div>
                  <h2 className="text-2xl font-bold mb-6 flex items-center">
                    <Building className="w-6 h-6 mr-2" />
                    Seus Empreendimentos
                  </h2>
                  
                  <div className="space-y-6">
                    {clientProjects.map((project) => (
                      <Card key={project.id} className="shadow-lg">
                        <CardHeader>
                          <CardTitle className="text-xl">{project.name}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="grid md:grid-cols-3 gap-4">
                            <div>
                              <label className="text-sm font-medium text-gray-600">Unidade</label>
                              <p className="font-semibold">{project.unit}</p>
                            </div>
                            <div>
                              <label className="text-sm font-medium text-gray-600">Status</label>
                              <p className="font-semibold">{project.status}</p>
                            </div>
                            <div>
                              <label className="text-sm font-medium text-gray-600">Progresso</label>
                              <div className="flex items-center">
                                <div className="flex-1 bg-gray-200 rounded-full h-2 mr-2">
                                  <div 
                                    className="bg-green-500 h-2 rounded-full" 
                                    style={{ width: project.completion }}
                                  ></div>
                                </div>
                                <span className="text-sm font-semibold">{project.completion}</span>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>

                {/* Invoices */}
                {clientInvoices.length > 0 && (
                  <div>
                    <h2 className="text-2xl font-bold mb-6 flex items-center">
                      <FileText className="w-6 h-6 mr-2" />
                      Boletos em Aberto
                    </h2>
                    
                    <Card className="shadow-lg">
                      <CardContent className="p-0">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Número</TableHead>
                              <TableHead>Empreendimento</TableHead>
                              <TableHead>Descrição</TableHead>
                              <TableHead>Vencimento</TableHead>
                              <TableHead>Valor</TableHead>
                              <TableHead>Ações</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {clientInvoices.map((invoice) => (
                              <TableRow key={invoice.id}>
                                <TableCell className="font-medium">
                                  {invoice.invoice_number}
                                </TableCell>
                                <TableCell>{invoice.project.name}</TableCell>
                                <TableCell>{invoice.description}</TableCell>
                                <TableCell>{formatDate(invoice.due_date)}</TableCell>
                                <TableCell>{formatCurrency(invoice.amount)}</TableCell>
                                <TableCell>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleDownloadInvoice(invoice.invoice_number)}
                                  >
                                    <Download className="w-4 h-4 mr-1" />
                                    Download
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ClientArea;
