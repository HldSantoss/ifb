-- Adicionar campos para controle de envio via WhatsApp
ALTER TABLE public.invoices 
ADD COLUMN whatsapp_sent BOOLEAN DEFAULT FALSE,
ADD COLUMN whatsapp_sent_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN whatsapp_error TEXT,
ADD COLUMN whatsapp_attempts INTEGER DEFAULT 0;