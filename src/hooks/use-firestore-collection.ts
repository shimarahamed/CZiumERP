
'use client';

import { useState, useEffect, useCallback } from 'react';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, doc, setDoc, writeBatch, getDocs, type CollectionReference } from 'firebase/firestore';

export function useFirestoreCollection<T extends { id: string }>(
  collectionName: string,
  initialData: T[]
) {
  const [data, setData] = useState<T[]>(initialData);
  const [isSeeded, setIsSeeded] = useState(false);

  useEffect(() => {
    const collRef = collection(db, collectionName) as CollectionReference<T>;
    const unsubscribe = onSnapshot(
      collRef,
      async (snapshot) => {
        if (snapshot.empty && initialData.length > 0 && !isSeeded) {
          console.log(`No data found in ${collectionName}. Seeding initial data...`);
          setIsSeeded(true); // Prevent re-seeding
          const batch = writeBatch(db);
          initialData.forEach((item) => {
            if (typeof item.id === 'string' && item.id.length > 0) {
              const docRef = doc(db, collectionName, item.id);
              batch.set(docRef, item);
            } else {
              console.error(`Skipping seeding for item with invalid ID in ${collectionName}:`, item);
            }
          });
          await batch.commit().catch((e) => {
            console.error(`Failed to seed ${collectionName}:`, e)
            setIsSeeded(false); // Allow retry on failure
          });
        } else if (!snapshot.empty) {
          const newData = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as T));
          setData(newData);
        }
      },
      (error) => {
        console.error(`Error fetching ${collectionName}:`, error);
      }
    );

    return () => unsubscribe();
  }, [collectionName, initialData, isSeeded]);

  const setCollection = useCallback(
    (updater: T[] | ((prev: T[]) => T[])) => {
      
      const updateData = (currentData: T[]) => {
        const dataToSet = typeof updater === 'function' ? updater(currentData) : updater;
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
                if (typeof item.id === 'string' && item.id.length > 0) {
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
      };
      
      setData(current => {
        updateData(current);
        // This part is just to get the latest state for the updater function, if it is one.
        return typeof updater === 'function' ? updater(current) : updater;
      });

    },
    [collectionName]
  );

  return [data, setCollection] as const;
}
