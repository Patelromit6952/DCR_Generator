export const usePDFGeneration = () => {
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  const LOADER_TIMING = {
    VALIDATE: 1500,
    SAVE_TO_DB: 2000,
    GENERATE_PDF: 1500,
    OPEN_DOCUMENT: 1000
  };

  const generateWithLoader = async (generationFunction) => {
    try {
      setIsGeneratingPDF(true);
      setCurrentStep(1);

      await new Promise((resolve) => setTimeout(resolve, LOADER_TIMING.VALIDATE));
      setCurrentStep(2);

      const saveResponse = await generationFunction.saveStep();
      
      if (saveResponse?.data?.success || saveResponse?.success) {
        setCurrentStep(3);
        await new Promise((resolve) => setTimeout(resolve, LOADER_TIMING.GENERATE_PDF));
        setCurrentStep(4);

        await generationFunction.generatePDFs();
        
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

  return {
    isGeneratingPDF,
    currentStep,
    generateWithLoader,
    LOADER_TIMING
  };
};
