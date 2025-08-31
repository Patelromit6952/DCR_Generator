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

  // New state for Labour Cess
  const [labourCessRate, setLabourCessRate] = useState(1); // 1% by default

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
          item_of_works: schedule.item_of_works?.map(item => {
            const labourCessOnRate = (item.rate || 0) * 0.01; // 1% labour cess on rate
            const finalRate = (item.rate || 0) + labourCessOnRate;
            return {
              ...item,
              qty: item.qty || 0,
              rate: item.rate || 0,
              labourCessOnRate: labourCessOnRate,
              finalRate: finalRate,
              amount: (item.qty || 0) * finalRate,
              calcRows: item.calcRows || []
            };
          })
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
          totalLabourCessAmount,
          finalTotal: finalTotal,
          gstPercentage: 18,
          labourCessPercentage: labourCessRate,
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
    const item = updated[scheduleIndex].item_of_works[taskIndex];

    // Update quantity
    item.qty = totalQty;

    // Calculate labour cess on rate and final rate
    const labourCessOnRate = item.rate * (labourCessRate / 100);
    const finalRate = item.rate + labourCessOnRate;

    // Update item properties
    item.labourCessOnRate = labourCessOnRate;
    item.finalRate = finalRate;
    item.amount = totalQty * finalRate;
    item.showQtyCalc = false;

    setData(updated);
  };

  // Modified handleChange to calculate Labour Cess on Rate
  const handleChange = (scheduleIndex, itemIndex, field, value) => {
    const updated = [...Data];
    const item = updated[scheduleIndex].item_of_works[itemIndex];
    item[field] = parseFloat(value) || 0;

    // Calculate labour cess on rate (1% of base rate)
    const labourCessOnRate = item.rate * (labourCessRate / 100);
    const finalRate = item.rate + labourCessOnRate;

    // Update item properties
    item.labourCessOnRate = labourCessOnRate;
    item.finalRate = finalRate;
    item.amount = item.qty * finalRate;

    setData(updated);
  };

  const handleRemoveRow = (scheduleIndex, itemIndex) => {
    const updated = [...Data];
    updated[scheduleIndex].item_of_works.splice(itemIndex, 1);
    setData(updated);
  };

  // New function to add schedule with enhanced debugging
  const addNewSchedule = () => {
    console.log('Adding new schedule:', newScheduleData);

    if (!newScheduleData.schedule.trim() || !newScheduleData.description.trim()) {
      alert('Please enter both schedule number and description');
      console.log('Validation failed:', {
        schedule: newScheduleData.schedule,
        description: newScheduleData.description
      });
      return;
    }

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
          labourCessOnRate: 0,
          finalRate: 0,
          amount: 0,
          unit: 'Sqm',
          calcRows: [],
          showQtyCalc: false
        }
      ]
    };

    const updatedData = [...Data, newSchedule];
    setData(updatedData);

    const newIndex = updatedData.length - 1;
    setDropdownOpen(prev => ({
      ...prev,
      [newIndex]: true
    }));

    setNewScheduleData({
      schedule: '',
      description: '',
      item_of_works: []
    });
    setShowAddSchedule(false);
    setSaveMessage('New schedule added successfully!');
    setTimeout(() => setSaveMessage(''), 3000);
  };

  const addNewItemToSchedule = (scheduleIndex) => {
    const updated = [...Data];
    updated[scheduleIndex].item_of_works.push({
      description: 'New Work Item',
      qty: 0,
      rate: 0,
      labourCessOnRate: 0,
      finalRate: 0,
      amount: 0,
      unit: 'Sqm',
      calcRows: [],
      showQtyCalc: false
    });
    setData(updated);
  };

  const removeSchedule = (scheduleIndex) => {
    if (window.confirm('Are you sure you want to remove this entire schedule?')) {
      const updated = [...Data];
      updated.splice(scheduleIndex, 1);
      setData(updated);

      const newDropdownState = {};
      updated.forEach((_, index) => {
        newDropdownState[index] = dropdownOpen[index] || false;
      });
      setDropdownOpen(newDropdownState);
    }
  };

  // Updated calculations - now amount already includes labour cess
  const subtotal = Data.reduce((acc, schedule) => {
    return acc + schedule.item_of_works.reduce((sum, item) => sum + item.amount, 0);
  }, 0);

  // Total labour cess amount (for reporting purposes)
  const totalLabourCessAmount = Data.reduce((acc, schedule) => {
    return acc + schedule.item_of_works.reduce((sum, item) => sum + (item.labourCessOnRate * item.qty || 0), 0);
  }, 0);

  // Base amount without labour cess (for reporting purposes)
  const baseAmountWithoutLabourCess = Data.reduce((acc, schedule) => {
    return acc + schedule.item_of_works.reduce((sum, item) => sum + (item.qty * item.rate), 0);
  }, 0);

  const gstAmount = subtotal * 0.18;
  const finalTotal = subtotal + gstAmount;

  const handleClientDetailsChange = (field, value) => {
    setClientDetails(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Save Draft Function (updated to include labour cess)
  const saveDraft = () => {
    const draftName = currentDraftName || `Draft_${clientDetails.name || 'Untitled'}_${new Date().toLocaleDateString()}`;
    const draftData = {
      id: Date.now(),
      name: draftName,
      clientDetails,
      Data,
      subtotal,
      gstAmount,
      totalLabourCessAmount,
      finalTotal: finalTotal,
      labourCessRate,
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

  // Load Draft Function (updated to include labour cess)
  const loadDraft = (draft) => {
    setClientDetails(draft.clientDetails);
    setData(draft.Data);
    setCurrentDraftName(draft.name);
    setLabourCessRate(draft.labourCessRate || 1);
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
      { id: 3, text: 'Generating PDFs...', icon: '📄' },
      { id: 4, text: 'Opening documents...', icon: '🚀' }
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
            <p className="text-gray-500 text-sm">Generating both Standard and Detailed PDFs...</p>
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

  // Function to generate Standard PDF (without labour cess breakdown)
  const generateStandardPDF = () => {
    const printWindow = window.open('', '_blank');

    if (!printWindow || printWindow.closed || typeof printWindow.closed === 'undefined') {
      alert('Popup blocked! Please allow popups for this site and try again.');
      return;
    }

    const pdfContent = `
<!DOCTYPE html>
<html>
<head>
    <title>SED-B Standard Quotation - ${clientDetails.name}</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 20px; line-height: 1.4; }
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
        @media print { body { margin: 0; } .no-print { display: none; } }
    </style>
</head>
<body>
    <div class="header">
        <h1>SED-B Construction Quotation (Standard)</h1>
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
                <td><strong>Labour Cess (${labourCessRate}%):</strong></td>
                <td class="amount">₹${labourCessAmount.toFixed(2)}</td>
            </tr>
            <tr>
                <td><strong>GST (18%):</strong></td>
                <td class="amount">₹${gstAmount.toFixed(2)}</td>
            </tr>
            <tr class="total-row">
                <td><strong>Total Project Amount:</strong></td>
                <td class="amount">₹${finalTotalWithLabourCess.toFixed(2)}</td>
            </tr>
        </table>
    </div>

    <div class="footer">
        <p>Standard Quotation - Generated on: ${new Date().toLocaleString()}</p>
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
      alert("Error opening Standard PDF window. Please try again.");
    }
  };

  // Function to generate Detailed PDF (with labour cess breakdown)
  const generateDetailedPDF = () => {
    setTimeout(() => {
      const printWindow = window.open('', '_blank');

      if (!printWindow || printWindow.closed || typeof printWindow.closed === 'undefined') {
        alert('Popup blocked! Please allow popups for this site and try again.');
        return;
      }

      const pdfContent = `
<!DOCTYPE html>
<html>
<head>
    <title>SED-B Detailed Quotation - ${clientDetails.name}</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 20px; line-height: 1.4; }
        .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 20px; }
        .client-info { margin-bottom: 30px; }
        .client-info h3 { margin-bottom: 10px; color: #333; }
        .client-row { display: flex; margin-bottom: 8px; }
        .client-label { font-weight: bold; width: 120px; }
        .schedule-header { background-color: #f0f8ff; padding: 15px; margin: 20px 0 10px 0; border-left: 4px solid #4a90e2; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        th, td { border: 1px solid #ddd; padding: 6px; text-align: left; font-size: 0.9em; }
        th { background-color: #f2f2f2; font-weight: bold; }
        .description { max-width: 200px; word-wrap: break-word; }
        .amount { text-align: right; font-weight: bold; }
        .summary { margin-top: 30px; }
        .summary-table { width: 400px; margin-left: auto; }
        .total-row { background-color: #f0f8ff; font-weight: bold; font-size: 1.1em; }
        .schedule-summary { background-color: #f9f9f9; padding: 10px; margin: 10px 0; }
        .footer { margin-top: 50px; text-align: center; font-size: 12px; color: #666; }
        .labour-cess-col { background-color: #fff3cd; }
        @media print { body { margin: 0; } .no-print { display: none; } }
    </style>
</head>
<body>
    <div class="header">
        <h1>SED-B Construction Quotation (Detailed with Labour Cess)</h1>
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
        const scheduleLabourCess = schedule.item_of_works.reduce((sum, item) => sum + (item.labourCess || 0), 0);
        return `
        <div class="schedule-header">
            <h2>Schedule ${schedule.schedule} - ${schedule.description || 'Work Items'}</h2>
        </div>

        <table>
            <thead>
                <tr>
                    <th>S.No.</th>
                    <th>Description of Work</th>
                    <th>Qty</th>
                    <th>Unit</th>
                    <th>Rate (₹)</th>
                    <th>Amount (₹)</th>
                    <th class="labour-cess-col">Labour Cess (${labourCessRate}%)</th>
                    <th>Total (₹)</th>
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
                        <td class="amount labour-cess-col">₹${(item.labourCess || 0).toFixed(2)}</td>
                        <td class="amount">₹${(item.amount + (item.labourCess || 0)).toFixed(2)}</td>
                    </tr>
                `).join('')}
            </tbody>
            <tfoot>
                <tr style="background-color: #e9ecef; font-weight: bold;">
                    <td colspan="5"><strong>Schedule ${schedule.schedule} Totals:</strong></td>
                    <td class="amount">₹${scheduleTotal.toFixed(2)}</td>
                    <td class="amount labour-cess-col">₹${scheduleLabourCess.toFixed(2)}</td>
                    <td class="amount">₹${(scheduleTotal + scheduleLabourCess).toFixed(2)}</td>
                </tr>
            </tfoot>
        </table>
      `;
      }).join('')}

    <div class="summary">
        <table class="summary-table">
            <tr>
                <td><strong>Project Subtotal:</strong></td>
                <td class="amount">₹${subtotal.toFixed(2)}</td>
            </tr>
            <tr>
                <td><strong>Labour Cess (${labourCessRate}%):</strong></td>
                <td class="amount labour-cess-col">₹${labourCessAmount.toFixed(2)}</td>
            </tr>
            <tr>
                <td><strong>GST (18%):</strong></td>
                <td class="amount">₹${gstAmount.toFixed(2)}</td>
            </tr>
            <tr class="total-row">
                <td><strong>Total Project Amount:</strong></td>
                <td class="amount">₹${finalTotalWithLabourCess.toFixed(2)}</td>
            </tr>
        </table>
    </div>

    <div class="footer">
        <p>Detailed Quotation with Labour Cess Breakdown - Generated on: ${new Date().toLocaleString()}</p>
        <p><em>Note: Labour Cess is calculated at ${labourCessRate}% of base amount for each item</em></p>
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
        console.error("Error writing to detailed PDF window:", writeError);
        alert("Error opening Detailed PDF window. Please try again.");
      }
    }, 1000); // 1 second delay to prevent popup conflicts
  };

  // Main function to generate both PDFs
const generateDualPDFs = async () => {
  try {
    setIsGeneratingPDF(true);
    setCurrentStep(1);

    await new Promise((resolve) => setTimeout(resolve, LOADER_TIMING.VALIDATE));
    setCurrentStep(2);

    const response = await saveQuotationToDB();
    if (response?.data?.success || response?.success) {
      setCurrentStep(3);
      await new Promise((resolve) => setTimeout(resolve, LOADER_TIMING.GENERATE_PDF));
      setCurrentStep(4);

      // Generate Abstract PDF
      const abstractElement = document.createElement('div');
      abstractElement.innerHTML = `
        <div class="header">
          <h2>Estimate of New Erecting Chain Link Fencing Work at - Samarkha Vankavach At-Jantarl Ta-Anand, Division - Social Forestry Anand</h2>
          <p>ABSTRACT (R&B SOR 2024-2025 + Irrigation SOR 2023-24)</p>
        </div>
        <table class="table">
          <thead><tr><th>Item No.</th><th>Description of Item</th><th>Quantity</th><th>Unit</th><th>SOR Rate</th><th>Add 1% Labour Cess</th><th>Final Rate</th><th>Amount</th></tr></thead>
          <tbody>
            ${Data.map((schedule, sIdx) =>
              schedule.item_of_works
                .map((item, iIdx) => `
                  <tr>
                    <td>Item No.${iIdx + 1} (Schedule ${schedule.schedule})</td>
                    <td>${item.description}</td>
                    <td>${item.qty.toFixed(2)}</td>
                    <td>${item.unit}</td>
                    <td>${item.rate.toFixed(2)}</td>
                    <td>${(item.rate * 0.01).toFixed(2)}</td>
                    <td>${item.finalRate.toFixed(2)}</td>
                    <td>${item.amount.toFixed(2)}</td>
                  </tr>
                `)
                .join('')
            ).join('')}
          </tbody>
          <tfoot>
            <tr><td colspan="7" style="text-align: right; font-weight: bold;">Total Estimated Amount:</td><td>${subtotal.toFixed(2)}</td></tr>
            <tr><td colspan="7" style="text-align: right; font-weight: bold;">Add 18% G.S.T:</td><td>${gstAmount.toFixed(2)}</td></tr>
            <tr><td colspan="7" style="text-align: right; font-weight: bold;">Total Amount:</td><td>${finalTotal.toFixed(2)}</td></tr>
          </tfoot>
        </table>
        <div class="footer">
          <p>Say Rs. ${finalTotal.toFixed(2)} Only</p>
          <p>SAUMI Consulting Engineers, Anand</p>
        </div>
      `;
      await html2pdf().from(abstractElement).save('Abstract_Estimate.pdf');

      // Generate Measurement PDF
      const measurementElement = document.createElement('div');
      measurementElement.innerHTML = `
        <div class="header">
          <h2>Estimate of New Erecting Chain Link Fencing Work at - Samarkha Vankavach At-Jantarl Ta-Anand, Division - Social Forestry Anand</h2>
          <p>MEASUREMENT</p>
        </div>
        <table class="table">
          <thead><tr><th>Item No.</th><th>Description of Item</th><th>No.</th><th>Length</th><th>Width</th><th>Depth</th><th>Quantity</th><th>Unit</th></tr></thead>
          <tbody>
            ${Data.map((schedule, sIdx) =>
              schedule.item_of_works
                .map((item, iIdx) => `
                  <tr>
                    <td>Item No.${iIdx + 1} (Schedule ${schedule.schedule})</td>
                    <td>${item.description}</td>
                    <td>Pits at 3.00 mtr C/C</td>
                    <td>${item.calcRows.reduce((sum, row) => sum + row.length, 0).toFixed(2) || '0.00'}</td>
                    <td>${item.calcRows.reduce((sum, row) => sum + row.width, 0).toFixed(2) || '0.00'}</td>
                    <td>${item.calcRows.reduce((sum, row) => sum + row.height, 0).toFixed(2) || '0.00'}</td>
                    <td>${item.qty.toFixed(2)}</td>
                    <td>${item.unit}</td>
                  </tr>
                `)
                .join('')
            ).join('')}
          </tbody>
        </table>
        <div class="footer">
          <p>Say Rs. ${finalTotal.toFixed(2)} Only</p>
          <p>SAUMI Consulting Engineers, Anand</p>
        </div>
      `;
      await html2pdf().from(measurementElement).save('Measurement_Estimate.pdf');

      setIsGeneratingPDF(false);
    } else {
      setIsGeneratingPDF(false);
      alert("Failed to save quotation to database.");
    }
  } catch (error) {
    console.error("Error generating PDFs:", error);
    setIsGeneratingPDF(false);
    alert("Something went wrong while generating PDFs. Please try again.");
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
        .labour-cess-col { background-color: #fff3cd; }
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
        {/* Header Section */}
        <header className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold text-gray-800">PaverBlock Quotation</h1>
            <div className="flex gap-3">
              <input
                type="text"
                placeholder="Draft name (optional)"
                value={currentDraftName}
                onChange={(e) => setCurrentDraftName(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                aria-label="Draft name"
              />
              <button
                onClick={saveDraft}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition"
                aria-label="Save Draft"
              >
                <FaSave /> Save Draft
              </button>
              <button
                onClick={() => setShowDrafts(!showDrafts)}
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition"
                aria-label="View Drafts"
              >
                <FaFileAlt /> View Drafts ({savedDrafts.length})
              </button>
              <button
                onClick={() => setShowAddSchedule(!showAddSchedule)}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition"
                aria-label="Add Schedule"
              >
                <MdAdd /> Add Schedule
              </button>
              <button
                onClick={generateDualPDFs}
                disabled={isGeneratingPDF}
                className={`px-6 py-3 rounded-lg ${isGeneratingPDF
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700'} text-white transition-colors`}
                aria-label={isGeneratingPDF ? 'Generating PDFs' : 'Generate Dual PDFs'}
              >
                {isGeneratingPDF ? 'Generating PDFs...' : 'Generate Dual PDFs'}
              </button>
            </div>
          </div>

          {/* Save Message */}
          {saveMessage && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4" role="alert">
              {saveMessage}
            </div>
          )}

          {isGeneratingPDF && <EnhancedPDFLoader currentStep={currentStep} />}
        </header>

        {/* Add New Schedule Form */}
        {showAddSchedule && (
          <section className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <h2 className="text-lg font-semibold mb-3 text-blue-800">Add New Schedule</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="schedule-number">Schedule Number/Identifier</label>
                <input
                  id="schedule-number"
                  type="text"
                  value={newScheduleData.schedule}
                  onChange={(e) => setNewScheduleData(prev => ({
                    ...prev,
                    schedule: e.target.value
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., B2, I, II, III, RA-1, etc."
                  aria-label="Schedule Number"
                />
                <p className="text-xs text-gray-500 mt-1">Enter unique schedule identifier</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="schedule-description">Schedule Description</label>
                <input
                  id="schedule-description"
                  type="text"
                  value={newScheduleData.description}
                  onChange={(e) => setNewScheduleData(prev => ({
                    ...prev,
                    description: e.target.value
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., Rate Analysis, Foundation Work, etc."
                  aria-label="Schedule Description"
                />
                <p className="text-xs text-gray-500 mt-1">Describe the type of work</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={addNewSchedule}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg flex items-center gap-2 transition font-medium"
                aria-label="Add Schedule"
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
                aria-label="Cancel"
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
          </section>
        )}

        {/* Drafts Panel */}
        {showDrafts && (
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
                        Client: {draft.clientDetails.name || 'N/A'} | Total: ₹{(draft.finalTotal || 0).toFixed(2)} | Saved: {draft.savedAt}
                      </div>
                    </div>
                    <div className="flex匹 gap-2">
                      <button
                        onClick={() => loadDraft(draft)}
                        classClassName="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm"
                        aria-label={`Load draft ${draft.name}`}
                      >
                        Load
                      </button>
                      <button
                        onClick={() => deleteDraft(draft.id)}
                        className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm"
                        aria-label={`Delete draft ${draft.name}`}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* Client Details with Labour Cess Rate */}
        <section className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4 text-gray-800">Client Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="client-name">Client Name</label>
              <input
                id="client-name"
                type="text"
                value={clientDetails.name}
                onChange={(e) => handleClientDetailsChange('name', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter client name"
                aria-label="Client Name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="client-address">Address</label>
              <input
                id="client-address"
                type="text"
                value={clientDetails.address}
                onChange={(e) => handleClientDetailsChange('address', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter address"
                aria-label="Client Address"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="client-phone">Phone</label>
              <input
                id="client-phone"
                type="tel"
                value={clientDetails.phone}
                onChange={(e) => handleClientDetailsChange('phone', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter phone number"
                aria-label="Client Phone"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="client-email">Email</label>
              <input
                id="client-email"
                type="email"
                value={clientDetails.email}
                onChange={(e) => handleClientDetailsChange('email', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter email"
                aria-label="Client Email"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="quotation-date">Quotation Date</label>
              <input
                id="quotation-date"
                type="date"
                value={clientDetails.quotationDate}
                onChange={(e) => handleClientDetailsChange('quotationDate', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                aria-label="Quotation Date"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="labour-cess">Labour Cess (%)</label>
              <input
                id="labour-cess"
                type="number"
                value={labourCessRate}
                onChange={(e) => {
                  const newRate = parseFloat(e.target.value) || 1;
                  setLabourCessRate(newRate);
                  const updated = [...Data];
                  updated.forEach(schedule => {
                    schedule.item_of_works.forEach(item => {
                      const labourCessOnRate = item.rate * (newRate / 100);
                      item.labourCessOnRate = labourCessOnRate;
                      item.finalRate = item.rate + labourCessOnRate;
                      item.amount = item.qty * item.finalRate;
                    });
                  });
                  setData(updated);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="1.0"
                step="0.1"
                min="0"
                max="10"
                aria-label="Labour Cess Percentage"
              />
            </div>
          </div>
        </section>

        {/* Work Items - Multiple Schedules */}
        <main>
          {Data.map((schedule, scheduleIndex) => (
            <section key={scheduleIndex} className="bg-white rounded-lg shadow-lg overflow-hidden mb-6">
              <header
                className="flex justify-between items-center bg-gradient-to-r from-gray-800 to-gray-700 text-white px-6 py-4 cursor-pointer"
                onClick={() => toggleDropdown(scheduleIndex)}
                role="button"
                aria-expanded={dropdownOpen[scheduleIndex]}
                aria-label={`Toggle Schedule ${schedule.schedule}`}
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
                    aria-label="Add New Item to Schedule"
                  >
                    <FaPlus /> Add Item
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeSchedule(scheduleIndex);
                    }}
                    className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-lg flex items-center gap-1 transition text-sm"
                    aria-label="Remove Schedule"
                  >
                    <FaTrash /> Remove
                  </button>
                  <span className="text-xl">{dropdownOpen[scheduleIndex] ? <FaChevronUp /> : <FaChevronDown />}</span>
                </div>
              </header>

              {dropdownOpen[scheduleIndex] && (
                <div className="p-6">
                  {schedule.item_of_works?.map((item, itemIndex) => {
                    const totalRowQty = item.calcRows.reduce((sum, row) => sum + row.length * row.width * (row.height || 1), 0);
                    return (
                      <article key={itemIndex} className="mb-6 border border-gray-200 rounded-lg overflow-hidden">
                        {/* Item Header */}
                        <header className="bg-gray-50 p-4 border-b">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <span className="inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm font-medium mb-2">
                                Item {itemIndex + 1}
                              </span>
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
                                aria-label={`Description for Item ${itemIndex + 1}`}
                              />
                            </div>
                            <button
                              onClick={() => handleRemoveRow(scheduleIndex, itemIndex)}
                              className="ml-4 text-red-500 hover:text-red-700 p-2 rounded-lg hover:bg-red-50 transition"
                              aria-label={`Remove Item ${itemIndex + 1}`}
                            >
                              <FaTrash />
                            </button>
                          </div>
                        </header>

                        {/* Item Details */}
                        <div className="p-4">
                          <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor={`qty-${scheduleIndex}-${itemIndex}`}>
                                Quantity ({item.unit})
                              </label>
                              <div className="flex gap-2">
                                <input
                                  id={`qty-${scheduleIndex}-${itemIndex}`}
                                  type="number"
                                  value={item.qty}
                                  onChange={(e) => handleChange(scheduleIndex, itemIndex, 'qty', e.target.value)}
                                  className="flex-1 min-w-0 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                  placeholder="0.00"
                                  aria-label={`Quantity for Item ${itemIndex + 1}`}
                                />
                                <button
                                  onClick={() => toggleQtyCalc(scheduleIndex, itemIndex)}
                                  className="bg-blue-600 flex-shrink-0 hover:bg-blue-700 text-white px-3 py-2 rounded-lg flex items-center gap-1 transition"
                                  aria-label="Calculate Quantity"
                                >
                                  <FaCalculator />
                                </button>
                              </div>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor={`unit-${scheduleIndex}-${itemIndex}`}>
                                Unit
                              </label>
                              <select
                                id={`unit-${scheduleIndex}-${itemIndex}`}
                                value={item.unit}
                                onChange={(e) => {
                                  const updated = [...Data];
                                  updated[scheduleIndex].item_of_works[itemIndex].unit = e.target.value;
                                  setData(updated);
                                }}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                aria-label={`Unit for Item ${itemIndex + 1}`}
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
                              <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor={`rate-${scheduleIndex}-${itemIndex}`}>
                                Base Rate (₹/{item.unit})
                              </label>
                              <input
                                id={`rate-${scheduleIndex}-${itemIndex}`}
                                type="number"
                                value={item.rate}
                                onChange={(e) => handleChange(scheduleIndex, itemIndex, 'rate', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                placeholder="0.00"
                                aria-label={`Base Rate for Item ${itemIndex + 1}`}
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor={`labour-cess-rate-${scheduleIndex}-${itemIndex}`}>
                                Labour Cess ({labourCessRate}%)
                              </label>
                              <input
                                id={` suicidlabour-cess-rate-${scheduleIndex}-${itemIndex}`}
                                type="text"
                                value={`₹${(item.labourCessOnRate || 0).toFixed(2)}`}
                                readOnly
                                className="w-full px-3 py-2 border border-yellow-300 rounded-lg bg-yellow-50 font-semibold text-orange-700"
                                aria-label={`Labour Cess for Item ${itemIndex + 1}`}
                              />
                              <p className="text-xs text-gray-500 mt-1">Per {item.unit}</p>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor={`final-rate-${scheduleIndex}-${itemIndex}`}>
                                Final Rate (₹/{item.unit})
                              </label>
                              <input
                                id={`final-rate-${scheduleIndex}-${itemIndex}`}
                                type="text"
                                value={`₹${(item.finalRate || 0).toFixed(2)}`}
                                readOnly
                                className="w-full px-3 py-2 border border-blue-300 rounded-lg bg-blue-50 font-semibold text-blue-700"
                                aria-label={`Final Rate for Item ${itemIndex + 1}`}
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor={`amount-${scheduleIndex}-${itemIndex}`}>
                                Total Amount (₹)
                              </label>
                              <input
                                id={`amount-${scheduleIndex}-${itemIndex}`}
                                type="text"
                                value={`₹${(item.amount || 0).toFixed(2)}`}
                                readOnly
                                className="w-full px-3 py-2 border border-green-300 rounded-lg bg-green-50 font-bold text-green-700"
                                aria-label={`Total Amount for Item ${itemIndex + 1}`}
                              />
                            </div>
                          </div>

                          {/* Quantity Calculator */}
                          {item.showQtyCalc && (
                            <section className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                              <header className="flex justify-between items-center mb-4">
                                <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                                  <FaCalculator className="text-blue-600" />
                                  Quantity Calculator
                                </h3>
                                <button
                                  onClick={() => addCalcRow(scheduleIndex, itemIndex)}
                                  className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg flex items-center gap-1 transition"
                                  aria-label="Add Row to Quantity Calculator"
                                >
                                  <FaPlus /> Add Row
                                </button>
                              </header>

                              <div className="overflow-x-auto">
                                <table className="w-full bg-white border border-gray-200 rounded-lg">
                                  <thead className="bg-gray-100">
                                    <tr>
                                      <th className="py-2 px-3 border text-left" scope="col">Description</th>
                                      <th className="py-2 px-3 border" scope="col">Length (m)</th>
                                      <th className="py-2 px-3 border" scope="col">Width (m)</th>
                                      <th className="py-2 px-3 border" scope="col">Height (m)</th>
                                      <th className="py-2 px-3 border" scope="col">Qty ({item.unit})</th>
                                      <th className="py-2 px-3 border" scope="col">Action</th>
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
                                            aria-label={`Description for Row ${rowIndex + 1}`}
                                          />
                                        </td>
                                        <td className="py-2 px-3 border">
                                          <input
                                            type="number"
                                            value={row.length}
                                            onChange={(e) => handleCalcRowChange(scheduleIndex, itemIndex, rowIndex, 'length', e.target.value)}
                                            className="w-20 px-2 py-1 border rounded text-center"
                                            placeholder="0"
                                            aria-label={`Length for Row ${rowIndex + 1}`}
                                          />
                                        </td>
                                        <td className="py-2 px-3 border">
                                          <input
                                            type="number"
                                            value={row.width}
                                            onChange={(e) => handleCalcRowChange(scheduleIndex, itemIndex, rowIndex, 'width', e.target.value)}
                                            className="w-20 px-2 py-1 border rounded text-center"
                                            placeholder="0"
                                            aria-label={`Width for Row ${rowIndex + 1}`}
                                          />
                                        </td>
                                        <td className="py-2 px-3 border">
                                          <input
                                            type="number"
                                            value={row.height}
                                            onChange={(e) => handleCalcRowChange(scheduleIndex, itemIndex, rowIndex, 'height', e.target.value)}
                                            className="w-20 px-2 py-1 border rounded text-center"
                                            placeholder="1"
                                            aria-label={`Height for Row ${rowIndex + 1}`}
                                          />
                                        </td>
                                        <td className="py-2 px-3 border text-center font-semibold text-blue-600">
                                          {(row.length * row.width * (row.height || 1)).toFixed(2)}
                                        </td>
                                        <td className="py-2 px-3 border text-center">
                                          <button
                                            onClick={() => deleteCalcRow(scheduleIndex, itemIndex, rowIndex)}
                                            className="text-red-500 hover:text-red-700 p-1 rounded"
                                            aria-label={`Delete Row ${rowIndex + 1}`}
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
                                  aria-label="Save Calculation"
                                >
                                  <FaSave /> Save Calculation
                                </button>
                                <button
                                  onClick={() => toggleQtyCalc(scheduleIndex, itemIndex)}
                                  className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition"
                                  aria-label="Cancel Calculation"
                                >
                                  Cancel
                                </button>
                              </div>
                            </section>
                          )}
                        </div>
                      </article>
                    );
                  })}

                  {/* Schedule Summary */}
                  <section className="mt-6 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="text-center">
                        <span className="text-sm text-gray-600 block">Base Amount (without Labour Cess)</span>
                        <span className="text-lg font-semibold text-gray-800">
                          ₹{schedule.item_of_works.reduce((sum, item) => sum + (item.qty * item.rate), 0).toFixed(2)}
                        </span>
                      </div>
                      <div className="text-center">
                        <span className="text-sm text-orange-600 block">Labour Cess Amount</span>
                        <span className="text-lg font-semibold text-orange-800">
                          ₹{schedule.item_of_works.reduce((sum, item) => sum + (item.qty * (item.labourCessOnRate || 0)), 0).toFixed(2)}
                        </span>
                      </div>
                      <div className="text-center">
                        <span className="text-sm text-green-600 block">Schedule {schedule.schedule} Total</span>
                        <span className="text-xl font-bold text-green-800">
                          ₹{schedule.item_of_works.reduce((sum, item) => sum + item.amount, 0).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </section>
                </div>
              )}
            </section>
          ))}
        </main>

        {/* Overall Summary */}
        <section className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Project Summary</h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-700">Base Project Amount (without Labour Cess):</span>
              <span className="font-semibold text-lg">₹{baseAmountWithoutLabourCess.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-700">Labour Cess ({labourCessRate}%):</span>
              <span className="font-semibold text-lg text-orange-600">₹{totalLabourCessAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-700">Subtotal (Base + Labour Cess):</span>
              <span className="font-semibold text-lg text-blue-600">₹{subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-700">GST (18%) on Subtotal:</span>
              <span className="font-semibold text-lg">₹{gstAmount.toFixed(2)}</span>
            </div>
            <hr className="border-gray-300" />
            <div className="flex justify-between items-center">
              <span className="text-xl font-bold text-gray-800">Total Project Amount:</span>
              <span className="text-2xl font-bold text-green-600">₹{finalTotal.toFixed(2)}</span>
            </div>
          </div>

          {/* Summary Breakdown */}
          <div className="mt-6 bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-700 mb-3">Cost Breakdown</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
              <div className="text-center p-3 bg-white rounded border">
                <div className="text-gray-600">Base Work</div>
                <div className="font-bold text-gray-600">₹{baseAmountWithoutLabourCess.toFixed(2)}</div>
                <div className="text-xs text-gray-500">
                  {((baseAmountWithoutLabourCess / finalTotal) * 100).toFixed(1)}%
                </div>
              </div>
              <div className="text-center p-3 bg-white rounded border">
                <div className="text-gray-600">Labour Cess</div>
                <div className="font-bold text-orange-600">₹{totalLabourCessAmount.toFixed(2)}</div>
                <div className="text-xs text-gray-500">
                  {((totalLabourCessAmount / finalTotal) * 100).toFixed(1)}%
                </div>
              </div>
              <div className="text-center p-3 bg-white rounded border">
                <div className="text-gray-600">GST (18%)</div>
                <div className="font-bold text-green-600">₹{gstAmount.toFixed(2)}</div>
                <div className="text-xs text-gray-500">
                  {((gstAmount / finalTotal) * 100).toFixed(1)}%
                </div>
              </div>
              <div className="text-center p-3 bg-green-100 rounded border-2 border-green-300">
                <div className="text-gray-700 font-medium">Total Amount</div>
                <div className="font-bold text-green-700 text-lg">₹{finalTotal.toFixed(2)}</div>
                <div className="text-xs text-green-600">100%</div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default PaverBlock;