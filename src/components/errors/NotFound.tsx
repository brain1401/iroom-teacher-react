export function NotFound() {
  return (
    <div className="flex-1 p-6 text-center">
      <h1 className="text-2xl font-bold">찾을 수 없는 페이지</h1>
      <p className="text-sm text-muted-foreground mt-2">
        요청한 페이지가 존재하지 않음
      </p>
      <a href="/" className="mt-4 inline-block text-blue-600 hover:underline">
        홈으로
      </a>
    </div>
  );
}
