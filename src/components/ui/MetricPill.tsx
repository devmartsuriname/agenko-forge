import { useCountUp } from '@/hooks/useCountUp';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface MetricPillProps {
  value: number;
  label: string;
  prefix?: string;
  suffix?: string;
  delta?: number;
  deltaLabel?: string;
  color?: 'primary' | 'green' | 'blue' | 'purple' | 'orange';
  size?: 'sm' | 'md' | 'lg';
  trigger?: boolean;
  className?: string;
}

export function MetricPill({
  value,
  label,
  prefix = '',
  suffix = '',
  delta,
  deltaLabel,
  color = 'primary',
  size = 'md',
  trigger = true,
  className,
}: MetricPillProps) {
  const countUpValue = useCountUp({
    end: value,
    duration: 1.5,
    prefix,
    suffix,
    trigger,
  });

  const deltaCountUp = useCountUp({
    end: delta || 0,
    duration: 1.8,
    prefix: delta && delta > 0 ? '+' : '',
    suffix: '%',
    trigger: trigger && delta !== undefined,
  });

  const colorClasses = {
    primary: 'bg-primary/10 text-primary border-primary/20',
    green: 'bg-green-500/10 text-green-600 border-green-500/20',
    blue: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
    purple: 'bg-purple-500/10 text-purple-600 border-purple-500/20',
    orange: 'bg-orange-500/10 text-orange-600 border-orange-500/20',
  };

  const sizeClasses = {
    sm: 'px-3 py-2',
    md: 'px-4 py-3',
    lg: 'px-6 py-4',
  };

  const textSizeClasses = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
  };

  const labelSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  return (
    <div className={cn(
      "rounded-xl border backdrop-blur-sm",
      "transform transition-all duration-300 hover:scale-105",
      colorClasses[color],
      sizeClasses[size],
      className
    )}>
      <div className="text-center">
        <div className={cn(
          "font-bold mb-1",
          textSizeClasses[size]
        )}>
          {countUpValue}
        </div>
        <div className={cn(
          "text-muted-foreground font-medium",
          labelSizeClasses[size]
        )}>
          {label}
        </div>
        
        {/* Delta indicator */}
        {delta !== undefined && (
          <div className={cn(
            "flex items-center justify-center gap-1 mt-2 pt-2 border-t border-current/10",
            labelSizeClasses[size]
          )}>
            {delta > 0 ? (
              <TrendingUp className="w-3 h-3 text-green-500" />
            ) : (
              <TrendingDown className="w-3 h-3 text-red-500" />
            )}
            <span className={cn(
              "font-medium",
              delta > 0 ? "text-green-600" : "text-red-600"
            )}>
              {deltaCountUp}
            </span>
            {deltaLabel && (
              <span className="text-muted-foreground ml-1">
                {deltaLabel}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}