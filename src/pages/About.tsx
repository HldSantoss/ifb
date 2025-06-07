
import { Building2, Users, Target, Eye } from 'lucide-react';

const About = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-r from-gray-900 to-black text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl font-bold mb-6 animate-fade-in">
              Construindo Sonhos há 25 Anos
            </h1>
            <p className="text-xl opacity-90 animate-fade-in">
              Nossa história é construída sobre bases sólidas de qualidade, inovação e confiança
            </p>
          </div>
        </div>
      </section>

      {/* Company Story */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-bold mb-6">Nossa História</h2>
                <p className="text-gray-600 mb-4">
                  Fundada em 1999, a Allure Construct Vista nasceu do sonho de transformar 
                  paisagens urbanas através de empreendimentos que combinam design excepcional 
                  com funcionalidade inteligente.
                </p>
                <p className="text-gray-600 mb-4">
                  Ao longo de mais de duas décadas, entregamos mais de 150 empreendimentos, 
                  sempre mantendo nosso compromisso com a qualidade superior e inovação 
                  arquitetônica.
                </p>
                <p className="text-gray-600">
                  Hoje, somos reconhecidos como uma das principais construtoras da região, 
                  com um portfólio diversificado que inclui residenciais de alto padrão, 
                  comerciais modernos e projetos sustentáveis.
                </p>
              </div>
              <div className="relative">
                <img 
                  src="https://images.unsplash.com/photo-1487958449943-2429e8be8625?auto=format&fit=crop&w=800&h=600" 
                  alt="Construção moderna"
                  className="rounded-lg shadow-xl hover-scale"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission, Vision, Values */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">Nossos Valores</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center p-8 bg-white rounded-lg shadow-lg hover-scale">
                <Target className="w-12 h-12 mx-auto mb-4 text-gray-800" />
                <h3 className="text-xl font-bold mb-4">Missão</h3>
                <p className="text-gray-600">
                  Construir empreendimentos de excelência que superem expectativas, 
                  criando valor para nossos clientes e contribuindo para o desenvolvimento 
                  urbano sustentável.
                </p>
              </div>
              <div className="text-center p-8 bg-white rounded-lg shadow-lg hover-scale">
                <Eye className="w-12 h-12 mx-auto mb-4 text-gray-800" />
                <h3 className="text-xl font-bold mb-4">Visão</h3>
                <p className="text-gray-600">
                  Ser reconhecida como referência nacional em construção civil, 
                  liderando através da inovação, qualidade e responsabilidade 
                  socioambiental.
                </p>
              </div>
              <div className="text-center p-8 bg-white rounded-lg shadow-lg hover-scale">
                <Users className="w-12 h-12 mx-auto mb-4 text-gray-800" />
                <h3 className="text-xl font-bold mb-4">Valores</h3>
                <p className="text-gray-600">
                  Integridade, excelência, inovação, sustentabilidade e compromisso 
                  com a satisfação do cliente são os pilares que guiam todas as 
                  nossas decisões.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Numbers Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-12">Números que Inspiram Confiança</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="text-4xl font-bold text-gray-800 mb-2">25+</div>
                <div className="text-gray-600">Anos de Experiência</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-gray-800 mb-2">150+</div>
                <div className="text-gray-600">Empreendimentos</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-gray-800 mb-2">5000+</div>
                <div className="text-gray-600">Famílias Atendidas</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-gray-800 mb-2">98%</div>
                <div className="text-gray-600">Satisfação</div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
