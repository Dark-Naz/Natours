import axios from 'axios';
import { showAlert } from './alerts';
const stripe = Stripe(
  'pk_test_51RlAmTCLXP8iZl6EnyIvKTh0oUmNsaRk4GQJwNiBxIdckqz6vCNS27oFitHmjY5sbwGQZ3YnQMqk46f4enDCxm0Z00IlMmxAhQ',
);

export const bookTour = async (tourId) => {
  try {
    // 1) Get checkout session from API
    const session = await axios(
      `http://http://127.0.0.1:3000/api/v1/bookings/checkout-session/${tourId}`,
    );
    console.log(session);

    // 2) Create checkout session form, charge credit card
    await stripe.redirectToCheckout({
      sessionId: session.data.sessionId,
    });
  } catch (err) {
    console.log(err);
    showAlert('error', err);
  }
};
