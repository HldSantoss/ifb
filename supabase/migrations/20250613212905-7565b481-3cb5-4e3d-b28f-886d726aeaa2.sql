
-- Limpar qualquer dado existente e inserir novos dados de teste
DELETE FROM public.clients WHERE cpf IN ('123.456.789-00', '987.654.321-00', '11111111111');

-- Inserir dados de teste com diferentes formatos de CPF para garantir compatibilidade
INSERT INTO public.clients (name, email, cpf, birth_date, phone) VALUES 
('João Silva', 'joao.silva@exemplo.com', '123.456.789-00', '1995-12-19', '(11) 99999-9999'),
('Maria Santos', 'maria.santos@exemplo.com', '987.654.321-00', '1990-05-15', '(11) 88888-8888'),
('Carlos Oliveira', 'carlos.oliveira@exemplo.com', '11111111111', '1985-03-10', '(11) 77777-7777');

-- Verificar se os dados foram inseridos corretamente
SELECT COUNT(*) as total_clients FROM public.clients;
