import api from '../Backend_api/SummaryApi';

export async function saveQuotationToDB(){
    try {
      const quotationData = {
        quotationType: '',
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
