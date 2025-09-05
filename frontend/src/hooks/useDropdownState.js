import { useEffect, useState } from "react";

export const useDropdownState = (initialData) => {
  const [dropdownOpen, setDropdownOpen] = useState({});

  useEffect(() => {
    if (initialData && initialData.length > 0) {
      const initialDropdownState = {};
      initialData.forEach((_, index) => {
        initialDropdownState[index] = true;
      });
      setDropdownOpen(initialDropdownState);
    }
  }, [initialData]);

  const toggleDropdown = (scheduleIndex) => {
    setDropdownOpen(prev => ({
      ...prev,
      [scheduleIndex]: !prev[scheduleIndex]
    }));
  };

  return { dropdownOpen, setDropdownOpen, toggleDropdown };
};