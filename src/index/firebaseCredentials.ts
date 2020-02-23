import admin from 'firebase-admin';
import firebaseCredentials from '../../firebase-credentials.json';

export const databaseUrl = 'https://pgu-app.firebaseio.com';

const serviceAccount = {
    type: firebaseCredentials.type,
    projectId: firebaseCredentials.project_id,
    privateKeyId: firebaseCredentials.private_key_id,
    privateKey: firebaseCredentials.private_key,
    clientEmail: firebaseCredentials.client_email,
    clientId: firebaseCredentials.client_id,
    authUri: firebaseCredentials.auth_uri,
    tokenUri: firebaseCredentials.token_uri,
    authProviderX509CertUrl: firebaseCredentials.auth_provider_x509_cert_url,
    clientC509CertUrl: firebaseCredentials.client_x509_cert_url,
};

const credential = admin.credential.cert(serviceAccount);

export default credential;
