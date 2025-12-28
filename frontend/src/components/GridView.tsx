import { GridPreview } from '../api';

interface GridViewProps {
    data: GridPreview;
}

export default function GridView({ data }: GridViewProps) {
    const { data: grid, dimensions } = data;

    return (
        <div>
            <div className="mb-4 text-sm text-gray-600">
                Visualizzazione celle da riga {dimensions.row_start} a {dimensions.row_end},
                colonna {dimensions.col_start} a {dimensions.col_end}
            </div>

            <div className="overflow-auto max-h-[600px]">
                <table className="min-w-full border-collapse border border-gray-300 text-sm">
                    <thead className="sticky top-0 bg-gray-100 z-10">
                        <tr>
                            <th className="border border-gray-300 px-2 py-1 bg-gray-200 w-12">#</th>
                            {grid[0]?.map((_, colIdx) => (
                                <th key={colIdx} className="border border-gray-300 px-2 py-1 bg-gray-200 min-w-[100px]">
                                    {String.fromCharCode(65 + ((dimensions.col_start + colIdx - 1) % 26))}
                                    {Math.floor((dimensions.col_start + colIdx - 1) / 26) || ''}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {grid.map((row, rowIdx) => (
                            <tr key={rowIdx} className={rowIdx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                <td className="border border-gray-300 px-2 py-1 bg-gray-100 font-medium text-center">
                                    {dimensions.row_start + rowIdx}
                                </td>
                                {row.map((cell, colIdx) => (
                                    <td
                                        key={colIdx}
                                        className="border border-gray-300 px-2 py-1"
                                        title={cell}
                                    >
                                        {cell || <span className="text-gray-300">—</span>}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
