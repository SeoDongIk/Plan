"use client";

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Navigation from '@/components/Navigation';

interface ThumbnailData {
    type: "Thumbnail";
    title: string;
    image_prompt: string;
}

interface CardNewsData {
    type: "CardNews";
    slides: {
        slide_number: number;
        text: string;
        image_prompt: string;
    }[];
}

type CreativeResult = ThumbnailData | CardNewsData;

function CreativeContent() {
    const searchParams = useSearchParams();
    const initialTopic = searchParams.get('topic') || '';

    const [topic, setTopic] = useState(initialTopic);
    const [type, setType] = useState<"Thumbnail" | "CardNews">("Thumbnail");
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<CreativeResult | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Update input when query param changes
    useEffect(() => {
        if (initialTopic) {
            setTopic(initialTopic);
        }
    }, [initialTopic]);

    const handleGenerate = async () => {
        if (!topic) return;

        setLoading(true);
        setError(null);
        setResult(null);

        try {
            const res = await fetch('/api/creative', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ topic, type }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to generate visual assets');

            setResult(data.data as CreativeResult);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const renderThumbnail = (data: ThumbnailData) => {
        // Pollinations.ai requires the prompt to be properly path-encoded.
        // Also adding a random seed so it generates a fresh image and doesn't cache a broken one
        const seed = Math.floor(Math.random() * 10000);
        const encodedPrompt = encodeURIComponent(data.image_prompt);
        const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1280&height=720&nologo=true&seed=${seed}`;

        return (
            <div className="bg-white p-8 rounded-3xl shadow-xl mt-12 animate-fade-in-up border border-gray-100">
                <h2 className="text-2xl font-bold mb-6 text-gray-800 flex items-center gap-2">
                    <span>🎬</span> 유튜브 썸네일 결과
                </h2>

                <div className="relative group rounded-2xl overflow-hidden bg-gray-100 aspect-video shadow-lg mb-6">
                    <img
                        src={imageUrl}
                        alt="Generated Thumbnail"
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-80" />
                    <div className="absolute bottom-0 left-0 p-8 w-full">
                        <h1 className="text-white text-4xl md:text-5xl font-extrabold drop-shadow-2xl leading-tight">
                            {data.title}
                        </h1>
                    </div>
                </div>

                <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                    <h3 className="font-bold text-gray-700 mb-2">프롬프트 페이로드 (Debug)</h3>
                    <p className="text-sm text-gray-500 break-words font-mono">
                        {data.image_prompt}
                    </p>
                </div>
            </div>
        );
    };

    const renderCardNews = (data: CardNewsData) => {
        return (
            <div className="mt-12 animate-fade-in-up">
                <h2 className="text-2xl font-bold mb-6 text-gray-800 flex items-center gap-2 pl-2">
                    <span>📱</span> 인스타그램 카드뉴스 결과
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {data.slides.map((slide, idx) => {
                        const seed = Math.floor(Math.random() * 10000) + idx;
                        const encodedPrompt = encodeURIComponent(slide.image_prompt);
                        const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1080&height=1080&nologo=true&seed=${seed}`;

                        return (
                            <div key={idx} className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden group">
                                <div className="aspect-square bg-gray-100 relative overflow-hidden">
                                    <img
                                        src={imageUrl}
                                        alt={`Slide ${slide.slide_number}`}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                    />
                                    <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md text-white px-3 py-1 rounded-full text-sm font-bold">
                                        {slide.slide_number}/{data.slides.length}
                                    </div>
                                </div>
                                <div className="p-6">
                                    <p className="text-gray-800 font-bold text-lg leading-relaxed mb-4 whitespace-pre-wrap">
                                        {slide.text}
                                    </p>
                                    <div className="bg-gray-50 p-4 rounded-xl text-xs text-gray-500 font-mono break-words border border-gray-100">
                                        {slide.image_prompt}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-[#f5f5f5] text-black pb-20">
            <Navigation />

            <main className="max-w-6xl mx-auto p-8 mt-24">
                <header className="mb-10 text-center">
                    <h1 className="text-4xl font-extrabold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600 drop-shadow-sm">
                        Visual Asset Studio
                    </h1>
                    <p className="text-gray-600 text-lg">
                        단 하나의 클릭으로 유튜브 썸네일과 인스타그램 카드뉴스를 완성하세요.
                    </p>
                </header>

                <section className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100 mb-8 max-w-3xl mx-auto">
                    <div className="flex flex-col gap-6">

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">콘텐츠 주제 (Topic)</label>
                            <input
                                type="text"
                                value={topic}
                                onChange={(e) => setTopic(e.target.value)}
                                placeholder="예: AI로 자동화하는 블로그 작성법"
                                className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-purple-500 focus:outline-none transition-all"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">콘텐츠 포맷 (Format)</label>
                            <div className="flex gap-4">
                                <button
                                    type="button"
                                    onClick={() => setType("Thumbnail")}
                                    className={`flex-1 py-4 px-6 rounded-2xl font-bold transition-all border-2 ${type === "Thumbnail"
                                        ? "border-purple-600 bg-purple-50 text-purple-700"
                                        : "border-gray-100 bg-white text-gray-500 hover:bg-gray-50"
                                        }`}
                                >
                                    🎬 유튜브 썸네일
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setType("CardNews")}
                                    className={`flex-1 py-4 px-6 rounded-2xl font-bold transition-all border-2 ${type === "CardNews"
                                        ? "border-pink-600 bg-pink-50 text-pink-700"
                                        : "border-gray-100 bg-white text-gray-500 hover:bg-gray-50"
                                        }`}
                                >
                                    📱 인스타 카드뉴스
                                </button>
                            </div>
                        </div>

                        <button
                            onClick={handleGenerate}
                            disabled={loading || !topic}
                            className="mt-4 h-[60px] w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-2xl font-extrabold text-lg flex items-center justify-center hover:opacity-90 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed group relative overflow-hidden"
                        >
                            <span className="relative z-10 flex border-b-0 items-center justify-center gap-2">
                                {loading ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        마법을 부리는 중...
                                    </>
                                ) : (
                                    "✨ 에셋 생성하기"
                                )}
                            </span>
                        </button>
                    </div>
                </section>

                {error && (
                    <div className="bg-red-50 text-red-600 p-6 rounded-2xl mb-8 border border-red-100 items-center justify-center flex font-bold shadow-sm max-w-3xl mx-auto">
                        ⚠️ {error}
                    </div>
                )}

                {/* Results */}
                {result && result.type === "Thumbnail" && renderThumbnail(result as ThumbnailData)}
                {result && result.type === "CardNews" && renderCardNews(result as CardNewsData)}

            </main>
        </div>
    );
}

export default function CreativePage() {
    return (
        <React.Suspense fallback={<div className="min-h-screen flex items-center justify-center p-8 bg-[#f5f5f5]">Loading...</div>}>
            <CreativeContent />
        </React.Suspense>
    );
}
