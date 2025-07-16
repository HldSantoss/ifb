
import { useState, useEffect } from 'react';
import { ArrowRight, Award, Users, Building, MapPin, ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import PropertyCard from '@/components/PropertyCard';
import { supabase } from '@/integrations/supabase/client';
import useEmblaCarousel from 'embla-carousel-react';
import floorPlan1 from '@/assets/floor-plan-1.png';
import floorPlan2 from '@/assets/floor-plan-2.png';
import certification from '@/assets/certification.png';

interface Empreendimento {
  id: string;
  nome: string;
  descricao: string | null;
  localizacao: string | null;
  preco: number | null;
  imagem_url: string | null;
  status: string;
  created_at: string;
  data_lancamento: string | null;
}

const Index = () => {
  const [empreendimentos, setEmpreendimentos] = useState<Empreendimento[]>([]);
  const [loading, setLoading] = useState(true);
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: 'start' });
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: ''
  });

  useEffect(() => {
    loadEmpreendimentos();
  }, []);

  const loadEmpreendimentos = async () => {
    try {
      setLoading(true);
      console.log('🔄 Carregando empreendimentos...');
      
      const { data, error } = await supabase
        .from('empreendimentos')
        .select('*')
        .order('created_at', { ascending: false });

      console.log('📊 Resposta do Supabase:', { data, error });

      if (error) {
        console.error('❌ Erro ao carregar empreendimentos:', error);
        return;
      }

      console.log('✅ Empreendimentos carregados:', data?.length || 0);
      setEmpreendimentos(data || []);
    } catch (error) {
      console.error('💥 Erro inesperado:', error);
    } finally {
      setLoading(false);
    }
  };

  const scrollPrev = () => emblaApi && emblaApi.scrollPrev();
  const scrollNext = () => emblaApi && emblaApi.scrollNext();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    try {
      const { error } = await supabase
        .from('contatos')
        .insert([{
          nome: formData.name,
          email: formData.email,
          telefone: formData.phone,
          mensagem: 'Contato via formulário'
        }]);

      if (error) throw error;

      alert('Mensagem enviada com sucesso!');
      setFormData({ name: '', email: '', phone: '' });
    } catch (error) {
      alert('Erro ao enviar mensagem. Tente novamente.');
    }
  };

  const getStatusInfo = (status: string) => {
    switch (status.toLowerCase()) {
      case 'lançamento':
        return { text: 'lançamento', bg: 'bg-black hover:bg-gray-800' };
      case 'em obra':
        return { text: 'em obra', bg: 'bg-black hover:bg-gray-800' };
      case 'pronto para morar':
        return { text: 'pronto para morar', bg: 'bg-black hover:bg-gray-800' };
      default:
        return { text: 'em obra', bg: 'bg-black hover:bg-gray-800' };
    }
  };

  // Convert empreendimentos to the format expected by PropertyCard
  const properties = empreendimentos.map(emp => ({
    id: emp.id,
    title: emp.nome,
    location: emp.localizacao || 'Localização não informada',
    price: '', // Removed price display
    image: emp.imagem_url || '/lovable-uploads/7477db64-59a1-41c0-9e27-d1fae676b2ec.png',
    description: emp.descricao || 'Descrição não disponível',
    launchDate: emp.data_lancamento,
    status: emp.status
  }));

  console.log('🏠 Properties finais:', properties);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section with Banner */}
      <section className="relative h-screen bg-white overflow-hidden -mt-20">
        <img 
          src="/lovable-uploads/fb4fe2ed-59f1-4b9e-a1e4-96a07f899514.png" 
          alt="Banner IFB Incorporadora" 
          className="w-full h-full object-contain"
        />
      </section>

      {/* Properties Section with Carousel */}
      <section className="py-20 bg-white mb-8">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Nossos Lançamentos
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Descubra projetos exclusivos que combinam arquitetura inovadora, 
              localização privilegiada e qualidade superior em cada detalhe.
            </p>
          </div>
          
          {loading ? (
            <div className="text-center py-12">
              <p className="text-gray-600 text-lg">Carregando empreendimentos...</p>
            </div>
          ) : properties.length > 0 ? (
            <div className="relative">
              <div className="overflow-hidden" ref={emblaRef}>
                <div className="flex">
                  {properties.map((property, index) => {
                    const statuses = ['lançamento', 'em obra', 'pronto para morar'];
                    const status = statuses[index % 3];
                    
                    return (
                      <div key={property.id} className="flex-[0_0_100%] md:flex-[0_0_50%] lg:flex-[0_0_33.33%] xl:flex-[0_0_25%] min-w-0 px-4">
                        <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
                          <div className="relative">
                            <img 
                              src={property.image} 
                              alt={property.title}
                              className="w-full h-48 object-cover"
                            />
                          </div>
                          <div className="p-6">
                            <span className="text-white text-sm mb-4 bg-black transition-transform duration-300 p-2 rounded inline-block hover:bg-gray-800">
                              {status}
                            </span>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">{property.title}</h3>
                            <div className="flex items-center text-gray-600 mb-4">
                              <MapPin className="w-4 h-4 mr-1 text-red-500" />
                              <span className="text-sm">{property.location}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              
              {/* Carousel Controls */}
              <button 
                onClick={scrollPrev}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black text-white p-2 rounded-full hover:bg-gray-800 transition-colors z-10"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button 
                onClick={scrollNext}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black text-white p-2 rounded-full hover:bg-gray-800 transition-colors z-10"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-600 text-lg mb-4">
                Nenhum empreendimento encontrado.
              </p>
            </div>
          )}
          
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

      {/* Nossos Padrões Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Nossos Padrões
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Plantas inteligentes pensadas para o seu conforto.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-12 max-w-6xl mx-auto">
            <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow duration-300">
              <img 
                src={floorPlan1} 
                alt="Planta humanizada 1-2 dormitórios"
                className="w-full h-64 object-contain mb-6"
              />
              <h3 className="text-2xl font-bold text-gray-900 mb-4 text-center">1 e 2 Dormitórios</h3>
              <p className="text-gray-600 text-center">Espaços otimizados com design inteligente para máximo conforto e funcionalidade.</p>
            </div>
            
            <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow duration-300">
              <img 
                src={floorPlan2} 
                alt="Planta humanizada 2-3 dormitórios"
                className="w-full h-64 object-contain mb-6"
              />
              <h3 className="text-2xl font-bold text-gray-900 mb-4 text-center">2 e 3 Dormitórios</h3>
              <p className="text-gray-600 text-center">Ambientes amplos e versáteis, perfeitos para famílias que buscam qualidade de vida.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-black">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Excelência Comprovada
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Mais de duas décadas construindo sonhos e transformando vidas através da arquitetura de qualidade.
            </p>
          </div>
          
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div className="p-8 bg-gray-900 rounded-xl hover:bg-gray-800 transition-colors duration-300">
              <Award className="w-12 h-12 mx-auto mb-4 text-yellow-400" />
              <div className="text-4xl font-bold text-white mb-2">25+</div>
              <div className="text-lg text-gray-300">Anos de Experiência</div>
              <p className="text-sm text-gray-400 mt-2">Tradição e inovação</p>
            </div>
            <div className="p-8 bg-gray-900 rounded-xl hover:bg-gray-800 transition-colors duration-300">
              <Building className="w-12 h-12 mx-auto mb-4 text-blue-400" />
              <div className="text-4xl font-bold text-white mb-2">150+</div>
              <div className="text-lg text-gray-300">Empreendimentos Entregues</div>
              <p className="text-sm text-gray-400 mt-2">Qualidade garantida</p>
            </div>
            <div className="p-8 bg-gray-900 rounded-xl hover:bg-gray-800 transition-colors duration-300">
              <Users className="w-12 h-12 mx-auto mb-4 text-green-400" />
              <div className="text-4xl font-bold text-white mb-2">5000+</div>
              <div className="text-lg text-gray-300">Famílias Atendidas</div>
              <p className="text-sm text-gray-400 mt-2">Sonhos realizados</p>
            </div>
            <div className="p-8 bg-gray-900 rounded-xl hover:bg-gray-800 transition-colors duration-300">
              <Building className="w-12 h-12 mx-auto mb-4 text-purple-400" />
              <div className="text-4xl font-bold text-white mb-2">+20</div>
              <div className="text-lg text-gray-300">Projetos em Andamento</div>
              <p className="text-sm text-gray-400 mt-2">Futuro em construção</p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Form Section */}
      <section id="contato" className="bg-white text-black py-16">
        <div className="container flex flex-col-reverse sm:flex-row items-center sm:gap-0 gap-12 justify-between px-4 sm:px-56 text-center">
          <div className="flex sm:flex-col gap-10 items-center">
            <img src="/lovable-uploads/33265cf6-499d-4191-a3ba-8586455ad12e.png" alt="logo" className="sm:w-56 sm:h-40 w-28 h-16 object-cover" />
            <img src={certification} alt="certificado" className="sm:w-52 sm:h-12 w-44 h-10 object-cover" />
          </div>
          <div>
            <h2 className="text-3xl font-bold mb-8">Entre em Contato</h2>
            <div className="max-w-lg mx-auto">
              <input
                type="text"
                name="name"
                placeholder="Seu Nome"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full p-3 mb-4 border border-gray-300 rounded"
              />
              <input
                type="email"
                name="email"
                placeholder="Seu E-mail"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full p-3 mb-4 border border-gray-300 rounded"
              />
              <input
                type="tel"
                name="phone"
                placeholder="Seu Telefone"
                value={formData.phone}
                onChange={handleInputChange}
                className="w-full p-3 mb-4 border border-gray-300 rounded"
              />
              <button
                onClick={handleSubmit}
                className="w-full bg-black text-white py-3 rounded-lg font-semibold hover:bg-gray-800"
              >
                Enviar
              </button>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};

export default Index;
