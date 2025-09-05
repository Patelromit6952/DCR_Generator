export const generatePDFStyles = () => `
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
  .labour-cess-col { background-color: #fff3cd; }
  @media print { body { margin: 0; } .no-print { display: none; } }
`;

export const generateClientInfoHTML = (clientDetails) => `
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
`;

export const generatePDFControls = () => `
  <div class="no-print" style="margin-top: 30px; text-align: center;">
    <button onclick="window.print(); window.close();" style="background: #4CAF50; color: white; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer; margin-right: 10px;">Print PDF</button>
    <button onclick="window.close()" style="background: #f44336; color: white; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer;">Close</button>
  </div>
`;