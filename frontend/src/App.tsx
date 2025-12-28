import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import Upload from './pages/Upload';
import DatasetList from './pages/DatasetList';
import DatasetDetail from './pages/DatasetDetail';
import SheetPreview from './pages/SheetPreview';

function App() {
    return (
        <BrowserRouter>
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
                <nav className="bg-white shadow-lg">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-between h-16">
                            <div className="flex items-center">
                                <Link to="/" className="text-2xl font-bold text-indigo-600">
                                    📊 Excel Dataset Importer
                                </Link>
                            </div>
                            <div className="flex items-center space-x-4">
                                <Link
                                    to="/"
                                    className="text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium transition"
                                >
                                    Dataset
                                </Link>
                                <Link
                                    to="/upload"
                                    className="bg-indigo-600 text-white hover:bg-indigo-700 px-4 py-2 rounded-md text-sm font-medium transition"
                                >
                                    + Carica File
                                </Link>
                            </div>
                        </div>
                    </div>
                </nav>

                <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <Routes>
                        <Route path="/" element={<DatasetList />} />
                        <Route path="/upload" element={<Upload />} />
                        <Route path="/datasets/:id" element={<DatasetDetail />} />
                        <Route path="/datasets/:id/sheets/:sheetName" element={<SheetPreview />} />
                    </Routes>
                </main>
            </div>
        </BrowserRouter>
    );
}

export default App;
