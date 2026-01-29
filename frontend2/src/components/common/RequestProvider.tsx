'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import RequestLoader from './RequestLoader';

type RequestContextType = {
  show: (message: string) => void;
  hide: () => void;
};

const RequestContext = createContext<RequestContextType | undefined>(undefined);

export function RequestProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');

  const show = (m: string) => {
    setMessage(m);
    setOpen(true);
  };

  const hide = () => {
    setOpen(false);
    setMessage('');
  };

  return (
    <RequestContext.Provider value={{ show, hide }}>
      {children}
      <RequestLoader open={open} message={message} />
    </RequestContext.Provider>
  );
}

export function useRequestContext() {
  const ctx = useContext(RequestContext);
  if (!ctx) throw new Error('useRequestContext must be used within RequestProvider');
  return ctx;
}

export default RequestProvider;
