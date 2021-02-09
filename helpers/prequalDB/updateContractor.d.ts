export interface ContractorForm {
    contractorID: string;
    docuShareCollectionID: string;
}
export declare const updateContractor: (updateForm: ContractorForm) => Promise<boolean>;
