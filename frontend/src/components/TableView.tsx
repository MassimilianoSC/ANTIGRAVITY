import { TablePreview } from '../api';

interface TableViewProps {
    data: TablePreview;
}

export default function TableView({ data }: TableViewProps) {
    const { headers, rows, confidence, score } = data;

    if (headers.length === 0) {
        return (
            <div className="text-center text-gray-600 py-8">
                <p className="text-lg mb-2">⚠️ Nessuna tabella rilevata</p>
                <p className="text-sm">Prova a usare la Vista Griglia per visualizzare i dati</p>
            </div>
        );
    }

    return (
        <div>
            <div className="mb-4 flex items-center gap-4">
                <span className="text-sm text-gray-700 font-medium">Confidenza analisi:</span>
                <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${confidence === 'high'
                            ? 'bg-green-100 text-green-800'
                            : confidence === 'medium'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-yellow-100 text-yellow-800'
                        }`}
                >
                    {confidence === 'high' ? 'Alta' : confidence === 'medium' ? 'Media' : 'Bassa'}
                    ({Math.round(score * 100)}%)
                </span>
            </div>

            <div className="overflow-auto max-h-[600px]">
                <table className="min-w-full border-collapse border border-gray-300 text-sm">
                    <thead className="sticky top-0 bg-indigo-100 z-10">
                        <tr>
                            {headers.map((header, idx) => (
                                <th
                                    key={idx}
                                    className="border border-gray-300 px-4 py-2 text-left font-semibold text-gray-900"
                                >
                                    {header || `Colonna ${idx + 1}`}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {rows.length === 0 ? (
                            <tr>
                                <td colSpan={headers.length} className="text-center py-8 text-gray-500">
                                    Nessun dato disponibile
                                </td>
                            </tr>
                        ) : (
                            rows.map((row, rowIdx) => (
                                <tr key={rowIdx} className={rowIdx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                    {row.map((cell, colIdx) => (
                                        <td
                                            key={colIdx}
                                            className="border border-gray-300 px-4 py-2"
                                            title={String(cell)}
                                        >
                                            {cell || <span className="text-gray-300">—</span>}
                                        </td>
                                    ))}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {rows.length > 0 && (
                <div className="mt-4 text-sm text-gray-500">
                    Visualizzate {rows.length} righe
                </div>
            )}
        </div>
    );
}
