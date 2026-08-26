'use client';

import { useHomePageQuery } from '../../hooks/queries';
import HomeFeatureSection from './HomeFeatureSection';
import HomeHero from './HomeHero';
import HomeStats from './HomeStats';

export default function HomePage() {
  const { data, isLoading, isError } = useHomePageQuery();
  const stats = data?.stats ?? [];
  const sections = data?.sections ?? [];

  return (
    <div className="home-page">
      <HomeHero />
      {isLoading ? (
        <p className="home-loading">Đang tải trang chủ...</p>
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
