-- Habilitar RLS na tabela clients
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

-- Criar política para permitir leitura pública (para login de clientes)
CREATE POLICY "Permitir leitura para todos" 
ON public.clients 
FOR SELECT 
USING (true);

-- Habilitar RLS na tabela invoices
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

-- Criar política para permitir leitura pública dos boletos
CREATE POLICY "Permitir leitura para todos" 
ON public.invoices 
FOR SELECT 
USING (true);

-- Habilitar RLS na tabela projects
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- Criar política para permitir leitura pública dos projetos
CREATE POLICY "Permitir leitura para todos" 
ON public.projects 
FOR SELECT 
USING (true);