// src/context/ReportContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const ReportContext = createContext();

export const ReportProvider = ({ children }) => {
  const [report, setReport] = useState(null);

  const fetchLatestReport = async () => {
    try {
      const res = await axios.get('http://localhost:8000/report/latest');
      if (res.data && res.data.content && res.data.prompt) {
        setReport({
          full: res.data.content,
          prompt: res.data.prompt,
        });
      }
    } catch (err) {
      console.error('Failed to fetch latest report:', err);
    }
  };

  useEffect(() => {
    fetchLatestReport();
  }, []);

  const setReportData = (data) => {
    setReport(data);
  };

  return (
    <ReportContext.Provider value={{ report, setReportData }}>
      {children}
    </ReportContext.Provider>
  );
};

export const useReport = () => useContext(ReportContext);
