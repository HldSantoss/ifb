import { Card, CardContent } from '@/components/ui/card';

const Portfolio = () => {
  // Criando 6 cards de exemplo com o mesmo conteúdo
  const portfolioItems = Array(6).fill({
    tag: 'Lançamento',
    title: 'RESIDENCIAL FACHEIRO PRETO',
    description: 'Rua Facheiro Preto nº 20, Bairro Vila Progresso, CEP: 08245-090'
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">Portfólio</h1>
        <p className="text-gray-600">Conheça nossos empreendimentos</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {portfolioItems.map((item, index) => (
          <Card key={index} className="overflow-hidden rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <div className="relative">
              {/* Imagem placeholder */}
              <div className="w-full h-48 bg-gray-200"></div>
              
              {/* Tag no topo */}
              <div className="absolute top-3 left-3">
                <span className="bg-blue-600 text-white px-3 py-1 rounded-md text-sm font-medium">
                  {item.tag}
                </span>
              </div>
            </div>
            
            <CardContent className="p-4">
              {/* Título */}
              <h3 className="text-lg font-bold text-gray-800 mb-2">
                {item.title}
              </h3>
              
              {/* Descrição */}
              <p className="text-sm text-gray-600">
                {item.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Portfolio;