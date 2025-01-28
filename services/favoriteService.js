import { collection, addDoc, getDocs, query, where } from 'firebase/firestore';
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
