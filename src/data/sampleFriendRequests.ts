import { FriendRequest } from '../types';

export const INITIAL_FRIEND_REQUESTS: FriendRequest[] = [
  {
    id: 'freq-1',
    fromUser: {
      id: 'buddy-2',
      name: 'Lucas Bernard',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
      country: 'France (Paris)',
      currentCity: 'Jaipur',
      travelStyle: 'Culinary & History Explorer',
      bio: 'Food blogger exploring authentic Indian street food & royal thalis. Looking to split a cab for the Amer Fort & Nahargarh sunset tour!',
      interests: ['Street Food', 'Bazaars', 'Night Walks', 'History']
    },
    sentAt: '2 hours ago',
    status: 'pending',
    note: 'Bonjour! Saw your profile on Explora. Would love to connect and split an afternoon cab to Nahargarh sunset point tomorrow!'
  },
  {
    id: 'freq-2',
    fromUser: {
      id: 'buddy-3',
      name: 'Aiko Tanaka',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&q=80',
      country: 'Japan (Kyoto)',
      currentCity: 'Jaipur',
      travelStyle: 'Art & Handicrafts Explorer',
      bio: 'Textile designer learning traditional block printing and blue pottery in Jaipur. Love quiet cafes and historical palaces.',
      interests: ['Handicrafts', 'Textiles', 'Pottery', 'Museums']
    },
    sentAt: 'Yesterday',
    status: 'pending',
    note: 'Hi Vrindu! I am attending a block printing workshop near Amber road. Would love to join you for rooftop chai or coffee!'
  },
  {
    id: 'freq-3',
    fromUser: {
      id: 'buddy-4',
      name: 'Elena Rostova',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      country: 'Germany (Berlin)',
      currentCity: 'Jaipur',
      travelStyle: 'Solo Heritage Trekker',
      bio: 'Loves sunrise photography, historic stepwells (Baori) and heritage bike tours.',
      interests: ['Stepwells', 'Cycling', 'Sunrise Points', 'Architecture']
    },
    sentAt: '3 days ago',
    status: 'pending',
    note: 'Hey! Doing an early morning cycle tour through the Old Pink City gates. Let me know if you would like to team up!'
  }
];
