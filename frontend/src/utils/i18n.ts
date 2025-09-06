/**
 * i18n-System für mehrsprachige Unterstützung
 * Unterstützt Deutsch, Englisch und Russisch
 */

export type Language = 'de' | 'en' | 'ru';

export interface TranslationKey {
  [key: string]: string | TranslationKey;
}

// Übersetzungsdateien
const translations: Record<Language, TranslationKey> = {
  de: {
    // Allgemeine UI-Elemente
    common: {
      save: 'Speichern',
      cancel: 'Abbrechen',
      reset: 'Zurücksetzen',
      loading: 'Lade...',
      error: 'Fehler',
      success: 'Erfolgreich',
      required: 'Erforderlich',
      optional: 'Optional',
      choose: 'Bitte wählen...',
      back: 'Zurück',
      next: 'Weiter',
      previous: 'Zurück',
      submit: 'Absenden',
      edit: 'Bearbeiten',
      delete: 'Löschen',
      search: 'Suchen',
      filter: 'Filter',
      sort: 'Sortieren',
      close: 'Schließen',
      confirm: 'Bestätigen',
      yes: 'Ja',
      no: 'Nein'
    },

    // Formular-Validierung
    validation: {
      required: 'Feld ist erforderlich',
      minLength: 'Mindestens {min} Zeichen erforderlich',
      maxLength: 'Maximal {max} Zeichen erlaubt',
      minValue: 'Mindestwert: {min}',
      maxValue: 'Maximalwert: {max}',
      invalidEmail: 'Ungültige E-Mail-Adresse',
      invalidUrl: 'Ungültige URL',
      invalidPhone: 'Ungültige Telefonnummer',
      invalidOption: 'Ungültiger Wert ausgewählt',
      invalidType: 'Ungültiger Datentyp'
    },

    // Dynamische Formulare
    forms: {
      sections: {
        about_item: 'Über den Artikel',
        specs: 'Spezifikationen',
        about_house: 'Über das Haus',
        additional: 'Zusätzliche Informationen',
        shipping: 'Versand & Abholung',
        warranty: 'Garantie & Service'
      },
      fieldTypes: {
        text: 'Text',
        number: 'Zahl',
        select: 'Auswahl',
        multiselect: 'Mehrfachauswahl',
        boolean: 'Ja/Nein',
        date: 'Datum',
        textarea: 'Textbereich',
        url: 'URL',
        email: 'E-Mail',
        phone: 'Telefon'
      },
      placeholders: {
        title: 'Titel eingeben',
        description: 'Beschreibung eingeben',
        price: 'Preis eingeben',
        condition: 'Zustand wählen',
        extras: 'Extras wählen',
        warranty: 'Garantie verfügbar',
        email: 'E-Mail eingeben',
        phone: 'Telefonnummer eingeben',
        url: 'URL eingeben'
      },
      helpText: {
        title: 'Geben Sie einen aussagekräftigen Titel ein',
        description: 'Detaillierte Beschreibung des Artikels',
        price: 'Preis in Euro',
        condition: 'Wählen Sie den Zustand des Artikels',
        extras: 'Wählen Sie verfügbare Extras',
        warranty: 'Verfügt über Garantie',
        email: 'Ihre E-Mail-Adresse',
        phone: 'Ihre Telefonnummer',
        url: 'Link zur Webseite',
        // Auto-spezifische Felder
        marke: 'Marke des Fahrzeugs (z.B. BMW, Audi, Mercedes)',
        modell: 'Modell des Fahrzeugs (z.B. 3er, A4, C-Klasse)',
        baujahr: 'Baujahr des Fahrzeugs',
        kilometerstand: 'Aktueller Kilometerstand in Kilometern',
        getriebe: 'Art des Getriebes (Manuell, Automatik)',
        kraftstoff: 'Art des Kraftstoffs (Benzin, Diesel, Elektro, Hybrid)',
        zustand: 'Allgemeiner Zustand des Fahrzeugs',
        farbe: 'Farbe des Fahrzeugs',
        tüv: 'TÜV-Ablaufdatum',
        unfallfrei: 'Ob das Fahrzeug unfallfrei ist',
        erstzulassung: 'Datum der ersten Zulassung',
        leistung: 'Motorleistung in PS oder kW',
        hubraum: 'Hubraum in cm³',
        verbrauch: 'Kraftstoffverbrauch in l/100km',
        co2: 'CO2-Emissionen in g/km',
        sitze: 'Anzahl der Sitze',
        türen: 'Anzahl der Türen',
        klimaanlage: 'Verfügbarkeit einer Klimaanlage',
        navigationssystem: 'Verfügbarkeit eines Navigationssystems',
        parkassistent: 'Verfügbarkeit eines Parkassistenten',
        einparkhilfe: 'Verfügbarkeit einer Einparkhilfe',
        rückfahrkamera: 'Verfügbarkeit einer Rückfahrkamera',
        led_scheinwerfer: 'Verfügbarkeit von LED-Scheinwerfern',
        lederausstattung: 'Verfügbarkeit einer Lederausstattung',
        schiebedach: 'Verfügbarkeit eines Schiebedachs',
        allradantrieb: 'Verfügbarkeit eines Allradantriebs',
        abs: 'Verfügbarkeit von ABS',
        esp: 'Verfügbarkeit von ESP',
        airbag: 'Anzahl der Airbags',
        isofix: 'Verfügbarkeit von ISOFIX-Kindersitzbefestigungen',
        winterreifen: 'Verfügbarkeit von Winterreifen',
        sommerreifen: 'Verfügbarkeit von Sommerreifen',
        allwetterreifen: 'Verfügbarkeit von Allwetterreifen',
        felgen: 'Art der Felgen (Stahl, Aluminium)',
        radio: 'Verfügbarkeit eines Radios',
        bluetooth: 'Verfügbarkeit von Bluetooth',
        usb: 'Verfügbarkeit von USB-Anschlüssen',
        apple_carplay: 'Verfügbarkeit von Apple CarPlay',
        android_auto: 'Verfügbarkeit von Android Auto',
        tempomat: 'Verfügbarkeit eines Tempomaten',
        spurhalteassistent: 'Verfügbarkeit eines Spurhalteassistenten',
        notbremsassistent: 'Verfügbarkeit eines Notbremsassistenten',
        müdigkeitserkennung: 'Verfügbarkeit einer Müdigkeitserkennung',
        verkehrszeichenerkennung: 'Verfügbarkeit einer Verkehrszeichenerkennung',
        tote_winkel_warnung: 'Verfügbarkeit einer Toter-Winkel-Warnung',
        einparkautomatik: 'Verfügbarkeit einer Einparkautomatik',
        fernlichtassistent: 'Verfügbarkeit eines Fernlichtassistenten',
        regensensor: 'Verfügbarkeit eines Regensensors',
        lichtsensor: 'Verfügbarkeit eines Lichtsensors',
        innenraumfilter: 'Verfügbarkeit eines Innenraumfilters',
        partikelfilter: 'Verfügbarkeit eines Partikelfilters',
        katalysator: 'Verfügbarkeit eines Katalysators',
        dpf: 'Verfügbarkeit eines Dieselpartikelfilters',
        adblue: 'Verfügbarkeit von AdBlue',
        lpg: 'Verfügbarkeit von LPG/CNG',
        hybrid: 'Hybrid-Fahrzeug',
        elektro: 'Elektrofahrzeug',
        plugin_hybrid: 'Plug-in-Hybrid',
        mild_hybrid: 'Mild-Hybrid',
        vollelektrisch: 'Vollständig elektrisch',
        reichweite: 'Elektrische Reichweite in km',
        ladezeit: 'Ladezeit in Stunden',
        ladeleistung: 'Ladeleistung in kW',
        batteriekapazität: 'Batteriekapazität in kWh'
      }
    },

    // Detailseite
    detail: {
      properties: 'Eigenschaften',
      contact: 'Kontakt',
      seller: 'Verkäufer',
      description: 'Beschreibung',
      contact_information: 'Kontaktinformationen',
      phone: 'Telefon',
      email: 'E-Mail',
      views: 'Aufrufe',
      reviews: 'Bewertungen',
      no_images: 'Keine Bilder verfügbar',
      send_message: 'Nachricht senden',
      start: 'Start',
      back_to_listings: 'Zurück zu den Anzeigen'
    },

    // Kategorien
    category: {
      kleinanzeigen: 'Kleinanzeigen',
      autos: 'Autos',
      electronics: 'Elektronik',
      fashion: 'Mode',
      home: 'Haus & Garten',
      sports: 'Sport & Freizeit',
      books: 'Bücher & Medien',
      services: 'Dienstleistungen'
    },

    // Abschnitte
    section: {
      about_item: 'Über den Artikel',
      specs: 'Spezifikationen',
      about_house: 'Über das Haus',
      additional: 'Zusätzliche Informationen',
      shipping: 'Versand & Abholung',
      warranty: 'Garantie & Service'
    },

    // Kategorien
    categories: {
      autos: 'Autos',
      electronics: 'Elektronik',
      real_estate: 'Immobilien',
      fashion: 'Mode',
      home_garden: 'Haus & Garten',
      sports: 'Sport & Freizeit',
      books: 'Bücher & Medien',
      jobs: 'Jobs & Karriere',
      services: 'Dienstleistungen'
    },

    // Fehlermeldungen
    errors: {
      formLoad: 'Fehler beim Laden des Formulars',
      validation: 'Validierungsfehler',
      network: 'Netzwerkfehler',
      server: 'Serverfehler',
      unknown: 'Unbekannter Fehler',
      retry: 'Erneut versuchen'
    },

    // Erfolgsmeldungen
    success: {
      formSaved: 'Formular erfolgreich gespeichert',
      dataUpdated: 'Daten erfolgreich aktualisiert',
      itemCreated: 'Artikel erfolgreich erstellt'
    }
  },

  en: {
    // General UI elements
    common: {
      save: 'Save',
      cancel: 'Cancel',
      reset: 'Reset',
      loading: 'Loading...',
      error: 'Error',
      success: 'Success',
      required: 'Required',
      optional: 'Optional',
      choose: 'Please choose...',
      back: 'Back',
      next: 'Next',
      previous: 'Previous',
      submit: 'Submit',
      edit: 'Edit',
      delete: 'Delete',
      search: 'Search',
      filter: 'Filter',
      sort: 'Sort',
      close: 'Close',
      confirm: 'Confirm',
      yes: 'Yes',
      no: 'No'
    },

    // Form validation
    validation: {
      required: 'Field is required',
      minLength: 'Minimum {min} characters required',
      maxLength: 'Maximum {max} characters allowed',
      minValue: 'Minimum value: {min}',
      maxValue: 'Maximum value: {max}',
      invalidEmail: 'Invalid email address',
      invalidUrl: 'Invalid URL',
      invalidPhone: 'Invalid phone number',
      invalidOption: 'Invalid option selected',
      invalidType: 'Invalid data type'
    },

    // Dynamic forms
    forms: {
      sections: {
        about_item: 'About Item',
        specs: 'Specifications',
        about_house: 'About House',
        additional: 'Additional Information',
        shipping: 'Shipping & Pickup',
        warranty: 'Warranty & Service'
      },
      fieldTypes: {
        text: 'Text',
        number: 'Number',
        select: 'Selection',
        multiselect: 'Multiple Selection',
        boolean: 'Yes/No',
        date: 'Date',
        textarea: 'Text Area',
        url: 'URL',
        email: 'Email',
        phone: 'Phone'
      },
      placeholders: {
        title: 'Enter title',
        description: 'Enter description',
        price: 'Enter price',
        condition: 'Choose condition',
        extras: 'Choose extras',
        warranty: 'Warranty available',
        email: 'Enter email',
        phone: 'Enter phone number',
        url: 'Enter URL'
      },
      helpText: {
        title: 'Enter a descriptive title',
        description: 'Detailed description of the item',
        price: 'Price in Euro',
        condition: 'Choose the condition of the item',
        extras: 'Choose available extras',
        warranty: 'Has warranty',
        email: 'Your email address',
        phone: 'Your phone number',
        url: 'Link to website',
        // Auto-specific fields
        marke: 'Vehicle brand (e.g. BMW, Audi, Mercedes)',
        modell: 'Vehicle model (e.g. 3 Series, A4, C-Class)',
        baujahr: 'Year of manufacture',
        kilometerstand: 'Current mileage in kilometers',
        getriebe: 'Type of transmission (Manual, Automatic)',
        kraftstoff: 'Type of fuel (Petrol, Diesel, Electric, Hybrid)',
        zustand: 'General condition of the vehicle',
        farbe: 'Vehicle color',
        tüv: 'TÜV expiry date',
        unfallfrei: 'Whether the vehicle is accident-free',
        erstzulassung: 'Date of first registration',
        leistung: 'Engine power in HP or kW',
        hubraum: 'Engine displacement in cm³',
        verbrauch: 'Fuel consumption in l/100km',
        co2: 'CO2 emissions in g/km',
        sitze: 'Number of seats',
        türen: 'Number of doors',
        klimaanlage: 'Availability of air conditioning',
        navigationssystem: 'Availability of navigation system',
        parkassistent: 'Availability of parking assistant',
        einparkhilfe: 'Availability of parking aid',
        rückfahrkamera: 'Availability of rear view camera',
        led_scheinwerfer: 'Availability of LED headlights',
        lederausstattung: 'Availability of leather interior',
        schiebedach: 'Availability of sunroof',
        allradantrieb: 'Availability of all-wheel drive',
        abs: 'Availability of ABS',
        esp: 'Availability of ESP',
        airbag: 'Number of airbags',
        isofix: 'Availability of ISOFIX child seat mounts',
        winterreifen: 'Availability of winter tires',
        sommerreifen: 'Availability of summer tires',
        allwetterreifen: 'Availability of all-season tires',
        felgen: 'Type of rims (Steel, Aluminum)',
        radio: 'Availability of radio',
        bluetooth: 'Availability of Bluetooth',
        usb: 'Availability of USB ports',
        apple_carplay: 'Availability of Apple CarPlay',
        android_auto: 'Availability of Android Auto',
        tempomat: 'Availability of cruise control',
        spurhalteassistent: 'Availability of lane keeping assistant',
        notbremsassistent: 'Availability of emergency brake assistant',
        müdigkeitserkennung: 'Availability of fatigue detection',
        verkehrszeichenerkennung: 'Availability of traffic sign recognition',
        tote_winkel_warnung: 'Availability of blind spot warning',
        einparkautomatik: 'Availability of automatic parking',
        fernlichtassistent: 'Availability of high beam assistant',
        regensensor: 'Availability of rain sensor',
        lichtsensor: 'Availability of light sensor',
        innenraumfilter: 'Availability of cabin filter',
        partikelfilter: 'Availability of particle filter',
        katalysator: 'Availability of catalytic converter',
        dpf: 'Availability of diesel particulate filter',
        adblue: 'Availability of AdBlue',
        lpg: 'Availability of LPG/CNG',
        hybrid: 'Hybrid vehicle',
        elektro: 'Electric vehicle',
        plugin_hybrid: 'Plug-in hybrid',
        mild_hybrid: 'Mild hybrid',
        vollelektrisch: 'Fully electric',
        reichweite: 'Electric range in km',
        ladezeit: 'Charging time in hours',
        ladeleistung: 'Charging power in kW',
        batteriekapazität: 'Battery capacity in kWh'
      }
    },

    // Categories
    categories: {
      autos: 'Cars',
      electronics: 'Electronics',
      real_estate: 'Real Estate',
      fashion: 'Fashion',
      home_garden: 'Home & Garden',
      sports: 'Sports & Leisure',
      books: 'Books & Media',
      jobs: 'Jobs & Career',
      services: 'Services'
    },

    // Error messages
    errors: {
      formLoad: 'Error loading form',
      validation: 'Validation error',
      network: 'Network error',
      server: 'Server error',
      unknown: 'Unknown error',
      retry: 'Try again'
    },

    // Success messages
    success: {
      formSaved: 'Form successfully saved',
      dataUpdated: 'Data successfully updated',
      itemCreated: 'Item successfully created'
    }
  },

  ru: {
    // Общие элементы UI
    common: {
      save: 'Сохранить',
      cancel: 'Отмена',
      reset: 'Сброс',
      loading: 'Загрузка...',
      error: 'Ошибка',
      success: 'Успешно',
      required: 'Обязательно',
      optional: 'Необязательно',
      choose: 'Пожалуйста, выберите...',
      back: 'Назад',
      next: 'Далее',
      previous: 'Предыдущий',
      submit: 'Отправить',
      edit: 'Редактировать',
      delete: 'Удалить',
      search: 'Поиск',
      filter: 'Фильтр',
      sort: 'Сортировка',
      close: 'Закрыть',
      confirm: 'Подтвердить',
      yes: 'Да',
      no: 'Нет'
    },

    // Валидация форм
    validation: {
      required: 'Поле обязательно для заполнения',
      minLength: 'Минимум {min} символов',
      maxLength: 'Максимум {max} символов',
      minValue: 'Минимальное значение: {min}',
      maxValue: 'Максимальное значение: {max}',
      invalidEmail: 'Неверный адрес электронной почты',
      invalidUrl: 'Неверный URL',
      invalidPhone: 'Неверный номер телефона',
      invalidOption: 'Выбрано неверное значение',
      invalidType: 'Неверный тип данных'
    },

    // Динамические формы
    forms: {
      sections: {
        about_item: 'О товаре',
        specs: 'Характеристики',
        about_house: 'О доме',
        additional: 'Дополнительная информация',
        shipping: 'Доставка и самовывоз',
        warranty: 'Гарантия и сервис'
      },
      fieldTypes: {
        text: 'Текст',
        number: 'Число',
        select: 'Выбор',
        multiselect: 'Множественный выбор',
        boolean: 'Да/Нет',
        date: 'Дата',
        textarea: 'Текстовое поле',
        url: 'URL',
        email: 'Электронная почта',
        phone: 'Телефон'
      },
      placeholders: {
        title: 'Введите название',
        description: 'Введите описание',
        price: 'Введите цену',
        condition: 'Выберите состояние',
        extras: 'Выберите дополнения',
        warranty: 'Гарантия доступна',
        email: 'Введите email',
        phone: 'Введите номер телефона',
        url: 'Введите URL'
      },
      helpText: {
        title: 'Введите описательное название',
        description: 'Подробное описание товара',
        price: 'Цена в евро',
        condition: 'Выберите состояние товара',
        extras: 'Выберите доступные дополнения',
        warranty: 'Есть гарантия',
        email: 'Ваш адрес электронной почты',
        phone: 'Ваш номер телефона',
        url: 'Ссылка на веб-сайт',
        // Автомобильные поля
        marke: 'Марка автомобиля (например, BMW, Audi, Mercedes)',
        modell: 'Модель автомобиля (например, 3 серия, A4, C-класс)',
        baujahr: 'Год выпуска',
        kilometerstand: 'Текущий пробег в километрах',
        getriebe: 'Тип трансмиссии (Механическая, Автоматическая)',
        kraftstoff: 'Тип топлива (Бензин, Дизель, Электро, Гибрид)',
        zustand: 'Общее состояние автомобиля',
        farbe: 'Цвет автомобиля',
        tüv: 'Дата истечения ТУВ',
        unfallfrei: 'Без аварий',
        erstzulassung: 'Дата первой регистрации',
        leistung: 'Мощность двигателя в л.с. или кВт',
        hubraum: 'Объем двигателя в см³',
        verbrauch: 'Расход топлива в л/100км',
        co2: 'Выбросы CO2 в г/км',
        sitze: 'Количество мест',
        türen: 'Количество дверей',
        klimaanlage: 'Наличие кондиционера',
        navigationssystem: 'Наличие навигационной системы',
        parkassistent: 'Наличие парковочного ассистента',
        einparkhilfe: 'Наличие парковочного помощника',
        rückfahrkamera: 'Наличие камеры заднего вида',
        led_scheinwerfer: 'Наличие LED фар',
        lederausstattung: 'Наличие кожаного салона',
        schiebedach: 'Наличие люка',
        allradantrieb: 'Наличие полного привода',
        abs: 'Наличие ABS',
        esp: 'Наличие ESP',
        airbag: 'Количество подушек безопасности',
        isofix: 'Наличие креплений ISOFIX',
        winterreifen: 'Наличие зимних шин',
        sommerreifen: 'Наличие летних шин',
        allwetterreifen: 'Наличие всесезонных шин',
        felgen: 'Тип дисков (Сталь, Алюминий)',
        radio: 'Наличие радио',
        bluetooth: 'Наличие Bluetooth',
        usb: 'Наличие USB портов',
        apple_carplay: 'Наличие Apple CarPlay',
        android_auto: 'Наличие Android Auto',
        tempomat: 'Наличие круиз-контроля',
        spurhalteassistent: 'Наличие помощника удержания полосы',
        notbremsassistent: 'Наличие помощника экстренного торможения',
        müdigkeitserkennung: 'Наличие системы распознавания усталости',
        verkehrszeichenerkennung: 'Наличие распознавания дорожных знаков',
        tote_winkel_warnung: 'Наличие предупреждения о слепой зоне',
        einparkautomatik: 'Наличие автоматической парковки',
        fernlichtassistent: 'Наличие помощника дальнего света',
        regensensor: 'Наличие датчика дождя',
        lichtsensor: 'Наличие датчика света',
        innenraumfilter: 'Наличие салонного фильтра',
        partikelfilter: 'Наличие сажевого фильтра',
        katalysator: 'Наличие катализатора',
        dpf: 'Наличие сажевого фильтра для дизеля',
        adblue: 'Наличие AdBlue',
        lpg: 'Наличие LPG/CNG',
        hybrid: 'Гибридный автомобиль',
        elektro: 'Электромобиль',
        plugin_hybrid: 'Подключаемый гибрид',
        mild_hybrid: 'Мягкий гибрид',
        vollelektrisch: 'Полностью электрический',
        reichweite: 'Электрический запас хода в км',
        ladezeit: 'Время зарядки в часах',
        ladeleistung: 'Мощность зарядки в кВт',
        batteriekapazität: 'Емкость батареи в кВтч'
      }
    },

    // Категории
    categories: {
      autos: 'Автомобили',
      electronics: 'Электроника',
      real_estate: 'Недвижимость',
      fashion: 'Мода',
      home_garden: 'Дом и сад',
      sports: 'Спорт и отдых',
      books: 'Книги и медиа',
      jobs: 'Работа и карьера',
      services: 'Услуги'
    },

    // Сообщения об ошибках
    errors: {
      formLoad: 'Ошибка загрузки формы',
      validation: 'Ошибка валидации',
      network: 'Ошибка сети',
      server: 'Ошибка сервера',
      unknown: 'Неизвестная ошибка',
      retry: 'Попробовать снова'
    },

    // Сообщения об успехе
    success: {
      formSaved: 'Форма успешно сохранена',
      dataUpdated: 'Данные успешно обновлены',
      itemCreated: 'Товар успешно создан'
    }
  }
};

/**
 * Standardsprache (Deutsch)
 */
export const DEFAULT_LANGUAGE: Language = 'de';

/**
 * Verfügbare Sprachen
 */
export const AVAILABLE_LANGUAGES: Language[] = ['de', 'en', 'ru'];

/**
 * Sprachnamen für die UI
 */
export const LANGUAGE_NAMES: Record<Language, string> = {
  de: 'Deutsch',
  en: 'English',
  ru: 'Русский'
};

/**
 * i18n-Klasse für Übersetzungsverwaltung
 */
class I18nService {
  private currentLanguage: Language = DEFAULT_LANGUAGE;

  /**
   * Setzt die aktuelle Sprache
   */
  setLanguage(language: Language): void {
    if (AVAILABLE_LANGUAGES.includes(language)) {
      this.currentLanguage = language;
      // Speichere in localStorage
      localStorage.setItem('preferred-language', language);
    }
  }

  /**
   * Gibt die aktuelle Sprache zurück
   */
  getLanguage(): Language {
    return this.currentLanguage;
  }

  /**
   * Lädt die bevorzugte Sprache aus localStorage
   */
  loadPreferredLanguage(): void {
    const saved = localStorage.getItem('preferred-language') as Language;
    if (saved && AVAILABLE_LANGUAGES.includes(saved)) {
      this.currentLanguage = saved;
    }
  }

  /**
   * Übersetzt einen Schlüssel
   */
  t(key: string, params?: Record<string, string | number>): string {
    // Handle edge cases
    if (!key || typeof key !== 'string') {
      return String(key || '');
    }

    const keys = key.split('.');
    let value: any = translations[this.currentLanguage];

    // Navigiere durch die verschachtelten Schlüssel
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        // Fallback auf Deutsch
        value = this.getFallbackValue(keys);
        break;
      }
    }

    // Wenn der Wert ein String ist, ersetze Parameter
    if (typeof value === 'string') {
      return this.replaceParams(value, params);
    }

    // Fallback auf den Schlüssel selbst
    return key;
  }

  /**
   * Fallback auf Deutsch
   */
  private getFallbackValue(keys: string[]): string {
    let value: any = translations.de;
    
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        return keys.join('.');
      }
    }

    return typeof value === 'string' ? value : keys.join('.');
  }

  /**
   * Ersetzt Parameter in Übersetzungsstrings
   */
  private replaceParams(text: string, params?: Record<string, string | number>): string {
    if (!params) return text;

    return text.replace(/\{(\w+)\}/g, (match, key) => {
      return params[key]?.toString() || match;
    });
  }

  /**
   * Prüft ob ein Übersetzungsschlüssel existiert
   */
  hasKey(key: string): boolean {
    const keys = key.split('.');
    let value: any = translations[this.currentLanguage];

    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        return false;
      }
    }

    return typeof value === 'string';
  }

  /**
   * Gibt alle verfügbaren Übersetzungsschlüssel zurück
   */
  getAllKeys(): string[] {
    const keys: string[] = [];
    
    const extractKeys = (obj: any, prefix = '') => {
      for (const [key, value] of Object.entries(obj)) {
        const fullKey = prefix ? `${prefix}.${key}` : key;
        
        if (typeof value === 'string') {
          keys.push(fullKey);
        } else if (typeof value === 'object' && value !== null) {
          extractKeys(value, fullKey);
        }
      }
    };

    extractKeys(translations[this.currentLanguage]);
    return keys;
  }
}

// Singleton-Instanz
export const i18n = new I18nService();

// Lade bevorzugte Sprache beim Start
i18n.loadPreferredLanguage();

/**
 * Hook-kompatible Funktion für React
 */
export const useTranslation = () => {
  return {
    t: i18n.t.bind(i18n),
    language: i18n.getLanguage(),
    setLanguage: i18n.setLanguage.bind(i18n),
    availableLanguages: AVAILABLE_LANGUAGES,
    languageNames: LANGUAGE_NAMES
  };
};

/**
 * Direkte Übersetzungsfunktion für nicht-React-Komponenten
 */
export const t = i18n.t.bind(i18n);
