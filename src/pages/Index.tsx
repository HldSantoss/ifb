import { ArrowRight, Award, Users, Building } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import PropertyCard from '@/components/PropertyCard';
import { properties } from '@/data/properties';

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-r from-gray-900 via-black to-gray-800 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black bg-opacity-40"></div>
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: 'url(/lovable-uploads/012a1088-7fea-46ce-9419-8f0d1fd49a5f.png)'
          }}
        ></div>
        
        <div className="relative z-10 container mx-auto px-4 text-center">
          <h1 className="text-6xl md:text-7xl font-bold mb-6 animate-fade-in">
            Construindo o
            <span className="block bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Futuro
            </span>
          </h1>
          <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto opacity-90 animate-fade-in">
            Empreendimentos de excelência que transformam sonhos em realidade. 
            Mais de 25 anos criando espaços únicos com design moderno e sustentabilidade.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in">
            <Button asChild size="lg" className="bg-black text-white hover:bg-gray-800">
              <Link to="/contact">
                Fale Conosco
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </Button>
            <Button asChild size="lg" className="bg-black text-white hover:bg-gray-800 border-black">
              <Link to="/about">
                Conheça Nossa História
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Properties Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Nossos Empreendimentos
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Descubra projetos exclusivos que combinam arquitetura inovadora, 
              localização privilegiada e qualidade superior em cada detalhe.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {properties.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
          
          <div className="text-center mt-12">
            <Button asChild size="lg" className="bg-black hover:bg-gray-800">
              <Link to="/contact">
                Ver Todos os Empreendimentos
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div className="p-8">
              <Award className="w-12 h-12 mx-auto mb-4 text-gray-800" />
              <div className="text-4xl font-bold text-gray-800 mb-2">25+</div>
              <div className="text-lg text-gray-600">Anos de Experiência</div>
            </div>
            <div className="p-8">
              <Building className="w-12 h-12 mx-auto mb-4 text-gray-800" />
              <div className="text-4xl font-bold text-gray-800 mb-2">150+</div>
              <div className="text-lg text-gray-600">Empreendimentos Entregues</div>
            </div>
            <div className="p-8">
              <Users className="w-12 h-12 mx-auto mb-4 text-gray-800" />
              <div className="text-4xl font-bold text-gray-800 mb-2">5000+</div>
              <div className="text-lg text-gray-600">Famílias Atendidas</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-gray-900 to-black text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-6">
            Pronto para Realizar seu Sonho?
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90">
            Entre em contato conosco e descubra como podemos ajudar você a 
            encontrar o empreendimento perfeito para sua família.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-white text-black hover:bg-gray-100">
              <Link to="/contact">
                Solicitar Informações
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-black">
              <Link to="/client-area">
                Área do Cliente
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
