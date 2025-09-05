import React, { useState, useEffect } from 'react';
import api from '../Backend_api/SummaryApi';

// Import all the common components and hooks
import { useQuotationState } from '../hooks/useQuotationState';
import { useDraftManagement } from '../hooks/useDraftManagement';
import { useDropdownState } from '../hooks/useDropdownState';
import { useCalculations } from '../hooks/useCalculations';
import { useScheduleManagement } from '../hooks/useScheduleManagement';
import { useQuantityCalculator } from '../hooks/useQuantityCalculator';
import { updateItemCalculations } from '../utils/calculationHelpers';
import { QuotationHeader } from '../components/QuotationHeader';
import { ClientDetailsForm } from '../components/ClientDetailsForm';
import { DraftsPanel } from '../components/DraftsPanel';
import { AddScheduleForm } from '../components/AddScheduleForm';
import { ScheduleSection } from '../components/ScheduleSection';
import { SummarySection } from '../components/SummarySection';
import { PDFLoader } from '../components/PDFLoader';
import {createPDFWindow, writeToPDFWindow, generateAbstractPDFTemplate, generateMeasurementPDFTemplate } from '../utils/pdfTemplates';

// Add the missing calculation function
const calculateItemAmounts = (item, labourCessRate) => {
  const qty = parseFloat(item.qty) || 0;
  const rate = parseFloat(item.rate) || 0;
  const labourCessOnRate = (rate * labourCessRate) / 100;
  const finalRate = rate + labourCessOnRate;
  const amount = qty * finalRate;

  return {
    labourCessOnRate: parseFloat(labourCessOnRate.toFixed(2)),
    finalRate: parseFloat(finalRate.toFixed(2)),
    amount: parseFloat(amount.toFixed(2))
  };
};
const transformQuotationData = (quotationData) => {
  if (!quotationData || !quotationData.schedules) {
    return [];
  }

  return quotationData.schedules.map(schedule => ({
    ...schedule,
    item_of_works: schedule.item_of_works?.map(item => ({
      ...item,
      qty: item.qty || 0,
      rate: item.rate || 0,
      amount: item.amount || ((item.qty || 0) * (item.rate || 0)),
      calcRows: item.calcRows || [],
      labourCessOnRate: item.labourCessOnRate || 0,
      finalRate: item.finalRate || (item.rate || 0)
    })) || []
  }));
};
const ESRoom = () => {
    const location = useLocation();
      const [isLoadingData, setIsLoadingData] = useState(true);
    
  const [data, setData] = useState([]);
  const [labourCessRate, setLabourCessRate] = useState(1);
  const [showDrafts, setShowDrafts] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [currentQuotationId, setCurrentQuotationId] = useState(null); // Added missing state
  const [workname,setworkname] = useState("");

  const quotationType = 'ESRoom';

  // Use common hooks
  const quotationState = useQuotationState(quotationType);
  const { dropdownOpen, setDropdownOpen, toggleDropdown } = useDropdownState(data);
  const calculations = useCalculations(data, labourCessRate);
  const scheduleManagement = useScheduleManagement(data, setData, setDropdownOpen);
  const quantityCalculator = useQuantityCalculator(setData);
  const draftManagement = useDraftManagement(quotationType, quotationState.clientDetails, data, calculations, labourCessRate);

  const fetchData = async () => {
    try {
      const response = await api.EsRoom({});
      if (response?.data?.data) {
        const formatted = response.data.data.map(schedule => ({
          ...schedule,
          item_of_works: schedule.item_of_works?.map(item => ({
            ...item,
            qty: item.qty || 0,
            rate: item.rate || 0,
            amount: (item.qty || 0) * (item.rate || 0),
            calcRows: item.calcRows || [],
            labourCessOnRate: 0,
            finalRate: item.rate || 0
          }))
        }));
        console.log('Fetched and formatted data:', formatted);
        console.log('Sample item calcRows:', formatted[0]?.item_of_works?.[0]?.calcRows);
        setData(formatted);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };
  const loadQuotationData = (quotationData) => {
    try {
      console.log('Loading quotation data:', quotationData);
      
      // Transform and set schedules data
      const transformedData = transformQuotationData(quotationData);
      setData(transformedData);
      
      // Set labour cess rate from summary
      if (quotationData.summary?.labourCessPercentage !== undefined) {
        setLabourCessRate(quotationData.summary.labourCessPercentage);
      }
      
      // Set client details
      if (quotationData.clientDetails) {
        quotationState.setClientDetails(quotationData.clientDetails);
      }
      
      // Set quotation ID if available
      if (quotationData.id || quotationData._id) {
        setCurrentQuotationId(quotationData.id || quotationData._id);
      }
      
      console.log('Quotation data loaded successfully');
    } catch (error) {
      console.error('Error loading quotation data:', error);
      quotationState.setSaveMessage('Error loading quotation data');
    }
  };
  useEffect(() => {
    const initializeData = async () => {
      setIsLoadingData(true);
      
      try {
        if (location.state?.quotation) {
          // Load data from previous page
          console.log('Loading from location state:', location.state.quotation);
          loadQuotationData(location.state.quotation);
        } else {
          // Fetch fresh data from API
          console.log('Fetching fresh data from API');
          await fetchData();
        }
      } catch (error) {
        console.error('Error initializing data:', error);
      } finally {
        setIsLoadingData(false);
      }
    };

    initializeData();
  }, [location.state]); 

  // Handle item changes with proper calculation updates
  const handleItemChange = (sIdx, iIdx, field, value) => {
    if (field === 'description' || field === 'unit') {
      const updated = [...data];
      updated[sIdx].item_of_works[iIdx][field] = value;
      setData(updated);
    } else {
      // Use the calculation helper for numeric fields
      const updated = updateItemCalculations(data, sIdx, iIdx, field, value, labourCessRate);
      setData(updated);
    }
  };

  // Handle labour cess rate changes
  const handleLabourCessChange = (newRate) => {
    setLabourCessRate(newRate);

    // Recalculate all items with new labour cess rate
    const updated = [...data];
    updated.forEach(schedule => {
      schedule.item_of_works.forEach(item => {
        const { labourCessOnRate, finalRate, amount } = calculateItemAmounts(item, newRate);
        Object.assign(item, { labourCessOnRate, finalRate, amount });
      });
    });
    setData(updated);
  };

  const handleSaveQuotationToDB = async () => {
    try {
      const quotationData = {
        quotationType: quotationType,
        workname:workname,
        clientDetails: quotationState.clientDetails,
        schedules: data,
        summary: {
          baseAmountWithoutLabourCess: calculations.baseAmountWithoutLabourCess,
          totalLabourCessAmount: calculations.totalLabourCessAmount,
          subtotal: calculations.subtotal,
          gstAmount: calculations.gstAmount,
          finalTotal: calculations.finalTotal,
          gstPercentage: 18,
          labourCessPercentage: labourCessRate,
        },
        createdAt: new Date(),
        status: 'Final',
      };

      const response = await api.saveQuotation(quotationData);
      if (response?.data?.success) {
        quotationState.setSaveMessage('Quotation saved to database successfully!');
        setCurrentQuotationId(response.data.quotationId);
      } else {
        quotationState.setSaveMessage('Error saving quotation to database');
      }
      return response;
    } catch (error) {
      console.error('Error saving quotation:', error);
      quotationState.setSaveMessage('Error saving quotation to database');
      return { error: true, message: error.message };
    } finally {
      setTimeout(() => quotationState.setSaveMessage(''), 3000);
    }
  };

  // Quantity calculator props with stable references
  const quantityCalculatorProps = React.useMemo(() => ({
    onToggle: quantityCalculator.toggleQtyCalc,
    onCalcRowChange: quantityCalculator.handleCalcRowChange,
    onAddCalcRow: quantityCalculator.addCalcRow,
    onDeleteCalcRow: quantityCalculator.deleteCalcRow,
    onSaveCalculation: (sIdx, iIdx) => {
      quantityCalculator.saveCalculation(sIdx, iIdx, labourCessRate);
    },
    onCancel: quantityCalculator.cancelQtyCalc || quantityCalculator.toggleQtyCalc,
    isCalculatorOpen: quantityCalculator.isCalculatorOpen
  }), [quantityCalculator, labourCessRate]);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <QuotationHeader
          title="ES Room Quotation"
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
          onAddSchedule={() => scheduleManagement.setShowAddSchedule(!scheduleManagement.showAddSchedule)}
          isGeneratingPDF={isGeneratingPDF}
          saveMessage={quotationState.saveMessage}
          onGeneratePDFs={() => {
            setIsGeneratingPDF(true);
            try {              
              console.log(data);
                            
                const pdfTemplate1 = generateAbstractPDFTemplate(data,workname);
                const pdfTemplate2 = generateMeasurementPDFTemplate(data,workname);
              const pdfWindow1 = createPDFWindow('ESRoom Quotation');
              const pdfWindow2 = createPDFWindow('ESRoom Measurement Sheet');
              if (pdfWindow1) {
                writeToPDFWindow(pdfWindow1, pdfTemplate1);
              }
              if (pdfWindow2) {
                writeToPDFWindow(pdfWindow2, pdfTemplate2);
              }
            } catch (error) {
              console.error('Error generating PDF:', error);
              alert('Error generating PDF. Please try again.');
            } finally {
              setIsGeneratingPDF(false);
            }
          }}
          onSaveQuotation={handleSaveQuotationToDB} // Pass the save function
        />

        <AddScheduleForm
          showAddSchedule={scheduleManagement.showAddSchedule}
          newScheduleData={scheduleManagement.newScheduleData}
          setNewScheduleData={scheduleManagement.setNewScheduleData}
          onAddSchedule={() => scheduleManagement.addNewSchedule(quotationState.setSaveMessage)}
          onCancel={() => {
            scheduleManagement.setShowAddSchedule(false);
            scheduleManagement.setNewScheduleData({
              schedule: '',
              description: '',
              item_of_works: []
            });
          }}
        />

        <DraftsPanel
          showDrafts={showDrafts}
          savedDrafts={quotationState.savedDrafts}
          onLoadDraft={(draft) => draftManagement.loadDraft(
            draft,
            quotationState.setClientDetails,
            setData,
            setLabourCessRate,
            quotationState.setCurrentDraftName,
            quotationState.setSaveMessage
          )}
          onDeleteDraft={(draftId) => {
            const updatedDrafts = draftManagement.deleteDraft(
              draftId,
              quotationState.savedDrafts,
              quotationState.setSavedDrafts
            );
            quotationState.setSavedDrafts(updatedDrafts);
          }}
        />

        <ClientDetailsForm
          clientDetails={quotationState.clientDetails}
          handleClientDetailsChange={quotationState.handleClientDetailsChange}
          labourCessRate={labourCessRate}
          setLabourCessRate={setLabourCessRate}
          onLabourCessChange={handleLabourCessChange}
           workname={workname} 
          setworkname={setworkname}
        />

        {/* Main content with schedules */}
        <main>
          {data.map((schedule, scheduleIndex) => (
            <ScheduleSection
              key={`schedule-${scheduleIndex}`}
              schedule={schedule}
              scheduleIndex={scheduleIndex}
              isOpen={dropdownOpen[scheduleIndex]}
              onToggle={toggleDropdown}
              onAddItem={scheduleManagement.addNewItemToSchedule}
              onRemoveSchedule={() => scheduleManagement.removeSchedule(scheduleIndex, dropdownOpen)}
              onItemChange={handleItemChange}
              onRemoveItem={(sIdx, iIdx) => {
                const updated = [...data];
                updated[sIdx].item_of_works.splice(iIdx, 1);
                setData(updated);
              }}
              labourCessRate={labourCessRate}
              quantityCalculatorProps={quantityCalculatorProps}
            />
          ))}
        </main>

        <SummarySection
          baseAmountWithoutLabourCess={calculations.baseAmountWithoutLabourCess}
          totalLabourCessAmount={calculations.totalLabourCessAmount}
          subtotal={calculations.subtotal}
          gstAmount={calculations.gstAmount}
          finalTotal={calculations.finalTotal}
          labourCessRate={labourCessRate}
        />

        <PDFLoader currentStep={currentStep} isVisible={isGeneratingPDF} />
      </div>
    </div>
  );
};

export default ESRoom;