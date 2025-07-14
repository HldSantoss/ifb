import { useState } from 'react';
import { MessageCircle, CheckCircle, XCircle, RotateCcw, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

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

interface WhatsAppSenderProps {
  invoices: Invoice[];
  clientName: string;
  onInvoicesUpdate: (invoices: Invoice[]) => void;
}

const WhatsAppSender = ({ invoices, clientName, onInvoicesUpdate }: WhatsAppSenderProps) => {
  const { toast } = useToast();
  const [sending, setSending] = useState<string | null>(null);
  const [sendingAll, setSendingAll] = useState(false);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const simulateWhatsAppSend = async (invoice: Invoice): Promise<{ success: boolean; error?: string }> => {
    // Simular delay de envio
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Simular falha ocasional (20% de chance)
    const shouldFail = Math.random() < 0.2;
    
    if (shouldFail) {
      return { success: false, error: 'Falha na conexão com WhatsApp API' };
    }
    
    return { success: true };
  };

  const sendInvoice = async (invoice: Invoice) => {
    setSending(invoice.id);
    
    try {
      const result = await simulateWhatsAppSend(invoice);
      
      const updateData = {
        whatsapp_attempts: invoice.whatsapp_attempts + 1,
        whatsapp_sent: result.success,
        whatsapp_sent_at: result.success ? new Date().toISOString() : null,
        whatsapp_error: result.success ? null : result.error
      };

      const { error } = await supabase
        .from('invoices')
        .update(updateData)
        .eq('id', invoice.id);

      if (error) throw error;

      // Atualizar a lista local
      const updatedInvoices = invoices.map(inv => 
        inv.id === invoice.id 
          ? { ...inv, ...updateData }
          : inv
      );
      onInvoicesUpdate(updatedInvoices);

      toast({
        title: result.success ? "Enviado com sucesso!" : "Falha no envio",
        description: result.success 
          ? `Boleto ${invoice.invoice_number} enviado via WhatsApp`
          : result.error,
        variant: result.success ? "default" : "destructive"
      });

    } catch (error) {
      console.error('Erro ao enviar boleto:', error);
      toast({
        title: "Erro no envio",
        description: "Erro inesperado ao enviar boleto",
        variant: "destructive"
      });
    } finally {
      setSending(null);
    }
  };

  const sendAllPending = async () => {
    setSendingAll(true);
    const pendingInvoices = invoices.filter(inv => !inv.whatsapp_sent);
    
    for (const invoice of pendingInvoices) {
      await sendInvoice(invoice);
      // Pequeno delay entre envios
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    setSendingAll(false);
  };

  const sentInvoices = invoices.filter(inv => inv.whatsapp_sent);
  const pendingInvoices = invoices.filter(inv => !inv.whatsapp_sent);
  const failedInvoices = invoices.filter(inv => inv.whatsapp_attempts > 0 && !inv.whatsapp_sent);

  return (
    <div className="space-y-6">
      {/* Header com botões de ação */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold flex items-center">
          <MessageCircle className="w-5 h-5 mr-2" />
          Envio via WhatsApp
        </h3>
        <div className="space-x-2">
          <Button 
            onClick={sendAllPending}
            disabled={sendingAll || pendingInvoices.length === 0}
            size="sm"
          >
            {sendingAll ? 'Enviando...' : `Enviar Todos (${pendingInvoices.length})`}
          </Button>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <CheckCircle className="w-8 h-8 mx-auto text-green-500 mb-2" />
            <p className="text-2xl font-bold text-green-600">{sentInvoices.length}</p>
            <p className="text-sm text-gray-600">Enviados</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <Clock className="w-8 h-8 mx-auto text-yellow-500 mb-2" />
            <p className="text-2xl font-bold text-yellow-600">{pendingInvoices.length}</p>
            <p className="text-sm text-gray-600">Pendentes</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <XCircle className="w-8 h-8 mx-auto text-red-500 mb-2" />
            <p className="text-2xl font-bold text-red-600">{failedInvoices.length}</p>
            <p className="text-sm text-gray-600">Falharam</p>
          </CardContent>
        </Card>
      </div>

      {/* Lista de boletos */}
      <div className="space-y-4">
        {invoices.map((invoice) => (
          <Card key={invoice.id} className="border-l-4 border-l-gray-200">
            <CardContent className="p-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-semibold">Boleto #{invoice.invoice_number}</h4>
                    {invoice.whatsapp_sent ? (
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Enviado
                      </Badge>
                    ) : invoice.whatsapp_attempts > 0 ? (
                      <Badge variant="destructive">
                        <XCircle className="w-3 h-3 mr-1" />
                        Falhou
                      </Badge>
                    ) : (
                      <Badge variant="outline">
                        <Clock className="w-3 h-3 mr-1" />
                        Pendente
                      </Badge>
                    )}
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-1">{invoice.description}</p>
                  <p className="text-lg font-bold text-green-600">{formatCurrency(invoice.amount)}</p>
                  <p className="text-sm text-gray-500">Vencimento: {formatDate(invoice.due_date)}</p>
                  
                  {invoice.whatsapp_sent_at && (
                    <p className="text-xs text-green-600 mt-1">
                      Enviado em: {new Date(invoice.whatsapp_sent_at).toLocaleString('pt-BR')}
                    </p>
                  )}
                  
                  {invoice.whatsapp_error && (
                    <p className="text-xs text-red-600 mt-1">
                      Erro: {invoice.whatsapp_error}
                    </p>
                  )}
                  
                  {invoice.whatsapp_attempts > 0 && (
                    <p className="text-xs text-gray-500 mt-1">
                      Tentativas: {invoice.whatsapp_attempts}
                    </p>
                  )}
                </div>
                
                <div className="ml-4">
                  {!invoice.whatsapp_sent && (
                    <Button 
                      size="sm"
                      onClick={() => sendInvoice(invoice)}
                      disabled={sending === invoice.id}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      {sending === invoice.id ? (
                        <>
                          <Clock className="w-4 h-4 mr-1 animate-spin" />
                          Enviando...
                        </>
                      ) : invoice.whatsapp_attempts > 0 ? (
                        <>
                          <RotateCcw className="w-4 h-4 mr-1" />
                          Reenviar
                        </>
                      ) : (
                        <>
                          <MessageCircle className="w-4 h-4 mr-1" />
                          Enviar
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default WhatsAppSender;