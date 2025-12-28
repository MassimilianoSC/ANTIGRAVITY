import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams, Link } from 'react-router-dom';
import { getSheetPreview, getDatasetDetail } from '../api';
import GridView from '../components/GridView';
import TableView from '../components/TableView';

export default function SheetPreview() {
    const { id, sheetName } = useParams<{ id: string; sheetName: string }>();
    const [viewMode, setViewMode] = useState<'grid' | 'table'>('table');
    const [candidateIdx, setCandidateIdx] = useState(0);
    const [rowRange, setRowRange] = useState({ start: 1, end: 50 });
    const [colRange, setColRange] = useState({ start: 1, end: 20 });
    const [rawValues, setRawValues] = useState(false);

    const { data: detailData } = useQuery({
        queryKey: ['dataset', id],
        queryFn: () => getDatasetDetail(id!),
        enabled: !!id,
    });

    const { data: previewData, isLoading } = useQuery({
        queryKey: ['preview', id, sheetName, viewMode, candidateIdx, rowRange, colRange, rawValues],
        queryFn: () => {
            if (viewMode === 'grid') {
                return getSheetPreview(id!, sheetName!, 'grid', {
                    rowStart: rowRange.start,
                    rowEnd: rowRange.end,
                    colStart: colRange.start,
                    colEnd: colRange.end,
                });
            } else {
                return getSheetPreview(id!, sheetName!, 'table', {
                    candidate: candidateIdx,
                    rawValues: rawValues
                });
            }
        },
        enabled: !!id && !!sheetName,
    });

    const sheet = detailData?.sheets.find(s => s.sheet_name === sheetName);
    const candidates = sheet?.analysis_json ? JSON.parse(sheet.analysis_json).candidates || [] : [];
    const defaultMode = candidates.length > 0 && candidates[0].confidence === 'high' ? 'table' : 'grid';

    // Set initial view mode based on confidence
    useState(() => {
        if (candidates.length > 0 && candidates[0].confidence === 'high') {
            setViewMode('table');
        } else {
            setViewMode('grid');
        }
    });

    const handleNextPage = () => {
        setRowRange(prev => ({ start: prev.start + 50, end: prev.end + 50 }));
    };

    const handlePrevPage = () => {
        setRowRange(prev => ({ start: Math.max(1, prev.start - 50), end: Math.max(51, prev.end - 50) }));
    };

    return (
        <div>
            <Link to={`/datasets/${id}`} className="text-indigo-600 hover:text-indigo-700 mb-4 inline-block">
                ← Torna al dataset
            </Link>

            <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
                <h1 className="text-2xl font-bold text-gray-900 mb-4">
                    📄 {sheetName}
                </h1>

                <div className="flex flex-wrap gap-4 items-center">
                    <div className="flex gap-2">
                        <button
                            onClick={() => setViewMode('table')}
                            className={`px-4 py-2 rounded-lg font-medium transition ${viewMode === 'table'
                                    ? 'bg-indigo-600 text-white'
                                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                }`}
                        >
                            📊 Vista Tabella
                        </button>
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`px-4 py-2 rounded-lg font-medium transition ${viewMode === 'grid'
                                    ? 'bg-indigo-600 text-white'
                                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                }`}
                        >
                            🔲 Vista Griglia
                        </button>
                    </div>

                    {viewMode === 'table' && candidates.length > 1 && (
                        <div className="flex items-center gap-2">
                            <label className="text-sm text-gray-700">Candidato:</label>
                            <select
                                value={candidateIdx}
                                onChange={(e) => setCandidateIdx(parseInt(e.target.value))}
                                className="border border-gray-300 rounded px-3 py-1 text-sm"
                            >
                                {candidates.map((_: any, idx: number) => (
                                    <option key={idx} value={idx}>
                                        Candidato {idx + 1}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    {viewMode === 'table' && (
                        <div className="flex items-center gap-2">
                            <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={rawValues}
                                    onChange={(e) => setRawValues(e.target.checked)}
                                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                />
                                Mostra valori grezzi
                            </label>
                        </div>
                    )}

                    {viewMode === 'grid' && (
                        <div className="flex items-center gap-2">
                            <button
                                onClick={handlePrevPage}
                                disabled={rowRange.start === 1}
                                className="px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                            >
                                ← Precedente
                            </button>
                            <span className="text-sm text-gray-600">
                                Righe {rowRange.start}-{rowRange.end}
                            </span>
                            <button
                                onClick={handleNextPage}
                                className="px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 text-sm"
                            >
                                Successiva →
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6 overflow-x-auto">
                {isLoading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                    </div>
                ) : viewMode === 'grid' && previewData?.mode === 'grid' ? (
                    <GridView data={previewData} />
                ) : viewMode === 'table' && previewData?.mode === 'table' ? (
                    <TableView data={previewData} />
                ) : (
                    <p className="text-gray-600">Nessun dato disponibile</p>
                )}
            </div>
        </div>
    );
}
