
import { MapPin, Calendar, Camera } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface PropertyCardProps {
  property: {
    id: number;
    name: string;
    description: string;
    location: string;
    status: string;
    images: string[];
    deliveryDate?: string;
  };
}

const PropertyCard = ({ property }: PropertyCardProps) => {
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'em construção':
        return 'bg-yellow-500';
      case 'entregue':
        return 'bg-green-500';
      case 'em breve':
        return 'bg-blue-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <Card className="group hover-scale shadow-lg overflow-hidden">
      <div className="relative">
        <img
          src={property.images[0]}
          alt={property.name}
          className="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute top-4 left-4">
          <Badge className={`${getStatusColor(property.status)} text-white`}>
            {property.status}
          </Badge>
        </div>
        {property.images.length > 1 && (
          <div className="absolute top-4 right-4 bg-black bg-opacity-50 text-white px-2 py-1 rounded-md flex items-center text-sm">
            <Camera className="w-4 h-4 mr-1" />
            {property.images.length}
          </div>
        )}
      </div>
      
      <CardContent className="p-6">
        <h3 className="text-xl font-bold mb-2 group-hover:text-gray-600 transition-colors">
          {property.name}
        </h3>
        
        <p className="text-gray-600 mb-4 line-clamp-3">
          {property.description}
        </p>
        
        <div className="space-y-2">
          <div className="flex items-center text-sm text-gray-500">
            <MapPin className="w-4 h-4 mr-2" />
            {property.location}
          </div>
          
          {property.deliveryDate && (
            <div className="flex items-center text-sm text-gray-500">
              <Calendar className="w-4 h-4 mr-2" />
              Entrega: {property.deliveryDate}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default PropertyCard;
