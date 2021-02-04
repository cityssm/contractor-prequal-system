export interface InsuranceForm {
    contractorID: string;
    insurance_company: string;
    insurance_policyNumber: string;
    insurance_amount: string;
    insurance_expiryDate: string;
}
export declare const updateInsurance: (updateForm: InsuranceForm) => Promise<boolean>;
