import React, { useState, useEffect } from 'react';
import { FaChevronDown, FaChevronUp, FaCalculator, FaPlus, FaTrash, FaSave, FaPrint, FaDownload, FaFileAlt, FaEdit } from 'react-icons/fa';
import { MdEdit, MdAdd } from 'react-icons/md';
import api from '../Backend_api/SummaryApi';

const PaverBlock = () => {
  const [Data, setData] = useState([]);
  const [currentQuotationId, setCurrentQuotationId] = useState(null);

  const quotationType = 'paverblock';
  const storageKey = `${quotationType}Drafts`;
  const [dropdownOpen, setDropdownOpen] = useState({});
  const [clientDetails, setClientDetails] = useState({
    name: '',
    address: '',
    phone: '',
    email: '',
    quotationDate: new Date().toISOString().split('T')[0]
  });
  const [savedDrafts, setSavedDrafts] = useState([]);
  const [showDrafts, setShowDrafts] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [currentDraftName, setCurrentDraftName] = useState('');
  
  // New states for schedule management
  const [showAddSchedule, setShowAddSchedule] = useState(false);
  const [newScheduleData, setNewScheduleData] = useState({
    schedule: '',
    description: '',
    item_of_works: []
  });

  const fetchData = async () => {
    try {
      const response = await api.Paverblock({});
      if (response?.data?.data) {
        const formatted = response.data.data.map(schedule => ({
          ...schedule,
          item_of_works: schedule.item_of_works?.map(item => ({
            ...item,
            qty: item.qty || 0,
            rate: item.rate || 0,
            amount: (item.qty || 0) * (item.rate || 0),
            calcRows: item.calcRows || []
          }))
        }));
        setData(formatted);
        
        // Initialize dropdown states
        const initialDropdownState = {};
        formatted.forEach((_, index) => {
          initialDropdownState[index] = true;
        });
        setDropdownOpen(initialDropdownState);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const saveQuotationToDB = async () => {
    try {
      const quotationData = {
        quotationType: 'PaverBlock',
        clientDetails,
        schedules: Data,
        summary: {
          subtotal,
          gstAmount,
          finalTotal,
          gstPercentage: 18,
        },
        createdAt: new Date(),
        status: 'Final',
      };

      const response = await api.saveQuotation(quotationData);
      if (response?.data?.success) {
        setSaveMessage('Quotation saved to database successfully!');
        setCurrentQuotationId(response.data.quotationId);
      } else {
        setSaveMessage('Error saving quotation to database');
      }
      return response;
    } catch (error) {
      console.error('Error saving quotation:', error);
      setSaveMessage('Error saving quotation to database');
      return { error: true, message: error.message };
    } finally {
      setTimeout(() => setSaveMessage(''), 3000);
    }
  };

  useEffect(() => {
    const stored = JSON.parse(sessionStorage.getItem(storageKey) || '[]');
    setSavedDrafts(stored);
  }, [quotationType]);

  useEffect(() => { fetchData() }, []);

  // Roman numeral converter
  const toRoman = (num) => {
    const values = [1000, 900, 500, 400, 100, 90, 50, 40, 10, 9, 5, 4, 1];
    const symbols = ['M', 'CM', 'D', 'CD', 'C', 'XC', 'L', 'XL', 'X', 'IX', 'V', 'IV', 'I'];
    let result = '';
    
    for (let i = 0; i < values.length; i++) {
      while (num >= values[i]) {
        result += symbols[i];
        num -= values[i];
      }
    }
    return result;
  };

  const toggleDropdown = (scheduleIndex) => {
    setDropdownOpen(prev => ({
      ...prev,
      [scheduleIndex]: !prev[scheduleIndex]
    }));
  };

  const toggleQtyCalc = (scheduleIndex, itemIndex) => {
    const updated = [...Data];
    updated[scheduleIndex].item_of_works[itemIndex].showQtyCalc = !updated[scheduleIndex].item_of_works[itemIndex].showQtyCalc;

    if (updated[scheduleIndex].item_of_works[itemIndex].showQtyCalc && updated[scheduleIndex].item_of_works[itemIndex].calcRows.length === 0) {
      updated[scheduleIndex].item_of_works[itemIndex].calcRows.push({ length: 0, width: 0, height: 1, description: '' });
    }

    setData(updated);
  };

  const handleCalcRowChange = (scheduleIndex, taskIndex, rowIndex, field, value) => {
    const updated = [...Data];
    updated[scheduleIndex].item_of_works[taskIndex].calcRows[rowIndex][field] = field === 'description' ? value : (parseFloat(value) || 0);
    setData(updated);
  };

  const addCalcRow = (scheduleIndex, taskIndex) => {
    const updated = [...Data];
    updated[scheduleIndex].item_of_works[taskIndex].calcRows.push({ length: 0, width: 0, height: 1, description: '' });
    setData(updated);
  };

  const deleteCalcRow = (scheduleIndex, taskIndex, rowIndex) => {
    const updated = [...Data];
    updated[scheduleIndex].item_of_works[taskIndex].calcRows.splice(rowIndex, 1);
    setData(updated);
  };

  const saveCalculation = (scheduleIndex, taskIndex) => {
    const updated = [...Data];
    const rows = updated[scheduleIndex].item_of_works[taskIndex].calcRows;
    const totalQty = rows.reduce((sum, row) => sum + row.length * row.width * (row.height || 1), 0);
    updated[scheduleIndex].item_of_works[taskIndex].qty = totalQty;
    updated[scheduleIndex].item_of_works[taskIndex].amount = totalQty * updated[scheduleIndex].item_of_works[taskIndex].rate;
    updated[scheduleIndex].item_of_works[taskIndex].showQtyCalc = false;
    setData(updated);
  };

  const handleChange = (scheduleIndex, itemIndex, field, value) => {
    const updated = [...Data];
    const item = updated[scheduleIndex].item_of_works[itemIndex];
    item[field] = parseFloat(value) || 0;
    item.amount = item.qty * item.rate;
    setData(updated);
  };

  const handleRemoveRow = (scheduleIndex, itemIndex) => {
    const updated = [...Data];
    updated[scheduleIndex].item_of_works.splice(itemIndex, 1);
    setData(updated);
  };

  // New function to add schedule with enhanced debugging
  const addNewSchedule = () => {
    console.log('Adding new schedule:', newScheduleData); // Debug log
    
    if (!newScheduleData.schedule.trim() || !newScheduleData.description.trim()) {
      alert('Please enter both schedule number and description');
      console.log('Validation failed:', { 
        schedule: newScheduleData.schedule, 
        description: newScheduleData.description 
      });
      return;
    }

    // Check if schedule number already exists
    const scheduleExists = Data.some(schedule => 
      schedule.schedule.toLowerCase().trim() === newScheduleData.schedule.toLowerCase().trim()
    );
    
    if (scheduleExists) {
      alert('Schedule number already exists. Please use a different number.');
      return;
    }

    const newSchedule = {
      schedule: newScheduleData.schedule.trim(),
      description: newScheduleData.description.trim(),
      item_of_works: [
        {
          description: 'New Work Item - Click to edit description',
          qty: 0,
          rate: 0,
          amount: 0,
          unit: 'Sqm',
          calcRows: [],
          showQtyCalc: false
        }
      ]
    };

    console.log('Creating new schedule:', newSchedule); // Debug log

    const updatedData = [...Data, newSchedule];
    console.log('Updated data array:', updatedData); // Debug log
    
    setData(updatedData);
    
    // Set dropdown open for the new schedule
    const newIndex = updatedData.length - 1;
    setDropdownOpen(prev => ({ 
      ...prev, 
      [newIndex]: true 
    }));
    
    console.log('New schedule index:', newIndex); // Debug log
    
    // Reset form
    setNewScheduleData({
      schedule: '',
      description: '',
      item_of_works: []
    });
    setShowAddSchedule(false);
    setSaveMessage('New schedule added successfully!');
    setTimeout(() => setSaveMessage(''), 3000);
  };

  // Function to add new item to a schedule
  const addNewItemToSchedule = (scheduleIndex) => {
    const updated = [...Data];
    updated[scheduleIndex].item_of_works.push({
      description: 'New Work Item',
      qty: 0,
      rate: 0,
      amount: 0,
      unit: 'Sqm',
      calcRows: [],
      showQtyCalc: false
    });
    setData(updated);
  };

  // Function to remove entire schedule
  const removeSchedule = (scheduleIndex) => {
    if (window.confirm('Are you sure you want to remove this entire schedule?')) {
      const updated = [...Data];
      updated.splice(scheduleIndex, 1);
      setData(updated);
      
      // Update dropdown states
      const newDropdownState = {};
      updated.forEach((_, index) => {
        newDropdownState[index] = dropdownOpen[index] || false;
      });
      setDropdownOpen(newDropdownState);
    }
  };

  const subtotal = Data.reduce((acc, schedule) => {
    return acc + schedule.item_of_works.reduce((sum, item) => sum + item.amount, 0);
  }, 0);

  const gstAmount = subtotal * 0.18;
  const finalTotal = subtotal + gstAmount;

  const handleClientDetailsChange = (field, value) => {
    setClientDetails(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Save Draft Function
  const saveDraft = () => {
    const draftName = currentDraftName || `Draft_${clientDetails.name || 'Untitled'}_${new Date().toLocaleDateString()}`;
    const draftData = {
      id: Date.now(),
      name: draftName,
      clientDetails,
      Data,
      subtotal,
      gstAmount,
      finalTotal,
      savedAt: new Date().toLocaleString()
    };

    const existingDrafts = JSON.parse(sessionStorage.getItem(storageKey) || '[]');
    const updatedDrafts = [...existingDrafts, draftData];

    sessionStorage.setItem(storageKey, JSON.stringify(updatedDrafts));
    setSavedDrafts(updatedDrafts);
    setSaveMessage('Draft saved successfully!');
    setCurrentDraftName('');

    setTimeout(() => setSaveMessage(''), 3000);
  };

  // Load Draft Function
  const loadDraft = (draft) => {
    setClientDetails(draft.clientDetails);
    setData(draft.Data);
    setCurrentDraftName(draft.name);
    setShowDrafts(false);
    setSaveMessage('Draft loaded successfully!');
    setTimeout(() => setSaveMessage(''), 3000);
  };

  const deleteDraft = (draftId) => {
    const updatedDrafts = savedDrafts.filter(draft => draft.id !== draftId);
    setSavedDrafts(updatedDrafts);
    sessionStorage.setItem(storageKey, JSON.stringify(updatedDrafts));
  };

  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  const EnhancedPDFLoader = ({ currentStep }) => {
    const steps = [
      { id: 1, text: 'Validating data...', icon: '🔍' },
      { id: 2, text: 'Saving to database...', icon: '💾' },
      { id: 3, text: 'Generating PDF...', icon: '📄' },
      { id: 4, text: 'Opening document...', icon: '🚀' }
    ];

    return (
      <div className="fixed inset-0 bg-white bg-opacity-95 backdrop-blur-sm flex flex-col items-center justify-center z-50">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="w-20 h-20 border-4 border-blue-200 rounded-full animate-ping"></div>
              <div className="absolute top-0 left-0 w-20 h-20 border-4 border-blue-500 rounded-full animate-pulse"></div>
              <div className="absolute top-2 left-2 w-16 h-16 border-4 border-blue-300 rounded-full animate-ping" style={{ animationDelay: '0.3s' }}></div>
            </div>
          </div>

          <div className="space-y-3">
            {steps.map((step, index) => (
              <div
                key={step.id}
                className={`flex items-center space-x-3 p-3 rounded-lg transition-all duration-300 ${currentStep >= step.id
                  ? 'bg-blue-50 text-blue-700'
                  : currentStep === step.id - 1
                    ? 'bg-yellow-50 text-yellow-700'
                    : 'bg-gray-50 text-gray-400'
                  }`}
              >
                <span className="text-2xl">{step.icon}</span>
                <span className="font-medium">{step.text}</span>
                {currentStep === step.id && (
                  <div className="ml-auto">
                    <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}
                {currentStep > step.id && (
                  <div className="ml-auto text-green-600">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="mt-6 text-center">
            <p className="text-gray-500 text-sm">Please wait while we process your request...</p>
          </div>
        </div>
      </div>
    );
  };

  const LOADER_TIMING = {
    VALIDATE: 1500,
    SAVE_TO_DB: 2000,
    GENERATE_PDF: 1500,
    OPEN_DOCUMENT: 1000
  };

  const generatePDF = async () => {
    try {
      setIsGeneratingPDF(true);
      setCurrentStep(1);

      await new Promise(resolve => setTimeout(resolve, LOADER_TIMING.VALIDATE));
      setCurrentStep(2);

      const [response] = await Promise.all([
        saveQuotationToDB(),
        new Promise(resolve => setTimeout(resolve, LOADER_TIMING.SAVE_TO_DB))
      ]);

      if (response?.data?.success || response?.success) {
        setCurrentStep(3);
        await new Promise(resolve => setTimeout(resolve, LOADER_TIMING.GENERATE_PDF));
        setCurrentStep(4);
        await new Promise(resolve => setTimeout(resolve, LOADER_TIMING.OPEN_DOCUMENT));
        
        const printWindow = window.open('', '_blank');
        
        if (!printWindow || printWindow.closed || typeof printWindow.closed === 'undefined') {
          setIsGeneratingPDF(false);
          alert('Popup blocked! Please allow popups for this site and try again, or use the alternative download method.');
          downloadHTMLFile();
          return;
        }

        const pdfContent = `
    <!DOCTYPE html>
    <html>
    <head>
        <title>SED-B Quotation - ${clientDetails.name}</title>
        <style>
            body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
            .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 20px; }
            .client-info { margin-bottom: 30px; }
            .client-info h3 { margin-bottom: 10px; color: #333; }
            .client-row { display: flex; margin-bottom: 8px; }
            .client-label { font-weight: bold; width: 120px; }
            .schedule-header { background-color: #f0f8ff; padding: 15px; margin: 20px 0 10px 0; border-left: 4px solid #4a90e2; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; font-weight: bold; }
            .description { max-width: 300px; word-wrap: break-word; }
            .amount { text-align: right; font-weight: bold; }
            .summary { margin-top: 30px; }
            .summary-table { width: 400px; margin-left: auto; }
            .total-row { background-color: #f0f8ff; font-weight: bold; font-size: 1.1em; }
            .schedule-summary { background-color: #f9f9f9; padding: 10px; margin: 10px 0; }
            .footer { margin-top: 50px; text-align: center; font-size: 12px; color: #666; }
            @media print {
                body { margin: 0; }
                .no-print { display: none; }
            }
        </style>
    </head>
    <body>
        <div class="header">
            <h1>SED-B Construction Quotation</h1>
            <p>Professional Construction Services</p>
        </div>

        <div class="client-info">
            <h3>Client Information:</h3>
            <div class="client-row">
                <span class="client-label">Client Name:</span>
                <span>${clientDetails.name || 'N/A'}</span>
            </div>
            <div class="client-row">
                <span class="client-label">Address:</span>
                <span>${clientDetails.address || 'N/A'}</span>
            </div>
            <div class="client-row">
                <span class="client-label">Phone:</span>
                <span>${clientDetails.phone || 'N/A'}</span>
            </div>
            <div class="client-row">
                <span class="client-label">Email:</span>
                <span>${clientDetails.email || 'N/A'}</span>
            </div>
            <div class="client-row">
                <span class="client-label">Date:</span>
                <span>${clientDetails.quotationDate}</span>
            </div>
        </div>

        ${Data.map(schedule => {
        const scheduleTotal = schedule.item_of_works.reduce((sum, item) => sum + item.amount, 0);
        return `
              <div class="schedule-header">
                  <h2>Schedule ${schedule.schedule} - ${schedule.description || 'Work Items'}</h2>
              </div>

              <table>
                  <thead>
                      <tr>
                          <th>S.No.</th>
                          <th>Description of Work</th>
                          <th>Quantity</th>
                          <th>Unit</th>
                          <th>Rate (₹)</th>
                          <th>Amount (₹)</th>
                      </tr>
                  </thead>
                  <tbody>
                      ${schedule.item_of_works.map((item, index) => `
                          <tr>
                              <td>${index + 1}</td>
                              <td class="description">${item.description}</td>
                              <td style="text-align: center;">${item.qty.toFixed(2)}</td>
                              <td style="text-align: center;">${item.unit || '-'}</td>
                              <td class="amount">₹${item.rate.toFixed(2)}</td>
                              <td class="amount">₹${item.amount.toFixed(2)}</td>
                          </tr>
                      `).join('')}
                  </tbody>
              </table>

              <div class="schedule-summary">
                  <div style="display: flex; justify-content: space-between; align-items: center;">
                      <strong>Schedule ${schedule.schedule} Subtotal:</strong>
                      <strong>₹${scheduleTotal.toFixed(2)}</strong>
                  </div>
              </div>
            `;
      }).join('')}

        <div class="summary">
            <table class="summary-table">
                <tr>
                    <td><strong>Project Subtotal:</strong></td>
                    <td class="amount">₹${subtotal.toFixed(2)}</td>
                </tr>
                <tr>
                    <td><strong>GST (18%):</strong></td>
                    <td class="amount">₹${gstAmount.toFixed(2)}</td>
                </tr>
                <tr class="total-row">
                    <td><strong>Total Project Amount:</strong></td>
                    <td class="amount">₹${finalTotal.toFixed(2)}</td>
                </tr>
            </table>
        </div>

        <div class="footer">
            <p>Generated on: ${new Date().toLocaleString()}</p>
        </div>

        <div class="no-print" style="margin-top: 30px; text-align: center;">
            <button onclick="window.print(); window.close();" style="background: #4CAF50; color: white; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer; margin-right: 10px;">Print PDF</button>
            <button onclick="window.close()" style="background: #f44336; color: white; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer;">Close</button>
        </div>
    </body>
    </html>
    `;

        try {
          printWindow.document.write(pdfContent);
          printWindow.document.close();
        } catch (writeError) {
          console.error("Error writing to popup window:", writeError);
          setIsGeneratingPDF(false);
          alert("Error opening PDF window. Please try again.");
          return;
        }

        setIsGeneratingPDF(false);

        printWindow.onafterprint = () => {
          window.location.href = '/dashboard';
        };

        printWindow.onbeforeunload = () => {
          setIsGeneratingPDF(false);
        };

      } else {
        setIsGeneratingPDF(false);
        alert("Failed to save quotation to database.");
      }
    } catch (error) {
      console.error("Error saving quotation:", error);
      setIsGeneratingPDF(false);
      alert("Something went wrong while saving. Please try again.");
    }
  };

  const downloadHTMLFile = () => {
    const htmlContent = `<!DOCTYPE html>
<html>
<head>
    <title>SED-B Quotation - ${clientDetails.name}</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
        .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 20px; }
        .client-info { margin-bottom: 30px; }
        .client-info h3 { margin-bottom: 10px; color: #333; }
        .client-row { display: flex; margin-bottom: 8px; }
        .client-label { font-weight: bold; width: 120px; }
        .schedule-header { background-color: #f0f8ff; padding: 15px; margin: 20px 0 10px 0; border-left: 4px solid #4a90e2; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; font-weight: bold; }
        .description { max-width: 300px; word-wrap: break-word; }
        .amount { text-align: right; font-weight: bold; }
        .summary { margin-top: 30px; }
        .summary-table { width: 400px; margin-left: auto; }
        .total-row { background-color: #f0f8ff; font-weight: bold; font-size: 1.1em; }
        .schedule-summary { background-color: #f9f9f9; padding: 10px; margin: 10px 0; }
        .footer { margin-top: 50px; text-align: center; font-size: 12px; color: #666; }
        .print-button { background: #4CAF50; color: white; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer; margin: 20px auto; display: block; }
        @media print {
            .print-button { display: none; }
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>SED-B Construction Quotation</h1>
        <p>Professional Construction Services</p>
    </div>
    <button class="print-button" onclick="window.print()">Print This Quotation</button>
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `SED-B_Quotation_${clientDetails.name}_${new Date().toISOString().split('T')[0]}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold text-gray-800">PaverBlock Quotation</h1>
            <div className="flex gap-3">
              <input
                type="text"
                placeholder="Draft name (optional)"
                value={currentDraftName}
                onChange={(e) => setCurrentDraftName(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={saveDraft}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition"
              >
                <FaSave /> Save Draft
              </button>
              <button
                onClick={() => setShowDrafts(!showDrafts)}
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition"
              >
                <FaFileAlt /> View Drafts ({savedDrafts.length})
              </button>
              <button
                onClick={() => setShowAddSchedule(!showAddSchedule)}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition"
              >
                <MdAdd /> Add Schedule
              </button>
              <button
                onClick={generatePDF}
                disabled={isGeneratingPDF}
                className={`px-6 py-3 rounded-lg ${isGeneratingPDF
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700'
                  } text-white transition-colors`}
              >
                {isGeneratingPDF ? 'Generating PDF...' : 'Generate PDF'}
              </button>
            </div>
          </div>

          {/* Save Message */}
          {saveMessage && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
              {saveMessage}
            </div>
          )}

          {isGeneratingPDF && <EnhancedPDFLoader currentStep={currentStep} />}

          {/* Add New Schedule Form */}
          {showAddSchedule && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <h3 className="text-lg font-semibold mb-3 text-blue-800">Add New Schedule</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Schedule Number/Identifier</label>
                  <input
                    type="text"
                    value={newScheduleData.schedule}
                    onChange={(e) => setNewScheduleData(prev => ({ 
                      ...prev, 
                      schedule: e.target.value 
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., B2, I, II, III, RA-1, etc."
                  />
                  <p className="text-xs text-gray-500 mt-1">Enter unique schedule identifier</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Schedule Description</label>
                  <input
                    type="text"
                    value={newScheduleData.description}
                    onChange={(e) => setNewScheduleData(prev => ({ 
                      ...prev, 
                      description: e.target.value 
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., Rate Analysis, Foundation Work, etc."
                  />
                  <p className="text-xs text-gray-500 mt-1">Describe the type of work</p>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={addNewSchedule}
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg flex items-center gap-2 transition font-medium"
                >
                  <FaPlus /> Add Schedule
                </button>
                <button
                  onClick={() => {
                    setShowAddSchedule(false);
                    setNewScheduleData({
                      schedule: '',
                      description: '',
                      item_of_works: []
                    });
                  }}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg transition font-medium"
                >
                  Cancel
                </button>
              </div>
              
              {/* Preview */}
              {(newScheduleData.schedule || newScheduleData.description) && (
                <div className="mt-4 p-3 bg-white border border-gray-200 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Preview:</p>
                  <p className="font-medium">
                    Schedule {newScheduleData.schedule} - {newScheduleData.description}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Drafts Panel */}
          {showDrafts && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
              <h3 className="text-lg font-semibold mb-3">Saved Drafts</h3>
              {savedDrafts.length === 0 ? (
                <p className="text-gray-500">No drafts saved yet.</p>
              ) : (
                <div className="space-y-2">
                  {savedDrafts.map((draft) => (
                    <div key={draft.id} className="bg-white p-3 rounded border flex justify-between items-center">
                      <div>
                        <div className="font-medium">{draft.name}</div>
                        <div className="text-sm text-gray-500">
                          Client: {draft.clientDetails.name || 'N/A'} | Total: ₹{draft.finalTotal.toFixed(2)} | Saved: {draft.savedAt}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => loadDraft(draft)}
                          className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm"
                        >
                          Load
                        </button>
                        <button
                          onClick={() => deleteDraft(draft.id)}
                          className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Client Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Client Name</label>
              <input
                type="text"
                value={clientDetails.name}
                onChange={(e) => handleClientDetailsChange('name', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter client name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
              <input
                type="text"
                value={clientDetails.address}
                onChange={(e) => handleClientDetailsChange('address', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter address"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
              <input
                type="tel"
                value={clientDetails.phone}
                onChange={(e) => handleClientDetailsChange('phone', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter phone number"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input
                type="email"
                value={clientDetails.email}
                onChange={(e) => handleClientDetailsChange('email', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter email"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Quotation Date</label>
              <input
                type="date"
                value={clientDetails.quotationDate}
                onChange={(e) => handleClientDetailsChange('quotationDate', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Work Items - Multiple Schedules */}
        {Data.map((schedule, scheduleIndex) => (
          <div key={scheduleIndex} className="bg-white rounded-lg shadow-lg overflow-hidden mb-6">
            <div
              className="flex justify-between items-center bg-gradient-to-r from-gray-800 to-gray-700 text-white px-6 py-4 cursor-pointer"
              onClick={() => toggleDropdown(scheduleIndex)}
            >
              <h2 className="text-xl font-semibold flex items-center gap-3">
                <span className="bg-blue-600 px-3 py-1 rounded-full text-sm">
                  Schedule {schedule.schedule}
                </span>
                {schedule.description || 'Work Items'}
              </h2>
              <div className="flex items-center gap-3">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    addNewItemToSchedule(scheduleIndex);
                  }}
                  className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-lg flex items-center gap-1 transition text-sm"
                  title="Add New Item"
                >
                  <FaPlus /> Add Item
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeSchedule(scheduleIndex);
                  }}
                  className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-lg flex items-center gap-1 transition text-sm"
                  title="Remove Schedule"
                >
                  <FaTrash /> Remove
                </button>
                <span className="text-xl">{dropdownOpen[scheduleIndex] ? <FaChevronUp /> : <FaChevronDown />}</span>
              </div>
            </div>

            {dropdownOpen[scheduleIndex] && (
              <div className="p-6">
                {schedule.item_of_works?.map((item, itemIndex) => {
                  const totalRowQty = item.calcRows.reduce((sum, row) => sum + row.length * row.width * (row.height || 1), 0);
                  return (
                    <div key={itemIndex} className="mb-6 border border-gray-200 rounded-lg overflow-hidden">
                      {/* Item Header */}
                      <div className="bg-gray-50 p-4 border-b">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <span className="inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm font-medium mb-2">
                              Item {itemIndex + 1}
                            </span>
                            <div className="flex-1">
                              <textarea
                                value={item.description}
                                onChange={(e) => {
                                  const updated = [...Data];
                                  updated[scheduleIndex].item_of_works[itemIndex].description = e.target.value;
                                  setData(updated);
                                }}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 resize-none"
                                rows="2"
                                placeholder="Enter work description"
                              />
                            </div>
                          </div>
                          <button
                            onClick={() => handleRemoveRow(scheduleIndex, itemIndex)}
                            className="ml-4 text-red-500 hover:text-red-700 p-2 rounded-lg hover:bg-red-50 transition"
                            title="Remove Item"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </div>

                      {/* Item Details */}
                      <div className="p-4">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Quantity ({item.unit})</label>
                            <div className="flex gap-2">
                              <input
                                type="number"
                                value={item.qty}
                                onChange={(e) => handleChange(scheduleIndex, itemIndex, 'qty', e.target.value)}
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                placeholder="0.00"
                              />
                              <button
                                onClick={() => toggleQtyCalc(scheduleIndex, itemIndex)}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg flex items-center gap-1 transition"
                                title="Calculate Quantity"
                              >
                                <FaCalculator />
                              </button>
                            </div>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Rate (₹/{item.unit})</label>
                            <input
                              type="number"
                              value={item.rate}
                              onChange={(e) => handleChange(scheduleIndex, itemIndex, 'rate', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                              placeholder="0.00"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Unit</label>
                            <select
                              value={item.unit}
                              onChange={(e) => {
                                const updated = [...Data];
                                updated[scheduleIndex].item_of_works[itemIndex].unit = e.target.value;
                                setData(updated);
                              }}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            >
                              <option value="Sqm">Sqm</option>
                              <option value="Cum">Cum</option>
                              <option value="Nos">Nos</option>
                              <option value="Kg">Kg</option>
                              <option value="Ton">Ton</option>
                              <option value="Rmt">Rmt</option>
                              <option value="LS">LS</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Amount (₹)</label>
                            <input
                              type="text"
                              value={`₹${item.amount.toFixed(2)}`}
                              readOnly
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 font-semibold"
                            />
                          </div>
                        </div>

                        {/* Quantity Calculator */}
                        {item.showQtyCalc && (
                          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <div className="flex justify-between items-center mb-4">
                              <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                                <FaCalculator className="text-blue-600" />
                                Quantity Calculator
                              </h3>
                              <button
                                onClick={() => addCalcRow(scheduleIndex, itemIndex)}
                                className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg flex items-center gap-1 transition"
                              >
                                <FaPlus /> Add Row
                              </button>
                            </div>

                            <div className="overflow-x-auto">
                              <table className="w-full bg-white border border-gray-200 rounded-lg">
                                <thead className="bg-gray-100">
                                  <tr>
                                    <th className="py-2 px-3 border text-left">Description</th>
                                    <th className="py-2 px-3 border">Length (m)</th>
                                    <th className="py-2 px-3 border">Width (m)</th>
                                    <th className="py-2 px-3 border">Height (m)</th>
                                    <th className="py-2 px-3 border">Qty ({item.unit})</th>
                                    <th className="py-2 px-3 border">Action</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {item.calcRows.map((row, rowIndex) => (
                                    <tr key={rowIndex} className="hover:bg-gray-50">
                                      <td className="py-2 px-3 border">
                                        <input
                                          type="text"
                                          value={row.description}
                                          onChange={(e) => handleCalcRowChange(scheduleIndex, itemIndex, rowIndex, 'description', e.target.value)}
                                          className="w-full px-2 py-1 border rounded"
                                          placeholder="Description"
                                        />
                                      </td>
                                      <td className="py-2 px-3 border">
                                        <input
                                          type="number"
                                          value={row.length}
                                          onChange={(e) => handleCalcRowChange(scheduleIndex, itemIndex, rowIndex, 'length', e.target.value)}
                                          className="w-20 px-2 py-1 border rounded text-center"
                                          placeholder="0"
                                        />
                                      </td>
                                      <td className="py-2 px-3 border">
                                        <input
                                          type="number"
                                          value={row.width}
                                          onChange={(e) => handleCalcRowChange(scheduleIndex, itemIndex, rowIndex, 'width', e.target.value)}
                                          className="w-20 px-2 py-1 border rounded text-center"
                                          placeholder="0"
                                        />
                                      </td>
                                      <td className="py-2 px-3 border">
                                        <input
                                          type="number"
                                          value={row.height}
                                          onChange={(e) => handleCalcRowChange(scheduleIndex, itemIndex, rowIndex, 'height', e.target.value)}
                                          className="w-20 px-2 py-1 border rounded text-center"
                                          placeholder="1"
                                        />
                                      </td>
                                      <td className="py-2 px-3 border text-center font-semibold text-blue-600">
                                        {(row.length * row.width * (row.height || 1)).toFixed(2)}
                                      </td>
                                      <td className="py-2 px-3 border text-center">
                                        <button
                                          onClick={() => deleteCalcRow(scheduleIndex, itemIndex, rowIndex)}
                                          className="text-red-500 hover:text-red-700 p-1 rounded"
                                        >
                                          <FaTrash />
                                        </button>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                                <tfoot className="bg-blue-100">
                                  <tr>
                                    <td colSpan="4" className="py-2 px-3 border text-right font-semibold">
                                      Total Quantity:
                                    </td>
                                    <td className="py-2 px-3 border text-center font-bold text-blue-700">
                                      {totalRowQty.toFixed(2)}
                                    </td>
                                    <td className="py-2 px-3 border"></td>
                                  </tr>
                                </tfoot>
                              </table>
                            </div>

                            <div className="mt-4 flex gap-3">
                              <button
                                onClick={() => saveCalculation(scheduleIndex, itemIndex)}
                                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition"
                              >
                                <FaSave /> Save Calculation
                              </button>
                              <button
                                onClick={() => toggleQtyCalc(scheduleIndex, itemIndex)}
                                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}

                {/* Schedule Summary */}
                <div className="mt-6 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold text-blue-800">
                      Schedule {schedule.schedule} Subtotal:
                    </span>
                    <span className="text-xl font-bold text-blue-900">
                      ₹{schedule.item_of_works.reduce((sum, item) => sum + item.amount, 0).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}

        {/* Overall Summary */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Project Summary</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-700">Project Subtotal:</span>
              <span className="font-semibold text-lg">₹{subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-700">GST (18%):</span>
              <span className="font-semibold text-lg">₹{gstAmount.toFixed(2)}</span>
            </div>
            <hr className="border-gray-300" />
            <div className="flex justify-between items-center">
              <span className="text-xl font-bold text-gray-800">Total Project Amount:</span>
              <span className="text-2xl font-bold text-green-600">₹{finalTotal.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaverBlock;