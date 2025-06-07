
import { useState } from 'react';
import { LogIn, User, Building } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

// Mock client data
const mockClients = [
  {
    cpf: '123.456.789-00',
    birthDate: '1990-05-15',
    name: 'João Silva Santos',
    email: 'joao.silva@email.com',
    phone: '(11) 99999-8888',
    projects: [
      {
        id: 1,
        name: 'Edifício Vista Mar',
        unit: 'Apartamento 102',
        status: 'Em construção',
        completion: '75%'
      },
      {
        id: 2,
        name: 'Residencial Green Park',
        unit: 'Casa 15',
        status: 'Entregue',
        completion: '100%'
      }
    ]
  }
];

const ClientArea = () => {
  const { toast } = useToast();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentClient, setCurrentClient] = useState<any>(null);
  const [formData, setFormData] = useState({
    cpf: '',
    birthDate: ''
  });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Find client by CPF and birth date
    const client = mockClients.find(
      c => c.cpf === formData.cpf && c.birthDate === formData.birthDate
    );

    if (client) {
      setCurrentClient(client);
      setIsLoggedIn(true);
      toast({
        title: "Login realizado com sucesso!",
        description: `Bem-vindo, ${client.name}`,
      });
    } else {
      toast({
        title: "Dados não encontrados",
        description: "CPF ou data de nascimento incorretos.",
        variant: "destructive"
      });
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentClient(null);
    setFormData({ cpf: '', birthDate: '' });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
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
                    
                    <Button type="submit" className="w-full bg-black hover:bg-gray-800">
                      Acessar
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
              <h1 className="text-3xl font-bold">Olá, {currentClient.name}!</h1>
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
                      <p className="font-semibold">{currentClient.name}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">CPF</label>
                      <p className="font-semibold">{currentClient.cpf}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">E-mail</label>
                      <p className="font-semibold">{currentClient.email}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Telefone</label>
                      <p className="font-semibold">{currentClient.phone}</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Projects */}
              <div className="lg:col-span-2">
                <h2 className="text-2xl font-bold mb-6 flex items-center">
                  <Building className="w-6 h-6 mr-2" />
                  Seus Empreendimentos
                </h2>
                
                <div className="space-y-6">
                  {currentClient.projects.map((project: any) => (
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
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ClientArea;
