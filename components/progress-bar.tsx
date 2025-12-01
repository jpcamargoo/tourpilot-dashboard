'use client';

interface ProgressBarProps {
  value: number;
  max?: number;
  className?: string;
}

export function ProgressBar({ value, max = 100, className = '' }: ProgressBarProps) {
  const percentage = Math.min(100, (value / max) * 100);
  
  return (
    <div className={`w-full bg-gray-200 rounded-full h-2 overflow-hidden ${className}`}>
      <div
        className={`h-2 rounded-full transition-all ${
          percentage >= 80
            ? 'bg-green-500'
            : percentage >= 50
            ? 'bg-yellow-500'
            : 'bg-red-500'
        }`}
        data-percentage={percentage.toFixed(2)}
      >
        <div className="h-full" data-width={percentage} />
      </div>
      <style dangerouslySetInnerHTML={{
        __html: `
          [data-percentage="${percentage.toFixed(2)}"] > [data-width] {
            width: ${percentage}%;
          }
        `
      }} />
    </div>
  );
}
