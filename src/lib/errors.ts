export function errorMessage(
  error: unknown,
  fallback = 'Không thể hoàn tất thao tác. Vui lòng thử lại.',
) {
  return error instanceof Error ? error.message : fallback;
}
