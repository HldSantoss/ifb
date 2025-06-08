
import { MapPin, Calendar } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface PropertyCardProps {
  property: {
    id: string;
    title: string;
    description: string;
    location: string;
    price: string;
    image: string;
    launchDate?: string | null;
  };
}

const PropertyCard = ({ property }: PropertyCardProps) => {
  const formatLaunchDate = (dateString: string | null | undefined) => {
    if (!dateString) return null;
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch (error) {
      return null;
    }
  };

  return (
    <Card className="group hover-scale shadow-lg overflow-hidden">
      <div className="relative">
        <img
          src={property.image}
          alt={property.title}
          className="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </div>
      
      <CardContent className="p-6">
        <h3 className="text-xl font-bold mb-2 group-hover:text-gray-600 transition-colors">
          {property.title}
        </h3>
        
        <p className="text-gray-600 mb-4 line-clamp-3">
          {property.description}
        </p>
        
        <div className="space-y-2">
          <div className="flex items-center text-sm text-gray-500">
            <MapPin className="w-4 h-4 mr-2" />
            {property.location}
          </div>
          
          {property.launchDate && (
            <div className="flex items-center text-sm text-gray-500">
              <Calendar className="w-4 h-4 mr-2" />
              Lançamento: {formatLaunchDate(property.launchDate)}
            </div>
          )}
          
          {property.price && (
            <div className="text-lg font-semibold text-green-600">
              {property.price}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default PropertyCard;
