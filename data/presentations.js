



export const homePageStructure = [
    {
        id: "card_1",
        type: "single",
        importance: 'recommended',
        mainImg: "AllDir/חוהלה משואה לתקומה/huale_shoah_tkuma.jpg",
        title: "חוהלה משואה לתקומה",
        linkedShowId: "p1"
    },
    {
        id: "card_2",
        type: "single",
        title: "את אחי אנכי מבקש",
        mainImg: "AllDir/את אחי אנכי מבקש/et_ahay_anochy.jpg",
        linkedShowId: "p2"
    },
    {
        id: "card_3",
        type: "collection",
        title: "הצגות והרצאות לבני נוער", // כותרת לכריסייה
        mainImg: "AllDir/הצגות והרצאות לבני נוער/potho_for_gift.jpg", // תמונה ראשית לאוסף
        description: "סדנאות מיוחדות לנוער המתבגר",
        // כאן הקסם: הרשימה מכילה IDs של הצגות שקיימות במאגר
        contains: ['p14']
    },
    {
        id: "card_4",
        type: "collection",
        title: "הצגות לילדים", // כותרת לכריסייה
        mainImg: 'AllDir/הצגות לילדים/potho_for_gift_yeladim.jpg', // תמונה ראשית לאוסף
        description: "ההצגות לילדים משלבות רכות שמחה והקשבה",
        
        // כאן הקסם: הרשימה מכילה IDs של הצגות שקיימות במאגר
        contains: ['p4','p5','p6','p7','p8','p9']
    },
    {
        id: "card_5",
        type: "collection",
        title: "סדנאות בובהתרפיה לגיל השלישי", // כותרת לכריסייה
        mainImg: 'AllDir/סדנאות לגיל השלישי/potho_for_gift_gil_ashlyshi.jpeg', // תמונה ראשית לאוסף
        description: "הצגות אלה ממש מעבירות חוויות עוצמתיות לגיל השלישי מומלץ מאד",

        collectionVideo: [`<iframe class= "vidue_iframe" src="https://www.youtube.com/embed/KRCoCcJ3eU8?si=hFiJX1yJHLnHYxLV" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>`],

        extraContent: `
            <h3>למה דווקא בובהתרפיה לגיל השלישי?</h3>
            <p>הסדנאות שלנו מותאמות במיוחד לצרכים הרגשיים והקוגניטיביים של הגיל השלישי.</p>
            <p>הבובה מאפשרת גישה רכה ועוקפת הגנות לנושאים כמו בדידות, זיכרון וקשר בין-דורי.</p>
        `,
        
        // כאן הקסם: הרשימה מכילה IDs של הצגות שקיימות במאגר
        contains: ['p10', 'p11', 'p12']
    },
    {
        id: "card_6",
        type: "collection",
        title: "סדנאות בובהתרפיה לבעלי צרכים מיוחדים", // כותרת לכריסייה
        mainImg: 'AllDir/תמונות כלליות והוספות/image9.jpg', // תמונה ראשית לאוסף
        description: "בעלי הצרכים המיוחדים מתרגשים ומשתתפים בחום ממש",
        
        // כאן הקסם: הרשימה מכילה IDs של הצגות שקיימות במאגר
        contains: []
    },
    {
        id: "card_7",
        type: "collection",
        title: "סדנאות בובהתרפיה לגננות ולצוותי גיל הרך", // כותרת לכריסייה
        mainImg: "AllDir/סדנאות בובהתרפיה לגננות ולצוותי גיל הרך/logo_gor_gananot_gil_arach.jpg", // תמונה ראשית לאוסף
        description: "אוסף סדנאות המשלבות את ההצגות המובחרות שלנו",
        
        // כאן הקסם: הרשימה מכילה IDs של הצגות שקיימות במאגר
        contains: ["p13",]
    },
    {
        id: "card_8",
        type: "collection",
        title: "סדנאות בובהתרפיה להורים לילדי גנים ובתי ספר", // כותרת לכריסייה
        mainImg: "AllDir/סדנאות והרצאות להורים לילדי גנים ובתי ספר/logo_for_orym_leyeladim.jpg", // תמונה ראשית לאוסף
        description: "אוסף סדנאות המשלבות את ההצגות המובחרות שלנו",

        collectionVideo: [`<iframe class= "vidue_iframe" src="https://www.youtube.com/embed/0xYlGfS9AGw?si=_66qwSLdmZSFrigF" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>`],
        
        // כאן הקסם: הרשימה מכילה IDs של הצגות שקיימות במאגר
        contains: ["p3",]
    },

]


export const showData = {

    p1:{
        title: "חוהל'ה משואה לתקומה",
        id: "p1",
        type: 'single',
        category: "adults",
        linkRec: ['rec3', 'rec4', 'rec5', 'rec6', 'rec7'],
        importance: 'recommended',
        mainImg: "AllDir/חוהלה משואה לתקומה/huale_shoah_tkuma.jpg",
        showData: {
            title: "חוהל'ה – משואה לתקומה",
            description: "סיפורה האמיתי, המופלא והמרגש של חוהל'ה ובעלה זלמן, שכל משפחתו נרצחה בשואה. זהו סיפור על אמונה ותקוה, המובא לקהל בעזרת בובות תיאטרון ומצגת מרגשת.",
            creatorIntro: "ההצגה מועברת ע\"י נכדתם,",
            creatorName: "רונית לוז",
            creatorCredentials: "יועצת חינוכית, מטפלת CBT, ויוצרת תיאטרונית – תיאטרון בובות רגשי-חברתי.",
            audience: "מתאים לכל האוכלוסיה גדולים וקטנים!",
            phone: "0542043429",
            socialProof: "ההצגה הועברה במועדון עמך לניצולי שואה... החל מכיתה ד'"
            },
        vidue: {
            Trailer:[ `<iframe class= "vidue_iframe" src="https://www.youtube.com/embed/7bcTavMpMZM?si=Hu5PlHwgkJYKzE7Z" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>`,
                        `<iframe class= "vidue_iframe" src="https://www.youtube.com/embed/iHc3BcP99hY?si=szGNnb8lH4wRzyy_" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>`,
            ],
            customers:[
                { src: '/AllDir/חוהלה משואה לתקומה/customers1.mp4', caption: 'מנהלת חט"ב אבן שמואל' },

            ],
        },
        arrayGallery: [
                    {img:"AllDir/חוהלה משואה לתקומה/image1.jpeg",},
                    {img:"AllDir/חוהלה משואה לתקומה/image2.jpeg",},
                    {img:"AllDir/חוהלה משואה לתקומה/image3.jpeg",},
                    {img:"AllDir/חוהלה משואה לתקומה/image4.jpeg",},
                    {img:"AllDir/חוהלה משואה לתקומה/image5.jpeg",},
                    {img:"AllDir/חוהלה משואה לתקומה/image6.jpeg",},
                    {img:"AllDir/חוהלה משואה לתקומה/image7.jpeg",},
                    {img:"AllDir/חוהלה משואה לתקומה/image8.jpeg",},
                    {img:"AllDir/חוהלה משואה לתקומה/image9.jpeg",},
                    {img:"AllDir/חוהלה משואה לתקומה/image10.jpeg",},
                    {img:"AllDir/חוהלה משואה לתקומה/image11.jpg",},
                    {img:"AllDir/חוהלה משואה לתקומה/image12.jpg",},
                    {img:"AllDir/חוהלה משואה לתקומה/image13.jpg",},
                    {img:"AllDir/חוהלה משואה לתקומה/image14.jpg",},
                    {img:"AllDir/חוהלה משואה לתקומה/image15.jpg",},
        ],
        },

    p2: {
        title: "את אחי אנכי מבקש",
        id: "p2",
        type: 'single',
        category: "adults",
        linkRec: [],
        importance: 'accustomed',
        mainImg: "AllDir/את אחי אנכי מבקש/et_ahay_anochy.jpg",
        showData: {
            title: "את אחי אנכי מבקש",
            description: "זו הצגה חדשה ומרגשת על רקע מסך הברזל ותקומתה של מדינת ישראל. זהו סיפורם האמיתי של שני אחים יוסף ואהרון שהוריהם נרצחו בשואה. יוסף הצליח לעלות לארץ בעוד אהרון הוגלה לסיביר ונידון לעשר שנות עבודת פרך. יוסף הפך עולמות כדי לחלץ את אחיו מהשבי.",
            creatorIntro: " ההצגה מלווה במצגת מרגשת ובתיאטרון בובות רגשי-חברתי ההצגה מועברת ע\"י נכדתם,",
            creatorName: "רונית לוז",
            creatorCredentials: "יועצת חינוכית, מטפלת CBT, ויוצרת תיאטרונית – תיאטרון בובות רגשי-חברתי.",
            audience: "מתאים לכל הציבור ולכל הגילאים!",
            phone: "0542043429",
            socialProof: 'תהיו הראשונים להזמין 😍'
        },
        vidue: {
            Trailer: [],
            customers:[],
        },
        arrayGallery: [
                    {img:"AllDir/את אחי אנכי מבקש/image1.jpg"},
                    {img:"AllDir/את אחי אנכי מבקש/image2.jpg"},
                    {img:"AllDir/את אחי אנכי מבקש/image3.jpg"},
                    {img:"AllDir/תמונות כלליות והוספות/image7.jpg"}
        ],
        },
    
    p3: {
        title: 'נעם עולה לכיתה א',
        id: 'p3',
        type: 'single',
        category: "adults",
        linkRec: ['rec2'],
        importance: 'accustomed',
        mainImg: 'AllDir/סדנאות והרצאות להורים לילדי גנים ובתי ספר/נעם עולה לכיתה א/logo_noam_ole_cita.jpg',
        showData: {
            title: "נעם עולה לכיתה א'",
            description: "נעם מתרגש וחושש . אמא מנסה לעודד אותו ואז הוא פוגש את חבריו התוכי, הכלב, הכבשה והצב. כל חיה עוזרת לנעם להתגבר על החששות בעזרת עצות וחשיבה חיובית",
            creatorIntro: "ההצגה מועברת ע\"י,",
            creatorName: "רונית לוז",
            creatorCredentials: "יועצת חינוכית, מטפלת CBT, ויוצרת תיאטרונית – תיאטרון בובות רגשי-חברתי.",
            audience: "מתאים להורים לילדי גנים ובתי ספר!",
            phone: "0542043429",
            socialProof: "ההצגה הועברה להורים רבים"
            },
        vidue:{
            Trailer:[`<iframe class= "vidue_iframe" src="https://www.youtube.com/embed/97jA2ir7Uu0?si=iAIGNEGyzw2-YC6z" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>`,

            ],
            customers:[],
            },
        arrayGallery: [
             {img:'AllDir/סדנאות והרצאות להורים לילדי גנים ובתי ספר/נעם עולה לכיתה א/imge1.jpg'},
             {img:'AllDir/סדנאות והרצאות להורים לילדי גנים ובתי ספר/נעם עולה לכיתה א/imge2.jpg'},
             {img:'AllDir/סדנאות והרצאות להורים לילדי גנים ובתי ספר/נעם עולה לכיתה א/imge3.jpg'},
             {img:'AllDir/סדנאות והרצאות להורים לילדי גנים ובתי ספר/imge1.jpg'},
             {img:'AllDir/סדנאות והרצאות להורים לילדי גנים ובתי ספר/imge2.jpg'},
        ]
        },
    p4:{
       title: 'המפתח מתחת לכרית',
       id: 'p4',
       type: 'single',
       category: "kids",
       linkRec: [],
       importance: 'accustomed',
       mainImg: 'AllDir/הצגות לילדים/המפתח מתחת לכרית/logo_for_hmaftech.jpg',
       showData: {
            title: 'המפתח מתחת לכרית',
            description: 'ההצגה מבוססת על אגדת חז"ל "דמא בן נתינה", שלא הסכים להעיר את אביו למרות הצעה גדולה מאד של מטבעות זהב, בהצגה זאת הילדים יבינה כמה חשובה מצוות כיבוד הורים',
            creatorIntro: "ההצגה מועברת ע\"י,",
            creatorName: "רונית לוז",
            creatorCredentials: "יועצת חינוכית, מטפלת CBT, ויוצרת תיאטרונית – תיאטרון בובות רגשי-חברתי.",
            audience: "מתאים לילדים מגיל 4 עד 10",
            phone: "0542043429",
            socialProof: "ההצגה הועברה בשלל גנים"
            },
        vidue:{
            Trailer:[],
            customers:[],
            },
        arrayGallery: [],
        },
    p5:{
        title: 'יוסף מוקיר שבת',
        id: 'p5',
        type: 'single',
        category: "kids",
        linkRec: [],
        importance: 'accustomed',
        mainImg: 'AllDir/הצגות לילדים/יוסף מוקיר שבת/yosef_mokir_shabat.jpg',
        showData: {
            title: 'יוסף מוקיר שבת',
            description: 'ההצגה מבוססת על אגדת חז"ל "יוסף מוקיר שבת", שהיה מכבד את השבת על ידי קניית דג, בהצגה זאת הילדים יבינה כמה חשובה מצוות השבת וכיבודה והאמנוה בפשיטות',
            creatorIntro: "ההצגה מועברת ע\"י,",
            creatorName: "רונית לוז",
            creatorCredentials: "יועצת חינוכית, מטפלת CBT, ויוצרת תיאטרונית – תיאטרון בובות רגשי-חברתי.",
            audience: "מתאים לילדים מגיל 4 עד 10",
            phone: "0542043429",
            socialProof: "ההצגה הועברה בשלל גנים"
            },
        vidue:{
            Trailer: [],
            customers:[],
        },
        arrayGallery: [],
        },
    p6:{
        title: 'כוחה של מילה',
        id: 'p6',
        type: 'single',
        category: "kids",
        linkRec: ['rec1'],
        importance: 'accustomed',
        mainImg: 'AllDir/הצגות לילדים/כוחה של מילה/logo_for_cocha_shel.jpg',
        showData: {
            title: 'כוחה של מילה',
            description: 'ההצגה מבוססת על "חיים ומוות ביד הלשון", יחד עם הבובות נלמד את הילדים איך מתמודדים עם כעס, עלבון ופחד',
            creatorIntro: "ההצגה מועברת ע\"י,",
            creatorName: "רונית לוז",
            creatorCredentials: "יועצת חינוכית, מטפלת CBT, ויוצרת תיאטרונית – תיאטרון בובות רגשי-חברתי.",
            audience: "מתאים לילדים מגיל 4 עד 10",
            phone: "0542043429",
            socialProof: "ההצגה הועברה בשלל גנים"
            },
        vidue:{Trailer:[], customers:[],},
        arrayGallery: [],
        },
    p7:{
        title: 'לקראת ימי התשובה',
        id: 'p7',
        type: 'single',
        category: "kids",
        linkRec: [],
        importance: 'accustomed',
        mainImg: 'AllDir/הצגות לילדים/לקראת ימי התשובה/logo_for_likrat_yema.jpg',
        showData: {
            title: 'לקראת ימי התשובה',
            description: 'ההצגה משלבת כלי חוסן מעולם הטיפול על אמונה תפילה וצדקה, הילדים יבינו את חשיבות ימים נוראים ויהיו מוכנים אליהם כראוי',
            creatorIntro: "ההצגה מועברת ע\"י,",
            creatorName: "רונית לוז",
            creatorCredentials: "יועצת חינוכית, מטפלת CBT, ויוצרת תיאטרונית – תיאטרון בובות רגשי-חברתי.",
            audience: "מתאים לילדים מגיל 4 עד 10",
            phone: "0542043429",
            socialProof: "ההצגה הועברה בשלל גנים"
            },
        vidue:{Trailer:[], customers:[],},
        arrayGallery: [],
        },
    p8:{
        title: 'עולה חדשה',
        id: 'p8',
        type: 'single',
        category: "kids",
        linkRec: [],
        importance: 'accustomed',
        mainImg: 'AllDir/הצגות לילדים/עולה חדשה/logo_ola_chadasha.jpg',
        showData: {
            title: 'עולה חדשה',
            description: 'ההצגה תלמד את הילדים להסתכל על חברם לגן או לכיתה בעין חיובית ויפה, להתמודד עם אכזבה וכמה חשוב לשתף את ההורים בכל דברת ההצגה מספרת את סיפורה של אילנה עולה חדשה בכיתה א',
            creatorIntro: 'ההצגה מועברת ע"י,',
            creatorName: "רונית לוז",
            creatorCredentials: "יועצת חינוכית, מטפלת CBT, ויוצרת תיאטרונית – תיאטרון בובות רגשי-חברתי.",
            audience: "מתאים לילדים מגיל 4 עד 10",
            phone: "0542043429",
            socialProof: "ההצגה הועברה בשלל גנים"
            },
        vidue:{Trailer:[], customers:[],},
        arrayGallery: [],
        },
    p9:{
        title: 'קמצא ובר קמצא',
        id: 'p9',
        type: 'single',
        category: "kids",
        linkRec: [],
        importance: 'accustomed',
        mainImg: 'AllDir/הצגות לילדים/קמצא ובר קמצא/logo_kamza.jpg',
        showData: {
            title: 'קמצא ובר קמצא',
            description: 'ההצגה מבוססת על אגדת חז"ל "קמצא ובר קמצא", בהצגה נדגים את הסיפור על ידי בובות, הילדים יקבלו מחווית הסיפור כהמ קשה שנאת חינם, ולעומת זאת כמה יפה וטובה אהבת חינם',
            creatorIntro: 'ההצגה מועברת ע"י,',
            creatorName: "רונית לוז",
            creatorCredentials: "יועצת חינוכית, מטפלת CBT, ויוצרת תיאטרונית – תיאטרון בובות רגשי-חברתי.",
            audience: "מתאים לילדים מגיל 4 עד 10",
            phone: "0542043429",
            socialProof: "ההצגה הועברה בשלל גנים"
            },
        vidue:{Trailer:[], customers:[],},
        arrayGallery: [],
        },
    p10:{
        title: 'כשהלבבות נפגשים',
        id: 'p10',
        type: 'single',
        category: "adults",
        linkRec: [],
        importance: 'accustomed',
        mainImg: 'AllDir/סדנאות לגיל השלישי/כשהלבבות נפגשים/logo_for_hlevavot.jpg',
        showData: {
            title: 'כשהלבבות נפגשים',
            description: 'מפגש פסיכודרמה שבו נקשיב נשתף ונצחק, המפגש ייפתח בנו את הרצון להקשיב אחת לשניה ולשתף וביחד נעבור סדנה מעצימה',
            creatorIntro: 'ההצגה מועברת ע"י,',
            creatorName: "רונית לוז",
            creatorCredentials: "יועצת חינוכית, מטפלת CBT, ויוצרת תיאטרונית – תיאטרון בובות רגשי-חברתי.",
            audience: "מתאים לנשים מהגיל השלישי",
            phone: "0542043429",
            socialProof: "המפגש הועבר ברחבי הארץ לקבוצות מהגיל השלישי"
            },
        vidue:{Trailer:[], customers:[],},
        arrayGallery: [],
        },
    p11:{
        title: 'אל תשליכני לעת זקנה',
        id: 'p11',
        type: 'single',
        category: "adults",
        linkRec: [],
        importance: 'accustomed',
        mainImg: 'AllDir/סדנאות לגיל השלישי/logo_for_al_tashlicheny.jpg',
        showData: {
            title: 'אל תשליכני לעת זקנה',
            description: ' באמצעות תיאטרון בובות רגשי - חברתי  אני מעלה סיטואציות בנושא הזיקנה.כמו: פרישה , זוגיות , בריאות , קשר עם ילדים ונכדים ועוד. בזכות ההצגה נשים פותחות את הלב ומשתפות בתובנות ובאתגרי הגיל.הסדנה כוללת גם שיחה עם מצגת מקצועית בנושא.',
            creatorIntro: 'ההצגה מועברת ע"י,',
            creatorName: "רונית לוז",
            creatorCredentials: "יועצת חינוכית, מטפלת CBT, ויוצרת תיאטרונית – תיאטרון בובות רגשי-חברתי.",
            audience: "מיועד לבני משפחה מטפלים ואנשי טיפול סעודי",
            phone: "0542043429",
            socialProof: "ההרצאה הועברה למטפלים ובני משפחות"
            },
        vidue:{Trailer:[], customers:[],},
        arrayGallery: [],
        },
    p12:{
        title: 'הגיל השלישי עם הפנים קדימה',
        id: 'p12',
        type: 'single',
        category: "adults",
        linkRec: ['rec9', 'rec10', 'rec11', 'rec12'],
        importance: 'accustomed',
        mainImg: 'AllDir/סדנאות לגיל השלישי/logo_for_him_hapanim_kadima.jpg',
        showData: {
            title: 'הגיל השלישי עם הפנים קדימה',
            description: 'תיאטרון בובות שמציג את החששות מהגיל ומעברי החיים, אנחנו ניגע ביחד עמוק בנפש עם הרבה רגש ושמחה, נלמד לאהוב את עצמינו ולשמוח במתנות שיש לנו',
            creatorIntro: 'ההצגה מועברת ע"י,',
            creatorName: "רונית לוז",
            creatorCredentials: "יועצת חינוכית, מטפלת CBT, ויוצרת תיאטרונית – תיאטרון בובות רגשי-חברתי.",
            audience: "מיועד לבני משפחה מטפלים ואנשי טיפול סעודי",
            phone: "0542043429",
            socialProof: "התיאטרון הועבר לנשים וגברים מהגיל השלישי"
            },
        vidue:{Trailer:[], customers:[],},
        arrayGallery: [
            {img: 'AllDir/סדנאות לגיל השלישי/imge1.JPG'},
            {img: 'AllDir/סדנאות לגיל השלישי/imge2.JPG'},
            {img: 'AllDir/סדנאות לגיל השלישי/imge3.png'},
            {img: 'AllDir/סדנאות לגיל השלישי/imge4.jpeg'},
        ],
        },
    p13:{
        title: 'השתלמות חוויתית ופרקטית לגננות ומורות',
        id: 'p13',
        type: 'single',
        category: "adults",
        linkRec: ['rec8'],
        importance: 'accustomed',
        mainImg: 'AllDir/סדנאות בובהתרפיה לגננות ולצוותי גיל הרך/logo_gor_gananot_gil_arach.jpg',
        showData: {
            title: 'השתלמות חוויתית ופרקטית לגננות ומורות',
            description: 'מחכה לנו מודל עבודה עם בובות לחיזוק החוסן הרגשי, סדנא ליצירת בובות חוסן כלי מעשי ומיידי, שילוב סיפורים ואגדות חז"ל',
            creatorIntro: 'ההצגה מועברת ע"י,',
            creatorName: "רונית לוז",
            creatorCredentials: "יועצת חינוכית, מטפלת CBT, ויוצרת תיאטרונית – תיאטרון בובות רגשי-חברתי.",
            audience: "מיועד לגננות ומורות",
            phone: "0542043429",
            socialProof: "הסדנא הועברה לגננות וצוותים"
            },
        vidue:{Trailer:['<iframe class= "vidue_iframe" src="https://www.youtube.com/embed/IROu-a1RGFg?si=P0Dg6PrmYkqX9Xet" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>',

                ],
               customers:[],
        },
        arrayGallery: [
            {img: 'AllDir/סדנאות בובהתרפיה לגננות ולצוותי גיל הרך/imge1.jpg'},
            {img: 'AllDir/סדנאות בובהתרפיה לגננות ולצוותי גיל הרך/imge2.jpg'},
            {img: 'AllDir/סדנאות בובהתרפיה לגננות ולצוותי גיל הרך/imge3.jpg'},
            {img: 'AllDir/סדנאות בובהתרפיה לגננות ולצוותי גיל הרך/imge4.jpg'},
            {img: 'AllDir/סדנאות בובהתרפיה לגננות ולצוותי גיל הרך/imge5.jpg'},
        ],
        },
    p14:{
        title: 'לילה לבן',
        id: 'p14',
        type: 'single',
        category: "youth",
        linkRec: [],
        importance: 'accustomed',
        mainImg: "AllDir/הצגות והרצאות לבני נוער/potho_for_gift.jpg",
        showData: {
            title: 'לילה לבן',
            description: 'הצגה מרגשת ועמוקה המשלבת תיאטרון בובות ושיח פתוח עם הקהל, העוסקת באורות אדומים בקשר הזוגי ובכוח הריפוי של הקשבה, חמלה ופתיחות.',
            creatorIntro: 'ההצגה מועברת ע"י,',
            creatorName: "רונית לוז",
            creatorCredentials: "יועצת חינוכית, מטפלת CBT, ויוצרת תיאטרונית – תיאטרון בובות רגשי-חברתי.",
            audience: "מיועד לבנות תיכון, אולפנות, מדרשות וחיילות",
            phone: "0542043429",
            socialProof: '',
            },
        vidue:{Trailer:[], customers:[],},
        arrayGallery: [],
        },
}

export const aboutData = {
    title: "קצת עלינו - תיאטרון בובות רגשי חברתי",
    mainDescription: `
        <p>נעים להכיר, שמי רונית לוז. אני יועצת חינוכית, מטפלת CBT ויוצרת "תיאטרונית".</p>
        <p>התיאטרון שלי נולד מתוך אהבה עמוקה לעולם הילדים והבנה בכוח המרפא של סיפור ובובה. אני מאמינה שדרך בובות ניתן להגיע ללבבות, לפתוח דלתות נעולות ולתת מילים לרגשות שקשה לבטא.</p>
        <p>בהצגות ובסדנאות שלי, אני משלבת את הידע המקצועי שלי בטיפול וייעוץ יחד עם אומנות הבובנאות, כדי ליצור חוויה שהיא גם מהנה וגם מעצימה.</p>
    `,
    mainImage: 'AllDir/תמונות כלליות והוספות/image9.jpg', // שים כאן תמונה יפה של רונית או של בובות
    
    // כרטיסיות הציטוטים הקטנות
    testimonials: [
        {
            text: "התרשמתי מאוד מהמקצועיות, הרגישות והיצירתיות של רונית לוז ומהבובות המושקעות.",
            linkRecId: 'rec1',
            fromPresention: 'כוחה של מילה',
            author: "טובה שץ, מנהלת גנים בנחל שורק"
        },
        {
            text: `ההצגה "נועם עולה לכיתה א'" היתה פשוט מקסימה!! הילדים וההורים נהנו כל כך! היו רגעים של צחוק עד דמעות, לצד דמעות של התרגשות.`,
            linkRecId: 'rec2',
            fromPresention: 'נועם עולה לכיתה א',
            author: 'רותם בר, צוות ביה"ס מושב צלפון'
        },
        {
            text: "העברת הסיפור בעזרת הבובות הייתה מוחשית מאוד ומרגשת עד דמעות. תודה שזיכית אותנו בסיפור המשפחתי.",
            linkRecId: 'rec3',
            fromPresention: 'חוהלה - משואה לתקומה',
            author: "אודליה אמסלם, רכזת חברתית אולפנה אבן שמואל"
        },
        {
            text: "השימוש בבובות ריכך את התכנים הקשים של השואה והפך את הסיפור לחי.",
            linkRecId: 'rec4',
            fromPresention: 'חוהלה - משואה לתקומה',
            author: "נורית ראובן, בית הספר ברויאר"
        },
        {
            text: "ההצגה הייתה משמעותית מאוד עבור הבנות, ואני בטוחה שרונית תהיה משמעותית לכל מוסד שיזמין אותה.",
            linkRecId: 'rec5',
            fromPresention: 'חוהלה - משואה לתקומה',
            author: "דבורה כהן, אולפנת צביה חפץ חיים"
        },
        {
            text: `רונית העבירה את סיפור הישרדותם של סבה וסבתה בצורה מרתקת, סוחפת ונוגעת ללב, אשר ריגשה את הקהל עד דמעות.`,
            linkRecId: 'rec6',
            fromPresention: "חוהל'ה - משואה לתקומה",
            author: "תמי חיות, מנהלת מועדון עמך רחובות"
        },
        {
            text: `אחת המחנכות שיתפה: "היה מרתק ומדהים... אחת ההרצאות הטובות והיעילות ששמעתי".`,
            linkRecId: 'rec8',
            fromPresention: 'השתלמות חוויתית ופרקטית לגננות ומורות',
            author: "ציפי ברגמן, מנהלת הגיל הרך קיבוץ צרעה"
        },
    ]
};



export const recommendationsData = {
    rec1: {
        id: "rec1",
        type: "recommendation", // סוג ייחודי
        recommenderName: "טובה שץ",
        recommenderRole: "מנהלת גני ילדים, מועצה אזורית נחל שורק",
        date: "17.12.2024",
        relatedShow: "כוחה של מילה",
        // התוכן המלא של ההמלצה (כולל פסקאות)
        content: `
            <p>אני כותבת מכתב זה על מנת להמליץ בחום על רונית לוז עבור הפעלת הצגות וסדנאות בובהתראפיה בגני ילדים.</p>
            <p>רונית הופיעה לאחרונה בגני הילדים במ.א. נחל שורק עם הצגה מרתקת ומרגשת העוסקת ב"כוחה של מילה". ההצגה, שהועברה ביד אומן, הצליחה לגעת בנושאים רגשיים וחברתיים עמוקים, כגון פחדים, משמעת והתמודדות עם סמכות בצורה עדינה ומותאמת לגיל הרך.</p>
            <p>הצגת הבובות סיפקה לילדי הגן חוויה ייחודית ומעשירה, שסייעה להם לחקור את רגשותיהם ולהבין אותם טוב יותר. לאחר ההצגה, רונית, יועצת ומטפלת ב-CBT, עבדה עם הילדים בעיבוד הרגשות שעלו, תוך שימוש בטכניקות התנהגותיות קוגניטיביות. רונית שיתפה את הצוותים החינוכיים שהמשיכו בתהליך.</p>
            <p>התרשמתי מאוד מהמקצועיות, הרגישות והיצירתיות של רונית לוז ומהבובות המושקעות. אני ממליצה בחום על רונית לוז לכל מי שמחפש פעילות חינוכית וטיפולית ייחודית ויעילה עבור ילדים.</p>
        `,
        contactInfo: "08-8594172",
        // קישור להצגה הרלוונטית (כדי שיוכלו להזמין אותה משם)
        linkedShowId: "p6" 
    },
    rec2: {
        id: "rec2",
        type: "recommendation",
        recommenderName: "רותם בר",
        recommenderRole: "בשם צוות ביה\"ס חמ\"ד \"מתתיהו\", מושב צלפון",
        date: "05.01.2025",
        relatedShow: "נעם עולה לכיתה א'",
        
        // תוכן ההמלצה כפי שחולץ מהמסמך
        content: `
            <p>ההצגה "נועם עולה לכיתה א'" היתה פשוט מקסימה!! הילדים וההורים נהנו כל כך! היו רגעים של צחוק עד דמעות, לצד דמעות של התרגשות.</p>
            <p>הילדים קיבלו "אישור" לתחושות שלהם בנוגע לעליה לכיתה א' - זה בסדר שאני גם שמח וגם מפחד, וגם קיבלו עצות ופתרונות לתחושות הללו.</p>
            <p>הבובות היו יפות, מצחיקות ומקרבות מסר של הרגעה וחיבוק.</p>
            <p>אנחנו ממליצות בחום על ההצגה לילדי גן חובה ולימים פתוחים בבתי ספר.</p>
        `,
        
        contactInfo: "", // לא צוין טלפון במכתב
        linkedShowId: "p3" // שיניתי ל-p3 כי זה ה-ID של "נעם עולה לכיתה א'" בקובץ שלך
    },
    rec3: {
        id: "rec3",
        type: "recommendation",
        recommenderName: "אודליה אמסלם",
        recommenderRole: "רכזת חברתית, אולפנת אבן שמואל",
        date: "09.01.2025",
        relatedShow: "חוהלה – משואה לתקומה", // מבוסס על התוכן (סיפור משפחתי, שואה)
        
        // תוכן ההמלצה מסודר לפי פסקאות
        content: `
            <p>כהכנה ליום הקדיש הכללי הזמנו את רונית לשיתוף בסיפור המשפחתי. המפגש נפתח בהצגת תיאטרון בובות והמשיך בהקרנת תמונות מהאלבום המשפחתי.</p>
            <p>העברת הסיפור בעזרת הבובות הייתה מוחשית מאוד ומרגשת עד דמעות.</p>
            <p>השימוש בבובות מקטין את המשמעות העצומה והמאיימת של השואה ומחבר אותה יותר לחיי היום-יום של הבנות. תודה שזיכית אותנו בסיפור המשפחתי.</p>
            <p>ממליצה בחום!</p>
        `,
        
        contactInfo: "", // לא צוין מספר טלפון במכתב
        linkedShowId: "p2" // מזהה ההצגה "חוהלה משואה לתקומה" (לפי הקבצים הקודמים)
    },
    rec4: {
        id: "rec4",
        type: "recommendation",
        recommenderName: "נורית ראובן",
        recommenderRole: "מנהלת בי\"ס ברויאר בנות, יד בנימין",
        date: "ניסן תשפ\"ד",
        relatedShow: "חווהל'ה - משואה לתקומה",
        
        // תוכן ההמלצה מתוך המסמך
        content: `
            <p>ברצוני להמליץ על ההצגה "חווהל'ה - משואה לתקומה". רונית לוז העבירה את ההצגה בבית ספרנו לתלמידות כיתות ד'-ה' ביום הזיכרון לשואה ולגבורה.</p>
            <p>ההצגה מספרת את סיפור הצלתה של סבתה של רונית באמצעות דיאלוג בין בובות המייצגות דמויות במשפחה. הועברו ערכים של אמונה, סבלנות והתמודדות עם קושי.</p>
            <p>השימוש בבובות ריכך את התכנים הקשים של השואה והפך את הסיפור לחי, דינמי ומותאם לגיל יסודי, כך שהבנות יצאו עם תחושת אופטימיות ואמונה.</p>
            <p>מומלץ לכל המעוניין להנגיש את נושא השואה לילדים בצורה קרובה ומותאמת.</p>
        `,
        
        contactInfo: "", 
        linkedShowId: "p2" // מקושר גם להצגה "חוהלה" (p2)
    },
    rec5: {
        id: "rec5",
        type: "recommendation",
        recommenderName: "דבורה כהן",
        recommenderRole: "מנהלת חטיבת הביניים, אולפנת צביה חפץ חיים",
        date: "09.07.2024",
        relatedShow: "חווהל'ה – משואה לתקומה",
        
        // תוכן ההמלצה מתוך המסמך
        content: `
            <p>המלצה על המופע "חווהל'ה - משואה לתקומה". רונית העבירה שיחה מדהימה ומרגשת לשכבות ז'-ח' באולפנה.</p>
            <p>רונית מצליחה בכישרונה לחבר את הבנות לנושא השואה הן דרך הסיפור האישי והן דרך חיבור רגשי לילדה בתקופת השואה, המקביל לחוויות של נערות בגיל ההתבגרות.</p>
            <p>המופע משלב גיוון של מצגת, בובות ושיח, ומעניק לבנות כלים להתמודדות רגשית וחברתית.</p>
            <p>ההצגה הייתה משמעותית מאוד עבור הבנות, ואני בטוחה שרונית תהיה משמעותית לכל מוסד שיזמין אותה.</p>
        `,
        
        contactInfo: "08-8593825", 
        linkedShowId: "p2" // מקושר גם להצגה "חוהלה" (p2)
    },
    rec6: {
        id: "rec6",
        type: "recommendation",
        recommenderName: "תמי חיות",
        recommenderRole: "עו\"ס פסיכותרפיסטית, מנהלת מועדון עמך רחובות",
        date: "יוני 2024",
        relatedShow: "חווהל'ה – משואה לתקומה",
        
        // תוכן ההמלצה מתוך המסמך
        content: `
            <p>המלצה חמה על מופע תיאטרון הבובות "חוהלה משואה לתקומה". רונית הופיעה במועדון עמך לשורדי שואה ברחובות בפני כ-50 שורדים, אנשי צוות וחברי קבוצת התיאטרון.</p>
            <p>רונית העבירה את סיפור הישרדותם של סבה וסבתה בצורה מרתקת, סוחפת ונוגעת ללב, אשר ריגשה את הקהל עד דמעות.</p>
            <p>השימוש בבובות מיוחדות ומרהיבות, יחד עם כישורי משחק וקול ייחודיים, אפשר לצופים להתחבר לסיפור ההיסטורי ולמצוא בו את עצמם.</p>
            <p>המופע מתאים הן לילדים והן לבני הגיל השלישי, ומהווה דרך ייחודית וחווייתית לשימור זיכרון השואה.</p>
        `,
        
        contactInfo: "", 
        linkedShowId: "p2" // מקושר גם להצגה "חוהלה" (p2)
    },
    rec7: {
        id: "rec7",
        type: "recommendation",
        recommenderName: "הדר אסחייק",
        recommenderRole: "רכזת חברתית, ת\"ת ובי\"ס ממ\"ד תורני כפר דרום",
        date: "י\"ג אייר התשפ\"ד",
        relatedShow: "חווהל'ה – משואה לתקומה",
        
        // תוכן ההמלצה מתוך המסמך
        content: `
            <p>המלצה על המופע "חווהל'ה - משואה לתקומה". רונית לוז הציגה את סיפור הצלתה של סבתה בבית ספרנו לבנות כיתות ד'-ו'.</p>
            <p>הסיפור סופר באמצעות בובות תיאטרון, אשר סייעו לעדן את קשיי הסיפור ולהעביר מסרים חשובים של התמודדות עם קשיים מתוך אמונה וייחודיות יהודית באופן ברור.</p>
            <p>האווירה הייתה נעימה, עם הקשבה מלאה ושיתוף פעולה מצד הבנות, כולל שאלות בסיום.</p>
            <p>אנו מודים לרונית על סיפור מיוחד, אמוני ומחזק, וממליצים להזמין אותה להופיע, במיוחד בימי ההכנה "משואה לתקומה".</p>
        `,
        
        contactInfo: "", 
        linkedShowId: "p2" // מקושר גם להצגה "חוהלה" (p2)
    },
    rec8: {
        id: "rec8",
        type: "recommendation",
        recommenderName: "ציפי ברגמן",
        recommenderRole: "מנהלת הגיל הרך, קיבוץ צרעה",
        date: "31.10.2025",
        relatedShow: "הצגה לילדים + השתלמות צוות",
        
        content: `
            <p>אני מבקשת להמליץ על רונית לוז להעברת הצגות וכן השתלמויות לצוותים. רונית העבירה לנו הצגה לילדי הגנים (גילאי 3-6) שהייתה ברמה גבוהה מאוד ומותאמת לגיל, ונגעה בנושאים רגשיים מורכבים (כעס, עלבון ופחד) בצורה עדינה שאפשרה שיח רגשי.</p>
            <p>בעקבות ההצגה, הזמנו את רונית להעביר השתלמות לצוות החינוכי. ההשתלמות כללה רקע תיאורטי, טכניקות להפעלת בובות וסדנא מעשית ליצירת "בובות חוסן".</p>
            <p>השימוש בבובות ככלי לחיזוק החוסן הרגשי נמצא יעיל מאוד במערכת הגיל הרך. רונית שידרגה את מקצועיות הצוותים באופן ניכר.</p>
            <p>אחת המחנכות שיתפה: "היה מרתק ומדהים... אחת ההרצאות הטובות והיעילות ששמעתי".</p>
        `,
        
        contactInfo: "02-9908230",
        linkedShowId: "p13" // מקושר להשתלמות לגננות
    },
    rec9: {
        id: "rec9",
        type: "recommendation",
        recommenderName: "אהובה פלאוט",
        recommenderRole: "בשם נשות 55 פלוס, מושב בית חלקיה",
        date: "", // תאריך לא מצוין
        relatedShow: "הגיל השלישי עם הפנים קדימה",
        
        // תוכן ההמלצה מאהובה פלאוט
        content: `
            <p>הייתה לי הזכות להזמין את רונית להעביר סדנא עם ההצגה "הגיל השלישי עם הפנים קדימה" לנשות 55 פלוס.</p>
            <p>נהנינו מאוד מההומור השזור בהצגה ומהרמה המקצועית הגבוהה, הן של ההצגה והן של השיח שהתפתח בעקבותיה.</p>
            <p>המופע נוגע בנקודות משמעותיות בחיי בני ובנות הגיל השלישי והסובבים אותם. אישיותה הנעימה והכובשת של רונית הפכה את הערב לבלתי נשכח.</p>
        `,
        
        contactInfo: "",
        linkedShowId: "p12" // מקושר להצגה: הגיל השלישי עם הפנים קדימה
    },
    // ----------------------------------------------------

    rec10: {
        id: "rec10",
        type: "recommendation",
        recommenderName: "עדי כהנא",
        recommenderRole: "תושבת יד בנימין",
        date: "", // תאריך לא מצוין
        relatedShow: "הגיל השלישי עם הפנים קדימה",
        
        // תוכן ההמלצה מעדי כהנא
        content: `
            <p>ההפעלה של רונית לוז היא שילוב מדהים של חוויה וחכמת חיים. רונית מצליחה להביע דרך משחק ותיאטרון בובות את ההתמודדויות של הגיל השלישי.</p>
            <p>הכול נעשה בחינניות, כבוד, הומור ודרמה. נהניתי מאוד כצופה.</p>
        `,
        
        contactInfo: "", 
        linkedShowId: "p12" // מקושר להצגה: הגיל השלישי עם הפנים קדימה
    },

    rec11: {
        id: "rec11",
        type: "recommendation",
        recommenderName: "נחמה ספרא",
        recommenderRole: "משתתפת סדנא (עדות אישית)",
        date: "", // תאריך לא מצוין (צוין "אתמול.בערב")
        relatedShow: "הגיל השלישי עם הפנים קדימה",
        
        // תוכן ההמלצה מנחמה ספרא
        content: `
            <p>אתמול בערב הייתה לנו חוויה מהנה במיוחד. הגב' רונית לוז העבירה סדנה בליווי בובות תיאטרון גדולות שנתפרו במיוחד לסדנא.</p>
            <p>הנושא היה סיטואציות מהחיים בגיל השלישי. הדו שיח שהתפתח בין הקהל לרונית היה מחזק, מצחיק ונתן כוח להמשיך הלאה.</p>
            <p>אני ממליצה בחום על רונית והפעילות שלה. בטוחני שתיהנו.</p>
        `,
        
        contactInfo: "", 
        linkedShowId: "p12" // מקושר להצגה: הגיל השלישי עם הפנים קדימה
    },

    rec12: {
        id: "rec12",
        type: "recommendation",
        recommenderName: "שירי חסיד",
        recommenderRole: "רכזת מסלול היזמות של מרכז אפ 60+, אשכול שורק דרומי",
        date: "", // לא צוין תאריך במסמך
        relatedShow: "הגיל השלישי עם הפנים קדימה", 
        
        content: `
            <p>רונית הרצתה בספריה הציבורית של מזכרת בתיה, במסגרת הרצאות לגילאי 60+. רונית עשתה תיאטרון בובות רגשי, ודרך הבובות דיברה עם המשתתפים על סוגיות שונות הקשורות לגיל הפרישה: בית, שעות פנאי, זוגיות, דילמות והזדמנויות.</p>
            <p>ההרצאה הייתה מקסימה, רונית הצליחה לעניין ולהקסים את הקהל ששיתף פעולה בצורה יוצאת דופן. רונית הצליחה להעביר תובנות על התקופה המשמעותית הזו בצורה חכמה ומלאת חן.</p>
            <p>אני ממליצה בחום רב על ההרצאה הזו ועל החוויה הנפלאה של תיאטרון הבובות.</p>
        `,
        
        contactInfo: "", 
        linkedShowId: "p12"
    },

    rec13: {
        id: "rec13",
        type: "recommendation",
        recommenderName: "עדינה ורהפטיג",
        recommenderRole: 'מנהלת "בית לחיים", עמותת בית נחליאל - יד בנימין',
        date: "", // תאריך לא צוין
        relatedShow: "חוג בובותרפיה לצרכים מיוחדים",
        
        content: `
            <p>ב"בית לחיים" ביד בנימין, בית של בנות בוגרות עם צרכים מיוחדים, אנחנו זוכות בכל שבוע להשתתף בחוג הבובותרפיה של רונית, וזה פשוט תענוג!</p>
            <p>החוג מצליח לגעת בבנות בצורה עמוקה ומשמחת – דרך הבובות הן מביעות רגשות, נכנסות לדמויות, חושבות, יוצרות ופועלות ממקום של שמחה וביטחון.</p>
            <p>רונית מביאה איתה הרבה רוך, סבלנות והקשבה, והיא יודעת להגיע לכל אחת בדיוק לפי היכולות והקצב שלה.</p>
            <p>המפגשים איתה נעימים, מרגשים ומשמעותיים, ואפשר ממש לראות את ההתפתחות של הבנות ממפגש למפגש.</p>
        `,
        
        contactInfo: "", 
        linkedShowId: "",// כאן תכניס את ה-ID של דף הסדנאות לצרכים מיוחדים אם קיים (למשל "p14" או כדומה)
    },
};