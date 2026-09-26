'use client';

import Link from 'next/link';
import { Suspense } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import type { JlptTextbookSeries } from '@/data/jlpt-textbooks';
import { useTextbookCatalog } from '@/hooks/useTextbookCatalog';

/** Trang /textbooks mặc định mở Sou Matome khi URL chưa có ?series= */
const DEFAULT_SERIES: JlptTextbookSeries = 'SOUMATOME';

type Props = { compact?: boolean; onClick?: () => void };

function Items({ compact, onClick, series, level }: Props & { series: string | null; level: string | null }) {
  const pathname = usePathname() ?? '';
  const onTextbooks = pathname === '/textbooks';
  const activeSeries = onTextbooks ? (series?.toUpperCase() ?? DEFAULT_SERIES) : null;
  const activeLevel = level?.toUpperCase() ?? null;
  // Tên, icon, thứ tự và các cấp có lộ trình đều lấy từ DB (TextbookSeries)
  const { data: catalog } = useTextbookCatalog();

  return (
    <>
      {(catalog?.series ?? []).map((meta) => {
        const s = meta.code;
        const icon = meta.icon;
        const key = s.toLowerCase();
        const isActive = activeSeries === s;
        return (
          <div key={s} className="nav-book">
            <Link
              href={`/textbooks?series=${key}`}
              className={`nav-item${isActive ? ' active' : ''}`}
              onClick={onClick}
              title={compact ? meta.name : undefined}
            >
              <span className="nav-item__icon">{icon}</span>
              <span className="nav-item__label">{meta.name}</span>
            </Link>
            {!compact && (
              <div className="nav-book__levels" aria-label={`${meta.name} theo cấp`}>
                {meta.planLevels.map((lv) => (
                  <Link
                    key={lv}
                    href={`/textbooks?series=${key}&level=${lv.toLowerCase()}`}
                    className={`nav-book__level${isActive && activeLevel === lv ? ' active' : ''}`}
                    onClick={onClick}
                  >
                    {lv}
                  </Link>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </>
  );
}

function ItemsWithParams(props: Props) {
  const params = useSearchParams();
  return <Items {...props} series={params?.get('series') ?? null} level={params?.get('level') ?? null} />;
}

/** Nhóm menu "Giáo trình": mỗi bộ sách + nút cấp N5–N1 (chỉ các cấp sách có). */
export default function TextbookNavItems(props: Props) {
  // useSearchParams trong layout cần Suspense; fallback vẫn hiện đủ menu, chỉ chưa tô mục đang chọn.
  return (
    <Suspense fallback={<Items {...props} series={null} level={null} />}>
      <ItemsWithParams {...props} />
    </Suspense>
  );
}
