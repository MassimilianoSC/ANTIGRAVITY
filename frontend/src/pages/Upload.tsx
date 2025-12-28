import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { uploadDataset } from '../api';

export default function Upload() {
    const navigate = useNavigate();
    const [dragActive, setDragActive] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    const uploadMutation = useMutation({
        mutationFn: uploadDataset,
        onSuccess: (data) => {
            navigate(`/datasets/${data.id}`);
        },
    });

    const handleDrag = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            const file = e.dataTransfer.files[0];
            if (file.name.endsWith('.xlsx')) {
                setSelectedFile(file);
            } else {
                alert('Solo file .xlsx sono supportati');
            }
        }
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.preventDefault();
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            if (file.name.endsWith('.xlsx')) {
                setSelectedFile(file);
            } else {
                alert('Solo file .xlsx sono supportati');
            }
        }
    };

    const handleUpload = () => {
        if (selectedFile) {
            uploadMutation.mutate(selectedFile);
        }
    };

    return (
        <div className="max-w-3xl mx-auto">
            <div className="bg-white rounded-lg shadow-xl p-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-6">
                    Carica File Excel
                </h1>

                <div
                    className={`relative border-2 border-dashed rounded-lg p-12 text-center transition-all ${dragActive
                            ? 'border-indigo-500 bg-indigo-50'
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                >
                    <input
                        type="file"
                        id="file-upload"
                        className="hidden"
                        accept=".xlsx"
                        onChange={handleChange}
                    />

                    <div className="space-y-4">
                        <div className="text-6xl">📊</div>
                        <div>
                            <label
                                htmlFor="file-upload"
                                className="cursor-pointer text-indigo-600 hover:text-indigo-700 font-semibold"
                            >
                                Clicca per caricare
                            </label>
                            <span className="text-gray-600"> o trascina qui il file</span>
                        </div>
                        <p className="text-sm text-gray-500">Solo file .xlsx (max 100MB)</p>
                    </div>
                </div>

                {selectedFile && (
                    <div className="mt-6 space-y-4">
                        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-medium text-gray-900">{selectedFile.name}</p>
                                    <p className="text-sm text-gray-500">
                                        {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                                    </p>
                                </div>
                                <button
                                    onClick={() => setSelectedFile(null)}
                                    className="text-red-600 hover:text-red-700"
                                >
                                    ✕
                                </button>
                            </div>
                        </div>

                        <button
                            onClick={handleUpload}
                            disabled={uploadMutation.isPending}
                            className="w-full bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
                        >
                            {uploadMutation.isPending ? (
                                <span className="flex items-center justify-center">
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Caricamento in corso...
                                </span>
                            ) : (
                                'Carica ed Elabora'
                            )}
                        </button>

                        {uploadMutation.isError && (
                            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                                Errore durante il caricamento. Riprova.
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
