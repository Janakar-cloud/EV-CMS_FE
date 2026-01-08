// KYC Type Definitions

export interface KYCDocument {
  id: string;
  userId: string;
  documentType: 'aadhaar' | 'pan' | 'driving_license' | 'passport';
  documentNumber: string;
  frontImage: string;
  backImage?: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
  verifiedAt?: string;
  verifiedBy?: string;
  notes?: string;
}

export interface KYCStatus {
  status: 'not_submitted' | 'pending' | 'approved' | 'rejected';
  documents: KYCDocument[];
  rejectionReason?: string;
}

export interface SubmitKYCRequest {
  documentType: 'aadhaar' | 'pan' | 'driving_license' | 'passport';
  documentNumber: string;
  documentUrl?: string;
  frontImage?: string;
  backImage?: string;
}

export interface VerifyKYCRequest {
  status: 'approved' | 'rejected';
  notes?: string;
}
