import React from 'react';
import { DivideIcon as LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle: string;
  icon: LucideIcon;
  color: 'blue' | 'green' | 'orange' | 'red' | 'purple' | 'pink' | 'yellow' | 'gray';
  size?: 'small' | 'medium' | 'large';
}

const colorClasses = {
  blue: 'bg-blue-100 text-blue-700 border-blue-200',
  green: 'bg-green-100 text-green-700 border-green-200',
  orange: 'bg-orange-100 text-orange-700 border-orange-200',
  red: 'bg-red-100 text-red-700 border-red-200',
  purple: 'bg-purple-100 text-purple-700 border-purple-200',
  pink: 'bg-pink-100 text-pink-700 border-pink-200',
  yellow: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  gray: 'bg-gray-100 text-gray-700 border-gray-200',
};

const iconColorClasses = {
  blue: 'bg-blue-600 text-white',
  green: 'bg-green-600 text-white',
  orange: 'bg-orange-600 text-white',
  red: 'bg-red-600 text-white',
  purple: 'bg-purple-600 text-white',
  pink: 'bg-pink-600 text-white',
  yellow: 'bg-yellow-600 text-white',
  gray: 'bg-gray-600 text-white',
};

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  color,
  size = 'medium',
}) => {
  const sizeClasses = {
    small: 'p-4',
    medium: 'p-6',
    large: 'p-8',
  };

  return (
    <div className={`${colorClasses[color]} rounded-xl border ${sizeClasses[size]} hover:shadow-md transition-shadow`}>
      <div className="flex items-center space-x-4">
        <div className={`w-12 h-12 rounded-full ${iconColorClasses[color]} flex items-center justify-center flex-shrink-0`}>
          <Icon className="w-6 h-6" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
          <p className="text-sm font-medium text-gray-700">{title}</p>
          <p className="text-sm text-gray-600">{subtitle}</p>
        </div>
      </div>
    </div>
  );
};

export default MetricCard;