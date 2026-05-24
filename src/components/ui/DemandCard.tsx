import React from 'react';
import { DemandPost } from '@/types';
import { MapPin, Clock, Phone, Bookmark, BookmarkCheck, Edit, Trash2 } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import Link from 'next/link';

interface DemandCardProps {
  demand: DemandPost;
  hideActions?: boolean;
  showEditDelete?: boolean;
  onEdit?: (demand: DemandPost) => void;
  onDelete?: (demand: DemandPost) => void;
}

const getUrgencyColor = (urgency: string) => {
  switch (urgency) {
    case 'Emergency': return 'bg-red-100 text-red-700';
    case 'High': return 'bg-orange-100 text-orange-700';
    case 'Medium': return 'bg-blue-100 text-blue-700';
    default: return 'bg-emerald-100 text-emerald-700';
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

export const DemandCard: React.FC<DemandCardProps> = ({ 
  demand, 
  hideActions, 
  showEditDelete = false, 
  onEdit, 
  onDelete 
}) => {
  const { savedDemandIds, toggleSaveDemand, role: activeRole } = useAuthStore();
  const isSaved = savedDemandIds.includes(demand.id);
  const isSeller = activeRole === 'seller';

  return (
    <div className="card-premium overflow-hidden flex flex-col p-0">
      <div className="relative h-48 w-full bg-slate-100">
        <img 
          src={demand.images?.[0] || 'https://via.placeholder.com/400x300?text=No+Image'} 
          alt={demand.product_name} 
          className="w-full h-full object-cover"
        />
        <div className="absolute top-4 right-4 flex flex-col gap-2">
          <div className={`px-3 py-1 rounded-full text-xs font-bold shadow-sm ${getUrgencyColor(demand.urgency)}`}>
            {demand.urgency}
          </div>
        </div>
        {isSeller && !hideActions && (
          <button 
            onClick={(e) => {
              e.preventDefault();
              toggleSaveDemand(demand.id);
            }}
            className="absolute top-4 left-4 w-10 h-10 bg-white/90 backdrop-blur rounded-full flex items-center justify-center shadow-sm hover:scale-105 transition-transform"
          >
            {isSaved ? <BookmarkCheck className="text-emerald-600" size={20} /> : <Bookmark className="text-slate-400" size={20} />}
          </button>
        )}
      </div>
      
      <div className="p-5 flex flex-col flex-1">
        <div className="flex justify-between items-start gap-4 mb-2">
          <h3 className="text-lg font-bold text-slate-900 line-clamp-2">
            {demand.title}
          </h3>
          <div className="text-right shrink-0">
            <span className="text-xs text-slate-500 block">Needs</span>
            <span className="font-bold text-emerald-700">{demand.quantity} {demand.unit}</span>
          </div>
        </div>
        
        <p className="text-sm text-slate-500 line-clamp-2 mb-4 flex-1">
          {demand.description}
        </p>
        
        <div className="flex items-center gap-4 text-xs font-medium text-slate-500 mb-5">
          <div className="flex items-center gap-1.5">
            <MapPin size={14} className="text-slate-400" />
            {demand.state}
          </div>
          <div className="flex items-center gap-1.5">
            <Clock size={14} className="text-slate-400" />
            {formatTimeAgo(demand.created_at)}
          </div>
        </div>
        
        {!hideActions && (
          <div className="pt-4 border-t border-slate-100 flex gap-3">
            <Link href={`/demands/${demand.id}`} className="flex-1 btn-secondary py-3 text-sm text-center">
              View Details
            </Link>
            {isSeller && (
              <a href={`tel:${demand.phone_number}`} className="w-12 flex items-center justify-center bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-100 transition-colors">
                <Phone size={18} />
              </a>
            )}
          </div>
        )}

        {showEditDelete && (
          <div className="pt-4 border-t border-slate-100 flex gap-3">
            <button
              onClick={(e) => {
                e.preventDefault();
                onEdit?.(demand);
              }}
              className="flex-1 h-12 bg-emerald-50 text-emerald-700 rounded-xl hover:bg-emerald-100 transition-colors flex items-center justify-center gap-1.5 font-bold text-sm"
            >
              <Edit size={16} />
              Edit
            </button>
            <button
              onClick={(e) => {
                e.preventDefault();
                onDelete?.(demand);
              }}
              className="px-4 h-12 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors flex items-center justify-center gap-1.5 font-bold text-sm"
            >
              <Trash2 size={16} />
              Delete
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
