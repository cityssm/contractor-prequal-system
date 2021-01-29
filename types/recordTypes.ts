export interface User {
  userName: string;
  canUpdate: boolean;
};


declare module "express-session" {
  interface Session {
    user: User;
  }
};


export interface Contractor {
  contractorID: number;
  docushareCollectionID?: number;
  isContractor: boolean;

  contractor_name: string;
  contractor_city?: string;
  contractor_province?: string;

  phone_name?: string;
  phone_title?: string;
  phone_number?: string;

  wsib_accountNumber?: string;
  wsib_firmNumber?: string;
  wsib_effectiveDate?: Date;
  wsib_expiryDate?: Date;
  wsib_isIndependent?: boolean;
  wsib_isSatisfactory: boolean;

  insurance_company?: string;
  insurance_policyNumber?: string;
  insurance_amount?: number;
  insurance_expiryDate?: Date;
  insurance_isSatisfactory: boolean;

  healthSafety_status?: string;
  healthSafety_isSatisfactory: boolean;

  legal_note?: string;
  legal_isSatisfactory: boolean;
};
