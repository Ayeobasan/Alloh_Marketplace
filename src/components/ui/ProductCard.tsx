import React, { memo } from 'react';
import { Product } from '@/types';
import { MapPin, Clock, Edit, Trash2, ShieldAlert } from 'lucide-react';
import { formatCurrency } from '@/utils/format';
import Link from 'next/link';

interface ProductCardProps {
  product: Product;
  showEditDelete?: boolean;
  onEdit?: (product: Product) => void;
  onDelete?: (product: Product) => void;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'Active':
      return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    case 'Pending':
      return 'bg-amber-100 text-amber-700 border-amber-200';
    case 'Rejected':
      return 'bg-rose-100 text-rose-700 border-rose-200';
    default:
      return 'bg-slate-100 text-slate-700 border-slate-200';
  }
};

const formatTimeAgo = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInHours = Math.abs(now.getTime() - date.getTime()) / 3600000;
  
  if (diffInHours < 1) return 'Just now';
  if (diffInHours < 24) return `${Math.floor(diffInHours)}h ago`;
  return `${Math.floor(diffInHours / 24)}d ago`;
};

export const ProductCard: React.FC<ProductCardProps> = memo(({ 
  product, 
  showEditDelete = false, 
  onEdit, 
  onDelete 
}) => {
  return (
    <div className="card-premium overflow-hidden flex flex-col p-0 border border-slate-100 hover:shadow-lg transition-shadow duration-300">
      <div className="relative h-48 w-full bg-slate-50">
        <img 
          src={product.images?.[0] || 'https://images.unsplash.com/photo-1615811361523-6bd03d7748e7?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3'} 
          alt={product.product_name} 
          className="w-full h-full object-cover"
          loading="lazy"
        />
        
        {/* Status indicator badge (Always visible to owner) */}
        <div className="absolute top-4 right-4 flex flex-col gap-2">
          <span className={`px-2.5 py-1 rounded-full text-xs font-bold shadow-sm border ${getStatusColor(product.status)}`}>
            {product.status}
          </span>
        </div>
      </div>
      
      <div className="p-5 flex flex-col flex-1">
        <div className="flex justify-between items-start gap-4 mb-2">
          <h3 className="text-lg font-bold text-slate-900 line-clamp-1">
            {product.product_name}
          </h3>
          <div className="text-right shrink-0">
            <span className="text-xl font-extrabold text-emerald-600 block">
              {formatCurrency(product.price)}
            </span>
            <span className="text-[10px] text-slate-400 block font-semibold uppercase">
              per {product.unit}
            </span>
          </div>
        </div>

        {product.status === 'Pending' && (
          <div className="mb-3 px-3 py-1.5 bg-amber-50 text-amber-700 text-xs rounded-lg font-medium flex items-center gap-1">
            <span>Your product is under review.</span>
          </div>
        )}

        {product.status === 'Rejected' && product.rejection_reason && (
          <div className="mb-3 p-2.5 bg-rose-50 text-rose-700 text-xs rounded-lg font-medium border border-rose-100">
            <div className="flex items-center gap-1 font-bold mb-0.5">
              <ShieldAlert size={14} className="shrink-0" />
              <span>Rejected:</span>
            </div>
            <p className="line-clamp-2 text-slate-600 font-normal leading-relaxed">
              {product.rejection_reason}
            </p>
          </div>
        )}
        
        <p className="text-sm text-slate-500 line-clamp-2 mb-4 flex-1 leading-relaxed">
          {product.description}
        </p>

        <div className="flex items-center justify-between text-xs font-medium text-slate-400 mb-4">
          <div className="flex items-center gap-1">
            <MapPin size={14} className="text-slate-400" />
            <span>{product.state}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock size={14} className="text-slate-400" />
            <span>{formatTimeAgo(product.created_at)}</span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-slate-100 mt-auto">
          <div className="flex items-center gap-2">
            {product.user && (
              <>
                <div className="w-6 h-6 rounded-full bg-slate-100 overflow-hidden shrink-0 border border-slate-200">
                  <img 
                    src={product.user.avatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${product.user.fullname || 'alloh'}`} 
                    alt={product.user.fullname} 
                    className="w-full h-full object-cover" 
                  />
                </div>
                <span className="text-xs font-semibold text-slate-700 line-clamp-1">
                  {product.user.fullname || 'Seller'}
                </span>
              </>
            )}
            {!product.user && (
              <span className="text-xs text-slate-400">Available Stock: {product.quantity}</span>
            )}
          </div>
          <span className="text-xs font-bold text-slate-500">
            Qty: {product.quantity} {product.unit}s
          </span>
        </div>

        {/* Owner actions bar */}
        {showEditDelete && (
          <div className="flex gap-2 mt-4 pt-3 border-t border-slate-100">
            <button
              onClick={() => onEdit?.(product)}
              className="flex-1 py-2 px-3 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition-colors border border-slate-200"
            >
              <Edit size={14} />
              {product.status === 'Rejected' ? 'Edit & Resubmit' : 'Edit Listing'}
            </button>
            <button
              onClick={() => onDelete?.(product)}
              className="py-2 px-3 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition-colors border border-red-100 shrink-0"
            >
              <Trash2 size={14} />
            </button>
          </div>
        )}

        {!showEditDelete && (
          <div className="mt-4">
            <Link 
              href={`/products/${product.id}`} 
              className="w-full inline-flex justify-center items-center py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-emerald-50"
            >
              View Product Details
            </Link>
          </div>
        )}
      </div>
    </div>
  );
});

ProductCard.displayName = 'ProductCard';

export const ProductCardSkeleton: React.FC = () => {
  return (
    <div className="card-premium overflow-hidden flex flex-col p-0 border border-slate-100 animate-pulse">
      <div className="h-48 w-full bg-slate-200" />
      <div className="p-5 flex flex-col flex-1 space-y-4">
        <div className="flex justify-between items-start gap-4">
          <div className="h-5 bg-slate-200 rounded w-1/2" />
          <div className="h-5 bg-slate-200 rounded w-1/3" />
        </div>
        <div className="space-y-2 flex-1">
          <div className="h-4 bg-slate-200 rounded w-full" />
          <div className="h-4 bg-slate-200 rounded w-5/6" />
        </div>
        <div className="flex items-center justify-between pt-4 border-t border-slate-100 mt-auto">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-slate-200" />
            <div className="h-3 bg-slate-200 rounded w-16" />
          </div>
          <div className="h-3 bg-slate-200 rounded w-12" />
        </div>
      </div>
    </div>
  );
};
