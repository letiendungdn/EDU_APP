'use client';

import type { HomeStat } from './types';

type HomeStatsProps = {
  stats: HomeStat[];
};

export default function HomeStats({ stats }: HomeStatsProps) {
  return (
    <div className="home-stats">
      {stats.map((stat) => (
        <div key={stat.label} className="home-stat">
          <div className="home-stat__value">
            {stat.value}
            <span style={{ fontSize: '1rem', opacity: 0.6 }}>{stat.suffix}</span>
          </div>
          <div className="home-stat__label">{stat.label}</div>
        </div>
      ))}
    </div>
  );
}
