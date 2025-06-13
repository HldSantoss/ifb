
-- Primeiro, vamos verificar se existe algum cliente na tabela
SELECT * FROM public.clients LIMIT 5;

-- Se não houver dados, vamos criar um cliente de teste
INSERT INTO public.clients (
  name,
  email,
  cpf,
  birth_date,
  phone
) VALUES (
  'João Silva',
  'joao.silva@exemplo.com',
  '123.456.789-00',
  '1995-12-19',
  '(11) 99999-9999'
)
ON CONFLICT (cpf) DO NOTHING;

-- Criar outro cliente caso o primeiro já exista
INSERT INTO public.clients (
  name,
  email,
  cpf,
  birth_date,
  phone
) VALUES (
  'Maria Santos',
  'maria.santos@exemplo.com',
  '987.654.321-00',
  '1990-05-15',
  '(11) 88888-8888'
)
ON CONFLICT (cpf) DO NOTHING;
