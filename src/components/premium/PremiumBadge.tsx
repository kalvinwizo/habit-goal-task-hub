/**
 * PremiumBadge - Shows premium feature indicator
 */

import { Crown, Lock } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface PremiumBadgeProps {
  feature: string;
  size?: 'sm' | 'md';
  showLock?: boolean;
}

export function PremiumBadge({ feature, size = 'sm', showLock = false }: PremiumBadgeProps) {
  const iconSize = size === 'sm' ? 'w-3 h-3' : 'w-4 h-4';
  
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-400/20 to-orange-500/20 text-amber-600 dark:text-amber-400 ${size === 'sm' ? 'text-[10px]' : 'text-xs'}`}>
          {showLock ? (
            <Lock className={iconSize} />
          ) : (
            <Crown className={iconSize} />
          )}
          Premium
        </span>
      </TooltipTrigger>
      <TooltipContent>
        <p>{feature} is a premium feature</p>
      </TooltipContent>
    </Tooltip>
  );
}
