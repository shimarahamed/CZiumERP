
'use client';

import { useState, useEffect, useCallback } from 'react';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, doc, setDoc, writeBatch, getDocs, type CollectionReference } from 'firebase/firestore';

export function useFirestoreCollection<T extends { id: string }>(
  collectionName: string,
  initialData: T[],
  isHydrated: boolean
) {
  const [data, setData] = useState<T[]>(initialData);

  useEffect(() => {
    if (!isHydrated) return;

    const collRef = collection(db, collectionName) as CollectionReference<T>;
    const unsubscribe = onSnapshot(
      collRef,
      async (snapshot) => {
        if (snapshot.empty && initialData.length > 0) {
          console.log(`No data found in ${collectionName}. Seeding initial data...`);
          const batch = writeBatch(db);
          initialData.forEach((item) => {
            const docRef = doc(db, collectionName, item.id);
            batch.set(docRef, item);
          });
          await batch.commit().catch((e) => console.error(`Failed to seed ${collectionName}:`, e));
        } else {
          const newData = snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
          setData(newData);
        }
      },
      (error) => {
        console.error(`Error fetching ${collectionName}:`, error);
      }
    );

    return () => unsubscribe();
  }, [isHydrated, collectionName, initialData]);

  const setCollection = useCallback(
    (newData: T[] | ((prev: T[]) => T[])) => {
      const dataToSet = typeof newData === 'function' ? newData(data) : newData;
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
              const docRef = doc(db, collectionName, item.id);
              batch.set(docRef, item);
            });
            
            await batch.commit();
        } catch (error) {
            console.error(`Failed to update collection ${collectionName}:`, error);
        }
      })();
    },
    [collectionName, data]
  );

  return [data, setCollection] as const;
}
