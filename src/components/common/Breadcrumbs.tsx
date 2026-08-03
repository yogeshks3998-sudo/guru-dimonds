import React from 'react';
import { navigateTo } from '../../utils/navigation';
import { ChevronRight, Home } from 'lucide-react';

export interface BreadcrumbItem {
  label: string;
  path?: string;
  action?: () => void;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items }) => {
  return (
    <nav aria-label="Breadcrumb" className="py-2.5 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <ol className="flex items-center flex-wrap gap-1.5 text-[11px] font-medium text-[#796A65]">
        <li>
          <button
            onClick={() => navigateTo('/')}
            className="flex items-center gap-1 hover:text-[#7A1822] transition-colors focus:outline-none"
          >
            <Home className="w-3.5 h-3.5 text-[#B8893D]" />
            <span>Home</span>
          </button>
        </li>
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={index} className="flex items-center gap-1.5">
              <ChevronRight className="w-3 h-3 text-[#E9D9C5]" />
              {isLast || (!item.path && !item.action) ? (
                <span className="font-semibold text-[#281C18] truncate max-w-[180px] sm:max-w-xs">
                  {item.label}
                </span>
              ) : (
                <button
                  onClick={() => {
                    if (item.action) item.action();
                    else if (item.path) navigateTo(item.path);
                  }}
                  className="hover:text-[#7A1822] hover:underline transition-colors focus:outline-none"
                >
                  {item.label}
                </button>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};
