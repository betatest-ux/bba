import React from 'react'

import type { StatRowBlock as StatRowBlockProps } from '@/payload-types'

import { CountUp } from '@/components/Motion/CountUp'
import { Reveal } from '@/components/Motion/Reveal'
import { cn } from '@/utilities/ui'

export const StatRowBlock: React.FC<StatRowBlockProps> = ({ background, heading, stats }) => {
  const isDark = background === 'dark'

  return (
    <section
      className={cn(
        'py-14 md:py-20',
        background === 'tint' && 'bg-secondary',
        isDark && 'bg-loom text-white',
      )}
    >
      <div className="container">
        {heading && (
          <Reveal>
            <h2 className="text-h2 mb-10 text-center">{heading}</h2>
          </Reveal>
        )}
        <ul
          className={cn(
            'grid gap-8 text-center list-none p-0',
            (stats?.length ?? 0) >= 4 ? 'grid-cols-2 lg:grid-cols-4' : 'grid-cols-1 sm:grid-cols-3',
          )}
        >
          {(stats || []).map((stat, index) => (
            <Reveal as="li" delay={index * 0.06} key={stat.id ?? index}>
              <p
                className={cn(
                  'font-display text-4xl md:text-5xl font-bold',
                  isDark ? 'text-gold' : 'text-brand',
                )}
              >
                <CountUp prefix={stat.prefix} suffix={stat.suffix} value={stat.value} />
              </p>
              <p className={cn('mt-2 text-base', isDark ? 'text-white/80' : 'text-muted-foreground')}>
                {stat.label}
              </p>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  )
}
