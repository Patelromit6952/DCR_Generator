
import React from 'react';

export const DraftsPanel = ({ 
  showDrafts, 
  savedDrafts, 
  onLoadDraft, 
  onDeleteDraft 
}) => {
  if (!showDrafts) return null;

  return (
    <section className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
      <h2 className="text-lg font-semibold mb-3">Saved Drafts</h2>
      {savedDrafts.length === 0 ? (
        <p className="text-gray-500">No drafts saved yet.</p>
      ) : (
        <div className="space-y-2">
          {savedDrafts.map((draft) => (
            <div key={draft.id} className="bg-white p-3 rounded border flex justify-between items-center">
              <div>
                <div className="font-medium">{draft.name}</div>
                <div className="text-sm text-gray-500">
                  Client: {draft.clientDetails.name || 'N/A'} | 
                  Total: ₹{(draft.finalTotal || 0).toFixed(2)} | 
                  Saved: {draft.savedAt}
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => onLoadDraft(draft)}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm"
                >
                  Load
                </button>
                <button
                  onClick={() => onDeleteDraft(draft.id)}
                  className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};