import Link from 'next/link';

export default function Navigation() {
  return (
    <nav className="fixed top-0 left-0 w-full bg-white/80 backdrop-blur-md border-b border-gray-100 z-50">
      <div className="max-w-6xl mx-auto px-8 h-16 flex items-center justify-between">
        <div className="font-extrabold text-xl bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
          AI Content OS
        </div>
        <div className="flex gap-6">
          <Link
            href="/"
            className="text-gray-600 hover:text-black font-medium transition-colors"
          >
            본문 생성기 (Generator)
          </Link>
          <Link
            href="/extractor"
            className="text-gray-600 hover:text-black font-medium transition-colors"
          >
            주제 추출기 (Topic Extractor)
          </Link>
          <Link
            href="/creative"
            className="text-gray-600 hover:text-black font-medium transition-colors"
          >
            이미지 스튜디오 (Creative)
          </Link>
        </div>
      </div>
    </nav>
  );
}
