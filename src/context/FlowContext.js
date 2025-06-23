import React, { createContext, useContext } from 'react';

const FlowContext = createContext();

export const FlowProvider = ({ children, value }) => {
  return (
    <FlowContext.Provider value={value}>
      {children}
    </FlowContext.Provider>
  );
};

export const useFlow = () => {
  const context = useContext(FlowContext);
  if (!context) {
    throw new Error('useFlow must be used within a FlowProvider');
  }
  return context;
};

export default FlowContext; 