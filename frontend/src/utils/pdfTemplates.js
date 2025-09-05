import { generatePDFStyles, generateClientInfoHTML, generatePDFControls } from './pdfGenerators';

export const createPDFWindow = (title) => {
  const printWindow = window.open('', '_blank', 'width=800,height=600,scrollbars=yes,resizable=yes');
  if (!printWindow || printWindow.closed || typeof printWindow.closed === 'undefined') {
    alert('Popup blocked! Please allow popups for this site and try again.');
    return null;
  }
  printWindow.document.title = title || 'PDF Document';
  return printWindow;
};

export const writeToPDFWindow = (printWindow, content) => {
  try {
    printWindow.document.write(content);
    printWindow.document.close();
    return true;
  } catch (writeError) {
    console.error("Error writing to PDF window:", writeError);
    alert("Error opening PDF window. Please try again.");
    return false;
  }
};

// New function to handle PDF printing
export const printPDF = (printWindow) => {
  if (!printWindow || printWindow.closed) {
    alert('Print window is not available. Please generate the PDF first.');
    return false;
  }

  try {
    // Wait for content to load before printing
    printWindow.onload = () => {
      printWindow.print();
    };
    
    // Fallback in case onload doesn't fire
    setTimeout(() => {
      if (printWindow && !printWindow.closed) {
        printWindow.print();
      }
    }, 500);
    
    return true;
  } catch (printError) {
    console.error("Error printing PDF:", printError);
    alert("Error printing PDF. Please try again.");
    return false;
  }
};

// Enhanced function to generate and print PDF in one step
export const generateAndPrintPDF = (templateFunction, data, title = 'PDF Document') => {
  const printWindow = createPDFWindow(title);
  if (!printWindow) return false;

  const content = templateFunction(data);
  const success = writeToPDFWindow(printWindow, content);
  
  if (success) {
    // Auto-print after content is loaded
    printPDF(printWindow);
  }
  
  return success;
};

export function generateAbstractPDFTemplate(data,workName) {
  
  // Generate content for each schedule
  const scheduleSections = data.map((schedule, scheduleIndex) => {
    const items = schedule.item_of_works || [];
    
    // Table rows with separate row for Item No.
    const rows = items.map((item, index) => `
      <tr>
        <td><b>Item No.${index + 1}  ${(item.sorPage) || ""}</b></td>
        <td></td>
        <td></td>
        <td></td>
        <td></td>
        <td></td>
        <td></td>
      </tr>
      <tr>
        <td>${item.description}</td>
        <td style="text-align:right;">${item.qty || ""}</td>
        <td style="text-align:center;">${item.unit || ""}</td>
        <td style="text-align:right;">${item.rate?.toFixed(2) || ""}</td>
        <td style="text-align:right;">${(item.labourCessOnRate || 0).toFixed(2)}</td>
        <td style="text-align:right;">${item.finalRate?.toFixed(2) || ""}</td>
        <td style="text-align:right;">${item.amount?.toFixed(2) || ""}</td>
      </tr>
    `).join("");

    // Calculate totals for this schedule
    const totalAmount = items.reduce((sum, i) => sum + (i.amount || 0), 0);
    const gst = totalAmount * 0.18;
    const grandTotal = totalAmount + gst;

    // Return the HTML section for this schedule
    return `
      <div class="schedule-section" ${scheduleIndex > 0 ? 'style="page-break-before: always;"' : ''}>
        <table class="header-table">
          <tr>
            <td colspan="7" class="work-name">
              <strong>Name of Work :</strong> ${workName || 'Estimate of New Erecting Chain link Fencing Work at - Samarkha Vankavach\nAt-Jantral Ta-Anand , Division - Social Forestry Anand'}
            </td>
          </tr>
          <tr>
            <td colspan="7" class="abstract-title center">
              <strong>A B S T R A C T - Schedule ${scheduleIndex + 1}</strong><br>
              ${schedule.scheduleName ? `<span style="font-size: 12px;">(${schedule.scheduleName})</span>` : ''}
            </td>
          </tr>
          <tr>
            <td colspan="7" class="right">(R & B SOR 2024-2025 + Irrigation SOR 2023-24)</td>
          </tr>
        </table>
        
        <table style="width: 100%; border-collapse: collapse; margin-top: 0;">
           <tr>
            <th>Description of Item</th>
            <th>Quantity</th>
            <th>Unit</th>
            <th>SOR Rate</th>
            <th>+1% Labour Cess</th>
            <th>Final Rate</th>
            <th>Amount</th>
          </tr>
          <tbody>
            ${rows}
          </tbody>
        </table>

        <table class="summary">
          <tr>
            <td class="right">Sub Total (Schedule ${scheduleIndex + 1}) Rs.</td>
            <td class="right">${totalAmount.toFixed(2)}</td>
          </tr>
          <tr>
            <td class="right">Add 18% G.S.T</td>
            <td class="right">${gst.toFixed(2)}</td>
          </tr>
          <tr class="total-row">
            <td class="right">Schedule ${scheduleIndex + 1} Total Amount</td>
            <td class="right">${grandTotal.toFixed(2)}</td>
          </tr>
          <tr class="total-row">
            <td class="right">Say Schedule ${scheduleIndex + 1} Amount</td>
            <td class="right">${Math.round(grandTotal)}</td>
          </tr>
        </table>
      </div>
    `;
  }).join('');

  // Calculate overall totals across all schedules
  const overallTotalAmount = data.reduce((sum, schedule) => {
    const scheduleTotal = (schedule.item_of_works || []).reduce((scheduleSum, item) => 
      scheduleSum + (item.amount || 0), 0);
    return sum + scheduleTotal;
  }, 0);
  const overallGst = overallTotalAmount * 0.18;
  const overallGrandTotal = overallTotalAmount + overallGst;

  // Overall summary section (only if there are multiple schedules)
  const overallSummary = data.length > 1 ? `
    <div class="overall-summary" style="page-break-before: always;">
      <h3 style="text-align: center; text-decoration: underline;">OVERALL SUMMARY</h3>
      <table class="summary">
        ${data.map((schedule, index) => {
          const scheduleTotal = (schedule.item_of_works || []).reduce((sum, item) => 
            sum + (item.amount || 0), 0);
          const scheduleGst = scheduleTotal * 0.18;
          const scheduleGrandTotal = scheduleTotal + scheduleGst;
          return `
            <tr>
              <td class="right">Schedule ${index + 1} Total Amount</td>
              <td class="right">${scheduleGrandTotal.toFixed(2)}</td>
            </tr>
          `;
        }).join('')}
        <tr style="border-top: 2px solid black;">
          <td class="right"><b>Grand Total Rs.</b></td>
          <td class="right"><b>${overallTotalAmount.toFixed(2)}</b></td>
        </tr>
        <tr>
          <td class="right"><b>Add 18% G.S.T</b></td>
          <td class="right"><b>${overallGst.toFixed(2)}</b></td>
        </tr>
        <tr>
          <td class="right"><b>Total Estimated Amount</b></td>
          <td class="right"><b>${overallGrandTotal.toFixed(2)}</b></td>
        </tr>
        <tr>
          <td class="right"><b>Say Total Amount</b></td>
          <td class="right"><b>${Math.round(overallGrandTotal)}</b></td>
        </tr>
      </table>
    </div>
  ` : '';

  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8" />
    <style>
      body { font-family: Arial, sans-serif; margin: 20px; }
      h2, h3 { text-align: center; }
      table { width: 100%; border-collapse: collapse; margin-top: 20px; }
      table, th, td { border: 1px solid black; }
      th, td { padding: 6px; font-size: 12px; vertical-align: top; }
      th { background: #f2f2f2; text-align: center; }
      .right { text-align: right; }
      .center { text-align: center; }
      .summary { margin-top: 20px; width: 100%; }
      .summary td { border: none; font-size: 14px; padding: 5px; }
      
      /* Print-specific styles */
      @media print {
        body { margin: 0; }
        .no-print { display: none !important; }
        .schedule-section { page-break-after: auto; }
        .overall-summary { page-break-before: always; }
      }
      
      /* Print controls */
      .print-controls {
        position: fixed;
        top: 10px;
        right: 10px;
        background: white;
        padding: 10px;
        border: 1px solid #ccc;
        border-radius: 5px;
        box-shadow: 0 2px 5px rgba(0,0,0,0.2);
        z-index: 1000;
      }
      
      .print-btn {
        background: #007bff;
        color: white;
        border: none;
        padding: 8px 15px;
        border-radius: 3px;
        cursor: pointer;
        margin-right: 5px;
      }
      
      .print-btn:hover {
        background: #0056b3;
      }
      
      .header-table {
        margin-bottom: 10px;
        border: 2px solid black;
        width: 100%;
        border-collapse: collapse;
      }
      
      .work-name {
        font-size: 11px;
        padding: 8px;
        font-weight: normal;
        border: 1px solid black;
      }
      
      .abstract-title {
        font-size: 14px;
        font-weight: bold;
        padding: 8px;
        background: #f8f8f8;
        border: 1px solid black;
      }
      
      .sub-header th {
        font-size: 10px;
        padding: 4px;
        background: #f2f2f2;
        border: 1px solid black;
      }
      
      .schedule-section {
        margin-bottom: 40px;
      }
    </style>
  </head>
  <body>
    <div class="print-controls no-print">
      <button class="print-btn" onclick="window.print()">Print PDF</button>
      <button class="print-btn" onclick="window.close()">Close</button>
    </div>

    ${scheduleSections}
    ${overallSummary}

    <p style="margin-top:40px; text-align:right;">
      <b>Consulting Engineer</b><br/>
      (Signature & Seal)
    </p>
  </body>
  </html>
  `;
}

export function generateMeasurementPDFTemplate(data,workName) {
  const nf2 = v => (v === null || v === undefined || v === "") ? "" : Number(v).toFixed(2);

  // Generate content for each schedule
  const scheduleSections = data.map((schedule, scheduleIndex) => {
    const items = schedule?.item_of_works ?? [];

    const rows = items.map((item, index) => {
      // Sub-rows from calcRows
      const subRows = (item.calcRows || []).map(sub => `
        <tr class="calc-row">
          <td></td>
          <td class="right" style="padding-left: 20px; font-style: italic;">${sub.description ?? ""}</td>
          <td class="center">${sub.no ?? ""}</td>
          <td class="center">${sub.length ?? ""}</td>
          <td class="center">${sub.width ?? ""}</td>
          <td class="center">${sub.height ?? ""}</td>
          <td class="right">${nf2(sub.qty)}</td>
          <td class="center">${sub.unit ?? item.unit ?? ""}</td>
        </tr>
      `).join("");

      return `
        <!-- Item heading row -->
        <tr class="item-head">
          <td style="vertical-align: top; font-weight: bold; padding: 8px;">Item No.${index + 1}</td>
          <td style="vertical-align: top; font-weight: bold; padding: 8px; line-height: 1.3;">${item.description ?? ""}</td>
          <td></td>
          <td></td>
          <td></td>
          <td></td>
          <td></td>
          <td></td>
        </tr>
        ${subRows}
        <tr class="total-row">
          <td></td>
          <td class="right" style="font-weight: bold; padding: 8px;">Total</td>
          <td></td>
          <td></td>
          <td></td>
          <td></td>
          <td class="right" style="font-weight: bold; padding: 8px;">${nf2(item.qty)}</td>
          <td class="center" style="font-weight: bold; padding: 8px;">${item.unit ?? ""}</td>
        </tr>
        <!-- Spacing row for better readability -->
        <tr class="spacing-row">
          <td colspan="8" style="border: none; height: 10px; background: #f9f9f9;"></td>
        </tr>
      `;
    }).join("");

    // Return the HTML section for this schedule
    return `
      <div class="schedule-section" ${scheduleIndex > 0 ? 'style="page-break-before: always;"' : ''}>
        <!-- Header Information Table -->
        <table class="main-table">
          <thead>
            <tr>
              <td colspan="8" class="work-name">
                <strong>Name of Work :</strong> ${workName || 'Estimate of New Erecting Chain link Fencing Work at - Samarkha Vankavach At-Jantral Ta-Anand , Division - Social Forestry Anand'}
              </td>
            </tr>
            <tr>
              <td colspan="8" class="measurement-title center">
                <strong>M E A S U R E M E N T${data.length > 1 ? ` - Schedule ${scheduleIndex + 1}` : ''}</strong><br>
                ${schedule.scheduleName ? `<span style="font-size: 12px;">(${schedule.scheduleName})</span>` : ''}
              </td>
            </tr>
            <tr>
              <td colspan="8" class="right">(R & B SOR 2024-2025 + Irrigation SOR 2023-24)</td>
            </tr>
            <tr class="header-row">
              <th style="width: 8%; text-align: center; font-weight: bold;">Item No.</th>
              <th style="width: 35%; text-align: center; font-weight: bold;">Description of Item</th>
              <th style="width: 6%; text-align: center; font-weight: bold;">No.</th>
              <th style="width: 10%; text-align: center; font-weight: bold;">Length</th>
              <th style="width: 10%; text-align: center; font-weight: bold;">Width</th>
              <th style="width: 10%; text-align: center; font-weight: bold;">Depth</th>
              <th style="width: 12%; text-align: center; font-weight: bold;">Quantity</th>
              <th style="width: 9%; text-align: center; font-weight: bold;">Unit</th>
            </tr>
          </thead>
          <tbody>
            ${rows || '<tr><td colspan="8" class="center">No data</td></tr>'}
          </tbody>
        </table>
      </div>
    `;
  }).join('');

  // Overall summary section for measurements (only if there are multiple schedules)
  const overallSummary = data.length > 1 ? `
    <div class="overall-summary" style="page-break-before: always;">
      <h3 style="text-align: center; text-decoration: underline; margin-bottom: 20px;">MEASUREMENT SUMMARY</h3>
      <table class="summary-table">
        <thead>
          <tr>
            <th style="width: 15%;">Schedule</th>
            <th style="width: 50%;">Description</th>
            <th style="width: 15%;">Total Quantity</th>
            <th style="width: 20%;">Unit</th>
          </tr>
        </thead>
        <tbody>
          ${data.map((schedule, index) => {
            const scheduleItems = schedule?.item_of_works || [];
            return scheduleItems.map((item, itemIndex) => `
              <tr>
                <td class="center">${itemIndex === 0 ? `Schedule ${index + 1}` : ''}</td>
                <td>${item.description || ''}</td>
                <td class="right">${nf2(item.qty)}</td>
                <td class="center">${item.unit || ''}</td>
              </tr>
            `).join('');
          }).join('')}
        </tbody>
      </table>
    </div>
  ` : '';

  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8" />
    <style>
      body { 
        font-family: Arial, sans-serif; 
        margin: 20px; 
        line-height: 1.4;
      }
      
      h2, h3 { 
        text-align: center; 
      }
      
      table { 
        width: 100%; 
        border-collapse: collapse; 
        margin-top: 20px; 
      }
      
      table, th, td { 
        border: 1px solid black; 
      }
      
      th, td { 
        padding: 6px; 
        font-size: 11px; 
        vertical-align: middle; 
      }
      
      th { 
        background: #f2f2f2; 
        text-align: center; 
        font-weight: bold;
      }
      
      .right { text-align: right; }
      .center { text-align: center; }
      .left { text-align: left; }
      
      .main-table {
        margin-bottom: 10px;
        border: 2px solid black;
        width: 100%;
        border-collapse: collapse;
        margin-top: 0;
      }
      
      .main-table th, .main-table td {
        border: 1px solid black;
        padding: 6px;
        vertical-align: top;
      }
      
      .header-row th {
        background-color: #f2f2f2 !important;
        font-weight: bold;
        text-align: center;
        font-size: 10px;
        padding: 8px;
      }
      
      .work-name {
        font-size: 11px;
        padding: 8px;
        font-weight: normal;
        border: 1px solid black;
      }
      
      .measurement-title {
        font-size: 14px;
        font-weight: bold;
        padding: 8px;
        background: #f8f8f8;
        border: 1px solid black;
      }
      
      .item-head td {
        background-color: #f9f9f9;
        border-bottom: 2px solid #333;
      }
      
      .calc-row td {
        font-size: 10px;
        padding: 4px 6px;
      }
      
      .total-row td {
        background-color: #f0f0f0;
        border-top: 2px solid #666;
      }
      
      .spacing-row td {
        border: none !important;
      }
      
      .schedule-section {
        margin-bottom: 40px;
      }
      
      .summary-table {
        border: 2px solid black;
        margin-top: 20px;
      }
      
      .summary-table th {
        background-color: #e8e8e8;
        font-weight: bold;
        padding: 10px;
      }
      
      .summary-table td {
        padding: 8px;
      }
      
      /* Print-specific styles */
      @media print {
        body { margin: 0; }
        .no-print { display: none !important; }
        .schedule-section { page-break-after: auto; }
        .overall-summary { page-break-before: always; }
      }
      
      /* Print controls */
      .print-controls {
        position: fixed;
        top: 10px;
        right: 10px;
        background: white;
        padding: 10px;
        border: 1px solid #ccc;
        border-radius: 5px;
        box-shadow: 0 2px 5px rgba(0,0,0,0.2);
        z-index: 1000;
      }
      
      .print-btn {
        background: #007bff;
        color: white;
        border: none;
        padding: 8px 15px;
        border-radius: 3px;
        cursor: pointer;
        margin-right: 5px;
      }
      
      .print-btn:hover {
        background: #0056b3;
      }
    </style>
  </head>
  <body>
    <div class="print-controls no-print">
      <button class="print-btn" onclick="window.print()">Print PDF</button>
      <button class="print-btn" onclick="window.close()">Close</button>
    </div>

    ${scheduleSections}
    ${overallSummary}

    <p style="margin-top:40px; text-align:right;">
      <b>Saumi Consulting Engineer</b><br/>
      (Signature & Seal)
    </p>
  </body>
  </html>
  `;
}

export function generateScheduleSummaryPDFTemplate(data,workName) {
  console.log(data);
  
  // Calculate totals for each schedule
  const scheduleRows = data.map((schedule, index) => {
    const items = schedule.item_of_works || [];
    const totalAmount = items.reduce((sum, item) => sum + (item.amount || 0), 0);
    const gst = totalAmount * 0.18;
    const grandTotal = totalAmount + gst;

    return `
      <tr>
        <td style="text-align: center; padding: 8px; font-weight: bold;">${index + 1}</td>
        <td style="padding: 8px; vertical-align: top;">
          <strong>SCHEDULE "${schedule.schedule}"</strong><br>
          ${schedule.description || schedule.workName || `Schedule ${index + 1} Work`}
        </td>
        <td style="text-align: right; padding: 8px; font-weight: bold;">${grandTotal.toFixed(2)}</td>
        <td style="text-align: right; padding: 8px;"></td>
      </tr>
    `;
  }).join('');

  // Calculate overall total
  const overallTotal = data.reduce((sum, schedule) => {
    const items = schedule.item_of_works || [];
    const scheduleTotal = items.reduce((scheduleSum, item) => 
      scheduleSum + (item.amount || 0), 0);
    const gst = scheduleTotal * 0.18;
    return sum + scheduleTotal + gst;
  }, 0);

  // Convert amount to words (simplified version)
  const numberToWords = (num) => {
    const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
    const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
    const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
    
    if (num < 10) return ones[num];
    if (num < 20) return teens[num - 10];
    if (num < 100) return tens[Math.floor(num / 10)] + (num % 10 ? ' ' + ones[num % 10] : '');
    if (num < 1000) return ones[Math.floor(num / 100)] + ' Hundred' + (num % 100 ? ' ' + numberToWords(num % 100) : '');
    if (num < 100000) return numberToWords(Math.floor(num / 1000)) + ' Thousand' + (num % 1000 ? ' ' + numberToWords(num % 1000) : '');
    if (num < 10000000) return numberToWords(Math.floor(num / 100000)) + ' Lakh' + (num % 100000 ? ' ' + numberToWords(num % 100000) : '');
    if (num < 1000000000) return numberToWords(Math.floor(num / 10000000)) + ' Crore' + (num % 10000000 ? ' ' + numberToWords(num % 10000000) : '');
    return 'Amount too large';
  };

  const amountInWords = numberToWords(Math.round(overallTotal));

  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8" />
    <style>
      body { 
        font-family: Arial, sans-serif; 
        margin: 20px; 
        font-size: 12px;
      }
      
      .header {
        text-align: center;
        margin-bottom: 20px;
      }
      
      .organization-name {
        font-size: 18px;
        font-weight: bold;
        margin-bottom: 10px;
      }
      
      .work-details {
        font-size: 11px;
        line-height: 1.4;
        margin-bottom: 20px;
      }
      
      .schedule-table {
        width: 100%;
        border-collapse: collapse;
        margin: 20px 0;
        border: 2px solid black;
      }
      
      .schedule-table th {
        background-color: #f2f2f2;
        padding: 10px;
        text-align: center;
        font-weight: bold;
        border: 1px solid black;
        font-size: 12px;
      }
      
      .schedule-table td {
        border: 1px solid black;
        padding: 8px;
        vertical-align: top;
        font-size: 11px;
      }
      
      .total-row {
        background-color: #f8f8f8;
        font-weight: bold;
      }
      
      .total-row td {
        border-top: 2px solid black;
        padding: 12px 8px;
        font-size: 12px;
      }
      
      .declaration {
        margin: 30px 0;
        font-size: 10px;
      }
      
      .amount-section {
        margin: 20px 0;
        border: 1px solid black;
        padding: 15px;
        background-color: #f9f9f9;
      }
      
      .signatures {
        margin-top: 50px;
        display: flex;
        justify-content: space-between;
      }
      
      .signature-box {
        text-align: center;
        width: 30%;
        padding: 20px;
      }
      
      .signature-line {
        border-top: 1px solid black;
        margin-top: 40px;
        padding-top: 5px;
      }
      
      /* Print-specific styles */
      @media print {
        body { margin: 0; }
        .no-print { display: none !important; }
      }
      
      /* Print controls */
      .print-controls {
        position: fixed;
        top: 10px;
        right: 10px;
        background: white;
        padding: 10px;
        border: 1px solid #ccc;
        border-radius: 5px;
        box-shadow: 0 2px 5px rgba(0,0,0,0.2);
        z-index: 1000;
      }
      
      .print-btn {
        background: #007bff;
        color: white;
        border: none;
        padding: 8px 15px;
        border-radius: 3px;
        cursor: pointer;
        margin-right: 5px;
      }
      
      .print-btn:hover {
        background: #0056b3;
      }
    </style>
  </head>
  <body>
    <div class="print-controls no-print">
      <button class="print-btn" onclick="window.print()">Print PDF</button>
      <button class="print-btn" onclick="window.close()">Close</button>
    </div>

    <div class="header">
      <div class="organization-name">${ 'ANAND NAGARPALIKA'}</div>
      <div class="work-details">
        <strong>Name of Work :</strong> ${'Bid Documents for Paver Block Work, Compound Wall, RCC Road & Servent Quarters In Community Hall Nr. Dave na kuva at Anand Nagarpalika, Anand'}
      </div>
    </div>

    <table class="schedule-table">
      <thead>
        <tr>
          <th style="width: 8%;">Sr. No.</th>
          <th style="width: 62%;">Description</th>
          <th style="width: 15%;">Estimated Cost</th>
          <th style="width: 15%;">Tender Cost</th>
        </tr>
      </thead>
      <tbody>
        ${scheduleRows}
        <tr class="total-row">
          <td style="text-align: center;"></td>
          <td style="font-weight: bold;">Total</td>
          <td style="text-align: right; font-weight: bold;">${overallTotal.toFixed(2)}</td>
          <td style="text-align: right;"></td>
        </tr>
      </tbody>
    </table>

    <div class="declaration">
      I/We are/are willing to carry out the work at ________% above/below percent (should be written in figures and words) of the standard amount mentioned above.
    </div>

    <div class="amount-section">
      <table style="width: 100%; border: none;">
        <tr>
          <td style="border: none; width: 50%;">
            <strong>Tendered amount put to tender Rs.${overallTotal.toFixed(2)}</strong><br>
            Deduct: _______% below Rs. ___________<br>
            Net Rs. ___________<br>
            In words: ${amountInWords} Only
          </td>
          <td style="border: none; width: 50%;">
            <strong>Tendered amount put to tender Rs.${overallTotal.toFixed(2)}</strong><br>
            Add: _______% Above Rs. ___________<br>
            Net Rs. ___________<br>
            In words: ___________________
          </td>
        </tr>
      </table>
    </div>

    <div class="signatures">
      <div class="signature-box">
        <div style="height: 60px;"></div>
        <div class="signature-line">
          <strong>Signature of Contractor.</strong>
        </div>
      </div>
      
      <div class="signature-box">
        <div style="height: 60px;"></div>
        <div class="signature-line">
          <strong>President,</strong><br>
          ${ 'Anand Nagar Seva Sadan'}<br>
          ${ 'Anand'}
        </div>
      </div>
      
      <div class="signature-box">
        <div style="height: 60px;"></div>
        <div class="signature-line">
          <strong>Chief Officer,</strong><br>
          ${  'Anand Nagar'}<br>
          ${ 'Sevasadan'}<br>
          ${ 'Anand'}
        </div>
      </div>
    </div>

  </body>
  </html>
  `;
}