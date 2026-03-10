"use client";

import React, { useState } from 'react';
import Navigation from '@/components/Navigation';

interface ExtractedTopic {
  level: number;
  topic: string;
  reasoning: string;
}

export default function ExtractorPage() {
  const [baseKeyword, setBaseKeyword] = useState('AI 업무 자동화');
  const [count, setCount] = useState(5);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ExtractedTopic[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleExtract = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch('/api/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ count, baseKeyword }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to extract topics');

      setResult(data.topics);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const levels = [
    { title: "Level 1 (Viral/Broad)", desc: "유입 극대화, 대중적 호기심 자극", level: 1 },
    { title: "Level 2 (Educational)", desc: "체류 시간 확보, 정보성 튜토리얼", level: 2 },
    { title: "Level 3 (Professional)", desc: "구매/전환 유도, 문제 해결 가이드", level: 3 }
  ];

  return (
    <div className="min-h-screen bg-[#f5f5f5] text-black">
      <Navigation />
      <main className="max-w-6xl mx-auto p-8 mt-24">
        <header className="mb-10 text-center">
          <h1 className="text-4xl font-extrabold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
            Trend-Driven Topic Extractor
          </h1>
          <p className="text-gray-600 text-lg">
            Google 및 YouTube의 실제 트렌드를 분석하여 유입률과 전환율이 극대화된 N개의 주제를 뽑아냅니다.
          </p>
        </header>

        <section className="bg-white p-8 rounded-3xl shadow-xl flex flex-col md:flex-row gap-6 mb-12 items-end justify-center">
          <div className="flex-1 w-full max-w-sm">
            <label className="block text-sm font-bold text-gray-700 mb-2">기본 탐색 키워드 (Base Keyword)</label>
            <input
              type="text"
              value={baseKeyword}
              onChange={(e) => setBaseKeyword(e.target.value)}
              className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:outline-none transition-shadow"
            />
          </div>
          <div className="w-full md:w-32">
            <label className="block text-sm font-bold text-gray-700 mb-2">추출 개수 (N)</label>
            <input
              type="number"
              min="3"
              max="20"
              value={count}
              onChange={(e) => setCount(Number(e.target.value))}
              className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:outline-none transition-shadow"
            />
          </div>
          <button
            onClick={handleExtract}
            disabled={loading}
            className="h-[58px] px-8 bg-black text-white rounded-2xl font-bold hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-[140px]"
          >
            {loading ? (
              <span className="animate-pulse">분석 중...</span>
            ) : (
              "주제 추출 시작"
            )}
          </button>
        </section>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-8 border border-red-100 items-center justify-center flex">
            ⚠️ {error}
          </div>
        )}

        {loading && (
          <div className="text-center py-20">
            <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
            <p className="text-xl font-bold text-gray-700">AI가 트렌드 데이터를 수집하고 계층을 분석 중입니다...</p>
            <p className="text-gray-500 mt-2">이 작업은 최대 20초 정도 소요될 수 있습니다.</p>
          </div>
        )}

        {result && !loading && (
          <div className="space-y-12 animate-fade-in-up">
            {levels.map((lvl) => {
              const matchedTopics = result.filter(item => item.level === lvl.level);
              if (matchedTopics.length === 0) return null;

              return (
                <div key={lvl.level} className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                  <div className="mb-6">
                    <h2 className="text-2xl font-bold mb-2 flex items-center gap-3">
                      <span className="bg-gray-100 text-gray-800 text-sm py-1 px-3 rounded-full">{lvl.title}</span>
                    </h2>
                    <p className="text-gray-500">{lvl.desc}</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {matchedTopics.map((item, idx) => (
                      <div key={idx} className="bg-gray-50 p-6 rounded-2xl hover:shadow-md transition-shadow border border-gray-100">
                        <h3 className="text-lg font-bold text-gray-900 mb-3 leading-snug">
                          {item.topic}
                        </h3>
                        <div className="bg-blue-50/50 p-4 rounded-xl text-blue-900 text-sm mb-4">
                          <strong className="block mb-1 text-blue-800">🎯 선정 이유 및 전략</strong>
                          {item.reasoning}
                        </div>
                        <a
                          href={`/creative?topic=${encodeURIComponent(item.topic)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 text-sm font-bold text-white bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 px-4 py-2 rounded-xl transition-all shadow-md hover:shadow-lg"
                        >
                          ✨ 에셋 생성하기
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
