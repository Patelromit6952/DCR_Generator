import React from 'react';

export const BaseQuotationComponent = ({
  quotationType,
  title,
  children,
  data,
  clientDetails,
  labourCessRate,
  calculations,
  customPDFGenerator
}) => {
  const quotationState = useQuotationState(quotationType);
  const { dropdownOpen, toggleDropdown } = useDropdownState(data);
  const draftManagement = useDraftManagement(quotationType, clientDetails, data, calculations, labourCessRate);
  const { isGeneratingPDF, currentStep, generateWithLoader } = usePDFGeneration();

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <QuotationHeader
          title={title}
          currentDraftName={quotationState.currentDraftName}
          setCurrentDraftName={quotationState.setCurrentDraftName}
          onSaveDraft={() => {
            const updatedDrafts = draftManagement.saveDraft(
              quotationState.currentDraftName,
              quotationState.setSaveMessage
            );
            quotationState.setSavedDrafts(updatedDrafts);
            quotationState.setCurrentDraftName('');
          }}
          onToggleDrafts={() => setShowDrafts(!showDrafts)}
          savedDraftsCount={quotationState.savedDrafts.length}
          onAddSchedule={() => setShowAddSchedule(!showAddSchedule)}
          onGeneratePDFs={() => generateWithLoader(customPDFGenerator)}
          isGeneratingPDF={isGeneratingPDF}
          saveMessage={quotationState.saveMessage}
        />

        {children}

        <SummarySection {...calculations} labourCessRate={labourCessRate} />

        <PDFLoader currentStep={currentStep} isVisible={isGeneratingPDF} />
      </div>
    </div>
  );
};