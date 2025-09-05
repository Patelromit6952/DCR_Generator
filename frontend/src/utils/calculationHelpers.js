export const calculateItemAmounts = (item, labourCessRate) => {
  const labourCessOnRate = (item.rate || 0) * (labourCessRate / 100);
  const finalRate = (item.rate || 0) + labourCessOnRate;
  const amount = (item.qty || 0) * finalRate;

  return {
    labourCessOnRate,
    finalRate,
    amount
  };
};

export const updateItemCalculations = (data, scheduleIndex, itemIndex, field, value, labourCessRate) => {
  const updated = [...data];
  const item = updated[scheduleIndex].item_of_works[itemIndex];
  item[field] = parseFloat(value) || 0;

  const calculations = calculateItemAmounts(item, labourCessRate);
  Object.assign(item, calculations);

  return updated;
};