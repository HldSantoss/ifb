
import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Building } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface Empreendimento {
  id: string;
  nome: string;
  descricao: string;
  localizacao: string;
  preco: number;
  imagem_url: string;
  status: string;
  created_at: string;
}

const Admin = () => {
  const { toast } = useToast();
  const [empreendimentos, setEmpreendimentos] = useState<Empreendimento[]>([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    nome: '',
    descricao: '',
    localizacao: '',
    preco: '',
    imagem_url: '',
    status: 'disponivel'
  });

  useEffect(() => {
    loadEmpreendimentos();
  }, []);

  const loadEmpreendimentos = async () => {
    try {
      const { data, error } = await (supabase as any)
        .from('empreendimentos')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setEmpreendimentos(data || []);
    } catch (error) {
      console.error('Erro ao carregar empreendimentos:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os empreendimentos.",
        variant: "destructive"
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const empreendimentoData = {
        nome: formData.nome,
        descricao: formData.descricao,
        localizacao: formData.localizacao,
        preco: parseFloat(formData.preco),
        imagem_url: formData.imagem_url,
        status: formData.status
      };

      if (editingId) {
        const { error } = await (supabase as any)
          .from('empreendimentos')
          .update(empreendimentoData)
          .eq('id', editingId);

        if (error) throw error;

        toast({
          title: "Sucesso!",
          description: "Empreendimento atualizado com sucesso.",
        });
      } else {
        const { error } = await (supabase as any)
          .from('empreendimentos')
          .insert([empreendimentoData]);

        if (error) throw error;

        toast({
          title: "Sucesso!",
          description: "Empreendimento cadastrado com sucesso.",
        });
      }

      resetForm();
      loadEmpreendimentos();
      setDialogOpen(false);
    } catch (error) {
      console.error('Erro ao salvar empreendimento:', error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar o empreendimento.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (empreendimento: Empreendimento) => {
    setEditingId(empreendimento.id);
    setFormData({
      nome: empreendimento.nome,
      descricao: empreendimento.descricao || '',
      localizacao: empreendimento.localizacao || '',
      preco: empreendimento.preco?.toString() || '',
      imagem_url: empreendimento.imagem_url || '',
      status: empreendimento.status
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este empreendimento?')) return;

    try {
      const { error } = await (supabase as any)
        .from('empreendimentos')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Sucesso!",
        description: "Empreendimento excluído com sucesso.",
      });

      loadEmpreendimentos();
    } catch (error) {
      console.error('Erro ao excluir empreendimento:', error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir o empreendimento.",
        variant: "destructive"
      });
    }
  };

  const resetForm = () => {
    setFormData({
      nome: '',
      descricao: '',
      localizacao: '',
      preco: '',
      imagem_url: '',
      status: 'disponivel'
    });
    setEditingId(null);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <section className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold flex items-center">
                <Building className="w-8 h-8 mr-3" />
                Administração de Empreendimentos
              </h1>
              <p className="text-gray-300">Gerencie os empreendimentos da construtora</p>
            </div>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button 
                  onClick={resetForm}
                  className="bg-white text-black hover:bg-gray-100"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Novo Empreendimento
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>
                    {editingId ? 'Editar Empreendimento' : 'Novo Empreendimento'}
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="nome" className="block text-sm font-medium mb-2">
                        Nome *
                      </label>
                      <Input
                        id="nome"
                        name="nome"
                        value={formData.nome}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="localizacao" className="block text-sm font-medium mb-2">
                        Localização
                      </label>
                      <Input
                        id="localizacao"
                        name="localizacao"
                        value={formData.localizacao}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="descricao" className="block text-sm font-medium mb-2">
                      Descrição
                    </label>
                    <Textarea
                      id="descricao"
                      name="descricao"
                      value={formData.descricao}
                      onChange={handleChange}
                      rows={3}
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="preco" className="block text-sm font-medium mb-2">
                        Preço (R$)
                      </label>
                      <Input
                        id="preco"
                        name="preco"
                        type="number"
                        step="0.01"
                        value={formData.preco}
                        onChange={handleChange}
                      />
                    </div>
                    <div>
                      <label htmlFor="status" className="block text-sm font-medium mb-2">
                        Status
                      </label>
                      <Select value={formData.status} onValueChange={(value) => setFormData({...formData, status: value})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="disponivel">Disponível</SelectItem>
                          <SelectItem value="em_construcao">Em Construção</SelectItem>
                          <SelectItem value="finalizado">Finalizado</SelectItem>
                          <SelectItem value="vendido">Vendido</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="imagem_url" className="block text-sm font-medium mb-2">
                      URL da Imagem
                    </label>
                    <Input
                      id="imagem_url"
                      name="imagem_url"
                      type="url"
                      value={formData.imagem_url}
                      onChange={handleChange}
                      placeholder="https://exemplo.com/imagem.jpg"
                    />
                  </div>

                  <div className="flex justify-end space-x-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setDialogOpen(false)}
                    >
                      Cancelar
                    </Button>
                    <Button type="submit" disabled={loading}>
                      {loading ? 'Salvando...' : (editingId ? 'Atualizar' : 'Cadastrar')}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <Card>
            <CardHeader>
              <CardTitle>Empreendimentos Cadastrados</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Localização</TableHead>
                    <TableHead>Preço</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {empreendimentos.map((empreendimento) => (
                    <TableRow key={empreendimento.id}>
                      <TableCell className="font-medium">
                        {empreendimento.nome}
                      </TableCell>
                      <TableCell>{empreendimento.localizacao}</TableCell>
                      <TableCell>
                        {empreendimento.preco ? formatCurrency(empreendimento.preco) : '-'}
                      </TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          empreendimento.status === 'disponivel' ? 'bg-green-100 text-green-800' :
                          empreendimento.status === 'em_construcao' ? 'bg-yellow-100 text-yellow-800' :
                          empreendimento.status === 'finalizado' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {empreendimento.status.replace('_', ' ')}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(empreendimento)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDelete(empreendimento.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {empreendimentos.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  Nenhum empreendimento cadastrado ainda.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default Admin;
