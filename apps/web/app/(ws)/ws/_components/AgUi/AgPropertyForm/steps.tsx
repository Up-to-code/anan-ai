"use client";

import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Building2,
  Check,
  CheckCircle2,
  FileCheck2,
  ImagePlus,
  MapPin,
  Search,
  Upload,
  Video,
  X,
} from "lucide-react";
import { useWebLocale } from "@/app/_components/WebLocaleProvider";
import type { AppLocale } from "@/lib/locale";
import type { UploadedFileReference } from "@/server/contracts/files";
import type { BrokerPresence } from "../../Visuals/BrokerPresenceChip";
import { BrokerAvatar, FieldLabel, ReviewRow, SectionCard, TextArea, TextInput, UploadTile } from "./controls";
import { getGalleryAspectOptions, getGalleryDisplayOptions, getStepDefinitions } from "./shared";
import type { AgPropertyFormState } from "./shared";

function getPropertyFormText(locale: AppLocale) {
  if (locale === "en") {
    return {
      basicTitle: "Core details",
      basicDescription: "Start with the project name, price, and main location.",
      name: "Project name",
      namePlaceholder: "Example: Yasmin Towers",
      price: "Price",
      pricePlaceholder: "Example: SAR 2,500,000",
      location: "Location",
      locationPlaceholder: "Example: Jeddah, North Obhur",
      visibility: "Property visibility in AI and buyer channels",
      publicTitle: "Public to buyers and AI",
      publicDescription: "Appears in client-web and the main assistant when published.",
      privateTitle: "Private inside the workspace",
      privateDescription: "Stays internal for the developer or broker and does not appear to buyers.",
      fullDescriptionTitle: "Full description",
      fullDescriptionDescription: "Write a clear description that a broker or buyer can understand immediately.",
      fullDescriptionPlaceholder: "Explain the project, unit types, location, strengths, and any important details.",
      pageContentTitle: "Page content",
      pageContentDescription: "This section appears next to the gallery and inside project cards.",
      shortDescription: "Short description",
      shortDescriptionPlaceholder: "A quick summary in two or three lines.",
      amenities: "Amenities and services",
      amenitiesPlaceholder: "Example: private parking, gym, elevators, security",
      amenitiesHint: "Separate each feature with a comma or a new line.",
      galleryTitle: "Image management",
      galleryDescription: "Upload images, choose the cover image, and arrange them in the right order.",
      addImages: "Add project images",
      uploadingImages: "Uploading images...",
      uploadedImages: (count: number) => `${count} uploaded images`,
      currentCover: "Current cover image",
      imageNumber: (index: number) => `Image ${index + 1}`,
      cover: "Cover",
      moveUp: "Up",
      moveDown: "Down",
      remove: "Remove",
      uploadImagesFirst: "Upload project images first to unlock ordering and cover controls.",
      galleryStyleTitle: "Gallery display style",
      galleryStyleDescription: "Choose how the images should appear in the gallery without using a separate crop tool.",
      displayMode: "Image display mode",
      frameRatio: "Frame ratio",
      videoEnabled: "Demo video enabled",
      videoDisabled: "Enable a demo video",
      videoEnabledDescription: "You can disable it whenever you want.",
      videoDisabledDescription: "Optional toggle for adding a short video.",
      specsTitle: "Specifications",
      specsDescription: "Set the project status and the main details shown in cards.",
      projectStatus: "Project status",
      statusActive: "Ready to publish",
      statusPending: "Draft",
      statusMaintenance: "Archived or hidden",
      rooms: "Rooms",
      baths: "Bathrooms",
      area: "Area in sqm",
      areaPlaceholder: "Example: 380",
      parking: "Parking",
      parkingAvailable: "Available",
      parkingCountPlaceholder: "Number of spaces",
      licenseTitle: "Ad license",
      licenseDescription: "Enter the license number now and upload verification files once the project is saved.",
      verificationStatus: "Verification status",
      verificationStatusHint: "This status stays in sync when the request is sent or reviewed.",
      licenseNumber: "Real estate ad license number",
      licenseNumberPlaceholder: "Example: AD-12345",
      uploadLicense: "Upload license documents",
      uploadingLicense: "Uploading documents...",
      docsCount: (count: number) => `${count} files`,
      docsHint: "PDF or clear image files",
      verificationSuccess: "Verification request was submitted successfully.",
      verificationSending: "Sending...",
      verificationSubmit: "Submit verification request",
      saveFirstForVerification: "Save the project first so you can upload documents and submit the request.",
      projectVisibilityTitle: "Project visibility",
      projectVisibilityDescription: "Choose whether the project is public or private, and review who can see it when private.",
      privateVisibilityTitle: "Private",
      privateVisibilityDescription: "Visible only to people explicitly granted access.",
      publicVisibilityTitle: "Public",
      publicVisibilityDescription: "Visible in buyer channels and AI depending on publication status.",
      revokeAccess: "Revoke access",
      hiddenEmail: "No visible email",
      chatShare: "From chat",
      manualShare: "Manual",
      noViewers: "No viewers have been added yet. People who open the project from a private chat share will appear here.",
      permitTitle: "Private chat permit",
      permitDescription: "Shown only to the person who opened the project through a private chat share.",
      permitPlaceholder: "Write a short note that explains this private permit or customization.",
      uploadPermit: "Upload private permit files",
      permitHint: "Only the approved recipient will see them",
      brokerAssignmentTitle: "Assign broker",
      brokerAssignmentDescription: "Optional. You can link one broker to this project from this page.",
      cancelAssignment: "Remove assignment",
      brokerSearchPlaceholder: "Search by broker name",
      noBrokerResults: "No matching results right now.",
      reviewTitle: "Final review",
      reviewDescription: "Review the most important details before the final save.",
      notSpecified: "Not specified",
      projectImages: "Project images",
      noImages: "No images uploaded",
      coverSuffix: " + cover selected",
      displaySummary: "Gallery display",
      specsSummary: "Specifications",
      parkingSummary: "Parking",
      parkingUnavailable: "Not available",
      projectStatusSummary: "Project status",
      clientVisibilitySummary: "Buyer visibility",
      visibleToAi: "Visible in AI and buyer channels",
      visibleInWorkspace: "Private inside workspace",
      viewers: "Approved viewers",
      usersCount: (count: number) => `${count} users`,
      none: "None",
      broker: "Broker",
      noBroker: "No broker selected",
      privatePermitSummary: "Private permit",
      permitAdded: "Private chat details added",
      safariNotice: "This form was simplified to behave more cleanly in Safari too: one column, clearer actions, and stable image frames.",
      saving: "Saving...",
      saveSummary: "The project will be saved with the selected status and the details shown above.",
      stepOf: (current: number, total: number) => `Step ${current} of ${total}`,
      previous: "Previous",
      next: "Next",
      nextLabel: (label: string) => `Next: ${label}`,
      finalReviewShort: "Final review",
      roomsUnit: "rooms",
      bathsUnit: "bathrooms",
      parkingUnit: "spaces",
      projectViewersOne: "1 user",
    };
  }

  if (locale === "fr") {
    return {
      basicTitle: "Informations de base",
      basicDescription: "Commencez par le nom du projet, le prix et l'emplacement principal.",
      name: "Nom du projet",
      namePlaceholder: "Exemple : Tours Yasmin",
      price: "Prix",
      pricePlaceholder: "Exemple : 2 500 000 SAR",
      location: "Emplacement",
      locationPlaceholder: "Exemple : Djeddah, Abhur Nord",
      visibility: "Visibilite du bien dans l'IA et les canaux client",
      publicTitle: "Public pour le client et l'IA",
      publicDescription: "Apparait dans client-web et dans l'assistant principal lors de la publication.",
      privateTitle: "Prive dans l'espace de travail",
      privateDescription: "Reste interne au promoteur ou au courtier et n'apparait pas au client.",
      fullDescriptionTitle: "Description complete",
      fullDescriptionDescription: "Redigez une description claire comprise immediatement par le courtier ou le client.",
      fullDescriptionPlaceholder: "Expliquez le projet, les types d'unites, l'emplacement, les points forts et tout detail important.",
      pageContentTitle: "Contenu de la page",
      pageContentDescription: "Cette section apparait a cote de la galerie et dans les cartes projet.",
      shortDescription: "Description courte",
      shortDescriptionPlaceholder: "Un resume rapide en deux ou trois lignes.",
      amenities: "Avantages et services",
      amenitiesPlaceholder: "Exemple : parking prive, salle de sport, ascenseurs, securite",
      amenitiesHint: "Separez chaque element par une virgule ou une nouvelle ligne.",
      galleryTitle: "Gestion des images",
      galleryDescription: "Televersez les images, choisissez la couverture et organisez l'ordre d'affichage.",
      addImages: "Ajouter des images du projet",
      uploadingImages: "Televersement des images...",
      uploadedImages: (count: number) => `${count} images televersees`,
      currentCover: "Image de couverture actuelle",
      imageNumber: (index: number) => `Image ${index + 1}`,
      cover: "Couverture",
      moveUp: "Monter",
      moveDown: "Descendre",
      remove: "Supprimer",
      uploadImagesFirst: "Televersez d'abord les images du projet pour activer l'ordre et la couverture.",
      galleryStyleTitle: "Style d'affichage de la galerie",
      galleryStyleDescription: "Choisissez comment les images s'affichent dans la galerie sans outil de recadrage separe.",
      displayMode: "Mode d'affichage",
      frameRatio: "Ratio du cadre",
      videoEnabled: "Video activee",
      videoDisabled: "Activer une video de presentation",
      videoEnabledDescription: "Vous pouvez la desactiver a tout moment.",
      videoDisabledDescription: "Option facultative pour joindre une courte video.",
      specsTitle: "Caracteristiques",
      specsDescription: "Definissez l'etat du projet et les informations principales affichees dans les cartes.",
      projectStatus: "Etat du projet",
      statusActive: "Pret a publier",
      statusPending: "Brouillon",
      statusMaintenance: "Archive ou masque",
      rooms: "Pieces",
      baths: "Salles de bain",
      area: "Surface en m²",
      areaPlaceholder: "Exemple : 380",
      parking: "Parking",
      parkingAvailable: "Disponible",
      parkingCountPlaceholder: "Nombre de places",
      licenseTitle: "Licence publicitaire",
      licenseDescription: "Saisissez le numero maintenant puis televersez les documents quand le projet est enregistre.",
      verificationStatus: "Etat de verification",
      verificationStatusHint: "Cet etat se met a jour apres l'envoi ou la revision de la demande.",
      licenseNumber: "Numero de licence publicitaire",
      licenseNumberPlaceholder: "Exemple : AD-12345",
      uploadLicense: "Televerser les documents de licence",
      uploadingLicense: "Televersement des documents...",
      docsCount: (count: number) => `${count} fichiers`,
      docsHint: "PDF ou images claires",
      verificationSuccess: "La demande de verification a ete envoyee avec succes.",
      verificationSending: "Envoi...",
      verificationSubmit: "Envoyer la demande de verification",
      saveFirstForVerification: "Enregistrez d'abord le projet pour pouvoir envoyer les documents.",
      projectVisibilityTitle: "Visibilite du projet",
      projectVisibilityDescription: "Choisissez si le projet est public ou prive et verifiez qui peut le voir lorsqu'il est prive.",
      privateVisibilityTitle: "Prive",
      privateVisibilityDescription: "Visible uniquement par les personnes autorisees.",
      publicVisibilityTitle: "Public",
      publicVisibilityDescription: "Visible dans les canaux client et l'IA selon le statut de publication.",
      revokeAccess: "Retirer l'acces",
      hiddenEmail: "Aucun e-mail visible",
      chatShare: "Depuis la conversation",
      manualShare: "Manuel",
      noViewers: "Aucun spectateur ajoute pour le moment. Les personnes ouvrant le projet via un partage prive apparaitront ici.",
      permitTitle: "Autorisation privee de conversation",
      permitDescription: "Visible uniquement par la personne qui a ouvert le projet via un partage prive.",
      permitPlaceholder: "Ajoutez une courte note expliquant cette autorisation ou personnalisation.",
      uploadPermit: "Televerser les fichiers prives",
      permitHint: "Seul le destinataire autorise pourra les voir",
      brokerAssignmentTitle: "Assigner un courtier",
      brokerAssignmentDescription: "Optionnel. Vous pouvez lier un courtier a ce projet depuis cette page.",
      cancelAssignment: "Annuler l'assignation",
      brokerSearchPlaceholder: "Rechercher un courtier",
      noBrokerResults: "Aucun resultat correspondant pour le moment.",
      reviewTitle: "Revision finale",
      reviewDescription: "Verifiez les informations principales avant l'enregistrement final.",
      notSpecified: "Non precise",
      projectImages: "Images du projet",
      noImages: "Aucune image televersee",
      coverSuffix: " + couverture selectionnee",
      displaySummary: "Affichage de la galerie",
      specsSummary: "Caracteristiques",
      parkingSummary: "Parking",
      parkingUnavailable: "Non disponible",
      projectStatusSummary: "Etat du projet",
      clientVisibilitySummary: "Visibilite client",
      visibleToAi: "Visible dans l'IA et les canaux client",
      visibleInWorkspace: "Prive dans l'espace de travail",
      viewers: "Lecteurs autorises",
      usersCount: (count: number) => `${count} utilisateurs`,
      none: "Aucun",
      broker: "Courtier",
      noBroker: "Aucun courtier selectionne",
      privatePermitSummary: "Autorisation privee",
      permitAdded: "Details prives ajoutes a la conversation",
      safariNotice: "Ce formulaire a ete simplifie pour mieux fonctionner aussi dans Safari : une colonne, des actions plus claires et des cadres d'image stables.",
      saving: "Enregistrement...",
      saveSummary: "Le projet sera enregistre selon l'etat choisi et les informations ci-dessus.",
      stepOf: (current: number, total: number) => `Etape ${current} sur ${total}`,
      previous: "Precedent",
      next: "Suivant",
      nextLabel: (label: string) => `Suivant : ${label}`,
      finalReviewShort: "Revision finale",
      roomsUnit: "pieces",
      bathsUnit: "salles de bain",
      parkingUnit: "places",
      projectViewersOne: "1 utilisateur",
    };
  }

  return {
    basicTitle: "البيانات الأساسية",
    basicDescription: "ابدأ باسم المشروع، سعره، وموقعه الرئيسي.",
    name: "اسم المشروع",
    namePlaceholder: "مثال: أبراج الياسمين",
    price: "السعر",
    pricePlaceholder: "مثال: 2,500,000 ر.س",
    location: "الموقع",
    locationPlaceholder: "مثال: جدة، أبحر الشمالية",
    visibility: "ظهور العقار في AI والعميل",
    publicTitle: "عام للعميل وAI",
    publicDescription: "يظهر في client-web والمساعد الرئيسي عند النشر.",
    privateTitle: "خاص داخل مساحة العمل",
    privateDescription: "يبقى داخلياً للمطور أو الوسيط ولا يظهر للعميل.",
    fullDescriptionTitle: "الوصف الكامل",
    fullDescriptionDescription: "اكتب وصفاً واضحاً يفهمه الوسيط أو العميل مباشرة.",
    fullDescriptionPlaceholder: "اشرح المشروع، نوع الوحدات، الموقع، نقاط القوة، وأي تفاصيل مهمة.",
    pageContentTitle: "محتوى الصفحة",
    pageContentDescription: "هذا الجزء يظهر بجوار المعرض وفي بطاقات المشروع.",
    shortDescription: "وصف قصير",
    shortDescriptionPlaceholder: "ملخص سريع في سطرين أو ثلاثة.",
    amenities: "المزايا والخدمات",
    amenitiesPlaceholder: "مثال: مواقف خاصة، نادي، مصاعد، حراسة",
    amenitiesHint: "افصل بين كل ميزة بفاصلة أو سطر جديد.",
    galleryTitle: "إدارة الصور",
    galleryDescription: "ارفع الصور ثم اختر صورة الغلاف ورتب الصور بالشكل المناسب.",
    addImages: "إضافة صور المشروع",
    uploadingImages: "جارٍ رفع الصور...",
    uploadedImages: (count: number) => `${count} صورة مرفوعة`,
    currentCover: "صورة الغلاف الحالية",
    imageNumber: (index: number) => `الصورة رقم ${index + 1}`,
    cover: "غلاف",
    moveUp: "رفع",
    moveDown: "خفض",
    remove: "إزالة",
    uploadImagesFirst: "ارفع صور المشروع أولاً لتظهر أدوات الترتيب والغلاف.",
    galleryStyleTitle: "أسلوب عرض المعرض",
    galleryStyleDescription: "اختر كيف تُعرض الصور داخل المعرض دون الحاجة إلى أداة قص كاملة.",
    displayMode: "طريقة عرض الصورة",
    frameRatio: "نسبة الإطار",
    videoEnabled: "الفيديو مفعّل",
    videoDisabled: "تفعيل فيديو توضيحي",
    videoEnabledDescription: "يمكنك إيقافه متى شئت.",
    videoDisabledDescription: "خيار اختياري لإرفاق فيديو قصير.",
    specsTitle: "المواصفات",
    specsDescription: "حدد حالة المشروع والمعلومات الأساسية التي تظهر في البطاقات.",
    projectStatus: "حالة المشروع",
    statusActive: "جاهز للنشر",
    statusPending: "مسودة",
    statusMaintenance: "مؤرشف أو مخفي",
    rooms: "الغرف",
    baths: "الحمامات",
    area: "المساحة بالمتر",
    areaPlaceholder: "مثال: 380",
    parking: "المواقف",
    parkingAvailable: "متوفر",
    parkingCountPlaceholder: "عدد المواقف",
    licenseTitle: "رخصة الإعلان",
    licenseDescription: "أدخل رقم الرخصة الآن، وارفع مستندات التوثيق عندما يكون المشروع محفوظاً.",
    verificationStatus: "حالة التوثيق",
    verificationStatusHint: "ستبقى هذه الحالة محدثة عند إرسال أو مراجعة الطلب.",
    licenseNumber: "رقم رخصة الإعلان",
    licenseNumberPlaceholder: "مثال: AD-12345",
    uploadLicense: "رفع مستندات الرخصة",
    uploadingLicense: "جارٍ رفع المستندات...",
    docsCount: (count: number) => `${count} ملف`,
    docsHint: "PDF أو صور واضحة",
    verificationSuccess: "تم إرسال طلب التوثيق بنجاح.",
    verificationSending: "جارٍ الإرسال...",
    verificationSubmit: "إرسال طلب التوثيق",
    saveFirstForVerification: "احفظ المشروع أولاً حتى تتمكن من رفع المستندات وإرسال الطلب.",
    projectVisibilityTitle: "رؤية المشروع",
    projectVisibilityDescription: "حدد إذا كان المشروع عاماً أو خاصاً، وراجع من يملك حق المشاهدة عندما يكون خاصاً.",
    privateVisibilityTitle: "خاص",
    privateVisibilityDescription: "لا يظهر إلا للجهات التي يتم السماح لها بالمشاهدة.",
    publicVisibilityTitle: "عام",
    publicVisibilityDescription: "يظهر في قنوات العميل والـ AI حسب حالة النشر.",
    revokeAccess: "إلغاء الوصول",
    hiddenEmail: "بدون بريد ظاهر",
    chatShare: "من المحادثة",
    manualShare: "يدوي",
    noViewers: "لا يوجد مشاهدون مضافون بعد. ستظهر هنا الجهات التي تفتح المشروع من مشاركة خاصة في المحادثات.",
    permitTitle: "تصريح خاص للمحادثة",
    permitDescription: "سيظهر فقط للشخص الذي فُتح له المشروع عبر مشاركة خاصة في المحادثات.",
    permitPlaceholder: "اكتب ملخصاً قصيراً يشرح هذا التصريح أو التخصيص الخاص.",
    uploadPermit: "رفع ملفات التصريح الخاص",
    permitHint: "لن يراها إلا الطرف المصرح له",
    brokerAssignmentTitle: "تكليف وسيط",
    brokerAssignmentDescription: "اختياري. يمكنك اختيار وسيط واحد لربط المشروع به من هذه الصفحة.",
    cancelAssignment: "إلغاء التكليف",
    brokerSearchPlaceholder: "ابحث باسم الوسيط",
    noBrokerResults: "لا توجد نتائج مطابقة حالياً.",
    reviewTitle: "المراجعة النهائية",
    reviewDescription: "راجع أهم البيانات قبل الحفظ النهائي.",
    notSpecified: "غير محدد",
    projectImages: "صور المشروع",
    noImages: "لا توجد صور",
    coverSuffix: " + غلاف محدد",
    displaySummary: "عرض الصور",
    specsSummary: "المواصفات",
    parkingSummary: "المواقف",
    parkingUnavailable: "غير متوفر",
    projectStatusSummary: "حالة المشروع",
    clientVisibilitySummary: "ظهور العميل",
    visibleToAi: "ظاهر في AI والعميل",
    visibleInWorkspace: "خاص داخل مساحة العمل",
    viewers: "المشاهدون المصرح لهم",
    usersCount: (count: number) => `${count} مستخدم`,
    none: "لا يوجد",
    broker: "الوسيط",
    noBroker: "بدون وسيط محدد",
    privatePermitSummary: "التصريح الخاص",
    permitAdded: "تمت إضافة بيانات خاصة للمحادثة",
    safariNotice: "تم تبسيط هذا النموذج ليتصرف بشكل أنظف في Safari أيضاً: عمود واحد، أزرار واضحة، وصور داخل أطر ثابتة.",
    saving: "جارٍ الحفظ...",
    saveSummary: "سيتم حفظ المشروع وفق الحالة المختارة والبيانات الظاهرة أعلاه.",
    stepOf: (current: number, total: number) => `الخطوة ${current} من ${total}`,
    previous: "السابق",
    next: "التالي",
    nextLabel: (label: string) => `التالي: ${label}`,
    finalReviewShort: "المراجعة النهائية",
    roomsUnit: "غرف",
    bathsUnit: "حمامات",
    parkingUnit: "موقف",
    projectViewersOne: "1 مستخدم",
  };
}

export function BasicStep({
  formState,
  setFormState,
}: {
  formState: AgPropertyFormState;
  setFormState: React.Dispatch<React.SetStateAction<AgPropertyFormState>>;
}) {
  const { locale, isRtl } = useWebLocale();
  const t = getPropertyFormText(locale);

  return (
    <SectionCard title={t.basicTitle} description={t.basicDescription}>
      <div className="grid gap-5">
        <div className="grid gap-2">
          <FieldLabel>{t.name}</FieldLabel>
          <TextInput
            value={formState.name}
            onChange={(value) => setFormState((prev) => ({ ...prev, name: value }))}
            placeholder={t.namePlaceholder}
            icon={<Building2 className="h-4 w-4" />}
          />
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <div className="grid gap-2">
            <FieldLabel>{t.price}</FieldLabel>
            <TextInput
              value={formState.price}
              onChange={(value) => setFormState((prev) => ({ ...prev, price: value }))}
              placeholder={t.pricePlaceholder}
            />
          </div>
          <div className="grid gap-2">
            <FieldLabel>{t.location}</FieldLabel>
            <TextInput
              value={formState.location}
              onChange={(value) => setFormState((prev) => ({ ...prev, location: value }))}
              placeholder={t.locationPlaceholder}
              icon={<MapPin className="h-4 w-4" />}
            />
          </div>
        </div>

        <div className="grid gap-2">
          <FieldLabel>{t.visibility}</FieldLabel>
          <div className="grid gap-3 md:grid-cols-2">
            <button
              type="button"
              onClick={() => setFormState((prev) => ({ ...prev, clientVisibility: "public" }))}
              className={`rounded-2xl border px-5 py-4 transition ${isRtl ? "text-right" : "text-left"} ${
                formState.clientVisibility === "public"
                  ? "border-emerald-500 bg-emerald-500/10 text-foreground"
                  : "border-border bg-muted/10 text-muted-foreground"
              }`}
            >
              <div className="text-sm font-black">{t.publicTitle}</div>
              <div className="mt-1 text-xs font-semibold">{t.publicDescription}</div>
            </button>
            <button
              type="button"
              onClick={() => setFormState((prev) => ({ ...prev, clientVisibility: "private" }))}
              className={`rounded-2xl border px-5 py-4 transition ${isRtl ? "text-right" : "text-left"} ${
                formState.clientVisibility === "private"
                  ? "border-amber-500 bg-amber-500/10 text-foreground"
                  : "border-border bg-muted/10 text-muted-foreground"
              }`}
            >
              <div className="text-sm font-black">{t.privateTitle}</div>
              <div className="mt-1 text-xs font-semibold">{t.privateDescription}</div>
            </button>
          </div>
        </div>
      </div>
    </SectionCard>
  );
}

export function ContentStep({
  formState,
  setFormState,
}: {
  formState: AgPropertyFormState;
  setFormState: React.Dispatch<React.SetStateAction<AgPropertyFormState>>;
}) {
  const { locale } = useWebLocale();
  const t = getPropertyFormText(locale);

  return (
    <div className="space-y-6">
      <SectionCard title={t.fullDescriptionTitle} description={t.fullDescriptionDescription}>
        <TextArea
          rows={8}
          value={formState.description}
          onChange={(value) => setFormState((prev) => ({ ...prev, description: value }))}
          placeholder={t.fullDescriptionPlaceholder}
        />
      </SectionCard>

      <SectionCard title={t.pageContentTitle} description={t.pageContentDescription}>
        <div className="grid gap-5">
          <div className="grid gap-2">
            <FieldLabel>{t.shortDescription}</FieldLabel>
            <TextArea
              rows={3}
              value={formState.shortDescription}
              onChange={(value) => setFormState((prev) => ({ ...prev, shortDescription: value }))}
              placeholder={t.shortDescriptionPlaceholder}
            />
          </div>
          <div className="grid gap-2">
            <FieldLabel>{t.amenities}</FieldLabel>
            <TextArea
              rows={4}
              value={formState.amenitiesText}
              onChange={(value) => setFormState((prev) => ({ ...prev, amenitiesText: value }))}
              placeholder={t.amenitiesPlaceholder}
            />
            <p className="text-sm text-muted-foreground">{t.amenitiesHint}</p>
          </div>
        </div>
      </SectionCard>
    </div>
  );
}

export function GalleryStep(props: {
  formState: AgPropertyFormState;
  handleImageSelection: (event: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
  inputRef: React.MutableRefObject<HTMLInputElement | null>;
  isUploading: boolean;
  moveImage: (fromIndex: number, offset: -1 | 1) => void;
  previewAspectClass: string;
  previewObjectClass: string;
  removeImage: (index: number) => void;
  setCoverImageKey: (nextCoverImageKey: string | null) => void;
  setFormState: React.Dispatch<React.SetStateAction<AgPropertyFormState>>;
  uploadError: string | null;
}) {
  const { locale, isRtl } = useWebLocale();
  const t = getPropertyFormText(locale);
  const galleryDisplayOptions = getGalleryDisplayOptions(locale);
  const galleryAspectOptions = getGalleryAspectOptions(locale);

  return (
    <div className="space-y-6">
      <SectionCard title={t.galleryTitle} description={t.galleryDescription}>
        <div className="space-y-4">
          <input
            ref={props.inputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(event) => void props.handleImageSelection(event)}
          />
          <UploadTile
            title={props.isUploading ? t.uploadingImages : t.addImages}
            subtitle={t.uploadedImages(props.formState.images.length)}
            onClick={() => props.inputRef.current?.click()}
            icon={<ImagePlus className="h-5 w-5" />}
            disabled={props.isUploading}
          />

          {props.uploadError ? (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
              {props.uploadError}
            </div>
          ) : null}

          {props.formState.images.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2">
              {props.formState.images.map((image, index) => {
                const isCover = props.formState.coverImageKey === image.key;
                return (
                  <div key={`${image.key}-${index}`} className="rounded-xl border border-border bg-card p-3">
                    <div className={["overflow-hidden rounded-lg border border-border bg-muted/20", props.previewAspectClass].join(" ")}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={image.url}
                        alt={image.name}
                        className={`h-full w-full ${props.previewObjectClass}`}
                      />
                    </div>
                    <div className={`mt-3 flex items-center justify-between gap-3 ${isRtl ? "" : "flex-row-reverse"}`}>
                      <div className={isRtl ? "min-w-0 text-right" : "min-w-0 text-left"}>
                        <div className="truncate text-[13px] font-black text-foreground">{image.name}</div>
                        <div className="mt-1 text-xs font-semibold text-muted-foreground">
                          {isCover ? t.currentCover : t.imageNumber(index)}
                        </div>
                      </div>
                      {isCover ? (
                        <span className="rounded-full border border-emerald-500/25 bg-emerald-500/10 px-3 py-1 text-[11px] font-bold text-emerald-300">
                          {t.cover}
                        </span>
                      ) : null}
                    </div>
                    <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
                      <button
                        type="button"
                        onClick={() => props.setCoverImageKey(image.key)}
                        className="rounded-md border border-border bg-muted/20 px-3 py-2 text-xs font-bold text-foreground transition hover:border-foreground/30"
                      >
                        {t.cover}
                      </button>
                      <button
                        type="button"
                        onClick={() => props.moveImage(index, -1)}
                        disabled={index === 0}
                        className="rounded-md border border-border bg-muted/20 px-3 py-2 text-xs font-bold text-foreground transition hover:border-foreground/30 disabled:opacity-40"
                      >
                        {t.moveUp}
                      </button>
                      <button
                        type="button"
                        onClick={() => props.moveImage(index, 1)}
                        disabled={index === props.formState.images.length - 1}
                        className="rounded-md border border-border bg-muted/20 px-3 py-2 text-xs font-bold text-foreground transition hover:border-foreground/30 disabled:opacity-40"
                      >
                        {t.moveDown}
                      </button>
                      <button
                        type="button"
                        onClick={() => props.removeImage(index)}
                        className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-bold text-rose-700 transition hover:border-rose-300"
                      >
                        {t.remove}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-border bg-muted/20 px-4 py-8 text-center text-sm font-semibold text-muted-foreground">
              {t.uploadImagesFirst}
            </div>
          )}
        </div>
      </SectionCard>

      <SectionCard title={t.galleryStyleTitle} description={t.galleryStyleDescription}>
        <div className="grid gap-5 md:grid-cols-2">
          <div className="grid gap-2">
            <FieldLabel>{t.displayMode}</FieldLabel>
            <select
              value={props.formState.galleryDisplayMode}
              onChange={(event) =>
                props.setFormState((prev) => ({
                  ...prev,
                  galleryDisplayMode: event.target.value as AgPropertyFormState["galleryDisplayMode"],
                }))
              }
              className="min-h-[54px] w-full rounded-2xl border border-border bg-muted/20 px-4 py-3 text-base font-semibold text-foreground outline-none transition focus:border-ring focus:bg-card"
            >
              {galleryDisplayOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div className="grid gap-2">
            <FieldLabel>{t.frameRatio}</FieldLabel>
            <select
              value={props.formState.galleryAspectRatio}
              onChange={(event) =>
                props.setFormState((prev) => ({
                  ...prev,
                  galleryAspectRatio: event.target.value as AgPropertyFormState["galleryAspectRatio"],
                }))
              }
              className="min-h-[54px] w-full rounded-2xl border border-border bg-muted/20 px-4 py-3 text-base font-semibold text-foreground outline-none transition focus:border-ring focus:bg-card"
            >
              {galleryAspectOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <button
          type="button"
          onClick={() => props.setFormState((prev) => ({ ...prev, video: prev.video ? null : "mock-video.mp4" }))}
          className={`mt-5 flex w-full items-center justify-between rounded-2xl border border-stone-200 bg-stone-50 px-4 py-4 transition hover:border-stone-400 ${isRtl ? "text-right" : "text-left"}`}
        >
          <div className={isRtl ? "text-right" : "text-left"}>
            <div className="text-sm font-black text-foreground">
              {props.formState.video ? t.videoEnabled : t.videoDisabled}
            </div>
            <div className="mt-1 text-xs font-semibold text-muted-foreground">
              {props.formState.video ? t.videoEnabledDescription : t.videoDisabledDescription}
            </div>
          </div>
          <Video className={`h-5 w-5 ${props.formState.video ? "text-emerald-300" : "text-muted-foreground"}`} />
        </button>
      </SectionCard>
    </div>
  );
}

export function SpecsStep(props: {
  adLicenseLabel: string;
  adLicenseTone: string;
  formState: AgPropertyFormState;
  handleLicenseFiles: (event: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
  handleLicenseSubmit: () => Promise<void>;
  isLicenseUploading: boolean;
  licenseDocs: UploadedFileReference[];
  licenseError: string | null;
  licenseInputRef: React.MutableRefObject<HTMLInputElement | null>;
  licenseSubmitted: boolean;
  licenseSubmitting: boolean;
  propertyId?: string;
  setFormState: React.Dispatch<React.SetStateAction<AgPropertyFormState>>;
  setLicenseDocs: React.Dispatch<React.SetStateAction<UploadedFileReference[]>>;
}) {
  const { locale, isRtl } = useWebLocale();
  const t = getPropertyFormText(locale);

  return (
    <div className="space-y-6">
      <SectionCard title={t.specsTitle} description={t.specsDescription}>
        <div className="grid gap-5">
          <div className="grid gap-2">
            <FieldLabel>{t.projectStatus}</FieldLabel>
            <select
              value={props.formState.status}
              onChange={(event) => props.setFormState((prev) => ({ ...prev, status: event.target.value }))}
              className="min-h-[54px] w-full rounded-2xl border border-border bg-muted/20 px-4 py-3 text-base font-semibold text-foreground outline-none transition focus:border-ring focus:bg-card"
            >
              <option value="active">{t.statusActive}</option>
              <option value="pending">{t.statusPending}</option>
              <option value="maintenance">{t.statusMaintenance}</option>
            </select>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            <div className="grid gap-2">
              <FieldLabel>{t.rooms}</FieldLabel>
              <TextInput
                type="number"
                value={props.formState.rooms}
                onChange={(value) => props.setFormState((prev) => ({ ...prev, rooms: value }))}
                placeholder="0"
              />
            </div>
            <div className="grid gap-2">
              <FieldLabel>{t.baths}</FieldLabel>
              <TextInput
                type="number"
                value={props.formState.baths}
                onChange={(value) => props.setFormState((prev) => ({ ...prev, baths: value }))}
                placeholder="0"
              />
            </div>
            <div className="grid gap-2">
              <FieldLabel>{t.area}</FieldLabel>
              <TextInput
                value={props.formState.area}
                onChange={(value) => props.setFormState((prev) => ({ ...prev, area: value }))}
                placeholder={t.areaPlaceholder}
              />
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-muted/20 p-4">
            <div className={`mb-3 flex items-center justify-between gap-3 ${isRtl ? "" : "flex-row-reverse"}`}>
              <span className="text-sm font-black text-foreground">{t.parking}</span>
              <label className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <span>{t.parkingAvailable}</span>
                <input
                  type="checkbox"
                  checked={props.formState.hasParking}
                  onChange={(event) =>
                    props.setFormState((prev) => ({
                      ...prev,
                      hasParking: event.target.checked,
                      parkingSpaces: event.target.checked ? prev.parkingSpaces : "",
                    }))
                  }
                  className="h-4 w-4 accent-stone-900"
                />
              </label>
            </div>
            <TextInput
              type="number"
              value={props.formState.parkingSpaces}
              onChange={(value) => props.setFormState((prev) => ({ ...prev, parkingSpaces: value }))}
              placeholder={t.parkingCountPlaceholder}
              disabled={!props.formState.hasParking}
            />
          </div>
        </div>
      </SectionCard>

      <SectionCard title={t.licenseTitle} description={t.licenseDescription}>
        <div className="space-y-4">
          <div className="rounded-2xl border border-border bg-muted/20 p-4">
            <div className={`mb-2 flex items-center justify-between gap-3 ${isRtl ? "" : "flex-row-reverse"}`}>
              <span className="text-sm font-black text-foreground">{t.verificationStatus}</span>
              <span className={`rounded-full border px-3 py-1 text-xs font-bold ${props.adLicenseTone}`}>
                {props.adLicenseLabel}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">{t.verificationStatusHint}</p>
          </div>

          <div className="grid gap-2">
            <FieldLabel>{t.licenseNumber}</FieldLabel>
            <TextInput
              value={props.formState.adLicenseNumber}
              onChange={(value) => props.setFormState((prev) => ({ ...prev, adLicenseNumber: value }))}
              placeholder={t.licenseNumberPlaceholder}
            />
          </div>

          {props.propertyId ? (
            <>
              <input
                ref={props.licenseInputRef}
                type="file"
                multiple
                className="hidden"
                onChange={(event) => void props.handleLicenseFiles(event)}
              />
              <UploadTile
                title={props.isLicenseUploading ? t.uploadingLicense : t.uploadLicense}
                subtitle={props.licenseDocs.length > 0 ? t.docsCount(props.licenseDocs.length) : t.docsHint}
                onClick={() => props.licenseInputRef.current?.click()}
                icon={<Upload className="h-5 w-5" />}
                disabled={props.isLicenseUploading}
              />

              {props.licenseDocs.length > 0 ? (
                <div className="space-y-2">
                  {props.licenseDocs.map((doc) => (
                    <div key={doc.key} className={`flex items-center justify-between gap-3 rounded-2xl border border-border bg-muted/20 px-4 py-3 ${isRtl ? "" : "flex-row-reverse"}`}>
                      <button
                        type="button"
                        onClick={() => props.setLicenseDocs((current) => current.filter((item) => item.key !== doc.key))}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-border bg-card text-muted-foreground transition hover:border-foreground/30 hover:text-foreground"
                      >
                        <X className="h-4 w-4" />
                      </button>
                      <div className="truncate text-sm font-bold text-foreground">{doc.name}</div>
                    </div>
                  ))}
                </div>
              ) : null}

              {props.licenseError ? (
                <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
                  {props.licenseError}
                </div>
              ) : null}
              {props.licenseSubmitted ? (
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
                  {t.verificationSuccess}
                </div>
              ) : null}

              <button
                type="button"
                onClick={() => void props.handleLicenseSubmit()}
                disabled={props.licenseSubmitting}
                className="w-full rounded-2xl border border-foreground/50 bg-foreground px-4 py-3 text-sm font-bold text-background transition hover:brightness-110 disabled:opacity-60"
              >
                {props.licenseSubmitting ? t.verificationSending : t.verificationSubmit}
              </button>
            </>
          ) : (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800">
              {t.saveFirstForVerification}
            </div>
          )}
        </div>
      </SectionCard>
    </div>
  );
}

export function SharingStep(props: {
  brokerSearch: string;
  filteredBrokers: BrokerPresence[];
  formState: AgPropertyFormState;
  handlePermitFiles: (event: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
  onRevokeViewer?: (viewerAuthUserId: string) => Promise<void> | void;
  permitInputRef: React.MutableRefObject<HTMLInputElement | null>;
  selectedBroker?: BrokerPresence;
  setBrokerSearch: React.Dispatch<React.SetStateAction<string>>;
  setFormState: React.Dispatch<React.SetStateAction<AgPropertyFormState>>;
  setSelectedBrokerId: React.Dispatch<React.SetStateAction<string | null>>;
}) {
  const { locale, isRtl } = useWebLocale();
  const t = getPropertyFormText(locale);

  return (
    <div className="space-y-6">
      <SectionCard title={t.projectVisibilityTitle} description={t.projectVisibilityDescription}>
        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => props.setFormState((prev) => ({ ...prev, clientVisibility: "private" }))}
              className={`rounded-2xl border px-4 py-4 transition ${isRtl ? "text-right" : "text-left"} ${
                props.formState.clientVisibility === "private"
                  ? "border-foreground/20 bg-foreground text-background"
                  : "border-border bg-background text-foreground hover:bg-muted"
              }`}
            >
              <div className="text-sm font-black">{t.privateVisibilityTitle}</div>
              <div className="mt-1 text-xs opacity-80">{t.privateVisibilityDescription}</div>
            </button>
            <button
              type="button"
              onClick={() => props.setFormState((prev) => ({ ...prev, clientVisibility: "public" }))}
              className={`rounded-2xl border px-4 py-4 transition ${isRtl ? "text-right" : "text-left"} ${
                props.formState.clientVisibility === "public"
                  ? "border-foreground/20 bg-foreground text-background"
                  : "border-border bg-background text-foreground hover:bg-muted"
              }`}
            >
              <div className="text-sm font-black">{t.publicVisibilityTitle}</div>
              <div className="mt-1 text-xs opacity-80">{t.publicVisibilityDescription}</div>
            </button>
          </div>

          {props.formState.clientVisibility === "private" ? (
            <div className="space-y-3">
              {props.formState.visibilityMembers.length > 0 ? (
                props.formState.visibilityMembers.map((viewer) => (
                  <div
                    key={viewer.authUserId}
                    className={`flex items-center justify-between gap-3 rounded-xl border border-border bg-background px-4 py-3 ${isRtl ? "" : "flex-row-reverse"}`}
                  >
                    <button
                      type="button"
                      disabled={!props.onRevokeViewer}
                      onClick={() => {
                        if (!props.onRevokeViewer) return;
                        void Promise.resolve(props.onRevokeViewer(viewer.authUserId)).then(() => {
                          props.setFormState((prev) => ({
                            ...prev,
                            visibilityMembers: prev.visibilityMembers.filter(
                              (entry) => entry.authUserId !== viewer.authUserId,
                            ),
                          }));
                        });
                      }}
                      className="rounded-lg border border-border bg-background px-3 py-2 text-xs font-bold text-muted-foreground transition hover:bg-muted hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {t.revokeAccess}
                    </button>
                    <div className={isRtl ? "text-right" : "text-left"}>
                      <div className="text-sm font-bold text-foreground">{viewer.name}</div>
                      <div className="mt-1 text-xs text-muted-foreground">
                        {viewer.email ?? t.hiddenEmail} · {viewer.accessSource === "chat_share" ? t.chatShare : t.manualShare}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-xl border border-dashed border-border bg-muted/20 px-4 py-6 text-center text-sm font-medium text-muted-foreground">
                  {t.noViewers}
                </div>
              )}
            </div>
          ) : null}
        </div>
      </SectionCard>

      <SectionCard title={t.permitTitle} description={t.permitDescription}>
        <div className="space-y-4">
          <TextArea
            rows={4}
            value={props.formState.privatePermitSummary}
            onChange={(value) => props.setFormState((prev) => ({ ...prev, privatePermitSummary: value }))}
            placeholder={t.permitPlaceholder}
          />

          <input
            ref={props.permitInputRef}
            type="file"
            multiple
            className="hidden"
            onChange={(event) => void props.handlePermitFiles(event)}
          />
          <UploadTile
            title={t.uploadPermit}
            subtitle={
              props.formState.privatePermitFiles.length > 0
                ? t.docsCount(props.formState.privatePermitFiles.length)
                : t.permitHint
            }
            onClick={() => props.permitInputRef.current?.click()}
            icon={<FileCheck2 className="h-5 w-5" />}
          />

          {props.formState.privatePermitFiles.length > 0 ? (
            <div className="space-y-2">
              {props.formState.privatePermitFiles.map((doc) => (
                <div key={doc.key} className={`flex items-center justify-between gap-3 rounded-2xl border border-border bg-muted/20 px-4 py-3 ${isRtl ? "" : "flex-row-reverse"}`}>
                  <button
                    type="button"
                    onClick={() =>
                      props.setFormState((prev) => ({
                        ...prev,
                        privatePermitFiles: prev.privatePermitFiles.filter((item) => item.key !== doc.key),
                      }))
                    }
                    className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-border bg-card text-muted-foreground transition hover:border-foreground/30 hover:text-foreground"
                  >
                    <X className="h-4 w-4" />
                  </button>
                  <div className="truncate text-sm font-bold text-foreground">{doc.name}</div>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </SectionCard>

      <SectionCard title={t.brokerAssignmentTitle} description={t.brokerAssignmentDescription}>
        {props.selectedBroker ? (
          <div className="rounded-2xl border border-border bg-muted/20 p-4">
            <div className={`flex items-center justify-between gap-3 ${isRtl ? "" : "flex-row-reverse"}`}>
              <button
                type="button"
                onClick={() => props.setSelectedBrokerId(null)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card text-muted-foreground transition hover:border-foreground/30 hover:text-foreground"
                title={t.cancelAssignment}
              >
                <X className="h-4 w-4" />
              </button>
              <div className={`flex items-center gap-3 ${isRtl ? "" : "flex-row-reverse"}`}>
                <div className={isRtl ? "text-right" : "text-left"}>
                  <div className="text-sm font-black text-foreground">{props.selectedBroker.name}</div>
                  <div className="mt-1 text-xs font-semibold text-muted-foreground">{props.selectedBroker.title}</div>
                </div>
                <BrokerAvatar
                  avatarImage={props.selectedBroker.avatarImage}
                  avatarLabel={props.selectedBroker.avatarLabel}
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="relative">
              <input
                type="text"
                value={props.brokerSearch}
                onChange={(event) => props.setBrokerSearch(event.target.value)}
                placeholder={t.brokerSearchPlaceholder}
                className={`min-h-[54px] w-full rounded-2xl border border-border bg-muted/20 px-4 py-3 text-base font-semibold text-foreground outline-none transition placeholder:text-muted-foreground focus:border-ring focus:bg-card ${isRtl ? "pr-11 text-right" : "pl-11 text-left"}`}
              />
              <Search className={`pointer-events-none absolute top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400 ${isRtl ? "right-4" : "left-4"}`} />
            </div>
            {props.filteredBrokers.length > 0 ? (
              <div className="grid gap-2">
                {props.filteredBrokers.map((broker) => (
                  <button
                    key={broker.id}
                    type="button"
                    onClick={() => {
                      props.setSelectedBrokerId(broker.id);
                      props.setBrokerSearch("");
                    }}
                    className={`flex items-center justify-between gap-3 rounded-2xl border border-border bg-muted/20 px-4 py-3 transition hover:border-foreground/30 hover:bg-card ${isRtl ? "text-right" : "flex-row-reverse text-left"}`}
                  >
                    <div className={`flex items-center gap-3 ${isRtl ? "" : "flex-row-reverse"}`}>
                      <div className={isRtl ? "text-right" : "text-left"}>
                        <div className="text-sm font-black text-foreground">{broker.name}</div>
                        <div className="mt-1 text-xs font-semibold text-muted-foreground">{broker.title}</div>
                      </div>
                      <BrokerAvatar avatarImage={broker.avatarImage} avatarLabel={broker.avatarLabel} />
                    </div>
                    <CheckCircle2 className="h-4 w-4 text-stone-300" />
                  </button>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-border bg-muted/20 px-4 py-6 text-center text-sm font-semibold text-muted-foreground">
                {t.noBrokerResults}
              </div>
            )}
          </div>
        )}
      </SectionCard>
    </div>
  );
}

export function ReviewStep(props: {
  formState: AgPropertyFormState;
  savePending: boolean;
  selectedBroker?: BrokerPresence;
  setShowSafetyConfirm: React.Dispatch<React.SetStateAction<boolean>>;
  submitLabel: string;
}) {
  const { locale, isRtl } = useWebLocale();
  const t = getPropertyFormText(locale);
  const galleryDisplayOptions = getGalleryDisplayOptions(locale);
  const galleryAspectOptions = getGalleryAspectOptions(locale);

  return (
    <div className="space-y-6">
      <SectionCard title={t.reviewTitle} description={t.reviewDescription}>
        <div className="grid gap-3">
          <ReviewRow label={t.name} value={props.formState.name || t.notSpecified} />
          <ReviewRow label={t.price} value={props.formState.price || t.notSpecified} />
          <ReviewRow label={t.location} value={props.formState.location || t.notSpecified} />
          <ReviewRow label={t.shortDescription} value={props.formState.shortDescription || t.notSpecified} />
          <ReviewRow
            label={t.projectImages}
            value={
              props.formState.images.length > 0
                ? `${props.formState.images.length}${locale === "ar" ? " صورة" : ""}${props.formState.coverImageKey ? t.coverSuffix : ""}`
                : t.noImages
            }
          />
          <ReviewRow
            label={t.displaySummary}
            value={`${galleryDisplayOptions.find((option) => option.value === props.formState.galleryDisplayMode)?.label ?? galleryDisplayOptions[0]?.label ?? ""} / ${galleryAspectOptions.find((option) => option.value === props.formState.galleryAspectRatio)?.label ?? galleryAspectOptions[1]?.label ?? ""}`}
          />
          <ReviewRow
            label={t.specsSummary}
            value={`${props.formState.rooms || "0"} ${t.roomsUnit} • ${props.formState.baths || "0"} ${t.bathsUnit} • ${props.formState.area || "0"} m²`}
          />
          <ReviewRow
            label={t.parkingSummary}
            value={props.formState.hasParking ? `${props.formState.parkingSpaces || t.notSpecified} ${t.parkingUnit}` : t.parkingUnavailable}
          />
          <ReviewRow label={t.projectStatusSummary} value={props.formState.status} />
          <ReviewRow
            label={t.clientVisibilitySummary}
            value={props.formState.clientVisibility === "public" ? t.visibleToAi : t.visibleInWorkspace}
          />
          <ReviewRow
            label={t.viewers}
            value={
              props.formState.visibilityMembers.length > 0
                ? props.formState.visibilityMembers.length === 1 && locale !== "ar"
                  ? t.projectViewersOne
                  : t.usersCount(props.formState.visibilityMembers.length)
                : t.none
            }
          />
          <ReviewRow
            label={t.broker}
            value={props.selectedBroker ? props.selectedBroker.name : t.noBroker}
          />
          <ReviewRow
            label={t.privatePermitSummary}
            value={
              props.formState.privatePermitSummary || props.formState.privatePermitFiles.length > 0
                ? t.permitAdded
                : t.none
            }
          />
        </div>
      </SectionCard>

      <section className="rounded-[28px] border border-border bg-card p-6 text-foreground shadow-[0_16px_44px_rgba(0,0,0,0.28)]">
        <div className={`flex items-start gap-3 rounded-2xl border border-border bg-card/40 p-4 ${isRtl ? "text-right" : "text-left"}`}>
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-amber-300" />
          <p className="text-sm leading-6 text-muted-foreground">
            {t.safariNotice}
          </p>
        </div>

        <button
          type="button"
          onClick={() => props.setShowSafetyConfirm(true)}
          disabled={props.savePending}
          className="mt-5 w-full rounded-2xl bg-foreground px-4 py-4 text-base font-black text-background transition hover:brightness-110 disabled:opacity-60"
        >
          {props.savePending ? t.saving : props.submitLabel}
        </button>

        <div className={`mt-4 flex items-center gap-2 text-sm text-muted-foreground ${isRtl ? "" : "flex-row-reverse justify-end"}`}>
          <Check className="h-4 w-4" />
          {t.saveSummary}
        </div>
      </section>
    </div>
  );
}

export function StepNavigation({
  activeStepSummary,
  currentStepIndex,
  isLastStep,
  setCurrentStepIndex,
}: {
  activeStepSummary: string;
  currentStepIndex: number;
  isLastStep: boolean;
  setCurrentStepIndex: React.Dispatch<React.SetStateAction<number>>;
}) {
  const { locale, isRtl } = useWebLocale();
  const t = getPropertyFormText(locale);
  const stepDefinitions = getStepDefinitions(locale);

  return (
    <>
      <section className="rounded-[28px] border border-border bg-card p-5 shadow-[0_12px_40px_rgba(0,0,0,0.2)] sm:p-6">
        <div className={`mb-5 flex items-center justify-between gap-4 ${isRtl ? "" : "flex-row-reverse"}`}>
          <div className={isRtl ? "text-right" : "text-left"}>
            <div className="text-sm font-black text-foreground">
              {t.stepOf(currentStepIndex + 1, stepDefinitions.length)}
            </div>
            <div className="mt-1 text-sm text-muted-foreground">{activeStepSummary}</div>
          </div>
          <div className="inline-flex h-12 min-w-12 items-center justify-center rounded-full bg-foreground px-3 text-sm font-black text-background">
            {currentStepIndex + 1}
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-3 lg:grid-cols-6">
          {stepDefinitions.map((step, index) => {
            const isActive = index === currentStepIndex;
            const isCompleted = index < currentStepIndex;
            return (
              <button
                key={step.key}
                type="button"
                onClick={() => setCurrentStepIndex(index)}
                className={`rounded-xl border px-3 py-3 transition ${isRtl ? "text-right" : "text-left"} ${
                  isActive
                    ? "border-border-foreground/45 bg-foreground/10 text-foreground"
                    : isCompleted
                      ? "border-emerald-500/25 bg-emerald-500/10 text-emerald-300"
                      : "border-border bg-muted/20 text-foreground hover:border-border hover:bg-muted/40"
                }`}
              >
                <div className="text-xs font-black">{step.title}</div>
                <div className={`mt-1 text-[11px] ${isActive ? "text-foreground" : "text-muted-foreground"}`}>
                  {step.summary}
                </div>
              </button>
            );
          })}
        </div>
      </section>

      <section className="rounded-3xl border border-border bg-card p-4 md:p-6 shadow-xl shadow-black/[0.02]">
        <div className={`flex items-center justify-between gap-6 ${isRtl ? "" : "flex-row-reverse"}`}>
          <button
            type="button"
            onClick={() => setCurrentStepIndex((current) => Math.max(0, current - 1))}
            disabled={currentStepIndex === 0}
            className="group inline-flex items-center justify-center gap-2 rounded-2xl border border-border bg-muted/10 px-8 py-4 text-[13px] font-black uppercase tracking-[0.2em] text-foreground transition-all hover:bg-muted active:scale-95 disabled:pointer-events-none disabled:opacity-30"
          >
            {isRtl ? <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" /> : <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />}
            {t.previous}
          </button>

          <div className="hidden text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground/40 lg:block">
            {isLastStep ? t.finalReviewShort : t.nextLabel(stepDefinitions[currentStepIndex + 1]?.title ?? "")}
          </div>

          <button
            type="button"
            onClick={() => setCurrentStepIndex((current) => Math.min(stepDefinitions.length - 1, current + 1))}
            disabled={isLastStep}
            className="group inline-flex items-center justify-center gap-2 rounded-2xl bg-foreground px-10 py-4 text-[13px] font-black uppercase tracking-[0.2em] text-background shadow-lg shadow-black/10 transition-all hover:opacity-90 active:scale-95 disabled:pointer-events-none disabled:opacity-30"
          >
            {t.next}
            {isRtl ? <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" /> : <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />}
          </button>
        </div>
      </section>
    </>
  );
}
