interface ConfidenceBadgeProps {
    analysisJson: string | null;
}

export default function ConfidenceBadge({ analysisJson }: ConfidenceBadgeProps) {
    if (!analysisJson) {
        return (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-200 text-gray-700">
                📄 Nessuna analisi
            </span>
        );
    }

    try {
        const analysis = JSON.parse(analysisJson);
        const candidates = analysis.candidates || [];

        if (candidates.length === 0) {
            return (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                    ⚠️ Layout complesso
                </span>
            );
        }

        const firstCandidate = candidates[0];
        const confidence = firstCandidate.confidence || 'low';
        const score = Math.round((firstCandidate.score || 0) * 100);

        if (confidence === 'high') {
            return (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    ✅ Tabella rilevata ({score}%)
                </span>
            );
        } else if (confidence === 'medium') {
            return (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    🔍 Tabella possibile ({score}%)
                </span>
            );
        } else {
            return (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                    ⚠️ Layout complesso ({score}%)
                </span>
            );
        }
    } catch {
        return (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-200 text-gray-700">
                ⚠️ Errore analisi
            </span>
        );
    }
}
