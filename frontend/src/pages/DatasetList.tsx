import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { getDatasets } from '../api';

export default function DatasetList() {
    const { data: datasets, isLoading, error } = useQuery({
        queryKey: ['datasets'],
        queryFn: getDatasets,
    });

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                Errore nel caricamento dei dataset
            </div>
        );
    }

    if (!datasets || datasets.length === 0) {
        return (
            <div className="bg-white rounded-lg shadow-lg p-12 text-center">
                <div className="text-6xl mb-4">📂</div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Nessun dataset caricato
                </h2>
                <p className="text-gray-600 mb-6">
                    Inizia caricando il tuo primo file Excel
                </p>
                <Link
                    to="/upload"
                    className="inline-block bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition"
                >
                    Carica File
                </Link>
            </div>
        );
    }

    return (
        <div>
            <div className="mb-6 flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-900">I Tuoi Dataset</h1>
                <span className="text-gray-600">{datasets.length} dataset</span>
            </div>

            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Nome File
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Data Caricamento
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Fogli
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Dimensione
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                SHA256
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {datasets.map((dataset) => (
                            <tr
                                key={dataset.id}
                                className="hover:bg-gray-50 transition cursor-pointer"
                                onClick={() => window.location.href = `/datasets/${dataset.id}`}
                            >
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <span className="text-2xl mr-3">📊</span>
                                        <div className="text-sm font-medium text-gray-900">
                                            {dataset.filename}
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {new Date(dataset.upload_date).toLocaleString('it-IT')}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-indigo-100 text-indigo-800">
                                        {dataset.sheet_count} fogli
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {(dataset.file_size / 1024 / 1024).toFixed(2)} MB
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
                                    {dataset.sha256.substring(0, 12)}...
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
