import React from 'react';

export const QuotationHeader = ({
  title,
  currentDraftName,
  setCurrentDraftName,
  onSaveDraft,
  onToggleDrafts,
  savedDraftsCount,
  onAddSchedule,
  onGeneratePDFs,
  isGeneratingPDF,
  saveMessage,
  onSaveQuotation // Add this new prop
}) => {
  return (
    <header className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">{title}</h1>
      <div className="flex justify-between items-center mb-4">
        <div className="flex gap-3">
          <input
            type="text"
            placeholder="Draft name (optional)"
            value={currentDraftName}
            onChange={(e) => setCurrentDraftName(e.target.value)}
            className="px-2 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={onSaveDraft}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition"
          >
            Save Draft
          </button>
          <button
            onClick={onToggleDrafts}
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition"
          >
            View Drafts ({savedDraftsCount})
          </button>
          <button
            onClick={onAddSchedule}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition"
          >
            Add Schedule
          </button>
          <button
            onClick={onGeneratePDFs}
            disabled={isGeneratingPDF}
            className={`px-6 py-3 rounded-lg ${
              isGeneratingPDF
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
            } text-white transition-colors`}
          >
            {isGeneratingPDF ? 'Generating PDFs...' : 'Generate PDFs'}
          </button>
          <button
            onClick={onSaveQuotation}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition"
          >
            Save Quotation
          </button>
        </div>
      </div>

      {saveMessage && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4" role="alert">
          {saveMessage}
        </div>
      )}
    </header>
  );
};
