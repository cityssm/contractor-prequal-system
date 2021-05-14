export interface HealthSafetyForm {
    contractorID: string;
    healthSafety_status: string;
}
export declare const updateHealthSafety: (updateForm: HealthSafetyForm) => Promise<boolean>;
export default updateHealthSafety;
