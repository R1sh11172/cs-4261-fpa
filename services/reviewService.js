import { collection, addDoc, getDocs, query, where, Timestamp } from 'firebase/firestore';
import { db } from '../firebaseConfig';

// Add a review
export async function addReview(airportCode, rating, comment, userId) {
  try {
    const review = {
      airportCode,
      rating,
      comment,
      userId,
      timestamp: Timestamp.now(),
    };
    await addDoc(collection(db, 'reviews'), review);
    console.log('Review added successfully');
  } catch (error) {
    console.error('Error adding review: ', error);
  }
}

// Fetch all reviews for an airport and calculate average rating
export async function fetchReviews(airportCode) {
  try {
    const q = query(collection(db, 'reviews'), where('airportCode', '==', airportCode));
    const querySnapshot = await getDocs(q);

    let totalRating = 0;
    let reviewCount = 0;
    const reviews = [];

    querySnapshot.forEach((doc) => {
      reviews.push(doc.data());
      totalRating += doc.data().rating;
      reviewCount += 1;
    });

    const averageRating = reviewCount > 0 ? (totalRating / reviewCount).toFixed(1) : 'No ratings yet';
    return { reviews, averageRating };
  } catch (error) {
    console.error('Error fetching reviews: ', error);
    return { reviews: [], averageRating: 'Error' };
  }
}