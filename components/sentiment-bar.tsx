'use client';

interface SentimentBarProps {
  count: number;
  total: number;
  type: 'positive' | 'neutral' | 'negative';
}

export function SentimentBar({ count, total, type }: SentimentBarProps) {
  const percentage = total > 0 ? (count / total) * 100 : 0;
  
  const colorClass = {
    positive: 'bg-green-500',
    neutral: 'bg-gray-400',
    negative: 'bg-red-500',
  }[type];

  return (
    <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden relative">
      <div
        className={`h-3 rounded-full transition-all absolute top-0 left-0 ${colorClass}`}
        data-percentage={percentage}
      >
        <div className="h-full" data-width={percentage} />
      </div>
      <style dangerouslySetInnerHTML={{
        __html: `
          [data-percentage="${percentage}"] > [data-width] {
            width: ${percentage}%;
          }
        `
      }} />
    </div>
  );
}
