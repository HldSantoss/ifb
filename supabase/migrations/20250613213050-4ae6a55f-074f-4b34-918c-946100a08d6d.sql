
-- Primeiro, vamos verificar se existe constraint único no CPF
ALTER TABLE public.clients DROP CONSTRAINT IF EXISTS clients_cpf_key;

-- Recriar a constraint única no CPF (isso é importante para evitar duplicatas)
ALTER TABLE public.clients ADD CONSTRAINT clients_cpf_unique UNIQUE (cpf);

-- Limpar completamente a tabela
TRUNCATE TABLE public.clients RESTART IDENTITY CASCADE;

-- Inserir dados de teste garantindo que não há conflitos
INSERT INTO public.clients (name, email, cpf, birth_date, phone) VALUES 
('João Silva', 'joao.silva@exemplo.com', '123.456.789-00', '1995-12-19', '(11) 99999-9999'),
('Maria Santos', 'maria.santos@exemplo.com', '987.654.321-00', '1990-05-15', '(11) 88888-8888'),
('Carlos Oliveira', 'carlos.oliveira@exemplo.com', '11111111111', '1985-03-10', '(11) 77777-7777');

-- Verificar se os dados foram realmente inseridos
SELECT id, name, cpf, birth_date, phone, created_at FROM public.clients ORDER BY created_at;
