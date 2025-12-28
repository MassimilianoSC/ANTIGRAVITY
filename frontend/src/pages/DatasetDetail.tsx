import { useQuery } from '@tanstack/react-query';
import { useParams, Link } from 'react-router-dom';
import { getDatasetDetail } from '../api';
import ConfidenceBadge from '../components/ConfidenceBadge';

export default function DatasetDetail() {
    const { id } = useParams<{ id: string }>();

    const { data, isLoading, error } = useQuery({
        queryKey: ['dataset', id],
        queryFn: () => getDatasetDetail(id!),
        enabled: !!id,
    });

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                Dataset non trovato
            </div>
        );
    }

    const { dataset, sheets } = data;

    return (
        <div>
            <Link to="/" className="text-indigo-600 hover:text-indigo-700 mb-4 inline-block">
                ← Torna ai dataset
            </Link>

            <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
                <div className="flex items-start justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">
                            {dataset.filename}
                        </h1>
                        <div className="text-sm text-gray-600 space-y-1">
                            <p>📅 Caricato: {new Date(dataset.upload_date).toLocaleString('it-IT')}</p>
                            <p>💾 Dimensione: {(dataset.file_size / 1024 / 1024).toFixed(2)} MB</p>
                            <p>🔒 SHA256: <span className="font-mono text-xs">{dataset.sha256}</span></p>
                            <p>📊 Fogli: {dataset.sheet_count}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Fogli Excel</h2>

                {sheets.length === 0 ? (
                    <p className="text-gray-600">Nessun foglio trovato</p>
                ) : (
                    <div className="grid gap-4">
                        {sheets.map((sheet) => (
                            <Link
                                key={sheet.id}
                                to={`/datasets/${id}/sheets/${encodeURIComponent(sheet.sheet_name)}`}
                                className="block border border-gray-200 rounded-lg p-4 hover:border-indigo-500 hover:shadow-md transition"
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                            📄 {sheet.sheet_name}
                                        </h3>
                                        <div className="text-sm text-gray-600 space-y-1">
                                            <p>Dimensioni: {sheet.n_rows} righe × {sheet.n_cols} colonne</p>
                                            {sheet.merged_cells_count > 0 && (
                                                <p>Celle unite: {sheet.merged_cells_count}</p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="ml-4">
                                        <ConfidenceBadge analysisJson={sheet.analysis_json} />
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
