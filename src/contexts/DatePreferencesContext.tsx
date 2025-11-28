import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { format } from 'date-fns';

interface DatePreferences {
  startDate: string;
  endDate: string;
  resetToToday: () => void;
  setDateRange: (start: string, end: string) => void;
}

const DatePreferencesContext = createContext<DatePreferences | null>(null);

export function DatePreferencesProvider({ children }: { children: ReactNode }) {
  const [startDate, setStartDate] = useState(() => {
    const today = format(new Date(), 'yyyy-MM-dd');
    const savedStart = localStorage.getItem('finance_tracker_start_date');
    return savedStart && savedStart >= format(new Date(Date.now() - 365 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd')
      ? savedStart
      : today;
  });

  const [endDate, setEndDate] = useState(() => {
    const today = format(new Date(), 'yyyy-MM-dd');
    const savedEnd = localStorage.getItem('finance_tracker_end_date');
    return savedEnd && savedEnd >= format(new Date(Date.now() - 365 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd')
      ? savedEnd
      : today;
  });

  useEffect(() => {
    const today = format(new Date(), 'yyyy-MM-dd');
    const lastLogin = localStorage.getItem('finance_tracker_last_login');
    const currentDate = new Date().toDateString();

    if (lastLogin !== currentDate) {
      setStartDate(today);
      setEndDate(today);
      localStorage.setItem('finance_tracker_last_login', currentDate);
      localStorage.setItem('finance_tracker_start_date', today);
      localStorage.setItem('finance_tracker_end_date', today);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('finance_tracker_start_date', startDate);
  }, [startDate]);

  useEffect(() => {
    localStorage.setItem('finance_tracker_end_date', endDate);
  }, [endDate]);

  const resetToToday = () => {
    const today = format(new Date(), 'yyyy-MM-dd');
    setStartDate(today);
    setEndDate(today);
  };

  const setDateRange = (start: string, end: string) => {
    setStartDate(start);
    setEndDate(end);
  };

  return (
    <DatePreferencesContext.Provider
      value={{
        startDate,
        endDate,
        resetToToday,
        setDateRange
      }}
    >
      {children}
    </DatePreferencesContext.Provider>
  );
}

export function useDatePreferences() {
  const context = useContext(DatePreferencesContext);
  if (!context) {
    throw new Error('useDatePreferences must be used within DatePreferencesProvider');
  }
  return context;
}
