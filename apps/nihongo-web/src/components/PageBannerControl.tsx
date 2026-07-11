'use client';

import { useState } from 'react';
import { readBannerImageFile, type BannerScope } from '../utils/pageBanner';
import { usePageBanner } from '../hooks/usePageBanner';
import './PageBannerControl.css';

export default function PageBannerControl() {
  const { bannerUrl, setBanner, removeBanner, pathname, isAdmin } = usePageBanner();
  const [open, setOpen] = useState(false);
  const [scope, setScope] = useState<BannerScope>('page');
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  if (!isAdmin) return null;

  const onPickFile = async (file: File | null) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Vui lòng chọn file ảnh (JPG, PNG, WebP…).');
      return;
    }

    setBusy(true);
    setError('');
    try {
      const dataUrl = await readBannerImageFile(file);
      setPreview(dataUrl);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Không xử lý được ảnh.');
    } finally {
      setBusy(false);
    }
  };

  const onApply = async () => {
    if (!preview) {
      setError('Hãy chọn ảnh trước khi áp dụng.');
      return;
    }
    setBusy(true);
    setError('');
    try {
      await setBanner(preview, scope);
      setPreview(null);
      setOpen(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Không lưu được banner.');
    } finally {
      setBusy(false);
    }
  };

  const onClear = async () => {
    setBusy(true);
    setError('');
    try {
      await removeBanner(scope === 'global' ? 'global' : 'page');
      setPreview(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Không xóa được banner.');
    } finally {
      setBusy(false);
    }
  };

  const onClearAll = async () => {
    setBusy(true);
    setError('');
    try {
      await removeBanner('all');
      setPreview(null);
      setOpen(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Không xóa được banner.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="page-banner-control">
      <button
        type="button"
        className="page-banner-control__toggle"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label="Đổi ảnh nền trang"
        title="Đổi ảnh nền (admin)"
      >
        🖼️
      </button>

      {open && (
        <div className="page-banner-control__panel glass-panel" role="dialog" aria-label="Cài đặt ảnh nền">
          <div className="page-banner-control__header">
            <h3>Ảnh nền trang</h3>
            <button type="button" className="btn-ghost" onClick={() => setOpen(false)} aria-label="Đóng">
              ✕
            </button>
          </div>

          <p className="page-banner-control__path">Trang hiện tại: <code>{pathname}</code></p>

          <div
            className="page-banner-control__preview"
            style={
              (preview || bannerUrl)
                ? { backgroundImage: `url("${preview || bannerUrl}")` }
                : undefined
            }
          >
            {!preview && !bannerUrl && <span>Chưa có ảnh nền</span>}
          </div>

          <label className="page-banner-control__upload btn-outline">
            {busy ? 'Đang xử lý…' : 'Chọn ảnh từ máy'}
            <input
              type="file"
              accept="image/*"
              hidden
              disabled={busy}
              onChange={(e) => void onPickFile(e.target.files?.[0] ?? null)}
            />
          </label>

          <fieldset className="page-banner-control__scope">
            <legend>Áp dụng cho</legend>
            <label>
              <input
                type="radio"
                name="banner-scope"
                checked={scope === 'global'}
                onChange={() => setScope('global')}
              />
              <span>Tất cả các trang</span>
            </label>
            <label>
              <input
                type="radio"
                name="banner-scope"
                checked={scope === 'page'}
                onChange={() => setScope('page')}
              />
              <span>Chỉ trang này</span>
            </label>
          </fieldset>

          {error && <p className="page-banner-control__error">{error}</p>}

          <div className="page-banner-control__actions">
            <button type="button" className="btn-primary" onClick={() => void onApply()} disabled={busy || !preview}>
              Áp dụng
            </button>
            <button type="button" className="btn-outline" onClick={() => void onClear()} disabled={busy}>
              Xóa {scope === 'global' ? 'nền chung' : 'nền trang này'}
            </button>
            <button type="button" className="btn-ghost" onClick={() => void onClearAll()} disabled={busy}>
              Xóa tất cả
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
