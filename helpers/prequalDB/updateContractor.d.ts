export interface ContractorForm {
    contractorID: string | number;
    docuShareCollectionID: string | number;
}
export declare const updateContractor: (updateForm: ContractorForm) => Promise<boolean>;
export default updateContractor;
