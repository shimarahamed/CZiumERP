'use client';

import {initializeApp, getApp, getApps} from 'firebase/app';
import {
  getFirestore,
  connectFirestoreEmulator,
  enableMultiTabIndexedDbPersistence,
  disableNetwork,
  enableNetwork,
} from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'your-api-key',
  authDomain: 'your-auth-domain',
  projectId: 'your-project-id',
  storageBucket: 'your-storage-bucket',
  messagingSenderId: 'your-messaging-sender-id',
  appId: 'your-app-id',
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);

// Enable multi-tab persistence
enableMultiTabIndexedDbPersistence(db).catch(err => {
  if (err.code === 'failed-precondition') {
    console.warn(
      'Firestore persistence could not be enabled. This is likely because another tab is already open with persistence enabled. Close other tabs and reload to enable.'
    );
  } else if (err.code === 'unimplemented') {
    console.warn(
      'The current browser does not support all of the features required to enable persistence.'
    );
  }
});

// By default, disable network to work offline first.
// The user can enable it via a setting.
disableNetwork(db);

export {app, db, enableNetwork, disableNetwork};
