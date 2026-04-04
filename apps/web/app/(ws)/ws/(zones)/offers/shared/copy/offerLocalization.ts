import type { AppLocale } from "@/lib/locale";
import { formatLocaleNumber } from "@/lib/locale";

type OfferUiCopy = {
  overview: {
    dashboardBadge: string;
    openOffersTitle: string;
    activeFilters: string;
    marketScope: string;
    reset: string;
    createOffer: string;
    noMatchingOffers: string;
    quickFilters: string;
    quickFiltersDescription: string;
    location: string;
    locationPlaceholder: string;
    locationEmpty: string;
    area: string;
    areaPlaceholder: string;
    areaEmpty: string;
    sort: string;
    newestFirst: string;
    oldestFirst: string;
    budgetFrom: string;
    budgetTo: string;
    spaceFrom: string;
    spaceTo: string;
    roomsFrom: string;
    bathsFrom: string;
    unlimited: string;
    clearAll: string;
    applyFilters: string;
    offersCount: string;
  };
  selector: {
    optionCount: string;
    searchIn: string;
    selected: string;
    choose: string;
  };
  list: {
    price: string;
    permit: string;
    unavailable: string;
    noAddress: string;
    clientRequest: string;
    budget: string;
    rooms: string;
    baths: string;
    area: string;
    phone: string;
    whatsapp: string;
    website: string;
    email: string;
    openDetails: string;
    publishedBy: string;
    unknownOrganization: string;
    broker: string;
    developer: string;
    organization: string;
  };
  detail: {
    propertyDescription: string;
    offerDetails: string;
    additionalInfo: string;
    detailFallbackTitle: string;
    detailFallbackClientSummary: string;
    detailFallbackPropertySummary: string;
    noPropertyImages: string;
    noPropertyImagesHint: string;
    previousImage: string;
    nextImage: string;
    gallery: string;
    showImage: string;
    propertyDetailEyebrow: string;
    categories: string;
    locationEyebrow: string;
    locationTitle: string;
    apartmentAddress: string;
    apartmentAddressHint: string;
    insideArea: string;
    insideAreaHint: string;
    fullDescriptionEyebrow: string;
    fullDescriptionTitle: string;
    description: string;
    noExtraDescription: string;
    budget: string;
    location: string;
    area: string;
    rooms: string;
    baths: string;
    space: string;
    phone: string;
    price: string;
    priceHint: string;
    roomsValue: string;
    roomsHint: string;
    bathsValue: string;
    bathsHint: string;
    spaceValue: string;
    spaceHint: string;
    status: string;
    statusHint: string;
    offerType: string;
    publisherOrganization: string;
    backToOffers: string;
    openConversation: string;
    editDraft: string;
    publishCase: string;
    publishing: string;
    startCollaboration: string;
    openingCollaboration: string;
    accept: string;
    accepting: string;
    reject: string;
    rejecting: string;
    approveAgreement: string;
    saving: string;
    closeWon: string;
    closingWon: string;
    closeLost: string;
    closingLost: string;
    archive: string;
    archiving: string;
    noActionsAvailable: string;
    actionFailed: string;
    activityLogEyebrow: string;
    activityLogTitle: string;
    noEvents: string;
  };
};

const copyByLocale: Record<AppLocale, OfferUiCopy> = {
  ar: {
    overview: {
      dashboardBadge: "لوحة العروض",
      openOffersTitle: "العروض المفتوحة",
      activeFilters: "{count} فلتر نشط",
      marketScope: "السعودية",
      reset: "إعادة الضبط",
      createOffer: "إنشاء عرض",
      noMatchingOffers: "لا توجد عروض مطابقة حالياً.",
      quickFilters: "فلترة سريعة",
      quickFiltersDescription: "القوائم الحالية مخصصة للسوق السعودي فقط.",
      location: "الموقع",
      locationPlaceholder: "مثال: الرياض",
      locationEmpty: "لا توجد مدن أو مواقع مطابقة",
      area: "المنطقة",
      areaPlaceholder: "ابحث داخل المناطق",
      areaEmpty: "لا توجد مناطق مطابقة",
      sort: "الترتيب",
      newestFirst: "الأحدث أولاً",
      oldestFirst: "الأقدم أولاً",
      budgetFrom: "الميزانية من",
      budgetTo: "الميزانية إلى",
      spaceFrom: "المساحة من",
      spaceTo: "المساحة إلى",
      roomsFrom: "الغرف من",
      bathsFrom: "الحمامات من",
      unlimited: "غير محدد",
      clearAll: "مسح الكل",
      applyFilters: "تطبيق الفلاتر",
      offersCount: "{count} عرض",
    },
    selector: {
      optionCount: "{count} خيار",
      searchIn: "ابحث في {label}",
      selected: "محدد",
      choose: "اختر",
    },
    list: {
      price: "السعر",
      permit: "التصريح",
      unavailable: "غير متوفر",
      noAddress: "غير محدد",
      clientRequest: "طلب عميل",
      budget: "الميزانية",
      rooms: "الغرف",
      baths: "الحمامات",
      area: "المساحة",
      phone: "الهاتف",
      whatsapp: "واتساب",
      website: "الموقع",
      email: "البريد",
      openDetails: "فتح التفاصيل",
      publishedBy: "المنظمة الناشرة",
      unknownOrganization: "جهة غير محددة",
      broker: "وسيط",
      developer: "مطور",
      organization: "جهة",
    },
    detail: {
      propertyDescription: "وصف العقار",
      offerDetails: "تفاصيل العرض",
      additionalInfo: "معلومة إضافية",
      detailFallbackTitle: "تفاصيل العرض",
      detailFallbackClientSummary: "لا يوجد وصف إضافي لهذه الحالة.",
      detailFallbackPropertySummary: "لا يوجد وصف إضافي لهذه الوحدة حالياً.",
      noPropertyImages: "لا توجد صور مرفقة لهذه الشقة حالياً.",
      noPropertyImagesHint: "يمكنك متابعة تفاصيل الوحدة والموقع من الأقسام التالية.",
      previousImage: "الصورة السابقة",
      nextImage: "الصورة التالية",
      gallery: "معرض الصور",
      showImage: "عرض الصورة {index}",
      propertyDetailEyebrow: "تفاصيل العقار",
      categories: "التصنيفات",
      locationEyebrow: "الموقع",
      locationTitle: "الموقع",
      apartmentAddress: "عنوان الشقة",
      apartmentAddressHint: "عنوان الوحدة المعروضة",
      insideArea: "داخل المنطقة",
      insideAreaHint: "بدون مدينة أو نطاق إضافي",
      fullDescriptionEyebrow: "الوصف الكامل",
      fullDescriptionTitle: "الوصف الكامل",
      description: "الوصف",
      noExtraDescription: "لا يوجد وصف إضافي لهذه الوحدة حالياً.",
      budget: "الميزانية",
      location: "الموقع",
      area: "المنطقة",
      rooms: "الغرف",
      baths: "الحمامات",
      space: "المساحة",
      phone: "الهاتف",
      price: "السعر",
      priceHint: "سعر الوحدة المعروض حالياً.",
      roomsValue: "{count} غرف",
      roomsHint: "عدد الغرف الأساسية داخل هذه الشقة.",
      bathsValue: "{count} حمامات",
      bathsHint: "عدد الحمامات المتاحة داخل الوحدة.",
      spaceValue: "{count} م²",
      spaceHint: "المساحة الإجمالية المعروضة لهذه الشقة.",
      status: "الحالة",
      statusHint: "حالة المنتج الحالية داخل المنصة.",
      offerType: "نوع العرض",
      publisherOrganization: "المنظمة الناشرة",
      backToOffers: "العودة للعروض",
      openConversation: "فتح المحادثة",
      editDraft: "تعديل المسودة",
      publishCase: "نشر الحالة",
      publishing: "جارٍ النشر...",
      startCollaboration: "بدء التعاون",
      openingCollaboration: "جارٍ فتح التعاون...",
      accept: "قبول",
      accepting: "جارٍ القبول...",
      reject: "رفض",
      rejecting: "جارٍ الرفض...",
      approveAgreement: "اعتماد الاتفاق",
      saving: "جارٍ الحفظ...",
      closeWon: "إغلاق ناجح",
      closingWon: "جارٍ الإغلاق...",
      closeLost: "إغلاق غير مكتمل",
      closingLost: "جارٍ الإغلاق...",
      archive: "أرشفة",
      archiving: "جارٍ الأرشفة...",
      noActionsAvailable: "لا توجد إجراءات متاحة في هذه المرحلة حالياً.",
      actionFailed: "تعذر تنفيذ الإجراء.",
      activityLogEyebrow: "سجل النشاط",
      activityLogTitle: "تاريخ العمليات",
      noEvents: "لا توجد أحداث مسجلة بعد.",
    },
  },
  en: {
    overview: {
      dashboardBadge: "Offers board",
      openOffersTitle: "Open offers",
      activeFilters: "{count} active filters",
      marketScope: "Saudi Arabia",
      reset: "Reset",
      createOffer: "Create offer",
      noMatchingOffers: "No matching offers right now.",
      quickFilters: "Quick filters",
      quickFiltersDescription: "The current listings are limited to the Saudi market.",
      location: "Location",
      locationPlaceholder: "Example: Riyadh",
      locationEmpty: "No matching cities or locations",
      area: "Area",
      areaPlaceholder: "Search within areas",
      areaEmpty: "No matching areas",
      sort: "Sort",
      newestFirst: "Newest first",
      oldestFirst: "Oldest first",
      budgetFrom: "Budget from",
      budgetTo: "Budget to",
      spaceFrom: "Area from",
      spaceTo: "Area to",
      roomsFrom: "Rooms from",
      bathsFrom: "Bathrooms from",
      unlimited: "Unspecified",
      clearAll: "Clear all",
      applyFilters: "Apply filters",
      offersCount: "{count} offers",
    },
    selector: {
      optionCount: "{count} options",
      searchIn: "Search in {label}",
      selected: "Selected",
      choose: "Choose",
    },
    list: {
      price: "Price",
      permit: "Permit",
      unavailable: "Unavailable",
      noAddress: "Unspecified",
      clientRequest: "Client request",
      budget: "Budget",
      rooms: "Rooms",
      baths: "Bathrooms",
      area: "Area",
      phone: "Phone",
      whatsapp: "WhatsApp",
      website: "Website",
      email: "Email",
      openDetails: "Open details",
      publishedBy: "Published by",
      unknownOrganization: "Unknown organization",
      broker: "Broker",
      developer: "Developer",
      organization: "Organization",
    },
    detail: {
      propertyDescription: "Property description",
      offerDetails: "Offer details",
      additionalInfo: "Additional info",
      detailFallbackTitle: "Offer details",
      detailFallbackClientSummary: "There is no extra description for this case.",
      detailFallbackPropertySummary: "There is no extra description for this unit right now.",
      noPropertyImages: "There are no images attached to this apartment right now.",
      noPropertyImagesHint: "You can continue with the unit and location details in the sections below.",
      previousImage: "Previous image",
      nextImage: "Next image",
      gallery: "Gallery",
      showImage: "Show image {index}",
      propertyDetailEyebrow: "Property details",
      categories: "Categories",
      locationEyebrow: "Location",
      locationTitle: "Location",
      apartmentAddress: "Apartment address",
      apartmentAddressHint: "The listed unit address",
      insideArea: "Inside area",
      insideAreaHint: "No extra city or area details",
      fullDescriptionEyebrow: "Full description",
      fullDescriptionTitle: "Full description",
      description: "Description",
      noExtraDescription: "There is no extra description for this unit right now.",
      budget: "Budget",
      location: "Location",
      area: "Area",
      rooms: "Rooms",
      baths: "Bathrooms",
      space: "Area",
      phone: "Phone",
      price: "Price",
      priceHint: "The current asking price for this unit.",
      roomsValue: "{count} rooms",
      roomsHint: "The number of primary rooms inside this apartment.",
      bathsValue: "{count} bathrooms",
      bathsHint: "The number of bathrooms available in the unit.",
      spaceValue: "{count} m²",
      spaceHint: "The total listed area for this apartment.",
      status: "Status",
      statusHint: "The current product status inside the platform.",
      offerType: "Offer type",
      publisherOrganization: "Published by",
      backToOffers: "Back to offers",
      openConversation: "Open conversation",
      editDraft: "Edit draft",
      publishCase: "Publish case",
      publishing: "Publishing...",
      startCollaboration: "Start collaboration",
      openingCollaboration: "Opening collaboration...",
      accept: "Accept",
      accepting: "Accepting...",
      reject: "Reject",
      rejecting: "Rejecting...",
      approveAgreement: "Mark agreement",
      saving: "Saving...",
      closeWon: "Close as won",
      closingWon: "Closing...",
      closeLost: "Close as lost",
      closingLost: "Closing...",
      archive: "Archive",
      archiving: "Archiving...",
      noActionsAvailable: "There are no available actions at this stage right now.",
      actionFailed: "Could not complete the action.",
      activityLogEyebrow: "Activity log",
      activityLogTitle: "Activity log",
      noEvents: "No events have been recorded yet.",
    },
  },
  fr: {
    overview: {
      dashboardBadge: "Tableau des offres",
      openOffersTitle: "Offres ouvertes",
      activeFilters: "{count} filtres actifs",
      marketScope: "Arabie saoudite",
      reset: "Réinitialiser",
      createOffer: "Créer une offre",
      noMatchingOffers: "Aucune offre correspondante pour le moment.",
      quickFilters: "Filtres rapides",
      quickFiltersDescription: "Les annonces actuelles sont limitées au marché saoudien.",
      location: "Lieu",
      locationPlaceholder: "Exemple : Riyad",
      locationEmpty: "Aucune ville ou aucun lieu correspondant",
      area: "Zone",
      areaPlaceholder: "Rechercher dans les zones",
      areaEmpty: "Aucune zone correspondante",
      sort: "Tri",
      newestFirst: "Plus récentes d'abord",
      oldestFirst: "Plus anciennes d'abord",
      budgetFrom: "Budget min",
      budgetTo: "Budget max",
      spaceFrom: "Surface min",
      spaceTo: "Surface max",
      roomsFrom: "Pièces min",
      bathsFrom: "Salles de bain min",
      unlimited: "Non précisé",
      clearAll: "Tout effacer",
      applyFilters: "Appliquer les filtres",
      offersCount: "{count} offres",
    },
    selector: {
      optionCount: "{count} options",
      searchIn: "Rechercher dans {label}",
      selected: "Sélectionné",
      choose: "Choisir",
    },
    list: {
      price: "Prix",
      permit: "Autorisation",
      unavailable: "Indisponible",
      noAddress: "Non précisé",
      clientRequest: "Demande client",
      budget: "Budget",
      rooms: "Pièces",
      baths: "Salles de bain",
      area: "Surface",
      phone: "Téléphone",
      whatsapp: "WhatsApp",
      website: "Site",
      email: "E-mail",
      openDetails: "Ouvrir les détails",
      publishedBy: "Publié par",
      unknownOrganization: "Organisation inconnue",
      broker: "Courtier",
      developer: "Promoteur",
      organization: "Organisation",
    },
    detail: {
      propertyDescription: "Description du bien",
      offerDetails: "Détails de l'offre",
      additionalInfo: "Information complémentaire",
      detailFallbackTitle: "Détails de l'offre",
      detailFallbackClientSummary: "Aucune description supplémentaire pour ce cas.",
      detailFallbackPropertySummary: "Aucune description supplémentaire pour cette unité pour le moment.",
      noPropertyImages: "Aucune image n'est jointe à cet appartement pour le moment.",
      noPropertyImagesHint: "Vous pouvez poursuivre avec les détails de l'unité et du lieu dans les sections suivantes.",
      previousImage: "Image précédente",
      nextImage: "Image suivante",
      gallery: "Galerie",
      showImage: "Afficher l'image {index}",
      propertyDetailEyebrow: "Détails du bien",
      categories: "Catégories",
      locationEyebrow: "Lieu",
      locationTitle: "Lieu",
      apartmentAddress: "Adresse de l'appartement",
      apartmentAddressHint: "L'adresse de l'unité affichée",
      insideArea: "Dans la zone",
      insideAreaHint: "Aucun détail de ville ou de zone supplémentaire",
      fullDescriptionEyebrow: "Description complète",
      fullDescriptionTitle: "Description complète",
      description: "Description",
      noExtraDescription: "Aucune description supplémentaire pour cette unité pour le moment.",
      budget: "Budget",
      location: "Lieu",
      area: "Zone",
      rooms: "Pièces",
      baths: "Salles de bain",
      space: "Surface",
      phone: "Téléphone",
      price: "Prix",
      priceHint: "Le prix actuel affiché pour cette unité.",
      roomsValue: "{count} pièces",
      roomsHint: "Le nombre de pièces principales de cet appartement.",
      bathsValue: "{count} salles de bain",
      bathsHint: "Le nombre de salles de bain disponibles dans l'unité.",
      spaceValue: "{count} m²",
      spaceHint: "La surface totale affichée pour cet appartement.",
      status: "Statut",
      statusHint: "Le statut actuel du produit sur la plateforme.",
      offerType: "Type d'offre",
      publisherOrganization: "Publié par",
      backToOffers: "Retour aux offres",
      openConversation: "Ouvrir la conversation",
      editDraft: "Modifier le brouillon",
      publishCase: "Publier le cas",
      publishing: "Publication...",
      startCollaboration: "Commencer la collaboration",
      openingCollaboration: "Ouverture de la collaboration...",
      accept: "Accepter",
      accepting: "Acceptation...",
      reject: "Refuser",
      rejecting: "Refus...",
      approveAgreement: "Valider l'accord",
      saving: "Enregistrement...",
      closeWon: "Clore comme gagnée",
      closingWon: "Clôture...",
      closeLost: "Clore comme perdue",
      closingLost: "Clôture...",
      archive: "Archiver",
      archiving: "Archivage...",
      noActionsAvailable: "Aucune action n'est disponible à cette étape pour le moment.",
      actionFailed: "Impossible d'exécuter l'action.",
      activityLogEyebrow: "Journal d'activité",
      activityLogTitle: "Historique d'activité",
      noEvents: "Aucun événement n'a encore été enregistré.",
    },
  },
};

/**
 * WHY:   The offers zone owns a lot of UI copy that should remain centralized instead of being redefined inside components.
 * WHAT:  Returns the locale-specific copy used by the offers overview, detail page, and shared controls.
 * HOW:   Keeps a compact local dictionary keyed by the supported workspace locales.
 */
export function getOfferUiCopy(locale: AppLocale) {
  return copyByLocale[locale];
}

/**
 * WHY:   Offer summaries and selectors repeatedly render count-based labels across locales.
 * WHAT:  Injects a locale-aware number into a `{count}` template string.
 * HOW:   Formats the numeric token first, then replaces the placeholder in the provided template.
 */
export function formatOfferCountLabel(locale: AppLocale, template: string, count: number) {
  return template.replace("{count}", formatLocaleNumber(locale, count));
}

/**
 * WHY:   Some detail labels need a raw numeric token inside otherwise localized text.
 * WHAT:  Replaces the `{count}` placeholder with the provided value.
 * HOW:   Uses string replacement so the same helper works for rooms, baths, area, and image indexes.
 */
export function formatOfferValueLabel(template: string, count: number | string) {
  return template.replace("{count}", String(count));
}
