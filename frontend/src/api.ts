import axios from 'axios';

const api = axios.create({
    baseURL: '/api',
});

export interface Dataset {
    id: string;
    filename: string;
    sha256: string;
    upload_date: string;
    file_size: number;
    sheet_count: number;
}

export interface Sheet {
    id: number;
    sheet_name: string;
    n_rows: number;
    n_cols: number;
    merged_cells_count: number;
    analysis_json: string | null;
}

export interface DatasetDetail {
    dataset: Dataset;
    sheets: Sheet[];
}

export interface GridPreview {
    mode: 'grid';
    data: string[][];
    dimensions: {
        row_start: number;
        row_end: number;
        col_start: number;
        col_end: number;
    };
}

export interface TablePreview {
    mode: 'table';
    headers: string[];
    rows: any[][];
    confidence: string;
    score: number;
}

export const uploadDataset = async (file: File): Promise<Dataset> => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post<Dataset>('/datasets', formData);
    return response.data;
};

export const getDatasets = async (): Promise<Dataset[]> => {
    const response = await api.get<Dataset[]>('/datasets');
    return response.data;
};

export const getDatasetDetail = async (datasetId: string): Promise<DatasetDetail> => {
    const response = await api.get<DatasetDetail>(`/datasets/${datasetId}`);
    return response.data;
};

export const getSheetPreview = async (
    datasetId: string,
    sheetName: string,
    mode: 'grid' | 'table',
    options: {
        rowStart?: number;
        rowEnd?: number;
        colStart?: number;
        colEnd?: number;
        candidate?: number;
    } = {}
): Promise<GridPreview | TablePreview> => {
    const params: any = { mode };

    if (mode === 'grid') {
        params.row_start = options.rowStart || 1;
        params.row_end = options.rowEnd || 50;
        params.col_start = options.colStart || 1;
        params.col_end = options.colEnd || 20;
    } else {
        params.candidate = options.candidate || 0;
    }

    const response = await api.get(`/datasets/${datasetId}/sheets/${encodeURIComponent(sheetName)}/preview`, { params });
    return response.data;
};

export default api;
