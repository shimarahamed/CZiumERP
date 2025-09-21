
'use client';

import { useState, useEffect, useCallback } from 'react';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, doc, setDoc, writeBatch, getDocs, type CollectionReference } from 'firebase/firestore';

export function useFirestoreCollection<T extends { id: string }>(
  collectionName: string,
  initialData: T[]
) {
  const [data, setData] = useState<T[]>(initialData);

  useEffect(() => {
    const collRef = collection(db, collectionName) as CollectionReference<T>;

    const seedData = async () => {
      console.log(`Checking to seed ${collectionName}...`);
      const snapshot = await getDocs(collRef);
      if (snapshot.empty && initialData.length > 0) {
        console.log(`No data found in ${collectionName}. Seeding initial data...`);
        const batch = writeBatch(db);
        initialData.forEach((item) => {
          if (item.id && typeof item.id === 'string') {
            const docRef = doc(db, collectionName, item.id);
            batch.set(docRef, item);
          } else {
             console.error(`Skipping seeding for item with invalid ID in ${collectionName}:`, item);
          }
        });
        await batch.commit();
      }
    };
    
    seedData();

    const unsubscribe = onSnapshot(
      collRef,
      (snapshot) => {
        const newData = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as T));
        setData(newData);
      },
      (error) => {
        console.error(`Error fetching ${collectionName}:`, error);
      }
    );

    return () => unsubscribe();
  }, [collectionName]); // Removed initialData and isSeeded from dependencies

  const setCollection = useCallback(
    (updater: T[] | ((prev: T[]) => T[])) => {
      const dataToSet = typeof updater === 'function' ? updater(data) : updater;
      
      setData(dataToSet);

      (async () => {
        try {
            const batch = writeBatch(db);
            const collectionRef = collection(db, collectionName);
            
            const existingDocs = await getDocs(collectionRef);
            const newIds = new Set(dataToSet.map(item => item.id));

            existingDocs.forEach(existingDoc => {
                if (!newIds.has(existingDoc.id)) {
                    batch.delete(existingDoc.ref);
                }
            });

            dataToSet.forEach(item => {
              if (item.id && typeof item.id === 'string') {
                const docRef = doc(db, collectionName, item.id);
                batch.set(docRef, item);
              } else {
                console.error(`Skipping update for item with invalid ID in ${collectionName}:`, item);
              }
            });
            
            await batch.commit();
        } catch (error) {
            console.error(`Failed to update collection ${collectionName}:`, error);
        }
      })();
    },
    [collectionName, data] // data is needed here for the updater function to have the correct state
  );

  return [data, setCollection] as const;
}
