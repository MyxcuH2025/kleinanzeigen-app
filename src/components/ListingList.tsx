import React, { useEffect, useState } from 'react';
import { fetchListings } from '../services/adService';

type Listing = {
  id: number;
  title: string;
  description: string;
  price: number;
  // weitere Felder nach Bedarf
};

const ListingList: React.FC = () => {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchListings()
      .then(data => setListings(data))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div>Lade Anzeigen...</div>;
  if (error) return <div>Fehler: {error}</div>;

  return (
    <ul>
      {listings.map(listing => (
        <li key={listing.id}>
          <strong>{listing.title}</strong> – {listing.price} €
          <br />
          {listing.description}
        </li>
      ))}
    </ul>
  );
};

export default ListingList; 