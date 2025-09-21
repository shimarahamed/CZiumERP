
'use client';

import { useState, useEffect, useCallback } from 'react';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, doc, setDoc, writeBatch, getDocs, type CollectionReference } from 'firebase/firestore';

export function useFirestoreCollection<T extends { id: string }>(
  collectionName: string,
  initialData: T[]
) {
  const [data, setData] = useState<T[]>(initialData);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const collRef = collection(db, collectionName) as CollectionReference<T>;

    const seedData = async () => {
      try {
        const snapshot = await getDocs(collRef);
        if (snapshot.empty && initialData.length > 0) {
          console.log(`Seeding initial data for ${collectionName}...`);
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
      } catch (error) {
        console.error(`Error seeding data for ${collectionName}:`, error);
      }
    };
    
    seedData();

    const unsubscribe = onSnapshot(
      collRef,
      (snapshot) => {
        const newData = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as T));
        setData(newData);
        if (!isLoaded) {
          setIsLoaded(true);
        }
      },
      (error) => {
        console.error(`Error fetching ${collectionName}:`, error);
        if (!isLoaded) {
          setIsLoaded(true); // Still mark as loaded on error to unblock UI
        }
      }
    );

    return () => unsubscribe();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [collectionName]);

  const setCollection = useCallback(
    (updater: T[] | ((prev: T[]) => T[])) => {
      
      const newData = typeof updater === 'function' ? updater(data) : updater;
      setData(newData); // Optimistic update

      (async () => {
        try {
            const batch = writeBatch(db);
            const collectionRef = collection(db, collectionName);
            
            const existingDocsSnapshot = await getDocs(collectionRef);
            const existingIds = new Set(existingDocsSnapshot.docs.map(d => d.id));
            const newIds = new Set(newData.map(item => item.id));

            // Delete docs that are no longer in the new data
            existingDocsSnapshot.forEach(existingDoc => {
                if (!newIds.has(existingDoc.id)) {
                    batch.delete(existingDoc.ref);
                }
            });

            // Set/update docs from the new data
            newData.forEach(item => {
              // *** CRITICAL FIX: Ensure item.id is a valid string before creating a doc ref ***
              if (typeof item.id !== 'string' || item.id.trim() === '') {
                console.error(`[Firestore] Skipped write for item with invalid ID in collection "${collectionName}":`, item);
                return; // Skip this item to prevent crash
              }
              const docRef = doc(db, collectionName, item.id);
              batch.set(docRef, item, { merge: true });
            });
            
            await batch.commit();
        } catch (error) {
            console.error(`Failed to update collection ${collectionName}:`, error);
            // Here you might want to revert the optimistic update
        }
      })();
    },
    [collectionName, data]
  );

  return [data, setCollection, isLoaded] as const;
}
