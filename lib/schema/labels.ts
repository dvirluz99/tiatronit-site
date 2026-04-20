// Hebrew labels for the admin dashboard UI.
// Keys mirror Zod schema field names; values are what the editor sees.

export const LABELS = {
  show: {
    _entity: 'הצגה',
    _entityPlural: 'הצגות',
    id: 'מזהה (ID)',
    slug: 'כתובת URL ידידותית (אופציונלי)',
    title: 'שם ההצגה',
    category: 'קהל יעד',
    priority: 'חשיבות תצוגה',
    mainImg: 'תמונה ראשית',
    presentationFormats: 'גרסאות של ההצגה (למשל: תיאטרון בובות, הצגת יחיד)',
    presentationFormatsItem: {
      image: 'תמונת הגרסה',
      caption: 'תיאור הגרסה',
    },
    gallery: 'גלריית תמונות',
    description: 'תיאור ההצגה',
    audience: 'קהל היעד (טקסט חופשי)',
    creatorName: 'שם היוצרת',
    creatorIntro: 'מילות פתיחה על היוצרת',
    creatorCredentials: 'רקע מקצועי',
    socialProof: 'היכן ההצגה הוצגה',
    phone: 'טלפון ליצירת קשר',
    video: {
      _section: 'סרטונים',
      trailers: 'טריילרים (מזהי YouTube)',
      clips: 'קטעים מההצגה',
      customerClips: 'עדויות לקוחות',
      clipItem: {
        youtubeId: 'מזהה YouTube',
        caption: 'כותרת',
      },
    },
    recommendationIds: 'המלצות מקושרות',
  },

  collection: {
    _entity: 'אוסף / כרטיס',
    _entityPlural: 'אוספים',
    id: 'מזהה (ID)',
    slug: 'כתובת URL ידידותית (אופציונלי)',
    type: 'סוג הכרטיס',
    typeOptions: {
      single: 'קישור להצגה יחידה',
      collection: 'אוסף של כמה הצגות',
    },
    title: 'כותרת',
    description: 'תיאור קצר',
    extendedHtml: 'תוכן מורחב (HTML)',
    mainImg: 'תמונה ראשית',
    priority: 'חשיבות תצוגה',
    linkedShowId: 'הצגה מקושרת',
    showIds: 'הצגות באוסף',
    gallery: 'גלריית תמונות',
    videos: 'סרטונים (מזהי YouTube)',
    recommendationIds: 'המלצות מקושרות',
  },

  recommendation: {
    _entity: 'המלצה',
    _entityPlural: 'המלצות',
    id: 'מזהה (ID)',
    recommenderName: 'שם הממליץ/ה',
    recommenderRole: 'תפקיד / מוסד',
    contactInfo: 'פרטי יצירת קשר',
    date: 'תאריך ההמלצה',
    content: 'תוכן ההמלצה (HTML)',
    linkedTarget: {
      _section: 'ההמלצה מתייחסת אל',
      kind: 'סוג',
      kindOptions: {
        show: 'הצגה',
        collection: 'אוסף',
      },
      id: 'בחר/י פריט',
      none: 'ללא קישור (המלצה כללית)',
    },
  },

  pageAbout: {
    _entity: 'עמוד "קצת עלי"',
    title: 'כותרת',
    mainImage: 'תמונה ראשית',
    mainDescription: 'תיאור ראשי',
    testimonials: 'ציטוטים מומלצים',
    testimonialItem: {
      author: 'שם הממליצ/ה',
      fromShowTitle: 'מאיזו הצגה',
      showId: 'הצגה מקושרת',
      recommendationId: 'המלצה מקושרת',
      text: 'טקסט הציטוט',
    },
  },

  pagePuppets: {
    _entity: 'עמוד "עולם הבובות"',
    title: 'כותרת',
    subtitle: 'כותרת משנה',
    paragraph: 'פסקת הסבר',
    youtubeVideoId: 'סרטון YouTube (מזהה)',
    infoSectionTitle: 'כותרת אזור העקרונות',
    infoListTitle: 'כותרת רשימת העקרונות',
    infoList: 'רשימת עקרונות',
    infoListItem: {
      title: 'כותרת עקרון',
      text: 'הסבר',
    },
    summaryQuote: 'ציטוט סיום',
  },

  homeGallery: {
    _entity: 'גלריה בעמוד הבית',
    images: 'תמונות הגלריה',
  },

  common: {
    categoryOptions: {
      kids: 'ילדים',
      youth: 'בני נוער',
      adults: 'מבוגרים',
    },
    priorityOptions: {
      featured: 'מומלץ (הבלטה)',
      normal: 'רגיל',
    },
    actions: {
      save: 'שמירה',
      cancel: 'ביטול',
      delete: 'מחיקה',
      add: 'הוספה',
      edit: 'עריכה',
      preview: 'תצוגה מקדימה',
      uploadImage: 'העלאת תמונה',
    },
    validation: {
      required: 'שדה חובה',
      invalidUrl: 'קישור לא תקין',
      invalidYoutubeId: 'מזהה YouTube לא תקין',
    },
  },
} as const;
