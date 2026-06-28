/** English API + DB — tắt bằng ENGLISH_ENABLED=false (mặc định Docker Nihongo). */
export function isEnglishEnabled(): boolean {
  const value = process.env.ENGLISH_ENABLED;
  return value !== 'false' && value !== '0';
}
