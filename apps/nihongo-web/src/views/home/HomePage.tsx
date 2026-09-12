'use client';

import { useHomePageQuery } from '../../hooks/queries';
import HomeFeatureSection from './HomeFeatureSection';
import HomeGoalBanner from './HomeGoalBanner';
import HomeHero from './HomeHero';
import HomeSrsWidget from './HomeSrsWidget';
import HomeStats from './HomeStats';
import HomeWordOfDay from './HomeWordOfDay';

export default function HomePage() {
  const { data, isLoading, isError } = useHomePageQuery();
  const stats = data?.stats ?? [];
  const sections = data?.sections ?? [];

  return (
    <div className="home-page">
      <HomeHero />

      <HomeGoalBanner />

      {/* SRS due today + Word of the day — nằm dưới hero, trên stats */}
      <div className="home-widgets">
        <HomeSrsWidget />
        <HomeWordOfDay />
      </div>

      {isLoading ? (
        <div className="home-loading">
          <div className="skeleton" style={{ height: 60, borderRadius: 12, marginBottom: 12 }} />
          <div className="skeleton" style={{ height: 200, borderRadius: 12 }} />
        </div>
      ) : isError ? (
        <p className="home-loading">Không tải được nội dung trang chủ.</p>
      ) : (
        <>
          <HomeStats stats={stats} />
          {sections.map((section) => (
            <HomeFeatureSection key={section.id} section={section} />
          ))}
        </>
      )}
    </div>
  );
}
