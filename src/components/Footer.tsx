
import { MapPin, Phone, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-black text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Logo and Description */}
          <div className="md:col-span-2">
            <div className="mb-4">
              <img 
                src="/lovable-uploads/33265cf6-499d-4191-a3ba-8586455ad12e.png" 
                alt="IFB Incorporadora" 
                className="h-8 w-auto"
              />
            </div>
            <p className="text-gray-300 mb-4 max-w-md">
              Construindo sonhos há 25 anos. Especializados em empreendimentos 
              residenciais e comerciais de alto padrão com design moderno e 
              sustentabilidade.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Links Rápidos</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-300 hover:text-white transition-colors">
                  Início
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-gray-300 hover:text-white transition-colors">
                  Sobre Nós
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-gray-300 hover:text-white transition-colors">
                  Fale Conosco
                </Link>
              </li>
              <li>
                <Link to="/client-area" className="text-gray-300 hover:text-white transition-colors">
                  Área do Cliente
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contato</h3>
            <ul className="space-y-3">
              <li className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-gray-400" />
                <p className="text-gray-300 text-sm">contato@ifbincorporadora.com.br</p>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center">
          <p className="text-gray-400 text-sm">
            © 2024 IFB Incorporadora. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
