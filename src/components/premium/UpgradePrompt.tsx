/**
 * UpgradePrompt - Non-intrusive upgrade prompt component
 * 
 * Shows when user hits free tier limits
 */

import { Crown, Sparkles, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { FREE_LIMITS, PREMIUM_FEATURES } from '@/hooks/usePremium';

interface UpgradePromptProps {
  type: 'habit' | 'goal';
  current: number;
  onDismiss?: () => void;
}

export function UpgradePrompt({ type, current, onDismiss }: UpgradePromptProps) {
  const limit = type === 'habit' ? FREE_LIMITS.habits : FREE_LIMITS.goals;
  const isAtLimit = current >= limit;

  if (!isAtLimit) return null;

  return (
    <div className="glass-card p-4 mb-4 relative overflow-hidden slide-up">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/20 to-transparent rounded-full blur-2xl -mr-10 -mt-10" />
      
      {/* Dismiss button */}
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="absolute top-3 right-3 p-1.5 rounded-full hover:bg-muted/50 transition-colors"
          aria-label="Dismiss"
        >
          <X className="w-4 h-4 text-muted-foreground" />
        </button>
      )}

      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg">
            <Crown className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-sm">Upgrade to Premium</h3>
            <p className="text-xs text-muted-foreground">
              You've reached the free limit of {limit} {type}s
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            {PREMIUM_FEATURES.unlimitedHabits}
          </span>
          <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            {PREMIUM_FEATURES.advancedAnalytics}
          </span>
        </div>

        <Link to="/premium">
          <Button className="w-full" size="sm">
            <Crown className="w-4 h-4 mr-2" />
            View Premium Features
          </Button>
        </Link>
      </div>
    </div>
  );
}
