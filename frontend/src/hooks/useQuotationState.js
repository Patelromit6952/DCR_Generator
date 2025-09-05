import { useState, useEffect } from 'react';

export const useQuotationState = (quotationType) => {
  const storageKey = `${quotationType}Drafts`;
  
  const [clientDetails, setClientDetails] = useState({
    name: '',
    address: '',
    phone: '',
    email: '',
    quotationDate: new Date().toISOString().split('T')[0]
  });
  
  const [savedDrafts, setSavedDrafts] = useState([]);
  const [saveMessage, setSaveMessage] = useState('');
  const [currentDraftName, setCurrentDraftName] = useState('');
  const [currentQuotationId, setCurrentQuotationId] = useState(null);

  useEffect(() => {
    const stored = JSON.parse(sessionStorage.getItem(storageKey) || '[]');
    setSavedDrafts(stored);
  }, [storageKey]);

  const handleClientDetailsChange = (field, value) => {
    setClientDetails(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const showMessage = (message, duration = 3000) => {
    setSaveMessage(message);
    setTimeout(() => setSaveMessage(''), duration);
  };

  return {
    clientDetails,
    setClientDetails,
    handleClientDetailsChange,
    savedDrafts,
    setSavedDrafts,
    saveMessage,
    setSaveMessage: showMessage,
    currentDraftName,
    setCurrentDraftName,
    currentQuotationId,
    setCurrentQuotationId,
    storageKey
  };
};