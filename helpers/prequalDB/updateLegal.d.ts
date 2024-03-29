import type * as express from "express-session";
export interface LegalForm {
    contractorID: string;
    legal_isSatisfactory: "1" | "0";
    legal_note: string;
}
export declare const updateLegal: (updateForm: LegalForm, requestSession: express.Session) => Promise<boolean>;
export default updateLegal;
