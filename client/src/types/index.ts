export interface User {
  id: number;
  name: string;
  login: string;
  role: 'doctor' | 'admin' | 'manager';
  isActive?: boolean;
}

export interface ServiceGroup {
  id: number;
  name: string;
  subgroups?: ServiceSubgroup[];
  createdAt: string;
  updatedAt: string;
}

export interface ServiceSubgroup {
  id: number;
  name: string;
  groupId: number;
  group?: ServiceGroup;
  createdAt: string;
  updatedAt: string;
}

export interface Service {
  id: number;
  name: string;
  groupId: number;
  subgroupId?: number;
  currentPrice: number;
  priceUpdatedAt: string;
  group: ServiceGroup;
  subgroup?: ServiceSubgroup;
  createdAt: string;
  updatedAt: string;
}

export interface VisitService {
  id: number;
  visitId: number;
  serviceId: number;
  quantity: number;
  priceAtDate: number;
  subtotal: number;
  service: Service;
  createdAt: string;
  updatedAt: string;
}

export interface Visit {
  id: number;
  patientName: string;
  doctorId: number;
  visitDate: string;
  comment?: string;
  totalAmount: number;
  paymentStatus: 'unpaid' | 'partial' | 'paid';
  cashPayment: number;
  cardPayment: number;
  transferPayment: number;
  paymentDate?: string;
  paidBy?: number;
  doctor: User;
  administrator?: User;
  visitServices: VisitService[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateVisitRequest {
  patientName: string;
  services: Array<{
    serviceId: number;
    quantity: number;
  }>;
  comment?: string;
}

export interface PaymentRequest {
  cashPayment?: number;
  cardPayment?: number;
  transferPayment?: number;
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (loginData: { login: string; password: string }) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
}

export interface VisitContextType {
  visits: Visit[];
  services: Service[];
  serviceGroups: ServiceGroup[];
  loading: boolean;
  fetchVisits: (date?: string, doctorId?: number) => Promise<void>;
  fetchServices: (search?: string) => Promise<void>;
  fetchServiceGroups: () => Promise<void>;
  createVisit: (visitData: CreateVisitRequest) => Promise<Visit>;
  updatePayment: (visitId: number, paymentData: PaymentRequest) => Promise<Visit>;
  createService: (serviceData: {
    name: string;
    groupId: number;
    subgroupId?: number;
    currentPrice: number;
  }) => Promise<Service>;
  updateServicePrice: (serviceId: number, newPrice: number) => Promise<Service>;
} 
  id: number;
  name: string;
  login: string;
  role: 'doctor' | 'admin' | 'manager';
  isActive?: boolean;
}

export interface ServiceGroup {
  id: number;
  name: string;
  subgroups?: ServiceSubgroup[];
  createdAt: string;
  updatedAt: string;
}

export interface ServiceSubgroup {
  id: number;
  name: string;
  groupId: number;
  group?: ServiceGroup;
  createdAt: string;
  updatedAt: string;
}

export interface Service {
  id: number;
  name: string;
  groupId: number;
  subgroupId?: number;
  currentPrice: number;
  priceUpdatedAt: string;
  group: ServiceGroup;
  subgroup?: ServiceSubgroup;
  createdAt: string;
  updatedAt: string;
}

export interface VisitService {
  id: number;
  visitId: number;
  serviceId: number;
  quantity: number;
  priceAtDate: number;
  subtotal: number;
  service: Service;
  createdAt: string;
  updatedAt: string;
}

export interface Visit {
  id: number;
  patientName: string;
  doctorId: number;
  visitDate: string;
  comment?: string;
  totalAmount: number;
  paymentStatus: 'unpaid' | 'partial' | 'paid';
  cashPayment: number;
  cardPayment: number;
  transferPayment: number;
  paymentDate?: string;
  paidBy?: number;
  doctor: User;
  administrator?: User;
  visitServices: VisitService[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateVisitRequest {
  patientName: string;
  services: Array<{
    serviceId: number;
    quantity: number;
  }>;
  comment?: string;
}

export interface PaymentRequest {
  cashPayment?: number;
  cardPayment?: number;
  transferPayment?: number;
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (loginData: { login: string; password: string }) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
}

export interface VisitContextType {
  visits: Visit[];
  services: Service[];
  serviceGroups: ServiceGroup[];
  loading: boolean;
  fetchVisits: (date?: string, doctorId?: number) => Promise<void>;
  fetchServices: (search?: string) => Promise<void>;
  fetchServiceGroups: () => Promise<void>;
  createVisit: (visitData: CreateVisitRequest) => Promise<Visit>;
  updatePayment: (visitId: number, paymentData: PaymentRequest) => Promise<Visit>;
  createService: (serviceData: {
    name: string;
    groupId: number;
    subgroupId?: number;
    currentPrice: number;
  }) => Promise<Service>;
  updateServicePrice: (serviceId: number, newPrice: number) => Promise<Service>;
} 