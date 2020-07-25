import * as admin from 'firebase-admin';

const deleteFirebaseCollection = async (
    batch: FirebaseFirestore.WriteBatch,
    path: string
): Promise<void> => {
    const documents = await admin.firestore().collection(path).listDocuments();

    documents.map((val) => {
        batch.delete(val);
    });
};

export default deleteFirebaseCollection;
