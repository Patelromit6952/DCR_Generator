export const useCalculations = (data, labourCessRate = 1) => {
  // Base amount without labour cess
  const baseAmountWithoutLabourCess = data.reduce((acc, schedule) => {
    return acc + schedule.item_of_works.reduce((sum, item) => sum + (item.qty * item.rate), 0);
  }, 0);

  // Total labour cess amount
  const totalLabourCessAmount = data.reduce((acc, schedule) => {
    return acc + schedule.item_of_works.reduce((sum, item) => sum + (item.qty * (item.labourCessOnRate || 0)), 0);
  }, 0);

  // Subtotal (includes labour cess)
  const subtotal = data.reduce((acc, schedule) => {
    return acc + schedule.item_of_works.reduce((sum, item) => sum + item.amount, 0);
  }, 0);

  const gstAmount = subtotal * 0.18;
  const finalTotal = subtotal + gstAmount;

  return {
    baseAmountWithoutLabourCess,
    totalLabourCessAmount,
    subtotal,
    gstAmount,
    finalTotal
  };
};
