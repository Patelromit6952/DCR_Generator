export const useDraftManagement = (quotationType, clientDetails, data, calculations, labourCessRate) => {
  const storageKey = `${quotationType}Drafts`;

  const saveDraft = (draftName, showMessage) => {
    const finalDraftName = draftName || `Draft_${clientDetails.name || 'Untitled'}_${new Date().toLocaleDateString()}`;
    const draftData = {
      id: Date.now(),
      name: finalDraftName,
      clientDetails,
      data,
      ...calculations,
      labourCessRate,
      savedAt: new Date().toLocaleString()
    };

    const existingDrafts = JSON.parse(sessionStorage.getItem(storageKey) || '[]');
    const updatedDrafts = [...existingDrafts, draftData];

    sessionStorage.setItem(storageKey, JSON.stringify(updatedDrafts));
    showMessage('Draft saved successfully!');
    
    return updatedDrafts;
  };

  const loadDraft = (draft, setClientDetails, setData, setLabourCessRate, setCurrentDraftName, showMessage) => {
    setClientDetails(draft.clientDetails);
    setData(draft.data);
    setCurrentDraftName(draft.name);
    setLabourCessRate(draft.labourCessRate || 1);
    showMessage('Draft loaded successfully!');
  };

  const deleteDraft = (draftId, savedDrafts, setSavedDrafts) => {
    const updatedDrafts = savedDrafts.filter(draft => draft.id !== draftId);
    setSavedDrafts(updatedDrafts);
    sessionStorage.setItem(storageKey, JSON.stringify(updatedDrafts));
    return updatedDrafts;
  };

  return { saveDraft, loadDraft, deleteDraft };
};