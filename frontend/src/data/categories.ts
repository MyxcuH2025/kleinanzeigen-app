// Umfassendes Kategorie-System basierend auf Avito und kleinanzeigen.de
export interface Category {
  value: string;
  label: string;
  icon: string;
  subcategories?: Subcategory[];
}

export interface Subcategory {
  value: string;
  label: string;
  icon?: string;
  items?: string[];
  types?: CategoryType[];
}

export interface CategoryType {
  value: string;
  label: string;
  icon?: string;
}

export const categories: Category[] = [
  {
    value: 'auto-rad-boot',
    label: 'Auto, Rad & Boot',
    icon: '🚗',
    subcategories: [
      {
        value: 'autos',
        label: 'Autos',
        items: ['BMW', 'Mercedes', 'Audi', 'Volkswagen', 'Opel', 'Ford', 'Toyota', 'Honda', 'Nissan', 'Skoda', 'Seat', 'Fiat', 'Renault', 'Peugeot', 'Citroen', 'Porsche', 'Andere']
      },
      {
        value: 'motorraeder',
        label: 'Motorräder',
        items: ['Honda', 'Yamaha', 'Kawasaki', 'Suzuki', 'BMW', 'Ducati', 'KTM', 'Harley-Davidson', 'Andere']
      },
      {
        value: 'fahrraeder',
        label: 'Fahrräder',
        items: ['Mountainbike', 'Rennrad', 'Citybike', 'E-Bike', 'BMX', 'Kinderrad', 'Andere']
      },
      {
        value: 'autoteile',
        label: 'Autoteile & Zubehör',
        items: ['Reifen', 'Felgen', 'Motor', 'Getriebe', 'Bremsen', 'Auspuff', 'Licht', 'Andere']
      },
      {
        value: 'boote',
        label: 'Boote & Wassersport',
        items: ['Segelboot', 'Motorboot', 'Kajak', 'SUP', 'Tauchausrüstung', 'Andere']
      },
      {
        value: 'lkw',
        label: 'LKW & Nutzfahrzeuge',
        items: ['LKW', 'Transporter', 'Anhänger', 'Landmaschinen', 'Andere']
      }
    ]
  },
  {
    value: 'real-estate',
    label: 'Immobilien',
    icon: '🏠',
    subcategories: [
      {
        value: 'wohnungen',
        label: 'Wohnungen',
        items: ['1-Zimmer', '2-Zimmer', '3-Zimmer', '4-Zimmer', '5+ Zimmer', 'Penthouse', 'Dachgeschoss']
      },
      {
        value: 'haeuser',
        label: 'Häuser',
        items: ['Einfamilienhaus', 'Reihenhaus', 'Doppelhaushälfte', 'Villa', 'Bauernhaus', 'Ferienhaus']
      },
      {
        value: 'gewerbeimmobilien',
        label: 'Gewerbeimmobilien',
        items: ['Büro', 'Laden', 'Lager', 'Produktion', 'Restaurant', 'Hotel', 'Andere']
      },
      {
        value: 'grundstuecke',
        label: 'Grundstücke',
        items: ['Bauland', 'Ackerland', 'Wald', 'Garten', 'Andere']
      }
    ]
  },
  {
    value: 'jobs',
    label: 'Jobs',
    icon: '💼',
    subcategories: [
      {
        value: 'ich-suche-arbeit',
        label: 'Ich suche Arbeit',
        items: ['IT & Internet', 'Büro & Verwaltung', 'Verkauf', 'Gastronomie', 'Handwerk', 'Gesundheit', 'Bildung', 'Andere']
      },
      {
        value: 'ich-suche-mitarbeiter',
        label: 'Ich suche Mitarbeiter',
        items: ['Vollzeit', 'Teilzeit', 'Minijob', 'Praktikum', 'Ausbildung', 'Freelance', 'Andere']
      }
    ]
  },
  {
    value: 'services',
    label: 'Dienstleistungen',
    icon: '🔧',
    subcategories: [
      {
        value: 'altenpflege',
        label: 'Altenpflege',
        items: ['Betreuung', 'Pflege', 'Begleitung', 'Haushaltshilfe', 'Andere']
      },
      {
        value: 'auto-rad-boot-services',
        label: 'Auto, Rad & Boot',
        items: ['Autoreparatur', 'Fahrradreparatur', 'Bootsservice', 'TÜV', 'Andere']
      },
      {
        value: 'babysitter-kinderbetreuung',
        label: 'Babysitter/-in & Kinderbetreuung',
        items: ['Babysitting', 'Kinderbetreuung', 'Nachmittagsbetreuung', 'Ferienbetreuung', 'Andere']
      },
      {
        value: 'elektronik-services',
        label: 'Elektronik',
        items: ['Handy-Reparatur', 'Computer-Reparatur', 'TV-Reparatur', 'Installation', 'Andere']
      },
      {
        value: 'haus-garten-services',
        label: 'Haus & Garten',
        items: ['Bau & Handwerk', 'Garten- & Landschaftsbau', 'Haushaltshilfe', 'Reinigungsservice', 'Reparaturen', 'Wohnungsauflösungen', 'Weitere Dienstleistungen Haus']
      },
      {
        value: 'kuenstler-musiker',
        label: 'Künstler/-in & Musiker/-in',
        items: ['Musiker', 'Künstler', 'DJ', 'Entertainment', 'Andere']
      },
      {
        value: 'reise-event',
        label: 'Reise & Event',
        items: ['Reiseplanung', 'Event-Organisation', 'Fotograf', 'Videograf', 'Andere']
      },
      {
        value: 'tierbetreuung-training',
        label: 'Tierbetreuung & Training',
        items: ['Hundesitting', 'Katzensitting', 'Tiertraining', 'Tierarzt', 'Andere']
      },
      {
        value: 'umzug-transport',
        label: 'Umzug & Transport',
        items: ['Umzug', 'Transport', 'Lieferung', 'Spedition', 'Andere']
      },
      {
        value: 'weitere-dienstleistungen',
        label: 'Weitere Dienstleistungen',
        items: ['Beratung', 'Büroarbeiten', 'Übersetzung', 'Andere']
      }
    ]
  },
  {
    value: 'personal-items',
    label: 'Persönliche Gegenstände',
    icon: '👕',
    subcategories: [
      {
        value: 'clothing',
        label: 'Kleidung & Schuhe',
        items: ['Damenkleidung', 'Herrenkleidung', 'Kindermode', 'Damen-Schuhe', 'Herren-Schuhe', 'Accessoires', 'Andere']
      },
      {
        value: 'jewelry',
        label: 'Schmuck & Uhren',
        items: ['Ringe', 'Ketten', 'Armbänder', 'Ohrringe', 'Uhren', 'Andere']
      },
      {
        value: 'beauty',
        label: 'Beauty & Kosmetik',
        items: ['Parfüm', 'Kosmetik', 'Haarpflege', 'Hautpflege', 'Make-up', 'Andere']
      }
    ]
  },
  {
    value: 'home-garden',
    label: 'Haus & Garten',
    icon: '🏡',
    subcategories: [
      {
        value: 'moebel',
        label: 'Möbel',
        items: ['Wohnzimmer', 'Schlafzimmer', 'Küche', 'Badezimmer', 'Büro', 'Gartenmöbel', 'Andere']
      },
      {
        value: 'haushaltsgeraete',
        label: 'Haushaltsgeräte',
        items: ['Küchengeräte', 'Waschmaschine', 'Trockner', 'Kühlschrank', 'Geschirrspüler', 'Andere']
      },
      {
        value: 'garten-pflanzen',
        label: 'Garten & Pflanzen',
        items: ['Gartenwerkzeug', 'Pflanzen', 'Samen', 'Dünger', 'Gartenmöbel', 'Andere']
      },
      {
        value: 'kueche-haushalt',
        label: 'Küche & Haushalt',
        items: ['Geschirr', 'Besteck', 'Töpfe', 'Pfannen', 'Küchengeräte', 'Andere']
      }
    ]
  },
  {
    value: 'elektronik',
    label: 'Elektronik',
    icon: '📱',
    subcategories: [
      {
        value: 'handy-telefon',
        label: 'Handy & Telefon',
        items: ['iPhone', 'Samsung', 'Huawei', 'Xiaomi', 'OnePlus', 'Google Pixel', 'Andere']
      },
      {
        value: 'notebooks',
        label: 'Notebooks',
        items: ['MacBook', 'Windows Laptop', 'Gaming Laptop', 'Business Laptop', 'Chromebook', 'Andere']
      },
      {
        value: 'pcs',
        label: 'PCs',
        items: ['Desktop PC', 'Gaming PC', 'Workstation', 'Mini PC', 'All-in-One', 'Andere']
      },
      {
        value: 'tablets',
        label: 'Tablets & Reader',
        items: ['iPad', 'Android Tablet', 'Windows Tablet', 'E-Reader', 'Andere']
      },
      {
        value: 'audio-hifi',
        label: 'Audio & Hifi',
        items: ['Lautsprecher', 'Kopfhörer', 'Verstärker', 'Receiver', 'Hifi-Anlage', 'Andere']
      },
      {
        value: 'tv-video',
        label: 'TV & Video',
        items: ['Fernseher', 'Projektor', 'Beamer', 'TV-Zubehör', 'Andere']
      },
      {
        value: 'foto',
        label: 'Foto',
        items: ['Kamera', 'Objektiv', 'Zubehör', 'Kamera & Zubehör', 'Weiteres Foto']
      },
      {
        value: 'konsolen',
        label: 'Konsolen',
        items: ['PlayStation', 'Xbox', 'Nintendo', 'Retro-Konsolen', 'Andere']
      },
      {
        value: 'videospiele',
        label: 'Videospiele',
        items: ['PS4/PS5 Spiele', 'Xbox Spiele', 'Nintendo Spiele', 'PC-Spiele', 'Retro-Spiele', 'Andere']
      },
      {
        value: 'elektronik-haushaltsgeraete',
        label: 'Haushaltsgeräte',
        items: ['Waschmaschine', 'Trockner', 'Kühlschrank', 'Geschirrspüler', 'Herd', 'Andere']
      },
      {
        value: 'pc-zubehoer',
        label: 'PC-Zubehör & Software',
        items: ['Maus', 'Tastatur', 'Monitor', 'Software', 'Netzwerk', 'Andere']
      },
      {
        value: 'dienstleistungen-elektronik',
        label: 'Dienstleistungen Elektronik',
        items: ['Reparatur', 'Installation', 'Beratung', 'Andere']
      },
      {
        value: 'weitere-elektronik',
        label: 'Weitere Elektronik',
        items: ['Messgeräte', 'Laborgeräte', 'Medizintechnik', 'Andere']
      }
    ]
  },
  {
    value: 'freizeit-hobby',
    label: 'Freizeit, Hobby & Nachbarschaft',
    icon: '⚽',
    subcategories: [
      {
        value: 'sport-fitness',
        label: 'Sport & Fitness',
        items: ['Fitness', 'Fußball', 'Tennis', 'Basketball', 'Schwimmen', 'Laufen', 'Andere']
      },
      {
        value: 'musik-instrumente',
        label: 'Musik & Instrumente',
        items: ['Gitarre', 'Klavier', 'Schlagzeug', 'Violine', 'Blasinstrumente', 'Andere']
      },
      {
        value: 'sammeln',
        label: 'Sammeln',
        items: ['Briefmarken', 'Münzen', 'Comics', 'Spielzeug', 'Andere']
      },
      {
        value: 'outdoor',
        label: 'Outdoor & Camping',
        items: ['Camping', 'Wandern', 'Klettern', 'Angeln', 'Jagen', 'Andere']
      },
      {
        value: 'nachbarschaft',
        label: 'Nachbarschaft',
        items: ['Gartenarbeit', 'Haushalt', 'Betreuung', 'Transport', 'Andere']
      }
    ]
  },
  {
    value: 'familie-kind-baby',
    label: 'Familie, Kind & Baby',
    icon: '👶',
    subcategories: [
      {
        value: 'baby',
        label: 'Baby',
        items: ['Kinderwagen', 'Babykleidung', 'Spielzeug', 'Möbel', 'Andere']
      },
      {
        value: 'kind',
        label: 'Kind',
        items: ['Kinderkleidung', 'Spielzeug', 'Fahrräder', 'Schuhe', 'Andere']
      },
      {
        value: 'schwangerschaft',
        label: 'Schwangerschaft',
        items: ['Umstandsmode', 'Stillkleidung', 'Zubehör', 'Andere']
      }
    ]
  },
  {
    value: 'mode-beauty',
    label: 'Mode & Beauty',
    icon: '👕',
    subcategories: [
      {
        value: 'damenmode',
        label: 'Damenmode',
        items: ['Kleider', 'Hosen', 'Röcke', 'Blusen', 'Jacken', 'Andere']
      },
      {
        value: 'herrenmode',
        label: 'Herrenmode',
        items: ['Hosen', 'Hemden', 'Jacken', 'Anzüge', 'T-Shirts', 'Andere']
      },
      {
        value: 'schuhe',
        label: 'Schuhe',
        items: ['Damen-Schuhe', 'Herren-Schuhe', 'Sportschuhe', 'Stiefel', 'Andere']
      },
      {
        value: 'accessoires',
        label: 'Accessoires',
        items: ['Taschen', 'Gürtel', 'Schmuck', 'Uhren', 'Andere']
      },
      {
        value: 'beauty',
        label: 'Beauty & Kosmetik',
        items: ['Parfüm', 'Kosmetik', 'Haarpflege', 'Hautpflege', 'Andere']
      }
    ]
  },
  {
    value: 'haustiere',
    label: 'Haustiere',
    icon: '🐕',
    subcategories: [
      {
        value: 'hunde',
        label: 'Hunde',
        items: ['Welpen', 'Erwachsene Hunde', 'Hundezubehör', 'Hundefutter', 'Andere']
      },
      {
        value: 'katzen',
        label: 'Katzen',
        items: ['Kätzchen', 'Erwachsene Katzen', 'Katzenzubehör', 'Katzenfutter', 'Andere']
      },
      {
        value: 'andere-tiere',
        label: 'Andere Haustiere',
        items: ['Vögel', 'Fische', 'Hamster', 'Kaninchen', 'Reptilien', 'Andere']
      },
      {
        value: 'tierzubehoer',
        label: 'Tierzubehör',
        items: ['Futter', 'Spielzeug', 'Transportboxen', 'Bettchen', 'Andere']
      }
    ]
  },
  {
    value: 'eintrittskarten-tickets',
    label: 'Eintrittskarten & Tickets',
    icon: '🎫',
    subcategories: [
      {
        value: 'konzerte',
        label: 'Konzerte',
        items: ['Rock', 'Pop', 'Klassik', 'Jazz', 'Andere']
      },
      {
        value: 'sport',
        label: 'Sport',
        items: ['Fußball', 'Tennis', 'Basketball', 'Eishockey', 'Andere']
      },
      {
        value: 'theater',
        label: 'Theater & Shows',
        items: ['Musical', 'Theater', 'Comedy', 'Zirkus', 'Andere']
      },
      {
        value: 'veranstaltungen',
        label: 'Veranstaltungen',
        items: ['Messen', 'Feste', 'Partys', 'Andere']
      }
    ]
  },
  {
    value: 'musik-filme-buecher',
    label: 'Musik, Filme & Bücher',
    icon: '📚',
    subcategories: [
      {
        value: 'buecher',
        label: 'Bücher',
        items: ['Romane', 'Fachbücher', 'Kinderbücher', 'Kochbücher', 'Andere']
      },
      {
        value: 'musik',
        label: 'Musik',
        items: ['CDs', 'Vinyl', 'Musik-DVDs', 'Andere']
      },
      {
        value: 'filme-serien',
        label: 'Filme & Serien',
        items: ['DVDs', 'Blu-ray', 'Streaming', 'Andere']
      },
      {
        value: 'zeitschriften',
        label: 'Zeitschriften',
        items: ['Fachzeitschriften', 'Lifestyle', 'Nachrichten', 'Andere']
      }
    ]
  },
  {
    value: 'verschenken-tauschen',
    label: 'Verschenken & Tauschen',
    icon: '🎁',
    subcategories: [
      {
        value: 'verschenken',
        label: 'Verschenken',
        items: ['Kleidung', 'Möbel', 'Elektronik', 'Bücher', 'Andere']
      },
      {
        value: 'tauschen',
        label: 'Tauschen',
        items: ['Kleidung', 'Möbel', 'Elektronik', 'Bücher', 'Andere']
      }
    ]
  },
  {
    value: 'unterricht-kurse',
    label: 'Unterricht & Kurse',
    icon: '🎓',
    subcategories: [
      {
        value: 'sprachen',
        label: 'Sprachen',
        items: ['Englisch', 'Französisch', 'Spanisch', 'Italienisch', 'Andere']
      },
      {
        value: 'musik',
        label: 'Musik',
        items: ['Gitarre', 'Klavier', 'Gesang', 'Schlagzeug', 'Andere']
      },
      {
        value: 'sport',
        label: 'Sport',
        items: ['Fitness', 'Yoga', 'Tanz', 'Kampfsport', 'Andere']
      },
      {
        value: 'computer',
        label: 'Computer & IT',
        items: ['Programmierung', 'Webdesign', 'Office', 'Andere']
      }
    ]
  },

];

// Mapping für AI-Kategorienamen
export const aiCategoryMapping: { [key: string]: string } = {
  // Hauptkategorien
  'Auto, Rad & Boot': 'auto-rad-boot',
  'Immobilien': 'real-estate',
  'Elektronik': 'elektronik',
  'Haus & Garten': 'home-garden',
  'Mode & Beauty': 'mode-beauty',
  'Sport & Freizeit': 'sport-freizeit',
  'Tiere': 'tiere',
  'Dienstleistungen': 'services',
  'Sonstiges': 'sonstiges',
  
  // Alternative Schreibweisen
  'Fahrzeuge': 'auto-rad-boot',
  'Autos': 'auto-rad-boot',
  'Motorräder': 'auto-rad-boot',
  'Fahrräder': 'auto-rad-boot',
  'Wohnungen': 'real-estate',
  'Häuser': 'real-estate',
  'Handys': 'elektronik',
  'Smartphones': 'elektronik',
  'Computer': 'elektronik',
  'Möbel': 'home-garden',
  'Garten': 'home-garden',
  'Kleidung': 'mode-beauty',
  'Schuhe': 'mode-beauty',
  'Hunde': 'tiere',
  'Katzen': 'tiere',
  'Haustiere': 'tiere',
  
  // Fallback
  'Persönliche Gegenstände': 'mode-beauty',
  'Geschäft & Ausrüstung': 'services'
};

// Kategorie-Beschreibungen
export const categoryDescriptions: { [key: string]: string } = {
  'auto-rad-boot': 'Autos, Motorräder, Fahrräder, Boote & Zubehör',
  'real-estate': 'Wohnungen, Häuser, Gewerbe, Grundstücke',
  'jobs': 'Stellenangebote, Praktika, Ausbildung, Freelance',
  'services': 'Reparaturen, Beratung, Transport, Service',
  'home-garden': 'Möbel, Haushaltsgeräte, Garten, Werkzeug',
  'elektronik': 'Smartphones, Laptops, Kameras, Gaming & mehr',
  'freizeit-hobby': 'Fitness, Outdoor, Hobby, Freizeit, Nachbarschaft',
  'familie-kind-baby': 'Baby, Kind, Schwangerschaft, Spielzeug',
  'mode-beauty': 'Kleidung, Schuhe, Accessoires, Kosmetik',
  'haustiere': 'Hunde, Katzen, Vögel, Fische, Zubehör',
  'eintrittskarten-tickets': 'Konzerte, Sport, Theater, Veranstaltungen',
  'musik-filme-buecher': 'Bücher, Musik, Filme, Zeitschriften',
  'verschenken-tauschen': 'Kostenlose Angebote, Tauschgeschäfte',
  'unterricht-kurse': 'Sprachen, Musik, Sport, Computer-Kurse'
};
