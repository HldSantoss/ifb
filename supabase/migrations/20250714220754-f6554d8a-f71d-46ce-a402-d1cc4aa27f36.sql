-- Limpar dados existentes para o CPF de teste e recriar
DELETE FROM public.invoices WHERE client_id IN (SELECT id FROM public.clients WHERE cpf = '123.456.789-00');
DELETE FROM public.clients WHERE cpf = '123.456.789-00';

-- Inserir cliente de teste
INSERT INTO public.clients (name, email, cpf, birth_date, phone) VALUES 
('João Silva Santos', 'joao.silva@teste.com', '123.456.789-00', '1990-01-15', '(11) 99999-9999');

-- Criar projeto se não existir
INSERT INTO public.projects (name, unit, status, completion) 
VALUES ('Residencial Teste', 'Apartamento 101', 'em_andamento', '75%')
ON CONFLICT DO NOTHING;

-- Inserir 5 boletos para o cliente
DO $$
DECLARE
    cliente_id uuid;
    projeto_id uuid;
BEGIN
    -- Buscar IDs
    SELECT id INTO cliente_id FROM public.clients WHERE cpf = '123.456.789-00';
    SELECT id INTO projeto_id FROM public.projects WHERE name = 'Residencial Teste' LIMIT 1;
    
    -- Inserir os 5 boletos
    IF cliente_id IS NOT NULL AND projeto_id IS NOT NULL THEN
        INSERT INTO public.invoices (client_id, project_id, invoice_number, description, amount, due_date, status) VALUES 
        (cliente_id, projeto_id, 'BOL-2025-001', 'Parcela 1/60 - Residencial Teste', 1200.00, '2025-01-15', 'paid'),
        (cliente_id, projeto_id, 'BOL-2025-002', 'Parcela 2/60 - Residencial Teste', 1200.00, '2025-02-15', 'paid'),
        (cliente_id, projeto_id, 'BOL-2025-003', 'Parcela 3/60 - Residencial Teste', 1200.00, '2025-03-15', 'pending'),
        (cliente_id, projeto_id, 'BOL-2025-004', 'Parcela 4/60 - Residencial Teste', 1200.00, '2025-04-15', 'pending'),
        (cliente_id, projeto_id, 'BOL-2025-005', 'Parcela 5/60 - Residencial Teste', 1200.00, '2025-05-15', 'overdue');
    END IF;
END $$;

-- Verificar os dados criados
SELECT 
    c.name as cliente_nome,
    c.cpf,
    COUNT(i.id) as total_boletos
FROM public.clients c
LEFT JOIN public.invoices i ON c.id = i.client_id
WHERE c.cpf = '123.456.789-00'
GROUP BY c.id, c.name, c.cpf;