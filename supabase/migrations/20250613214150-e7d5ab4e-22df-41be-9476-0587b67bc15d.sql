
-- Verificar se existem dados na tabela clients
SELECT * FROM public.clients;

-- Se não houver dados, vamos inserir novamente
-- Primeiro, garantir que a tabela está limpa
DELETE FROM public.clients;

-- Inserir os dados de teste novamente
INSERT INTO public.clients (name, email, cpf, birth_date, phone) VALUES 
('João Silva', 'joao.silva@exemplo.com', '123.456.789-00', '1995-12-19', '(11) 99999-9999'),
('Maria Santos', 'maria.santos@exemplo.com', '987.654.321-00', '1990-05-15', '(11) 88888-8888'),
('Carlos Oliveira', 'carlos.oliveira@exemplo.com', '11111111111', '1985-03-10', '(11) 77777-7777');

-- Verificar se os dados foram inseridos
SELECT id, name, cpf, birth_date FROM public.clients ORDER BY name;

-- Criar alguns boletos de teste para o João Silva
DO $$
DECLARE
    joao_id uuid;
    projeto_id uuid;
BEGIN
    -- Buscar o ID do João Silva
    SELECT id INTO joao_id FROM public.clients WHERE cpf = '123.456.789-00';
    
    -- Criar um projeto se não existir
    INSERT INTO public.projects (name, unit, status, completion) 
    VALUES ('Residencial Teste', 'Apartamento 101', 'em_andamento', '65%')
    ON CONFLICT DO NOTHING
    RETURNING id INTO projeto_id;
    
    -- Se o projeto já existia, pegar o ID
    IF projeto_id IS NULL THEN
        SELECT id INTO projeto_id FROM public.projects LIMIT 1;
    END IF;
    
    -- Inserir boletos de teste se o cliente existir
    IF joao_id IS NOT NULL AND projeto_id IS NOT NULL THEN
        INSERT INTO public.invoices (client_id, project_id, invoice_number, description, amount, due_date, status) VALUES 
        (joao_id, projeto_id, 'BOL-2024-001', 'Parcela 1/36 - Residencial Teste', 1500.00, '2024-01-15', 'paid'),
        (joao_id, projeto_id, 'BOL-2024-002', 'Parcela 2/36 - Residencial Teste', 1500.00, '2024-02-15', 'paid'),
        (joao_id, projeto_id, 'BOL-2024-003', 'Parcela 3/36 - Residencial Teste', 1500.00, '2024-03-15', 'pending'),
        (joao_id, projeto_id, 'BOL-2024-004', 'Parcela 4/36 - Residencial Teste', 1500.00, '2024-04-15', 'overdue');
    END IF;
END $$;

-- Verificar os boletos criados
SELECT i.invoice_number, i.description, i.amount, i.due_date, i.status, c.name as client_name
FROM public.invoices i
JOIN public.clients c ON i.client_id = c.id
WHERE c.cpf = '123.456.789-00';
