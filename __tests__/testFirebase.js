import { db } from '../src/config/firebase.js';

const testFirebase = async () => {
  try {
    const docRef = db.collection('testCollection').doc('testDoc');
    await docRef.set({
      testField: 'Hello, Firebase!'
    });

    const doc = await docRef.get();
    if (doc.exists) {
      console.log('Document data:', doc.data());
    } else {
      console.log('No such document!');
    }
  } catch (error) {
    console.error('Error testing Firebase:', error);
  }
};

testFirebase();