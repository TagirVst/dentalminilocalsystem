import axios from 'axios';
import { User, Visit, Service, ServiceGroup, CreateVisitRequest, PaymentRequest } from '../types';

const API_BASE_URL = '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

// Auth API
export const authAPI = {
  login: async (credentials: { login: string; password: string }) => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  logout: async () => {
    const response = await api.post('/auth/logout');
    return response.data;
  },

  getMe: async (): Promise<{ user: User }> => {
    const response = await api.get('/auth/me');
    return response.data;
  },
};

// Visits API
export const visitsAPI = {
  getVisits: async (date?: string, doctorId?: number): Promise<Visit[]> => {
    const params = new URLSearchParams();
    if (date) params.append('date', date);
    if (doctorId) params.append('doctorId', doctorId.toString());
    
    const response = await api.get(`/visits?${params.toString()}`);
    return response.data;
  },

  getVisit: async (id: number): Promise<Visit> => {
    const response = await api.get(`/visits/${id}`);
    return response.data;
  },

  createVisit: async (visitData: CreateVisitRequest): Promise<Visit> => {
    const response = await api.post('/visits', visitData);
    return response.data;
  },

  updatePayment: async (visitId: number, paymentData: PaymentRequest): Promise<Visit> => {
    const response = await api.put(`/visits/${visitId}/payment`, paymentData);
    return response.data;
  },
};

// Services API
export const servicesAPI = {
  getServices: async (search?: string): Promise<Service[]> => {
    const params = search ? `?search=${encodeURIComponent(search)}` : '';
    const response = await api.get(`/services${params}`);
    return response.data;
  },

  getServiceGroups: async (): Promise<ServiceGroup[]> => {
    const response = await api.get('/services/groups');
    return response.data;
  },

  createService: async (serviceData: {
    name: string;
    groupId: number;
    subgroupId?: number;
    currentPrice: number;
  }): Promise<Service> => {
    const response = await api.post('/services', serviceData);
    return response.data;
  },

  updateServicePrice: async (serviceId: number, currentPrice: number): Promise<Service> => {
    const response = await api.put(`/services/${serviceId}/price`, { currentPrice });
    return response.data;
  },

  createGroup: async (name: string): Promise<ServiceGroup> => {
    const response = await api.post('/services/groups', { name });
    return response.data;
  },

  createSubgroup: async (name: string, groupId: number) => {
    const response = await api.post('/services/subgroups', { name, groupId });
    return response.data;
  },
};

// Users API
export const usersAPI = {
  getUsers: async (): Promise<User[]> => {
    const response = await api.get('/users');
    return response.data;
  },

  createUser: async (userData: {
    name: string;
    login: string;
    password: string;
    role: string;
  }): Promise<{ user: User }> => {
    const response = await api.post('/users', userData);
    return response.data;
  },
};

export default api; 
import { User, Visit, Service, ServiceGroup, CreateVisitRequest, PaymentRequest } from '../types';

const API_BASE_URL = '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

// Auth API
export const authAPI = {
  login: async (credentials: { login: string; password: string }) => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  logout: async () => {
    const response = await api.post('/auth/logout');
    return response.data;
  },

  getMe: async (): Promise<{ user: User }> => {
    const response = await api.get('/auth/me');
    return response.data;
  },
};

// Visits API
export const visitsAPI = {
  getVisits: async (date?: string, doctorId?: number): Promise<Visit[]> => {
    const params = new URLSearchParams();
    if (date) params.append('date', date);
    if (doctorId) params.append('doctorId', doctorId.toString());
    
    const response = await api.get(`/visits?${params.toString()}`);
    return response.data;
  },

  getVisit: async (id: number): Promise<Visit> => {
    const response = await api.get(`/visits/${id}`);
    return response.data;
  },

  createVisit: async (visitData: CreateVisitRequest): Promise<Visit> => {
    const response = await api.post('/visits', visitData);
    return response.data;
  },

  updatePayment: async (visitId: number, paymentData: PaymentRequest): Promise<Visit> => {
    const response = await api.put(`/visits/${visitId}/payment`, paymentData);
    return response.data;
  },
};

// Services API
export const servicesAPI = {
  getServices: async (search?: string): Promise<Service[]> => {
    const params = search ? `?search=${encodeURIComponent(search)}` : '';
    const response = await api.get(`/services${params}`);
    return response.data;
  },

  getServiceGroups: async (): Promise<ServiceGroup[]> => {
    const response = await api.get('/services/groups');
    return response.data;
  },

  createService: async (serviceData: {
    name: string;
    groupId: number;
    subgroupId?: number;
    currentPrice: number;
  }): Promise<Service> => {
    const response = await api.post('/services', serviceData);
    return response.data;
  },

  updateServicePrice: async (serviceId: number, currentPrice: number): Promise<Service> => {
    const response = await api.put(`/services/${serviceId}/price`, { currentPrice });
    return response.data;
  },

  createGroup: async (name: string): Promise<ServiceGroup> => {
    const response = await api.post('/services/groups', { name });
    return response.data;
  },

  createSubgroup: async (name: string, groupId: number) => {
    const response = await api.post('/services/subgroups', { name, groupId });
    return response.data;
  },
};

// Users API
export const usersAPI = {
  getUsers: async (): Promise<User[]> => {
    const response = await api.get('/users');
    return response.data;
  },

  createUser: async (userData: {
    name: string;
    login: string;
    password: string;
    role: string;
  }): Promise<{ user: User }> => {
    const response = await api.post('/users', userData);
    return response.data;
  },
};

export default api; 