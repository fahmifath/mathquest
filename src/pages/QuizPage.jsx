import React, {
  useEffect,
  useState,
} from 'react';

import {
  useNavigate,
  useParams,
} from 'react-router-dom';

import {
  createQuizSession,
  submitQuizAnswer,
  finishQuizSession,
} from '../services/quizService';

import {
  CheckCircle2,
  XCircle,
  Loader2,
} from 'lucide-react';

const QuizPage = () => {
  const navigate = useNavigate();

  const { quizId } = useParams();

  const [session, setSession] =
    useState(null);

  const [quiz, setQuiz] = useState(null);

  const [currentIndex, setCurrentIndex] =
    useState(0);

  const [selectedOption, setSelectedOption] =
    useState(null);

  const [answerResult, setAnswerResult] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [submitting, setSubmitting] =
    useState(false);

  const [startTime, setStartTime] =
    useState(Date.now());

  // CREATE SESSION
  useEffect(() => {
    const startQuiz = async () => {
      try {
        const res =
          await createQuizSession(quizId);

        setSession(res.session);

        setQuiz(res.quiz);

        setStartTime(Date.now());
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    startQuiz();
  }, [quizId]);

  if (loading || !quiz) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  const question =
    quiz.questions[currentIndex];

  const handleAnswer = async (
    optionId
  ) => {
    if (submitting || answerResult) return;

    setSubmitting(true);

    try {
      const timeTaken = Math.floor(
        (Date.now() - startTime) / 1000
      );

      const res =
        await submitQuizAnswer(
          session.id,
          {
            questionId: question.id,
            optionId,
            timeTaken,
          }
        );

      setSelectedOption(optionId);

      setAnswerResult(res);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleNext = async () => {
    // LAST QUESTION
    if (
      currentIndex ===
      quiz.questions.length - 1
    ) {
      try {
        const result =
          await finishQuizSession(
            session.id
          );

        navigate(
          `/quiz-result/${session.id}`,
          {
            state: result,
          }
        );
      } catch (err) {
        console.error(err);
      }

      return;
    }

    setCurrentIndex((p) => p + 1);

    setSelectedOption(null);

    setAnswerResult(null);

    setStartTime(Date.now());
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4">
      <div className="max-w-3xl mx-auto">
        {/* TOP */}
        <div className="mb-8">
          <div className="w-full h-4 rounded-full overflow-hidden bg-slate-200">
            <div
              className="h-full bg-green-500 transition-all"
              style={{
                width: `${
                  ((currentIndex + 1) /
                    quiz.questions.length) *
                  100
                }%`,
              }}
            />
          </div>
        </div>

        {/* QUESTION */}
        <div className="bg-white rounded-[32px] p-8 border-2 border-slate-100">
          <p className="text-sm font-black text-slate-400 mb-3">
            QUESTION {currentIndex + 1}
          </p>

          <h1 className="text-3xl font-black text-slate-800 mb-8">
            {question.questionText}
          </h1>

          {question.imageUrl && (
            <img
              src={question.imageUrl}
              alt=""
              className="rounded-3xl mb-8"
            />
          )}

          <div className="space-y-4">
            {question.options.map((opt) => {
              const isSelected =
                selectedOption === opt.id;

              return (
                <button
                  key={opt.id}
                  onClick={() =>
                    handleAnswer(opt.id)
                  }
                  disabled={!!answerResult}
                  className="w-full p-5 rounded-2xl border-2 text-left font-bold transition-all"
                  style={{
                    borderColor: isSelected
                      ? '#58CC02'
                      : '#E5E7EB',
                  }}
                >
                  {opt.optionText}
                </button>
              );
            })}
          </div>

          {/* RESULT */}
          {answerResult && (
            <div
              className={`mt-8 rounded-3xl p-6 ${
                answerResult.isCorrect
                  ? 'bg-green-50'
                  : 'bg-red-50'
              }`}
            >
              <div className="flex items-center gap-3 mb-4">
                {answerResult.isCorrect ? (
                  <CheckCircle2 className="text-green-500" />
                ) : (
                  <XCircle className="text-red-500" />
                )}

                <h3 className="font-black text-xl">
                  {answerResult.isCorrect
                    ? 'Jawaban Benar!'
                    : 'Jawaban Salah'}
                </h3>
              </div>

              <p className="mb-4">
                {answerResult.isCorrect
                  ? answerResult.explanation
                  : answerResult
                      .correctOption
                      ?.explanation}
              </p>

              <button
                onClick={handleNext}
                className="px-6 py-4 rounded-2xl text-white font-black"
                style={{
                  background: '#58CC02',
                }}
              >
                {currentIndex ===
                quiz.questions.length - 1
                  ? 'Selesaikan Quiz'
                  : 'Lanjut'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuizPage;