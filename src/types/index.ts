export interface Charger {
  id: string;
  name: string;
  location: {
    latitude: number;
    longitude: number;
    address: string;
    city: string;
    state: string;
    zipCode: string;
  };
  status: ChargerStatus;
  connectors: Connector[];
  power: number;
  franchise?: Franchise;
  partner?: Partner;
  brand: string;
  model: string;
  serialNumber: string;
  firmwareVersion: string;
  lastSeen: Date;
  uptime: number;
  utilization: number;
  revenue: {
    today: number;
    thisWeek: number;
    thisMonth: number;
    lifetime: number;
  };
  maintenance: {
    lastMaintenance: Date;
    nextScheduled: Date;
    alerts: MaintenanceAlert[];
  };
  ocppVersion: '1.6' | '2.0';
  networkStatus: 'online' | 'offline';
  temperature?: number;
  loadManagement: {
    currentLoad: number;
    maxLoad: number;
    inputPower: number;
    outputPower: number;
  };
}

export type ChargerStatus = 'available' | 'occupied' | 'offline' | 'fault' | 'maintenance';

export interface Connector {
  id: string;
  type: ConnectorType;
  status: ConnectorStatus;
  power: number;
  currentSession?: ChargingSession;
}

export type ConnectorType = 'CCS2' | 'CHAdeMO' | 'Type2' | 'CCS1' | 'GB/T';
export type ConnectorStatus = 'available' | 'occupied' | 'fault' | 'reserved';

export interface MaintenanceAlert {
  id: string;
  type: 'temperature' | 'power' | 'connectivity' | 'hardware';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  timestamp: Date;
  resolved: boolean;
}

export interface User {
  id: string;
  email: string;
  phone: string;
  name: string;
  verified: boolean;
  kycStatus: 'pending' | 'verified' | 'rejected';
  vehicles: Vehicle[];
  wallet: Wallet;
  joinedAt: Date;
  lastActive: Date;
  preferences: UserPreferences;
}

export interface Vehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  batteryCapacity: number;
  connectorTypes: ConnectorType[];
  registrationNumber?: string;
  nickname?: string;
}

export interface Wallet {
  balance: number;
  currency: string;
  autoTopup: {
    enabled: boolean;
    threshold: number;
    amount: number;
  };
  transactions: Transaction[];
}

export interface Transaction {
  id: string;
  type: 'credit' | 'debit';
  amount: number;
  currency: string;
  description: string;
  timestamp: Date;
  status: 'pending' | 'completed' | 'failed';
  paymentMethod?: string;
  sessionId?: string;
}

export interface UserPreferences {
  notifications: {
    email: boolean;
    sms: boolean;
    push: boolean;
  };
  defaultPaymentMethod: string;
  language: string;
  units: 'metric' | 'imperial';
}

export interface ChargingSession {
  id: string;
  userId: string;
  chargerId: string;
  connectorId: string;
  startTime: Date;
  endTime?: Date;
  status: SessionStatus;
  energyConsumed: number;
  duration: number;
  cost: number;
  currency: string;
  paymentStatus: PaymentStatus;
  startMethod: 'qr' | 'nfc' | 'plug_charge' | 'app';
  vehicle?: Vehicle;
  franchise?: Franchise;
  partner?: Partner;
  brand: string;
  roaming: {
    isRoaming: boolean;
    partnerBrand?: string;
    roamingFee?: number;
  };
  realTimeData: {
    currentPower: number;
    voltage: number;
    current: number;
    temperature: number;
    stateOfCharge?: number;
  };
}

export type SessionStatus = 'starting' | 'charging' | 'stopping' | 'completed' | 'failed';
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';

export interface Franchise {
  id: string;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: Address;
  type: 'single' | 'master';
  status: 'active' | 'inactive' | 'suspended';
  joinedAt: Date;
  chargers: string[];
  staff: Staff[];
  revenue: {
    totalEarned: number;
    pending: number;
    thisMonth: number;
  };
  settings: FranchiseSettings;
  kyc: KYCDetails;
  isAffiliate: boolean;
  affiliateSettings?: AffiliateSettings;
}

export interface Partner {
  id: string;
  name: string;
  type: 'location' | 'smart' | 'affiliate' | 'combination';
  contactPerson: string;
  email: string;
  phone: string;
  address: Address;
  status: 'active' | 'inactive' | 'suspended';
  joinedAt: Date;
  contract: Contract;
  earnings: {
    totalEarned: number;
    pending: number;
    thisMonth: number;
  };
  kyc: KYCDetails;
  chargers?: string[];
  investments?: Investment[];
  referrals?: Referral[];
}

export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

export interface Staff {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: StaffRole;
  permissions: Permission[];
  status: 'active' | 'inactive';
  joinedAt: Date;
  lastActive: Date;
}

export interface StaffRole {
  id: string;
  name: string;
  description: string;
  permissions: Permission[];
}

export type Permission = 
  | 'charger_control'
  | 'view_revenue'
  | 'manage_staff'
  | 'handle_support'
  | 'view_analytics'
  | 'manage_pricing'
  | 'export_reports';

export interface FranchiseSettings {
  pricingApprovalRequired: boolean;
  allowRemoteControl: boolean;
  autoReports: boolean;
  payoutFrequency: 'weekly' | 'monthly';
  minimumPayout: number;
}

export interface KYCDetails {
  status: 'pending' | 'verified' | 'rejected';
  documents: {
    type: string;
    url: string;
    status: string;
  }[];
  gstNumber?: string;
  panNumber?: string;
  bankDetails: {
    accountNumber: string;
    ifscCode: string;
    accountHolderName: string;
    verified: boolean;
  };
}

export interface AffiliateSettings {
  commissionRate: number;
  referralCode: string;
  totalReferrals: number;
  activeReferrals: number;
  commissionEarned: number;
}

export interface Contract {
  id: string;
  type: 'location' | 'smart' | 'affiliate';
  revenueShare: number;
  minimumTerm: number;
  startDate: Date;
  endDate?: Date;
  terms: string;
  signedBy: string;
  signedAt: Date;
  status: 'active' | 'expired' | 'terminated';
}

export interface Investment {
  id: string;
  chargerId: string;
  amount: number;
  date: Date;
  returns: number;
  status: 'active' | 'completed';
}

export interface Referral {
  id: string;
  referredUserId: string;
  referralCode: string;
  status: 'pending' | 'active' | 'inactive';
  commissionEarned: number;
  date: Date;
}

export interface PricingRule {
  id: string;
  name: string;
  type: 'static' | 'time_based' | 'demand_based' | 'session_based';
  rules: PricingCondition[];
  applicableChargers: string[];
  franchise?: string;
  priority: number;
  active: boolean;
  createdBy: string;
  createdAt: Date;
  approvedBy?: string;
  approvedAt?: Date;
}

export interface PricingCondition {
  condition: string;
  pricePerKwh: number;
  sessionFee?: number;
  minimumCharge?: number;
  currency: string;
}

export interface SupportTicket {
  id: string;
  userId?: string;
  franchiseId?: string;
  partnerId?: string;
  title: string;
  description: string;
  category: TicketCategory;
  priority: TicketPriority;
  status: TicketStatus;
  assignedTo?: string;
  department: Department;
  createdAt: Date;
  updatedAt: Date;
  resolvedAt?: Date;
  slaBreached: boolean;
  attachments: Attachment[];
  comments: TicketComment[];
  escalationLevel: number;
  source: 'app' | 'web' | 'email' | 'whatsapp' | 'phone' | 'social';
  relatedCharger?: string;
  relatedSession?: string;
}

export type TicketCategory = 
  | 'charging_issue'
  | 'payment_issue'
  | 'hardware_fault'
  | 'app_bug'
  | 'account_issue'
  | 'billing_dispute'
  | 'feature_request'
  | 'other';

export type TicketPriority = 'low' | 'medium' | 'high' | 'critical';
export type TicketStatus = 'open' | 'in_progress' | 'waiting_user' | 'resolved' | 'closed';
export type Department = 'support' | 'technical' | 'billing' | 'operations';

export interface TicketComment {
  id: string;
  ticketId: string;
  authorId: string;
  authorType: 'staff' | 'user' | 'system';
  content: string;
  isInternal: boolean;
  createdAt: Date;
  attachments: Attachment[];
}

export interface Attachment {
  id: string;
  filename: string;
  url: string;
  size: number;
  mimeType: string;
  uploadedAt: Date;
}

export interface RoamingPartner {
  id: string;
  name: string;
  brand: string;
  ocpiVersion: string;
  endpointUrl: string;
  token: string;
  status: 'active' | 'inactive' | 'testing';
  agreement: RoamingAgreement;
  chargers: RoamingCharger[];
  sessions: RoamingSession[];
  revenue: {
    totalReceived: number;
    totalPaid: number;
    thisMonth: number;
    pending: number;
  };
  lastSync: Date;
  syncStatus: 'synced' | 'syncing' | 'error';
}

export interface RoamingAgreement {
  id: string;
  partnerName: string;
  revenueShare: number;
  sessionFee: number;
  roamingFee: number;
  currency: string;
  paymentTerms: string;
  startDate: Date;
  endDate?: Date;
  signedAt: Date;
  status: 'active' | 'expired' | 'terminated';
}

export interface RoamingCharger {
  id: string;
  partnerId: string;
  externalId: string;
  name: string;
  location: Address;
  connectors: Connector[];
  status: ChargerStatus;
  pricing: PricingRule[];
  lastUpdated: Date;
}

export interface RoamingSession {
  id: string;
  localSessionId: string;
  partnerSessionId: string;
  partnerId: string;
  userId: string;
  chargerId: string;
  direction: 'incoming' | 'outgoing';
  startTime: Date;
  endTime?: Date;
  energyConsumed: number;
  cost: number;
  roamingFee: number;
  partnerShare: number;
  ourShare: number;
  currency: string;
  status: SessionStatus;
  settlementStatus: 'pending' | 'settled' | 'disputed';
}

export interface AnalyticsData {
  overview: {
    totalChargers: number;
    activeChargers: number;
    totalSessions: number;
    totalRevenue: number;
    averageUtilization: number;
  };
  chargerMetrics: {
    utilization: ChartData[];
    revenue: ChartData[];
    sessions: ChartData[];
    uptime: ChartData[];
  };
  userMetrics: {
    activeUsers: number;
    newUsers: ChartData[];
    userGrowth: ChartData[];
    topUsers: TopUser[];
  };
  franchiseMetrics: {
    totalFranchises: number;
    topPerformers: TopFranchise[];
    revenueDistribution: ChartData[];
  };
  partnerMetrics: {
    totalPartners: number;
    partnerTypes: ChartData[];
    earnings: ChartData[];
  };
  roamingMetrics: {
    incomingSessions: number;
    outgoingSessions: number;
    roamingRevenue: ChartData[];
    partnerPerformance: PartnerPerformance[];
  };
}

export interface ChartData {
  label: string;
  value: number;
  date?: Date;
}

export interface TopUser {
  id: string;
  name: string;
  email: string;
  totalSessions: number;
  totalSpent: number;
  rank: number;
}

export interface TopFranchise {
  id: string;
  name: string;
  totalRevenue: number;
  utilization: number;
  chargerCount: number;
  rank: number;
}

export interface PartnerPerformance {
  id: string;
  name: string;
  sessionsHandled: number;
  revenue: number;
  reliability: number;
  averageResponseTime: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface WebSocketMessage {
  type: 'charger_status' | 'session_update' | 'payment_update' | 'system_alert';
  data: any;
  timestamp: Date;
}

export interface ChargerStatusUpdate {
  chargerId: string;
  status: ChargerStatus;
  connectors: Connector[];
  lastSeen: Date;
  networkStatus: 'online' | 'offline';
}

export interface SessionUpdate {
  sessionId: string;
  status: SessionStatus;
  energyConsumed: number;
  duration: number;
  cost: number;
  realTimeData: any;
}
