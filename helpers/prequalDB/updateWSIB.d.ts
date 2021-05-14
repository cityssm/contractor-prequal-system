export interface WSIBForm {
    contractorID: string;
    wsib_isIndependent?: "1";
    wsib_accountNumber: string;
    wsib_firmNumber: string;
    wsib_effectiveDate: string;
    wsib_expiryDate: string;
}
export declare const updateWSIB: (updateForm: WSIBForm) => Promise<boolean>;
export default updateWSIB;
