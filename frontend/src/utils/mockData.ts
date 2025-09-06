// Globale Mock-Daten für bessere Performance
// Diese werden nur einmal geladen und dann wiederverwendet

export interface Shop {
  id: string;
  name: string;
  description: string;
  category: string;
  location: string;
  rating: number;
  reviewCount: number;
  listingCount: number;
  image: string;
  phone: string;
  email: string;
  website: string;
  verified: boolean;
  featured: boolean;
}

export interface Dienstleister {
  id: string;
  name: string;
  company: string;
  serviceType: string;
  description: string;
  location: string;
  rating: number;
  reviewCount: number;
  experience: string;
  verified: boolean;
  image: string;
  phone: string;
  email: string;
}

export interface User {
  id: string;
  name: string;
  username: string;
  bio: string;
  location: string;
  rating: number;
  reviewCount: number;
  memberSince: string;
  lastActive: string;
  verified: boolean;
  premium: boolean;
  interests: string[];
  listingsCount: number;
  followers: number;
  following: number;
  avatar: string;
  phone: string;
  email: string;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  category: string;
  location: string;
  date: string;
  time: string;
  price: string | number;
  organizer: string;
  verified: boolean;
  image: string;
  rating: number;
  reviewCount: number;
  attendees: number;
  maxAttendees: number;
  tags: string[];
  phone?: string;
  email?: string;
  website?: string;
}

export interface NewsArticle {
  id: string;
  title: string;
  summary: string;
  content: string;
  category: string;
  location: string;
  author: string;
  publishDate: string;
  tags: string[];
  featured: boolean;
  trending: boolean;
  readTime: number;
  views: number;
  bookmarks: number;
  image?: string;
}

export interface JobPosition {
  id: string;
  title: string;
  department: string;
  location: string;
  type: string;
  experience: string;
  salary: string;
  description: string;
  requirements: string[];
  benefits: string[];
  urgent?: boolean;
  featured?: boolean;
}

// Mock-Daten werden nur einmal erstellt
export const mockShops: Shop[] = [
  {
    id: '1',
    name: 'AutoCenter München',
    description: 'Professioneller Autohandel mit über 20 Jahren Erfahrung. Wir bieten eine große Auswahl an qualitativ hochwertigen Fahrzeugen.',
    category: 'Autos',
    location: 'München',
    rating: 4.8,
    reviewCount: 127,
    listingCount: 45,
    image: 'https://via.placeholder.com/300x200',
    phone: '+49 89 12345678',
    email: 'info@autocenter-muenchen.de',
    website: 'www.autocenter-muenchen.de',
    verified: true,
    featured: true
  },
  {
    id: '2',
    name: 'Elektronik Pro',
    description: 'Ihr Experte für Elektronik und Technik. Große Auswahl an Smartphones, Laptops und Unterhaltungselektronik.',
    category: 'Elektronik',
    location: 'Berlin',
    rating: 4.9,
    reviewCount: 89,
    listingCount: 156,
    image: 'https://via.placeholder.com/300x200',
    phone: '+49 30 98765432',
    email: 'info@elektronik-pro.de',
    website: 'www.elektronik-pro.de',
    verified: true,
    featured: false
  },
  {
    id: '3',
    name: 'Möbelhaus Schmidt',
    description: 'Qualitätsmöbel für jeden Geschmack. Von modern bis klassisch, wir haben die perfekte Einrichtung für Ihr Zuhause.',
    category: 'Möbel',
    location: 'Hamburg',
    rating: 4.6,
    reviewCount: 234,
    listingCount: 89,
    image: 'https://via.placeholder.com/300x200',
    phone: '+49 40 55556666',
    email: 'info@moebelhaus-schmidt.de',
    website: 'www.moebelhaus-schmidt.de',
    verified: true,
    featured: false
  },
  {
    id: '4',
    name: 'Sport & Outdoor',
    description: 'Ihr Spezialist für Sportartikel und Outdoor-Ausrüstung. Beratung von Experten für alle Aktivitäten.',
    category: 'Sport',
    location: 'Köln',
    rating: 4.7,
    reviewCount: 156,
    listingCount: 67,
    image: 'https://via.placeholder.com/300x200',
    phone: '+49 221 77778888',
    email: 'info@sport-outdoor.de',
    website: 'www.sport-outdoor.de',
    verified: false,
    featured: false
  },
  {
    id: '5',
    name: 'Buchhandlung Leselust',
    description: 'Unabhängige Buchhandlung mit großer Auswahl an Büchern aller Genres. Persönliche Beratung und Lesungen.',
    category: 'Bücher',
    location: 'Stuttgart',
    rating: 4.8,
    reviewCount: 78,
    listingCount: 34,
    image: 'https://via.placeholder.com/300x200',
    phone: '+49 711 99990000',
    email: 'info@buchhandlung-leselust.de',
    website: 'www.buchhandlung-leselust.de',
    verified: true,
    featured: false
  }
];

export const mockDienstleister: Dienstleister[] = [
  {
    id: '1',
    name: 'Hans Weber',
    company: 'Weber Consulting',
    serviceType: 'Beratung',
    description: 'Professionelle Beratung für kleine und mittlere Unternehmen. Spezialisiert auf Strategie und Prozessoptimierung.',
    location: 'Berlin',
    rating: 4.9,
    reviewCount: 156,
    experience: '15+ Jahre',
    verified: true,
    image: 'https://via.placeholder.com/300x200',
    phone: '+49 30 12345678',
    email: 'hans.weber@weber-consulting.de'
  },
  {
    id: '2',
    name: 'Maria Schmidt',
    company: 'Schmidt Design',
    serviceType: 'Design',
    description: 'Kreative Designlösungen für Marken und Unternehmen. Von Logo-Design bis zur kompletten Markenidentität.',
    location: 'München',
    rating: 4.8,
    reviewCount: 89,
    experience: '8+ Jahre',
    verified: true,
    image: 'https://via.placeholder.com/300x200',
    phone: '+49 89 98765432',
    email: 'maria.schmidt@schmidt-design.de'
  },
  {
    id: '3',
    name: 'Thomas Müller',
    company: 'Müller IT Services',
    serviceType: 'IT',
    description: 'IT-Support und Systemadministration für Unternehmen. Schnelle Problemlösung und proaktive Wartung.',
    location: 'Hamburg',
    rating: 4.7,
    reviewCount: 234,
    experience: '12+ Jahre',
    verified: false,
    image: 'https://via.placeholder.com/300x200',
    phone: '+49 40 55556666',
    email: 'thomas.mueller@mueller-it.de'
  }
];

export const mockUsers: User[] = [
  {
    id: '1',
    name: 'Max Mustermann',
    username: 'max_mustermann',
    bio: 'Hobby-Fotograf und Reisebegeisterter. Ich teile gerne meine Erfahrungen und helfe anderen bei der Reiseplanung.',
    location: 'Berlin',
    rating: 4.7,
    reviewCount: 23,
    memberSince: '15.03.2020',
    lastActive: 'vor 2 Stunden',
    verified: true,
    premium: true,
    interests: ['Fotografie', 'Reisen', 'Kultur'],
    listingsCount: 8,
    followers: 156,
    following: 89,
    avatar: 'M',
    phone: '+49 30 12345678',
    email: 'max.mustermann@email.de'
  },
  {
    id: '2',
    name: 'Anna Schmidt',
    username: 'anna_schmidt',
    bio: 'Studentin der Informatik mit Leidenschaft für neue Technologien. Ich entwickle gerne Apps und helfe bei technischen Fragen.',
    location: 'München',
    rating: 4.9,
    reviewCount: 45,
    memberSince: '22.07.2019',
    lastActive: 'vor 1 Stunde',
    verified: true,
    premium: false,
    interests: ['Programmierung', 'KI', 'Mobile Apps'],
    listingsCount: 15,
    followers: 234,
    following: 167,
    avatar: 'A',
    phone: '+49 89 98765432',
    email: 'anna.schmidt@email.de'
  },
  {
    id: '3',
    name: 'Thomas Weber',
    username: 'thomas_weber',
    bio: 'Erfahrener Handwerker mit Spezialisierung auf Elektroinstallation. Ich helfe gerne bei allen elektrischen Arbeiten.',
    location: 'Hamburg',
    rating: 4.8,
    reviewCount: 67,
    memberSince: '08.11.2018',
    lastActive: 'vor 3 Stunden',
    verified: true,
    premium: true,
    interests: ['Elektroinstallation', 'Smart Home', 'Energiesparen'],
    listingsCount: 23,
    followers: 89,
    following: 45,
    avatar: 'T',
    phone: '+49 40 55556666',
    email: 'thomas.weber@email.de'
  },
  {
    id: '4',
    name: 'Lisa Müller',
    username: 'lisa_mueller',
    bio: 'Studentin der Architektur. Ich interessiere mich für Design, Kunst und alles, was mit Kreativität zu tun hat.',
    location: 'Köln',
    rating: 4.6,
    reviewCount: 34,
    memberSince: '05.11.2021',
    lastActive: 'vor 5 Tagen',
    verified: false,
    premium: false,
    interests: ['Architektur', 'Design', 'Kunst'],
    listingsCount: 12,
    followers: 67,
    following: 45,
    avatar: 'L',
    phone: '+49 221 77778888',
    email: 'lisa.mueller@email.de'
  },
  {
    id: '5',
    name: 'Michael Bauer',
    username: 'michael_bauer',
    bio: 'Sportbegeisterter und Fitness-Trainer. Ich helfe anderen dabei, ihre Fitness-Ziele zu erreichen und einen gesunden Lebensstil zu führen.',
    location: 'Stuttgart',
    rating: 4.8,
    reviewCount: 78,
    memberSince: '18.09.2019',
    lastActive: 'vor 1 Tag',
    verified: true,
    premium: true,
    interests: ['Sport', 'Fitness', 'Gesundheit'],
    listingsCount: 45,
    followers: 189,
    following: 134,
    avatar: 'M',
    phone: '+49 711 99990000',
    email: 'michael.bauer@email.de'
  }
];

export const mockEvents: Event[] = [
  {
    id: '1',
    title: 'Sommerfest im Stadtpark',
    description: 'Ein großes Fest mit Live-Musik, Essen und Aktivitäten für die ganze Familie.',
    category: 'music',
    location: 'Berlin',
    date: '2024-07-15',
    time: '14:00',
    price: 'Eintritt frei',
    organizer: 'Stadt Berlin',
    verified: true,
    image: 'https://via.placeholder.com/300x200',
    rating: 4.5,
    reviewCount: 128,
    attendees: 45,
    maxAttendees: 200,
    tags: ['Musik', 'Familie', 'Sommer', 'Fest'],
    phone: '+49 30 123456',
    email: 'info@sommerfest-berlin.de'
  },
  {
    id: '2',
    title: 'Tech Meetup: KI & Zukunft',
    description: 'Diskussion über künstliche Intelligenz und ihre Auswirkungen auf die Gesellschaft.',
    category: 'business',
    location: 'München',
    date: '2024-07-20',
    time: '19:00',
    price: 15,
    organizer: 'Tech Community München',
    verified: true,
    image: 'https://via.placeholder.com/300x200',
    rating: 4.8,
    reviewCount: 89,
    attendees: 78,
    maxAttendees: 100,
    tags: ['Technologie', 'KI', 'Networking', 'Zukunft'],
    email: 'info@tech-muenchen.de',
    website: 'tech-muenchen.de'
  },
  {
    id: '3',
    title: 'Yoga im Park',
    description: 'Entspannende Yoga-Session im Freien für alle Levels. Bitte eigene Matte mitbringen.',
    category: 'health',
    location: 'Hamburg',
    date: '2024-07-18',
    time: '09:00',
    price: 8,
    organizer: 'Yoga Studio Hamburg',
    verified: true,
    image: 'https://via.placeholder.com/300x200',
    rating: 4.6,
    reviewCount: 67,
    attendees: 23,
    maxAttendees: 50,
    tags: ['Yoga', 'Gesundheit', 'Entspannung', 'Outdoor'],
    phone: '+49 40 555566',
    email: 'info@yoga-hamburg.de'
  }
];

export const mockArticles: NewsArticle[] = [
  {
    id: '1',
    title: 'Neue Radwege in der Innenstadt eröffnet',
    summary: 'Die Stadt hat neue Radwege in der Innenstadt eröffnet, um den Radverkehr zu fördern und die Sicherheit zu verbessern.',
    content: 'Nach monatelanger Planung und Bauzeit wurden heute die neuen Radwege in der Innenstadt offiziell eröffnet. Die neuen Strecken verbinden wichtige Knotenpunkte der Stadt und bieten Radfahrern eine sichere Alternative zu den Hauptverkehrsstraßen. Die Wege sind mit modernen LED-Beleuchtungssystemen ausgestattet und verfügen über eigene Ampelschaltungen für Radfahrer.',
    category: 'Verkehr',
    location: 'Berlin',
    author: 'Verkehrsredaktion',
    publishDate: 'vor 2 Stunden',
    tags: ['Radwege', 'Verkehr', 'Innenstadt', 'Sicherheit'],
    featured: true,
    trending: true,
    readTime: 3,
    views: 1234,
    bookmarks: 89
  },
  {
    id: '2',
    title: 'Lokale Künstler stellen in der Galerie aus',
    summary: 'Eine Gruppe lokaler Künstler präsentiert ihre Werke in der städtischen Galerie. Die Ausstellung läuft noch bis Ende des Monats.',
    content: 'Die städtische Galerie präsentiert eine neue Ausstellung mit Werken lokaler Künstler. Die Ausstellung zeigt eine vielfältige Mischung aus Malerei, Skulptur und digitaler Kunst. Besonders beeindruckend sind die interaktiven Installationen, die Besucher zum Mitmachen einladen. Die Ausstellung läuft noch bis zum 31. Juli und ist kostenlos zugänglich.',
    category: 'Kunst',
    location: 'München',
    author: 'Kunstredaktion',
    publishDate: 'vor 1 Tag',
    tags: ['Kunst', 'Galerie', 'Lokale Künstler', 'Ausstellung'],
    featured: false,
    trending: false,
    readTime: 4,
    views: 567,
    bookmarks: 34
  },
  {
    id: '3',
    title: 'Wetter: Sonniges Wochenende erwartet',
    summary: 'Das Wochenende verspricht sonniges Wetter mit Temperaturen bis zu 25 Grad. Perfekt für Outdoor-Aktivitäten.',
    content: 'Nach einer regnerischen Woche bessert sich das Wetter zum Wochenende hin deutlich. Meteorologen prognostizieren sonnige Tage mit Temperaturen zwischen 20 und 25 Grad Celsius. Die UV-Strahlung ist moderat, aber Sonnenschutz wird empfohlen. Das Wetter ist ideal für Outdoor-Aktivitäten wie Radfahren, Wandern oder Picknicken im Park.',
    category: 'Wetter',
    location: 'Hamburg',
    author: 'Wetterredaktion',
    publishDate: 'vor 3 Tagen',
    tags: ['Wetter', 'Wochenende', 'Sonne', 'Outdoor'],
    featured: false,
    trending: true,
    readTime: 2,
    views: 890,
    bookmarks: 56
  },
  {
    id: '4',
    title: 'Neue Restaurants in der Altstadt',
    summary: 'Drei neue Restaurants haben in der historischen Altstadt eröffnet und bieten eine vielfältige kulinarische Auswahl.',
    content: 'Die Altstadt erhält einen kulinarischen Aufschwung: Drei neue Restaurants haben ihre Türen geöffnet. Das italienische Restaurant "La Dolce Vita" serviert authentische mediterrane Küche, das asiatische "Bamboo Garden" bietet eine Mischung aus thailändischen und japanischen Gerichten, und das "Biergarten am Markt" präsentiert traditionelle deutsche Küche in gemütlicher Atmosphäre.',
    category: 'Gastronomie',
    location: 'Köln',
    author: 'Gastronomieredaktion',
    publishDate: 'vor 4 Tagen',
    tags: ['Restaurants', 'Altstadt', 'Kulinarik', 'Neueröffnung'],
    featured: true,
    trending: false,
    readTime: 3,
    views: 445,
    bookmarks: 23
  },
  {
    id: '5',
    title: 'Lokale Unternehmen unterstützen Jugendprojekte',
    summary: 'Verschiedene lokale Unternehmen haben sich zusammengeschlossen, um Jugendprojekte in der Stadt zu fördern.',
    content: 'Ein Zusammenschluss lokaler Unternehmen hat eine Initiative zur Förderung von Jugendprojekten gestartet. Mit einer Gesamtsumme von 100.000 Euro werden verschiedene Projekte unterstützt, darunter ein Jugendzentrum, ein Musikprojekt und ein Sportprogramm. Die Unternehmen sehen dies als Investition in die Zukunft der Stadt.',
    category: 'Wirtschaft',
    location: 'Stuttgart',
    author: 'Wirtschaftsredaktion',
    publishDate: 'vor 3 Tagen',
    tags: ['Jugend', 'Unternehmen', 'Förderung'],
    featured: true,
    trending: false,
    readTime: 4,
    views: 445,
    bookmarks: 67
  }
];

export const mockJobs: JobPosition[] = [
  {
    id: '1',
    title: 'Senior Frontend Developer',
    department: 'Entwicklung',
    location: 'München',
    type: 'full-time',
    experience: '5+ Jahre',
    salary: '65.000€ - 85.000€',
    description: 'Wir suchen einen erfahrenen Frontend-Entwickler, der unser Team bei der Entwicklung moderner Web-Anwendungen unterstützt.',
    requirements: [
      'Starke Erfahrung mit React, TypeScript und modernen Frontend-Technologien',
      'Kenntnisse in CSS-in-JS und responsive Design',
      'Erfahrung mit State Management (Redux, Zustand)',
      'Gute Kenntnisse in Git und CI/CD'
    ],
    benefits: [
      'Flexible Arbeitszeiten',
      'Homeoffice-Möglichkeit',
      'Weiterbildungsbudget',
      'Moderne Arbeitsumgebung'
    ],
    urgent: true,
    featured: true
  },
  {
    id: '2',
    title: 'UX/UI Designer',
    department: 'Design',
    location: 'Berlin',
    type: 'full-time',
    experience: '3+ Jahre',
    salary: '45.000€ - 60.000€',
    description: 'Gestalten Sie die Benutzeroberfläche unserer Plattform und verbessern Sie die Benutzererfahrung.',
    requirements: [
      'Erfahrung mit Design-Tools (Figma, Sketch, Adobe Creative Suite)',
      'Kenntnisse in User Research und Usability Testing',
      'Verständnis für Design-Systeme und Komponenten',
      'Portfolio mit relevanten Projekten'
    ],
    benefits: [
      'Kreative Freiheit',
      'Moderne Design-Tools',
      'Teilnahme an Design-Konferenzen',
      'Flexible Arbeitszeiten'
    ],
    featured: true
  },
  {
    id: '3',
    title: 'Product Manager',
    department: 'Produkt',
    location: 'Hamburg',
    type: 'full-time',
    experience: '4+ Jahre',
    salary: '55.000€ - 75.000€',
    description: 'Führen Sie die Produktentwicklung und arbeiten Sie eng mit Entwicklungsteams und Stakeholdern zusammen.',
    requirements: [
      'Erfahrung im Produktmanagement',
      'Starke analytische Fähigkeiten',
      'Kenntnisse in Agile/Scrum',
      'Gute Kommunikationsfähigkeiten'
    ],
    benefits: [
      'Verantwortungsvolle Position',
      'Karriereentwicklung',
      'Moderne Arbeitsmethoden',
      'Attraktive Vergütung'
    ]
  },
  {
    id: '4',
    title: 'Marketing Manager',
    department: 'Marketing',
    location: 'Köln',
    type: 'full-time',
    experience: '3+ Jahre',
    salary: '40.000€ - 75.000€',
    description: 'Entwickeln und implementieren Sie Marketing-Strategien für unsere Plattform.',
    requirements: [
      'Erfahrung im digitalen Marketing',
      'Kenntnisse in SEO, SEA und Social Media',
      'Analytics-Tools (Google Analytics, Facebook Insights)',
      'Kreative und strategische Denkweise'
    ],
    benefits: [
      'Vielfältige Marketing-Aufgaben',
      'Moderne Marketing-Tools',
      'Kreative Freiheit',
      'Teamarbeit'
    ]
  },
  {
    id: '5',
    title: 'DevOps Engineer',
    department: 'IT',
    location: 'Stuttgart',
    type: 'full-time',
    experience: '3+ Jahre',
    salary: '50.000€ - 70.000€',
    description: 'Optimieren Sie unsere Infrastruktur und automatisieren Sie Deployment-Prozesse.',
    requirements: [
      'Erfahrung mit Cloud-Plattformen (AWS, Azure, GCP)',
      'Kenntnisse in Docker, Kubernetes',
      'CI/CD-Pipelines (Jenkins, GitLab CI)',
      'Monitoring und Logging'
    ],
    benefits: [
      'Moderne Technologien',
      'Homeoffice-Möglichkeit',
      'Weiterbildung',
      'Stabile Arbeitsumgebung'
    ]
  }
];

// Cache für geladene Daten
const dataCache = new Map<string, unknown>();

export const getMockData = <T>(key: string, data: T[]): T[] => {
  if (!dataCache.has(key)) {
    dataCache.set(key, data);
  }
  return dataCache.get(key) as T[];
};

// Funktion zum Zurücksetzen des Caches (für Tests)
export const clearMockDataCache = () => {
  dataCache.clear();
};
