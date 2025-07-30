import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Visit, Service, ServiceGroup, VisitContextType, CreateVisitRequest, PaymentRequest } from '../types';
import { visitsAPI, servicesAPI } from '../services/api';

const VisitContext = createContext<VisitContextType | null>(null);

export const useVisits = () => {
  const context = useContext(VisitContext);
  if (!context) {
    throw new Error('useVisits должен использоваться внутри VisitProvider');
  }
  return context;
};

interface VisitProviderProps {
  children: ReactNode;
}

export const VisitProvider: React.FC<VisitProviderProps> = ({ children }) => {
  const [visits, setVisits] = useState<Visit[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [serviceGroups, setServiceGroups] = useState<ServiceGroup[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchVisits = async (date?: string, doctorId?: number) => {
    try {
      setLoading(true);
      const data = await visitsAPI.getVisits(date, doctorId);
      setVisits(data);
    } catch (error) {
      console.error('Ошибка загрузки визитов:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const fetchServices = async (search?: string) => {
    try {
      setLoading(true);
      const data = await servicesAPI.getServices(search);
      setServices(data);
    } catch (error) {
      console.error('Ошибка загрузки услуг:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const fetchServiceGroups = async () => {
    try {
      setLoading(true);
      const data = await servicesAPI.getServiceGroups();
      setServiceGroups(data);
    } catch (error) {
      console.error('Ошибка загрузки групп услуг:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const createVisit = async (visitData: CreateVisitRequest): Promise<Visit> => {
    try {
      const newVisit = await visitsAPI.createVisit(visitData);
      setVisits(prev => [newVisit, ...prev]);
      return newVisit;
    } catch (error) {
      console.error('Ошибка создания визита:', error);
      throw error;
    }
  };

  const updatePayment = async (visitId: number, paymentData: PaymentRequest): Promise<Visit> => {
    try {
      const updatedVisit = await visitsAPI.updatePayment(visitId, paymentData);
      setVisits(prev => prev.map(visit => 
        visit.id === visitId ? updatedVisit : visit
      ));
      return updatedVisit;
    } catch (error) {
      console.error('Ошибка обновления оплаты:', error);
      throw error;
    }
  };

  const createService = async (serviceData: {
    name: string;
    groupId: number;
    subgroupId?: number;
    currentPrice: number;
  }): Promise<Service> => {
    try {
      const newService = await servicesAPI.createService(serviceData);
      setServices(prev => [...prev, newService]);
      return newService;
    } catch (error) {
      console.error('Ошибка создания услуги:', error);
      throw error;
    }
  };

  const updateServicePrice = async (serviceId: number, newPrice: number): Promise<Service> => {
    try {
      const updatedService = await servicesAPI.updateServicePrice(serviceId, newPrice);
      setServices(prev => prev.map(service => 
        service.id === serviceId ? updatedService : service
      ));
      return updatedService;
    } catch (error) {
      console.error('Ошибка обновления цены услуги:', error);
      throw error;
    }
  };

  const value: VisitContextType = {
    visits,
    services,
    serviceGroups,
    loading,
    fetchVisits,
    fetchServices,
    fetchServiceGroups,
    createVisit,
    updatePayment,
    createService,
    updateServicePrice,
  };

  return (
    <VisitContext.Provider value={value}>
      {children}
    </VisitContext.Provider>
  );
}; 
import { Visit, Service, ServiceGroup, VisitContextType, CreateVisitRequest, PaymentRequest } from '../types';
import { visitsAPI, servicesAPI } from '../services/api';

const VisitContext = createContext<VisitContextType | null>(null);

export const useVisits = () => {
  const context = useContext(VisitContext);
  if (!context) {
    throw new Error('useVisits должен использоваться внутри VisitProvider');
  }
  return context;
};

interface VisitProviderProps {
  children: ReactNode;
}

export const VisitProvider: React.FC<VisitProviderProps> = ({ children }) => {
  const [visits, setVisits] = useState<Visit[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [serviceGroups, setServiceGroups] = useState<ServiceGroup[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchVisits = async (date?: string, doctorId?: number) => {
    try {
      setLoading(true);
      const data = await visitsAPI.getVisits(date, doctorId);
      setVisits(data);
    } catch (error) {
      console.error('Ошибка загрузки визитов:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const fetchServices = async (search?: string) => {
    try {
      setLoading(true);
      const data = await servicesAPI.getServices(search);
      setServices(data);
    } catch (error) {
      console.error('Ошибка загрузки услуг:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const fetchServiceGroups = async () => {
    try {
      setLoading(true);
      const data = await servicesAPI.getServiceGroups();
      setServiceGroups(data);
    } catch (error) {
      console.error('Ошибка загрузки групп услуг:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const createVisit = async (visitData: CreateVisitRequest): Promise<Visit> => {
    try {
      const newVisit = await visitsAPI.createVisit(visitData);
      setVisits(prev => [newVisit, ...prev]);
      return newVisit;
    } catch (error) {
      console.error('Ошибка создания визита:', error);
      throw error;
    }
  };

  const updatePayment = async (visitId: number, paymentData: PaymentRequest): Promise<Visit> => {
    try {
      const updatedVisit = await visitsAPI.updatePayment(visitId, paymentData);
      setVisits(prev => prev.map(visit => 
        visit.id === visitId ? updatedVisit : visit
      ));
      return updatedVisit;
    } catch (error) {
      console.error('Ошибка обновления оплаты:', error);
      throw error;
    }
  };

  const createService = async (serviceData: {
    name: string;
    groupId: number;
    subgroupId?: number;
    currentPrice: number;
  }): Promise<Service> => {
    try {
      const newService = await servicesAPI.createService(serviceData);
      setServices(prev => [...prev, newService]);
      return newService;
    } catch (error) {
      console.error('Ошибка создания услуги:', error);
      throw error;
    }
  };

  const updateServicePrice = async (serviceId: number, newPrice: number): Promise<Service> => {
    try {
      const updatedService = await servicesAPI.updateServicePrice(serviceId, newPrice);
      setServices(prev => prev.map(service => 
        service.id === serviceId ? updatedService : service
      ));
      return updatedService;
    } catch (error) {
      console.error('Ошибка обновления цены услуги:', error);
      throw error;
    }
  };

  const value: VisitContextType = {
    visits,
    services,
    serviceGroups,
    loading,
    fetchVisits,
    fetchServices,
    fetchServiceGroups,
    createVisit,
    updatePayment,
    createService,
    updateServicePrice,
  };

  return (
    <VisitContext.Provider value={value}>
      {children}
    </VisitContext.Provider>
  );
}; 