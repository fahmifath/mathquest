import React, { useEffect, useState } from 'react';

import {
  useNavigate,
  useParams,
} from 'react-router-dom';

import {
  getQuizResult,
} from '../services/quizService';

import {
  Trophy,
  Star,
  CheckCircle2,
  XCircle,
  Home,
  Loader2,
  Clock,
} from 'lucide-react';

const COLORS = {
  green: '#58CC02',
  greenDark: '#46A302',

  red: '#FF4B4B',

  yellow: '#FFD700',

  blue: '#1CB0F6',
};

const QuizResultPage = () => {
  const navigate = useNavigate();

  const { sessionId } = useParams();

  const [result, setResult] = useState(null);

  const [loading, setLoading] =
    useState(true);

  // ─────────────────────────────────────────
  // FETCH RESULT
  // ─────────────────────────────────────────
  useEffect(() => {
    const fetchResult = async () => {
      try {
        const res = await getQuizResult(
          sessionId
        );

        setResult(res);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchResult();
  }, [sessionId]);

  // ─────────────────────────────────────────
  // LOADING
  // ─────────────────────────────────────────
  if (loading || !result) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <Loader2
            size={50}
            className="animate-spin mx-auto mb-4 text-green-500"
          />

          <p className="font-black text-slate-500">
            Loading Result...
          </p>
        </div>
      </div>
    );
  }

  const passed = result.isPassed;

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4">
      <div className="max-w-4xl mx-auto">
        {/* HEADER */}
        <div
          className="rounded-[32px] p-10 text-white mb-8 relative overflow-hidden"
          style={{
            background: passed
              ? `linear-gradient(135deg, ${COLORS.green}, ${COLORS.greenDark})`
              : `linear-gradient(135deg, ${COLORS.red}, #D92D2D)`,
          }}
        >
          <div className="absolute right-0 top-0 text-[180px] opacity-10 leading-none">
            {passed ? '🏆' : '❌'}
          </div>

          <div className="relative z-10">
            <div className="w-24 h-24 rounded-[28px] bg-white/20 flex items-center justify-center mb-6">
              {passed ? (
                <Trophy size={50} />
              ) : (
                <XCircle size={50} />
              )}
            </div>

            <p className="uppercase text-xs tracking-[0.3em] font-black opacity-80 mb-3">
              Quiz Result
            </p>

            <h1 className="text-5xl font-black mb-4">
              {passed
                ? 'Quiz Passed!'
                : 'Quiz Failed'}
            </h1>

            <p className="text-lg opacity-90 max-w-xl">
              {passed
                ? 'Keren! Kamu berhasil menyelesaikan quiz dan mendapatkan bonus XP module.'
                : 'Jangan menyerah. Kamu bisa mencoba quiz lagi untuk mendapatkan skor lebih baik.'}
            </p>
          </div>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-8">
          {/* SCORE */}
          <div className="bg-white rounded-[28px] p-6 border-2 border-slate-100">
            <p className="text-xs font-black text-slate-400 mb-2">
              SCORE
            </p>

            <h2 className="text-4xl font-black text-slate-800">
              {result.totalScore}
            </h2>

            <p className="text-sm text-slate-400 mt-1">
              Passing:{' '}
              {result.quiz.passingScore}
            </p>
          </div>

          {/* XP */}
          <div className="bg-white rounded-[28px] p-6 border-2 border-slate-100">
            <p className="text-xs font-black text-slate-400 mb-2">
              TOTAL XP
            </p>

            <h2 className="text-4xl font-black text-yellow-500 flex items-center gap-2">
              <Star
                size={30}
                fill="currentColor"
              />
              {result.totalXpEarned}
            </h2>

            <p className="text-sm text-slate-400 mt-1">
              XP Earned
            </p>
          </div>

          {/* CORRECT */}
          <div className="bg-white rounded-[28px] p-6 border-2 border-slate-100">
            <p className="text-xs font-black text-slate-400 mb-2">
              CORRECT
            </p>

            <h2 className="text-4xl font-black text-green-500">
              {
                result.answers.filter(
                  (a) => a.isCorrect
                ).length
              }
            </h2>

            <p className="text-sm text-slate-400 mt-1">
              Benar
            </p>
          </div>

          {/* DURATION */}
          <div className="bg-white rounded-[28px] p-6 border-2 border-slate-100">
            <p className="text-xs font-black text-slate-400 mb-2">
              DURATION
            </p>

            <h2 className="text-4xl font-black text-blue-500 flex items-center gap-2">
              <Clock size={28} />
              {result.durationSeconds}s
            </h2>

            <p className="text-sm text-slate-400 mt-1">
              Waktu
            </p>
          </div>
        </div>

        {/* ANSWERS */}
        <div className="space-y-5 mb-8">
          {result.answers.map(
            (answer, index) => {
              const correctOption =
                answer.question.options.find(
                  (o) => o.isCorrect
                );

              return (
                <div
                  key={answer.id}
                  className="bg-white rounded-[28px] p-8 border-2 border-slate-100"
                >
                  {/* TOP */}
                  <div className="flex items-start gap-4 mb-6">
                    <div
                      className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${
                        answer.isCorrect
                          ? 'bg-green-100'
                          : 'bg-red-100'
                      }`}
                    >
                      {answer.isCorrect ? (
                        <CheckCircle2 className="text-green-500" />
                      ) : (
                        <XCircle className="text-red-500" />
                      )}
                    </div>

                    <div className="flex-1">
                      <p className="text-xs uppercase tracking-widest font-black text-slate-400 mb-2">
                        Question {index + 1}
                      </p>

                      <h3 className="text-2xl font-black text-slate-800 leading-tight">
                        {
                          answer.question
                            .questionText
                        }
                      </h3>
                    </div>
                  </div>

                  {/* IMAGE */}
                  {answer.question.imageUrl && (
                    <img
                      src={
                        answer.question
                          .imageUrl
                      }
                      alt=""
                      className="rounded-3xl mb-6 max-h-[300px] object-cover"
                    />
                  )}

                  {/* OPTIONS */}
                  <div className="space-y-3 mb-6">
                    {answer.question.options.map(
                      (opt) => {
                        const isSelected =
                          opt.id ===
                          answer
                            .selectedOption.id;

                        const isCorrect =
                          opt.isCorrect;

                        return (
                          <div
                            key={opt.id}
                            className={`p-4 rounded-2xl border-2 ${
                              isCorrect
                                ? 'border-green-300 bg-green-50'
                                : isSelected
                                ? 'border-red-300 bg-red-50'
                                : 'border-slate-200'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-slate-700">
                                {
                                  opt.optionText
                                }
                              </span>

                              {isCorrect && (
                                <CheckCircle2 className="text-green-500" />
                              )}

                              {!isCorrect &&
                                isSelected && (
                                  <XCircle className="text-red-500" />
                                )}
                            </div>
                          </div>
                        );
                      }
                    )}
                  </div>

                  {/* EXPLANATION */}
                  <div className="rounded-2xl bg-slate-100 p-5">
                    <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-2">
                      Explanation
                    </p>

                    <p className="text-slate-700 leading-relaxed">
                      {correctOption?.explanation ||
                        'Tidak ada penjelasan.'}
                    </p>
                  </div>
                </div>
              );
            }
          )}
        </div>

        {/* ACTION */}
        <div className="flex justify-center">
          <button
            onClick={() =>
              navigate('/dashboard/quest-map')
            }
            className="px-10 py-5 rounded-3xl text-white font-black text-lg flex items-center gap-3 active:translate-y-0.5 transition-transform"
            style={{
              background: COLORS.green,
              boxShadow: `0 5px 0 ${COLORS.greenDark}`,
            }}
          >
            <Home size={22} />
            Kembali ke Quest Map
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuizResultPage;