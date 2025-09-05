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

export function generateAbstractPDFTemplate(data) {    
  const items = data[0].item_of_works || [];

  // Table rows with separate row for Item No.
  const rows = items.map((item, index) => `
    <tr>
      <td><b>Item No.${index + 1}   ( ${item.sorPage})</b></td>
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

  // Totals
  const totalAmount = items.reduce((sum, i) => sum + (i.amount || 0), 0);
  const gst = totalAmount * 0.18;
  const grandTotal = totalAmount + gst;

  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8" />
    <style>
      body { font-family: Arial, sans-serif; margin: 20px; }
      h2 { text-align: center; }
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
    </style>
  </head>
  <body>
    <div class="print-controls no-print">
      <button class="print-btn" onclick="window.print()">Print PDF</button>
      <button class="print-btn" onclick="window.close()">Close</button>
    </div>

    <table class="header-table">
        <tr>
    <td colspan="8" class="work-name">
      <strong>Name of Work :</strong> Estimate of New Erecting Chain link Fencing Work at - Samarkha Vankavach\n At-Jantral Ta-Anand , Division - Social Forestry Anand
    </td>
  </tr>
  <tr><td colspan="8" class="abstract-title center"><strong>A B S T R A C T</strong><br></td></tr>
   <tr><td colspan="8" class="right">(R & B SOR 2024-2025 + Irrigation SOR 2023-24)</td></tr>
        <tr>
          <th>Description of Item</th>
          <th>Quantity</th>
          <th>Unit</th>
          <th>SOR Rate</th>
          <th>+1% Labour Cess</th>
          <th>Final Rate</th>
          <th>Amount</th>
        </tr>
      </thead>
      <tbody>
        ${rows}
      </tbody>
    </table>

    <table class="summary">
      <tr>
        <td class="right"><b>Total Rs.</b></td>
        <td class="right"><b>${totalAmount.toFixed(2)}</b></td>
      </tr>
      <tr>
        <td class="right">Add 18% G.S.T</td>
        <td class="right">${gst.toFixed(2)}</td>
      </tr>
      <tr>
        <td class="right"><b>Total Estimated Amount</b></td>
        <td class="right"><b>${grandTotal.toFixed(2)}</b></td>
      </tr>
      <tr>
        <td class="right"><b>Say Total Amount</b></td>
        <td class="right"><b>${Math.round(grandTotal)}</b></td>
      </tr>
    </table>

    <p style="margin-top:40px; text-align:right;">
      <b>Consulting Engineer</b><br/>
      (Signature & Seal)
    </p>
  </body>
  </html>
  `;
}

export function generateMeasurementPDFTemplate(data) {
  const items = data?.[0]?.item_of_works ?? [];

  const nf2 = v => (v === null || v === undefined || v === "") ? "" : Number(v).toFixed(2);

  const rows = items.map((item, index) => {
    // Sub-rows from calcRows
    const subRows = (item.calcRows || []).map(sub => `
      <tr>
        <td></td>
        <td class="right">${sub.description ?? ""}</td>
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
        <td><b>Item No.${index + 1}</td>
        <td><b>${item.description ?? ""}</b></td>
        <td></td>
        <td></td>
        <td></td>
        <td></td>
        <td></td>
        <td></td>
      </tr>
      ${subRows}
      <tr class="total">
        <td></td>
        <td class="right"><b>Total</b></td>
        <td></td>
        <td></td>
        <td></td>
        <td></td>
        <td class="right"><b>${nf2(item.qty)}</b></td>
        <td class="center">${item.unit ?? ""}</td>
      </tr>
    `;
  }).join("");

  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8" />
    <style>
      body { font-family: Arial, sans-serif; margin: 20px; }
      h2 { text-align: center; }
      table { width: 100%; border-collapse: collapse; margin-top: 20px; }
      table, th, td { border: 1px solid black; }
      th, td { padding: 6px; font-size: 12px; vertical-align: middle; }
      th { background: #f2f2f2; text-align: center; }
      .right { text-align: right; }
      .center { text-align: center; }
      .left { text-align: left; }
      tr.total td { font-weight: bold; }
      
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
        /* Header table styles */
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
    </style>
  </head>
  <body>
    <div class="print-controls no-print">
      <button class="print-btn" onclick="window.print()">Print PDF</button>
      <button class="print-btn" onclick="window.close()">Close</button>
    </div>
    
<!-- Header Information Table -->
<table class="header-table">
  <tr>
    <td colspan="8" class="work-name">
      <strong>Name of Work :</strong> Estimate of New Erecting Chain link Fencing Work at - Samarkha Vankavach\n At-Jantral Ta-Anand , Division - Social Forestry Anand
    </td>
  </tr>
  <tr><td colspan="8" class="abstract-title center"><strong>M E A S U R E M E N T</strong><br></td></tr>
   <tr><td colspan="8" class="right">(R & B SOR 2024-2025 + Irrigation SOR 2023-24)</td></tr>
        <tr>
          <th>Item No.</th>
          <th>Description of Item</th>
          <th>No.</th>
          <th>Length</th>
          <th>Width</th>
          <th>Depth</th>
          <th>Quantity</th>
          <th>Unit</th>
        </tr>
      <tbody>
        ${rows || '<tr><td colspan="8" class="center">No data</td></tr>'}
      </tbody>
</table>

    <p style="margin-top:40px; text-align:right;">
      <b>Consulting Engineer</b><br/>(Signature & Seal)
    </p>
  </body>
  </html>
  `;
}

// Usage examples:
// 1. Generate PDF and print automatically:
// generateAndPrintPDF(generateAbstractPDFTemplate, data, 'Abstract Report');

// 2. Generate PDF first, then print later:
// const printWindow = createPDFWindow('My Report');
// writeToPDFWindow(printWindow, generateAbstractPDFTemplate(data));
// printPDF(printWindow);

// 3. Print from within the PDF window (using the Print button)