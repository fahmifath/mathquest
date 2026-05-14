import React, {
    useEffect,
    useState,
    useCallback,
} from 'react';

import {
    useNavigate,
    useParams,
} from 'react-router-dom';

import {
    getModuleById,
    getModulePage,
    updateModuleProgress,
} from '../services/moduleService';

import {
    ChevronLeft,
    ChevronRight,
    BookOpen,
    CheckCircle2,
    Loader2,
    Sparkles,
} from 'lucide-react';

// ─────────────────────────────────────────────
// COLORS
// ─────────────────────────────────────────────
const COLORS = {
    green: '#58CC02',
    greenDark: '#46A302',

    blue: '#1CB0F6',
    blueDark: '#0A91D0',

    red: '#FF4B4B',
};

// ─────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────
const ModuleReader = () => {
    const navigate = useNavigate();

    const { moduleId } = useParams();

    const [module, setModule] = useState(null);

    const [page, setPage] = useState(null);

    const [currentPage, setCurrentPage] =
        useState(1);

    const [loading, setLoading] = useState(true);

    const [saving, setSaving] = useState(false);

    // ─────────────────────────────────────────
    // FETCH MODULE DETAIL
    // ─────────────────────────────────────────
    useEffect(() => {
        const fetchModule = async () => {
            try {
                const res = await getModuleById(
                    moduleId
                );

                setModule(res);

                const lastPage =
                    res.progress?.lastPage || 1;

                setCurrentPage(lastPage);
            } catch (err) {
                console.error(err);
            }
        };

        fetchModule();
    }, [moduleId]);

    // ─────────────────────────────────────────
    // FETCH PAGE
    // ─────────────────────────────────────────
    const fetchPage = useCallback(
        async (pageNumber) => {
            try {
                setLoading(true);

                const res = await getModulePage(
                    moduleId,
                    pageNumber
                );

                setPage(res);

                // SAVE PROGRESS
                await updateModuleProgress(
                    moduleId,
                    pageNumber
                );
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        },
        [moduleId]
    );

    useEffect(() => {
        if (currentPage) {
            fetchPage(currentPage);
        }
    }, [currentPage, fetchPage]);

    // ─────────────────────────────────────────
    // NEXT PAGE
    // ─────────────────────────────────────────
    const handleNext = async () => {
        if (!page) return;

        setSaving(true);

        try {
            // HALAMAN TERAKHIR
            if (page.isLastPage) {
                // simpan progress halaman terakhir
                await updateModuleProgress(
                    moduleId,
                    currentPage
                );

                // kembali ke quest map
                navigate('/dashboard/quest-map');

                return;
            }

            // NEXT PAGE
            const nextPage = currentPage + 1;

            await updateModuleProgress(
                moduleId,
                nextPage
            );

            setCurrentPage(nextPage);
        } catch (err) {
            console.error(err);
        } finally {
            setSaving(false);
        }
    };

    // ─────────────────────────────────────────
    // PREV PAGE
    // ─────────────────────────────────────────
    const handlePrev = () => {
        if (currentPage <= 1) return;

        setCurrentPage((p) => p - 1);
    };

    // ─────────────────────────────────────────
    // LOADING
    // ─────────────────────────────────────────
    if (loading || !page || !module) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="text-center">
                    <Loader2
                        size={48}
                        className="animate-spin mx-auto mb-4 text-green-500"
                    />

                    <p className="font-black text-slate-500">
                        Loading Module...
                    </p>
                </div>
            </div>
        );
    }

    // ─────────────────────────────────────────
    // PROGRESS %
    // ─────────────────────────────────────────
    const progress =
        (currentPage / page.totalPages) * 100;

    // ─────────────────────────────────────────
    // PAGE TYPE COLOR
    // ─────────────────────────────────────────
    const pageTypeColor =
        page.pageType === 'story'
            ? COLORS.blue
            : page.pageType === 'summary'
                ? COLORS.green
                : COLORS.red;

    return (
        <div className="min-h-screen bg-slate-50">
            {/* TOPBAR */}
            <div className="sticky top-0 z-50 bg-white border-b border-slate-100">
                <div className="max-w-4xl mx-auto px-4 py-4">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate(-1)}
                            className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center"
                        >
                            <ChevronLeft size={22} />
                        </button>

                        <div className="flex-1">
                            <h1 className="font-black text-slate-800 text-lg">
                                {module.title}
                            </h1>

                            <p className="text-sm text-slate-400">
                                Halaman {currentPage} dari{' '}
                                {page.totalPages}
                            </p>
                        </div>

                        <div className="text-sm font-black text-green-600">
                            {Math.round(progress)}%
                        </div>
                    </div>

                    {/* PROGRESS */}
                    <div className="mt-4 w-full h-4 rounded-full overflow-hidden bg-slate-100">
                        <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{
                                width: `${progress}%`,
                                background: COLORS.green,
                            }}
                        />
                    </div>
                </div>
            </div>

            {/* CONTENT */}
            <div className="max-w-4xl mx-auto px-4 py-10">
                <div className="bg-white rounded-[32px] border-2 border-slate-100 overflow-hidden shadow-sm">
                    {/* HEADER */}
                    <div
                        className="p-8 text-white"
                        style={{
                            background: pageTypeColor,
                        }}
                    >
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center">
                                {page.pageType === 'story' ? (
                                    <BookOpen size={28} />
                                ) : (
                                    <Sparkles size={28} />
                                )}
                            </div>

                            <div>
                                <p className="uppercase text-xs tracking-widest font-black opacity-80">
                                    {page.pageType}
                                </p>

                                <h2 className="text-2xl font-black">
                                    {page.sceneTitle}
                                </h2>
                            </div>
                        </div>
                    </div>

                    {/* IMAGE */}
                    {page.illustrationUrl && (
                        <img
                            src={page.illustrationUrl}
                            alt={page.sceneTitle}
                            className="w-full max-h-[420px] object-cover"
                        />
                    )}

                    {/* STORY */}
                    <div className="p-8">
                        <div className="prose prose-lg max-w-none">
                            <p className="text-slate-700 leading-8 whitespace-pre-line">
                                {page.storyContent}
                            </p>
                        </div>
                    </div>
                </div>

                {/* BUTTONS */}
                <div className="flex items-center justify-between mt-8">
                    <button
                        onClick={handlePrev}
                        disabled={page.isFirstPage}
                        className="px-6 py-4 rounded-2xl border-2 border-slate-200 font-black text-slate-500 disabled:opacity-40"
                    >
                        Sebelumnya
                    </button>

                    <button
                        onClick={handleNext}
                        disabled={saving}
                        className="px-8 py-4 rounded-2xl text-white font-black flex items-center gap-2 active:translate-y-0.5 transition-transform"
                        style={{
                            background: COLORS.green,
                            boxShadow: `0 4px 0 ${COLORS.greenDark}`,
                        }}
                    >
                        {page.isLastPage ? (
                            <>
                                <CheckCircle2 size={20} />
                                Selesai
                            </>
                        ) : (
                            <>
                                Lanjut
                                <ChevronRight size={20} />
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ModuleReader;