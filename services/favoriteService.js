import { collection, addDoc, getDocs, query, where, doc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';

// Add a favorite airport
export async function addFavorite(airportCode, userId, airportName, city, state) {
  try {
    const favorite = {
      airportCode,
      userId,
      airportName,
      city,
      state,
    };
    await addDoc(collection(db, 'favorites'), favorite);
    console.log('Airport added to favorites successfully');
  } catch (error) {
    console.error('Error adding airport to favorites: ', error);
  }
}

// Fetch all favorite airports for a user
export async function fetchFavorites(userId) {
  try {
    const q = query(collection(db, 'favorites'), where('userId', '==', userId));
    const querySnapshot = await getDocs(q);

    // console.log(querySnapshot)

    const favorites = [];
    querySnapshot.forEach((doc) => {
      favorites.push(doc.data());
    });

    return favorites;
  } catch (error) {
    console.error('Error fetching favorites: ', error);
    return [];
  }
}

export const removeFavorite = async (userId, airportCode, setFavorites) => {
  try {
    const q = query(
      collection(db, 'favorites'),
      where('userId', '==', userId),
      where('airportCode', '==', airportCode)
    );

    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      console.log('No matching favorite found.');
      return;
    }

    // console.log(querySnapshot)

    // Correctly iterate over each document and delete it
    for (const documentSnapshot of querySnapshot.docs) {
      const docRef = doc(db, 'favorites', documentSnapshot.id);
      
      try {
        await deleteDoc(docRef);
        console.log(`Deleted favorite: ${documentSnapshot.id}`);
      } catch (error) {
        console.error(`Failed to delete document ${documentSnapshot.id}:`, error);
      }
    }

    console.log('Favorite removed successfully.');


    setFavorites((prevFavorites) =>
      prevFavorites.filter((fav) => fav.airportCode !== airportCode)
    );

  } catch (error) {
    console.error('Error removing favorite:', error);
    throw error;
  }
};