import { AdWebAuthConnector } from '@cityssm/ad-web-auth-connector';
import * as configFunctions from './configFunctions.js';
const adWebAuthConfig = configFunctions.getProperty('adWebAuthConfig');
const userDomain = configFunctions.getProperty('application.userDomain');
const auth = new AdWebAuthConnector(adWebAuthConfig);
export const authenticate = async (userName, password) => {
    return await auth.authenticate(userDomain + '\\' + userName, password);
};
