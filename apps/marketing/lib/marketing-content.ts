import type { AppLocale } from "./locale";

type SeoEntry = {
  title: string;
  description: string;
};

type BlogPost = {
  slug: string;
  category: string;
  date: string;
  title: string;
  excerpt: string;
  content: string;
};

type MarketingContent = {
  site: {
    siteName: string;
    siteAltName: string;
    defaultTitle: string;
    defaultDescription: string;
    companyDescription: string;
    localeLabel: string;
  };
  nav: {
    home: string;
    assistant: string;
    workspace: string;
    developer: string;
    broker: string;
    about: string;
    docs: string;
    contact: string;
    workspaceSignIn: string;
    assistantTitle: string;
    switchLanguage: string;
    activateLightMode: string;
    activateDarkMode: string;
  };
  footer: {
    brandTitle: string;
    description: string;
    platform: string;
    company: string;
    legal: string;
    developers: string;
    brokers: string;
    pricing: string;
    partnerships: string;
    docs: string;
    team: string;
    careers: string;
    privacy: string;
    terms: string;
    faq: string;
    blog: string;
    bottomTagline: string;
    copyright: string;
  };
  seo: Record<string, SeoEntry>;
  about: {
    badge: string;
    title: string;
    titleAccent: string;
    description: string;
    missionTitle: string;
    missionDescription: string;
    valuesTitle: string;
    valuesDescription: string;
    workStyleTitle: string;
    workStyleDescription: string;
    whyTitle: string;
    whyAccent: string;
    whyDescriptionPrimary: string;
    whyDescriptionSecondary: string;
    metricsUnified: string;
    metricsAudience: string;
    metricsAvailability: string;
    metricsClarity: string;
    identityTitle: string;
    identityAccent: string;
    identityDescriptionPrimary: string;
    identityDescriptionSecondary: string;
    talkToTeam: string;
    developerSpace: string;
    contact: string;
  };
  faq: {
    eyebrow: string;
    title: string;
    description: string;
    groups: { category: string; items: { q: string; a: string }[] }[];
  };
  blog: {
    eyebrow: string;
    title: string;
    description: string;
    readMore: string;
    backToBlog: string;
    shareArticle: string;
    posts: BlogPost[];
  };
};

const marketingContent: Record<AppLocale, MarketingContent> = {
  ar: {
    site: {
      siteName: "عنان",
      siteAltName: "Anan Real Estate OS",
      defaultTitle: "عنان | بنية تشغيل وتسويق وذكاء عقاري",
      defaultDescription:
        "عنان هي بنية تشغيل عقارية تربط المساعد الذكي، مساحة العمل، واجهات المطورين، وشبكة الوسطاء في تجربة واحدة قابلة للنمو.",
      companyDescription:
        "منصة تشغيل عقاري تربط الاكتساب، التأهيل، التعاون، والتوزيع في مسار واحد.",
      localeLabel: "العربية",
    },
    nav: {
      home: "الرئيسية",
      assistant: "المساعد",
      workspace: "مساحة العمل",
      developer: "للمطورين",
      broker: "للوسطاء",
      about: "عن الشركة",
      docs: "المطورون",
      contact: "تواصل",
      workspaceSignIn: "اذهب إلى مساحة العمل",
      assistantTitle: "اذهب إلى المساعد",
      switchLanguage: "تبديل اللغة",
      activateLightMode: "تفعيل الوضع الفاتح",
      activateDarkMode: "تفعيل الوضع الداكن",
    },
    footer: {
      brandTitle: "بنية تشغيل وتسويق وذكاء عقاري",
      description:
        "نحوّل المحادثات والطلب والعمليات إلى نظام واحد يفهم السوق ويجعل الفرق تتحرك بثقة أكبر.",
      platform: "المنصة",
      company: "الشركة",
      legal: "القانونية",
      developers: "حلول المطورين",
      brokers: "حلول الوسطاء",
      pricing: "التسعير",
      partnerships: "كن شريكاً معنا",
      docs: "الوثائق",
      team: "الفريق",
      careers: "الوظائف",
      privacy: "الخصوصية",
      terms: "الشروط",
      faq: "الأسئلة الشائعة",
      blog: "المدونة",
      bottomTagline: "عنان تبني طبقة التشغيل التي تربط الذكاء العقاري بالفرق والصفقات.",
      copyright: "© 2026 عنان. جميع الحقوق محفوظة.",
    },
    seo: {
      home: {
        title: "عنان | نظام تشغيل عقاري يربط الذكاء والفرق والتوزيع",
        description:
          "اكتشف كيف توحّد عنان المساعد الذكي، مساحة العمل، واجهات المطورين، والتوزيع عبر الوسطاء في بنية واحدة للنمو العقاري.",
      },
      assistant: {
        title: "مساعد عنان | اكتساب وتأهيل عقاري يعمل 24/7",
        description:
          "مساعد عنان يحوّل المحادثات إلى طلب مؤهّل، يفهم الميزانية والمنطقة والنية، ثم يربط العميل بالفرصة والفريق المناسب.",
      },
      workspace: {
        title: "مساحة عمل عنان | تشغيل المبيعات والتعاون العقاري",
        description:
          "مساحة عمل عنان تجمع المشاريع، الوسطاء، العملاء، والعروض في تجربة واحدة أقل احتكاكاً وأكثر وضوحاً للفرق التجارية.",
      },
      developer: {
        title: "عنان للمطورين | توزيع أذكى ورؤية أوضح للطلب",
        description:
          "ساعد فريق التطوير على إدارة المشاريع والعروض وشبكة الوسطاء وقراءة الطلب الحقيقي من سوق العقار السعودي في مكان واحد.",
      },
      broker: {
        title: "عنان للوسطاء | متابعة أسرع وتعاون أوضح",
        description:
          "منصة تساعد الوسطاء على الوصول إلى المشاريع المناسبة، متابعة العملاء، والتعاون مع المطورين من دون فقدان السياق.",
      },
      about: {
        title: "عن عنان | الشركة التي تبني بنية التشغيل العقاري الحديثة",
        description:
          "تعرف على رؤية عنان لبناء نظام تشغيل عقاري يربط الذكاء، التوزيع، والعمليات بين المطورين والوسطاء والمشترين.",
      },
      contact: {
        title: "تواصل مع عنان | ابدأ محادثة حول النمو العقاري",
        description:
          "تحدث مع فريق عنان حول المساعد الذكي، مساحة العمل، التكاملات، أو فرص الشراكة التي تساعد شركتك على النمو.",
      },
      pricing: {
        title: "تسعير عنان | نماذج تشغيل مرنة للشركات العقارية",
        description:
          "تعرف على طريقة تفكير عنان في التسعير والنمو المرحلي لمساحات العمل، القنوات الذكية، والتكاملات المخصصة.",
      },
      partnerships: {
        title: "شراكات عنان | توسيع التوزيع والخدمات العقارية",
        description:
          "نبني شراكات مع مطورين ووسطاء ومقدمي خدمات وتشغيل لتوسيع الوصول وتحويل البيانات إلى نمو تجاري فعلي.",
      },
      investor: {
        title: "عنان للمستثمرين | طبقة تشغيل لاقتصاد العقار الحديث",
        description:
          "لماذا يرى فريق عنان أن الذكاء العقاري والتوزيع متعدد القنوات والتشغيل الموحد تمثل فرصة بنية تحتية كبيرة في المنطقة.",
      },
      team: {
        title: "فريق عنان | خبرة تشغيلية وتقنية تبني وضوحاً تجارياً",
        description:
          "تعرف على الفريق الذي يبني عنان كمنصة تشغيل تربط فرق التطوير والوسطاء والذكاء والبيانات.",
      },
      careers: {
        title: "وظائف عنان | ابنِ مستقبل التشغيل العقاري معنا",
        description:
          "نبحث عن أشخاص يحبون تحويل التعقيد التجاري والتقني إلى أدوات واضحة قابلة للاستخدام داخل سوق العقار.",
      },
      faq: {
        title: "الأسئلة الشائعة | كيف تعمل عنان كشركة ومنتج",
        description:
          "إجابات سريعة حول المساعد الذكي ومساحة العمل والدور الذي تلعبه عنان في تشغيل وتسويق الأعمال العقارية.",
      },
      blog: {
        title: "مدونة عنان | رؤى عن التشغيل العقاري والذكاء والتوزيع",
        description:
          "مقالات عن بناء بنية تشغيل عقاري حديثة، استخدام الذكاء في التأهيل، وتصميم أنظمة تساعد الفرق على التحرك أسرع.",
      },
      docs: {
        title: "وثائق المطورين | تكاملات عنان وواجهاتها العامة",
        description:
          "ابدأ بتكاملات OAuth وواجهات API ومفاتيح الوصول العامة في عنان لفِرق المطورين والشركاء التقنيين.",
      },
      policy: {
        title: "سياسة الخصوصية | عنان",
        description: "تعرف على طريقة تعامل عنان مع البيانات والخصوصية ضمن منصتها التسويقية والتشغيلية.",
      },
      terms: {
        title: "شروط الاستخدام | عنان",
        description: "الشروط العامة التي تنظّم استخدام الصفحات العامة والخدمات المرتبطة بعنان.",
      },
    },
    about: {
      badge: "عن الشركة",
      title: "نبني طبقة",
      titleAccent: "التشغيل العقاري",
      description:
        "عنان ليست مجرد مساحة عمل أو مساعد محادثة. نحن نبني البنية التي تربط الطلب، المشاريع، الفرق، والبيانات داخل سوق عقاري يتحرك بسرعة ويحتاج وضوحاً أعلى.",
      missionTitle: "مهمتنا",
      missionDescription: "تحويل التعقيد العقاري إلى نظام موحّد يجعل التأهيل والتوزيع والمتابعة أسرع وأقل احتكاكاً.",
      valuesTitle: "ما نؤمن به",
      valuesDescription: "الوضوح قبل الضجيج، والبنية القابلة للتوسع قبل الحلول المؤقتة، والبيانات الحية قبل التخمين.",
      workStyleTitle: "كيف نعمل",
      workStyleDescription: "نبني منتجاً يفكر في المطور والوسيط والعميل معاً لأن السوق الحقيقي لا يتحرك داخل فريق واحد فقط.",
      whyTitle: "لماذا تحتاج السوق إلى",
      whyAccent: "نظام تشغيل موحّد",
      whyDescriptionPrimary:
        "القنوات تتكاثر، والطلب يتغير بسرعة، والفرق تحتاج رؤية مشتركة لتتحرك بثقة. لهذا صممنا عنان كبنية تشغيل، لا كأداة منفصلة.",
      whyDescriptionSecondary:
        "عندما تتصل المحادثة بالبيانات، وتتصل البيانات بالفرق، يصبح القرار التجاري أسرع وأكثر واقعية.",
      metricsUnified: "طبقة موحدة",
      metricsAudience: "جمهوران رئيسيان",
      metricsAvailability: "تشغيل مستمر",
      metricsClarity: "وضوح",
      identityTitle: "عنان اليوم",
      identityAccent: "وشكلها القادم",
      identityDescriptionPrimary:
        "اليوم نبدأ من المساعد الذكي، مساحة العمل، وشبكة التوزيع. وغداً تمتد البنية إلى وكلاء مخصصين، تكاملات أعمق، وتشغيل أكثر استقلالية.",
      identityDescriptionSecondary:
        "نقيس النجاح بمدى سهولة انتقال العميل من الاهتمام إلى الفرصة، ومدى سهولة انتقال الفريق من البيانات إلى التنفيذ.",
      talkToTeam: "تحدث مع الفريق",
      developerSpace: "استكشف حلول المطورين",
      contact: "تواصل معنا",
    },
    faq: {
      eyebrow: "الأسئلة الشائعة",
      title: "كيف نفكر في عنان كشركة ومنتج",
      description: "إجابات قصيرة حول المنصة، القنوات، ودور المساعد الذكي ومساحة العمل في دورة البيع العقارية.",
      groups: [
        {
          category: "عن المنصة",
          items: [
            {
              q: "ما هي عنان باختصار؟",
              a: "عنان هي نظام تشغيل عقاري يربط المساعد الذكي، مساحة العمل، المطورين، الوسطاء، وطبقة البيانات في تجربة واحدة.",
            },
            {
              q: "هل عنان مجرد روبوت محادثة؟",
              a: "لا. المساعد هو قناة اكتساب وتأهيل فقط. القيمة الأكبر تأتي من ربطه بالبيانات، التوزيع، والمتابعة داخل مساحة العمل.",
            },
          ],
        },
        {
          category: "للمطورين والوسطاء",
          items: [
            {
              q: "لماذا يحتاج المطور إلى عنان؟",
              a: "لأنه يحصل على رؤية أوضح للطلب، إدارة أفضل للمشاريع والعروض، ومسار توزيع أقرب إلى السوق الحقيقي.",
            },
            {
              q: "كيف يستفيد الوسيط؟",
              a: "يصل إلى فرص أكثر وضوحاً، يتابع العملاء من مكان واحد، ويتعاون مع المطورين من دون ضياع السياق التجاري.",
            },
          ],
        },
        {
          category: "التشغيل والتكامل",
          items: [
            {
              q: "هل يمكن التكامل مع أنظمة أخرى؟",
              a: "نعم. وثائق المطورين تشرح مسار OAuth وواجهات API العامة، لأننا نبني عنان كبنية قابلة للاتصال لا كنظام مغلق.",
            },
            {
              q: "كيف أبدأ؟",
              a: "يمكنك البدء من المساعد لتجربة المحادثة أو الدخول إلى مساحة العمل إذا كنت جزءاً من فريق يستخدم عنان بالفعل.",
            },
          ],
        },
      ],
    },
    blog: {
      eyebrow: "الرؤى والتحديثات",
      title: "مقالات عن الذكاء العقاري والبنية التجارية الحديثة",
      description: "نكتب عن كيف تبني عنان نظام تشغيل يساعد فرق العقار على التأهيل والتوزيع والعمل بثقة أكبر.",
      readMore: "اقرأ المزيد",
      backToBlog: "العودة للمدونة",
      shareArticle: "شارك هذا المقال",
      posts: [
        {
          slug: "assistant-demand-qualification",
          category: "المساعد",
          date: "٣ أبريل ٢٠٢٦",
          title: "كيف يحوّل المساعد الذكي المحادثة إلى طلب مؤهّل",
          excerpt:
            "الفرق العقارية لا تحتاج رسائل أكثر، بل تحتاج طبقة تفهم نية العميل وتربطها بالمشروع والفريق المناسبين.",
          content:
            "مساعد عنان لا يتعامل مع المحادثة كدردشة عابرة. الهدف هو تحويل الاهتمام إلى بيانات قابلة للاستخدام: ميزانية، منطقة، نوع أصل، نية شراء، وطبيعة القرار.\n\nعندما تصبح هذه البيانات جاهزة، تنتقل القيمة من مجرد الرد إلى التوجيه. يمكن ربط العميل بالمشروع المناسب، أو تمريره إلى وسيط، أو توجيهه مباشرة إلى فريق المطور. هذا هو الفرق بين روبوت يرد وبين قناة تأهيل ترفع جودة الفرص.",
        },
        {
          slug: "workspace-commercial-clarity",
          category: "مساحة العمل",
          date: "٢٨ مارس ٢٠٢٦",
          title: "لماذا تحتاج الشركات العقارية إلى مساحة عمل تفهم السياق التجاري",
          excerpt:
            "الأدوات المنفصلة تصنع احتكاكاً خفياً. مساحة العمل الجيدة تجعل الفرق ترى نفس الصورة وتتحرك أسرع.",
          content:
            "حين تتوزع المشاريع والعروض والعملاء والمحادثات بين أدوات منفصلة، تبدأ التكلفة الخفية بالظهور: تأخير، سوء فهم، وتكرار عمل.\n\nمساحة عمل عنان تبني طبقة أوضح بين الفرق. المطور يرى الطلب، الوسيط يرى الفرصة، والإدارة ترى ما يحدث فعلاً. هذا النوع من الوضوح هو ما يجعل التشغيل التجاري قابلاً للنمو.",
        },
        {
          slug: "developer-apis-for-real-estate-growth",
          category: "المطورون",
          date: "٢٠ مارس ٢٠٢٦",
          title: "كيف تدعم واجهات المطورين نمواً أسرع في الأعمال العقارية",
          excerpt:
            "عندما تكون البيانات والتكاملات جزءاً من المنتج، يصبح توسيع القنوات والفرق أقل كلفة وأكثر سرعة.",
          content:
            "جزء من رؤية عنان هو أن تكون البنية قابلة للاتصال. لذلك لا نتعامل مع OAuth وواجهات API كطبقة تقنية منفصلة عن العمل التجاري.\n\nالتكاملات العامة تسمح بربط المساعد والبيانات ومساحة العمل بأنظمة الشركاء أو الفرق الداخلية. النتيجة ليست تكاملاً تقنياً فقط، بل توزيعاً أذكى وقدرة أعلى على التوسع عبر القنوات.",
        },
      ],
    },
  },
  en: {
    site: {
      siteName: "Anan",
      siteAltName: "Anan Real Estate OS",
      defaultTitle: "Anan | Real Estate AI, Workflows, and Growth Infrastructure",
      defaultDescription:
        "Anan is a real estate operating system connecting AI qualification, workspace execution, developer infrastructure, and broker distribution.",
      companyDescription: "Real estate operating infrastructure for demand, distribution, and execution.",
      localeLabel: "English",
    },
    nav: {
      home: "Home",
      assistant: "Assistant",
      workspace: "Workspace",
      developer: "Developers",
      broker: "Brokers",
      about: "Company",
      docs: "Docs",
      contact: "Contact",
      workspaceSignIn: "Go to Workspace",
      assistantTitle: "Go to Assistant",
      switchLanguage: "Switch language",
      activateLightMode: "Enable light mode",
      activateDarkMode: "Enable dark mode",
    },
    footer: {
      brandTitle: "Real estate operating infrastructure",
      description:
        "We connect conversations, demand signals, teams, and execution into one system built for modern real estate growth.",
      platform: "Platform",
      company: "Company",
      legal: "Legal",
      developers: "Developer solution",
      brokers: "Broker solution",
      pricing: "Pricing",
      partnerships: "Be Partner With Us",
      docs: "Docs",
      team: "Team",
      careers: "Careers",
      privacy: "Privacy",
      terms: "Terms",
      faq: "FAQ",
      blog: "Blog",
      bottomTagline: "Anan connects real estate AI, teams, and execution in one operating layer.",
      copyright: "© 2026 Anan. All rights reserved.",
    },
    seo: {
      home: {
        title: "Anan | Real Estate Operating System for AI, Teams, and Distribution",
        description:
          "See how Anan connects an AI assistant, commercial workspace, developer infrastructure, and broker distribution into one real estate operating system.",
      },
      assistant: {
        title: "Anan Assistant | AI Qualification for Real Estate Teams",
        description:
          "The Anan Assistant captures intent, qualifies demand, and routes buyers to the right project, broker, or team with more structure and less friction.",
      },
      workspace: {
        title: "Anan Workspace | Real Estate Sales and Collaboration Operations",
        description:
          "Run projects, offers, brokers, clients, and execution in one commercial workspace built for real estate teams that need clarity at scale.",
      },
      developer: {
        title: "Anan for Developers | Demand Visibility and Smarter Distribution",
        description:
          "Give developer teams a clearer view of demand, project performance, broker collaboration, and operational momentum in one place.",
      },
      broker: {
        title: "Anan for Brokers | Faster Follow-up and Better Collaboration",
        description:
          "Help brokers move faster with cleaner project access, shared context, and more structured client follow-up across the sales cycle.",
      },
      about: {
        title: "About Anan | The Company Building Real Estate Operating Infrastructure",
        description:
          "Learn how Anan is building the operating layer that connects AI, project data, distribution, and execution for modern real estate businesses.",
      },
      contact: {
        title: "Contact Anan | Talk to the Team",
        description:
          "Start a conversation with Anan about AI qualification, workspace operations, integrations, partnerships, or growth infrastructure.",
      },
      pricing: {
        title: "Anan Pricing | Flexible Commercial Infrastructure",
        description:
          "Understand how Anan thinks about phased pricing for AI channels, workspaces, integrations, and operating support.",
      },
      partnerships: {
        title: "Anan Partnerships | Scale Distribution and Service Delivery",
        description:
          "Explore how Anan partners with developers, brokers, and service providers to turn market signals into coordinated growth.",
      },
      investor: {
        title: "Anan for Investors | Infrastructure for the Next Real Estate Stack",
        description:
          "Why Anan sees real estate AI, broker distribution, and unified commercial operations as an infrastructure opportunity in the region.",
      },
      team: {
        title: "Anan Team | Commercial and Technical Builders",
        description:
          "Meet the team building Anan across product, operating design, and the technical systems behind real estate execution.",
      },
      careers: {
        title: "Careers at Anan | Build the Future of Real Estate Operations",
        description:
          "Join a team turning commercial and technical complexity into clear operating systems for modern real estate companies.",
      },
      faq: {
        title: "Anan FAQ | How the Company and Platform Work",
        description:
          "Quick answers about the assistant, the workspace, integrations, and how Anan supports real estate teams commercially.",
      },
      blog: {
        title: "Anan Blog | Real Estate AI, Operations, and Distribution Insights",
        description:
          "Thoughts on real estate operating systems, AI-led qualification, commercial clarity, and building infrastructure for growth.",
      },
      docs: {
        title: "Developer Docs | Public APIs and Integrations for Anan",
        description:
          "Start with Anan OAuth, public APIs, and access patterns for partners and developer teams building on the platform.",
      },
      policy: {
        title: "Privacy Policy | Anan",
        description: "How Anan handles privacy and data across its public and operational product surfaces.",
      },
      terms: {
        title: "Terms of Use | Anan",
        description: "General terms covering the use of Anan public pages and related services.",
      },
    },
    about: {
      badge: "Company",
      title: "We are building the",
      titleAccent: "real estate operating layer",
      description:
        "Anan is not only a workspace and not only an assistant. We are building the infrastructure that connects demand, projects, teams, and intelligence inside one commercial system.",
      missionTitle: "Mission",
      missionDescription:
        "Turn fragmented real estate activity into a unified operating system for qualification, distribution, and follow-through.",
      valuesTitle: "Values",
      valuesDescription:
        "Clarity before noise. Expandable infrastructure before temporary tools. Live demand signals before guesswork.",
      workStyleTitle: "How we build",
      workStyleDescription:
        "We design for developers, brokers, and buyers at the same time because the real market never moves through a single team.",
      whyTitle: "Why the market needs a",
      whyAccent: "unified operating system",
      whyDescriptionPrimary:
        "Channels multiply, demand shifts quickly, and teams need a shared commercial picture. That is why Anan is built as infrastructure, not as one more point solution.",
      whyDescriptionSecondary:
        "When conversations connect to data, and data connects to execution, commercial decisions become faster and more grounded.",
      metricsUnified: "Unified layer",
      metricsAudience: "Core audiences",
      metricsAvailability: "Always-on qualification",
      metricsClarity: "Commercial clarity",
      identityTitle: "What Anan is now",
      identityAccent: "and where it is heading",
      identityDescriptionPrimary:
        "Today Anan starts with the assistant, the workspace, and distribution orchestration. Over time it expands into branded AI agents, deeper integrations, and more autonomous operations.",
      identityDescriptionSecondary:
        "We measure success by how easily buyers move from intent to opportunity and how easily teams move from data to execution.",
      talkToTeam: "Talk to the team",
      developerSpace: "Explore the developer solution",
      contact: "Contact us",
    },
    faq: {
      eyebrow: "Frequently asked questions",
      title: "How we think about Anan as a company and product",
      description:
        "Short answers about the platform, the channels, and the role of the assistant and workspace inside real estate sales operations.",
      groups: [
        {
          category: "Platform",
          items: [
            {
              q: "What is Anan, in simple terms?",
              a: "Anan is a real estate operating system that connects AI qualification, team workflows, project data, and broker distribution.",
            },
            {
              q: "Is Anan only a chatbot?",
              a: "No. The assistant is one acquisition and qualification layer. The larger value comes from tying it to data, routing, and commercial execution.",
            },
          ],
        },
        {
          category: "Developers and brokers",
          items: [
            {
              q: "Why do developers use Anan?",
              a: "To see live demand more clearly, manage projects and offers, and coordinate broker distribution from one operating surface.",
            },
            {
              q: "How do brokers benefit?",
              a: "They get cleaner project access, stronger context, and a better way to move clients through follow-up and collaboration.",
            },
          ],
        },
        {
          category: "Operations and integrations",
          items: [
            {
              q: "Can Anan integrate with other systems?",
              a: "Yes. The developer docs cover OAuth and public API patterns because Anan is designed as infrastructure, not a closed silo.",
            },
            {
              q: "How should I start?",
              a: "Use the assistant if you want to experience the conversation layer, or enter the workspace if your team is already operating inside Anan.",
            },
          ],
        },
      ],
    },
    blog: {
      eyebrow: "Insights and updates",
      title: "Writing about AI, commercial clarity, and real estate operations",
      description:
        "We share how Anan thinks about demand qualification, workspace design, integrations, and the operating systems real estate teams actually need.",
      readMore: "Read more",
      backToBlog: "Back to blog",
      shareArticle: "Share this article",
      posts: [
        {
          slug: "assistant-demand-qualification",
          category: "Assistant",
          date: "April 3, 2026",
          title: "How an AI assistant turns a real estate conversation into qualified demand",
          excerpt:
            "Real estate teams do not need more messages. They need a layer that understands intent and routes it with context.",
          content:
            "The Anan Assistant is not built to keep a conversation alive for its own sake. The goal is to translate interest into usable structure: budget, area, asset type, timing, and buying intent.\n\nOnce that structure exists, the business value becomes tangible. A buyer can be matched to the right project, broker, or internal team. That is the difference between a chatbot that replies and a qualification channel that improves opportunity quality.",
        },
        {
          slug: "workspace-commercial-clarity",
          category: "Workspace",
          date: "March 28, 2026",
          title: "Why real estate companies need a workspace that understands commercial context",
          excerpt:
            "Fragmented tools create invisible drag. A better workspace helps teams see the same picture and move with more confidence.",
          content:
            "When projects, offers, conversations, and clients live across disconnected tools, the cost shows up in delays, handoff confusion, and repeated effort.\n\nAnan Workspace creates a clearer operating layer. Developers see demand, brokers see opportunity, and leadership sees what is actually happening. That kind of clarity is what makes commercial execution scalable.",
        },
        {
          slug: "developer-apis-for-real-estate-growth",
          category: "Developers",
          date: "March 20, 2026",
          title: "Why developer APIs matter in the next real estate operating stack",
          excerpt:
            "When integrations are part of the product strategy, expanding channels and teams becomes faster and less expensive.",
          content:
            "Part of Anan’s vision is to stay connectable. That means OAuth and public APIs are not treated as separate technical extras.\n\nThey are part of the commercial system. Integrations let teams connect the assistant, project data, and workspace operations to partner tools or internal systems, making distribution smarter and growth easier to scale.",
        },
      ],
    },
  },
  fr: {
    site: {
      siteName: "Anan",
      siteAltName: "Anan Real Estate OS",
      defaultTitle: "Anan | IA immobiliere, operations et infrastructure de croissance",
      defaultDescription:
        "Anan relie l'assistant IA, l'espace de travail, l'infrastructure developpeur et la distribution par courtiers dans un seul systeme immobilier.",
      companyDescription: "Une infrastructure immobiliere pour la demande, la distribution et l'execution.",
      localeLabel: "Français",
    },
    nav: {
      home: "Accueil",
      assistant: "Assistant",
      workspace: "Espace de travail",
      developer: "Developpeurs",
      broker: "Courtiers",
      about: "Entreprise",
      docs: "Docs",
      contact: "Contact",
      workspaceSignIn: "Aller a l'espace",
      assistantTitle: "Aller a l'assistant",
      switchLanguage: "Changer de langue",
      activateLightMode: "Activer le mode clair",
      activateDarkMode: "Activer le mode sombre",
    },
    footer: {
      brandTitle: "Infrastructure d'exploitation immobiliere",
      description:
        "Nous relions conversations, signaux de demande, equipes et execution dans un seul systeme pense pour la croissance immobiliere moderne.",
      platform: "Plateforme",
      company: "Entreprise",
      legal: "Juridique",
      developers: "Solution promoteurs",
      brokers: "Solution courtiers",
      pricing: "Tarification",
      partnerships: "Devenir partenaire",
      docs: "Docs",
      team: "Equipe",
      careers: "Carrieres",
      privacy: "Confidentialite",
      terms: "Conditions",
      faq: "FAQ",
      blog: "Blog",
      bottomTagline: "Anan connecte l'IA immobiliere, les equipes et l'execution dans une seule couche operatoire.",
      copyright: "© 2026 Anan. Tous droits reserves.",
    },
    seo: {
      home: {
        title: "Anan | Systeme d'exploitation immobilier pour l'IA, les equipes et la distribution",
        description:
          "Decouvrez comment Anan relie l'assistant IA, l'espace de travail commercial, l'infrastructure developpeur et la distribution courtier dans un seul systeme.",
      },
      assistant: {
        title: "Assistant Anan | Qualification IA pour l'immobilier",
        description:
          "L'assistant Anan capte l'intention, qualifie la demande et dirige les acheteurs vers le bon projet, le bon courtier ou la bonne equipe.",
      },
      workspace: {
        title: "Espace Anan | Operations commerciales et collaboration immobiliere",
        description:
          "Pilotez projets, offres, courtiers, clients et execution dans un seul espace de travail pense pour les equipes immobilieres.",
      },
      developer: {
        title: "Anan pour les promoteurs | Plus de visibilite sur la demande",
        description:
          "Offrez aux equipes promoteur une vue plus claire sur la demande, les projets, les offres et la distribution via courtiers.",
      },
      broker: {
        title: "Anan pour les courtiers | Suivi plus rapide et meilleure collaboration",
        description:
          "Aidez les courtiers a avancer plus vite avec un acces plus clair aux projets, un contexte partage et un suivi client mieux structure.",
      },
      about: {
        title: "A propos d'Anan | L'entreprise qui construit l'infrastructure immobiliere",
        description:
          "Découvrez comment Anan construit la couche operatoire reliant IA, donnees projets, distribution et execution pour l'immobilier moderne.",
      },
      contact: {
        title: "Contacter Anan | Parler avec l'equipe",
        description:
          "Contactez l'equipe Anan au sujet de la qualification IA, des operations workspace, des integrations ou des partenariats.",
      },
      pricing: {
        title: "Tarification Anan | Infrastructure commerciale flexible",
        description:
          "Comprenez l'approche d'Anan pour la tarification progressive des canaux IA, workspaces, integrations et services operationnels.",
      },
      partnerships: {
        title: "Partenariats Anan | Etendre la distribution et les services",
        description:
          "Explorez comment Anan collabore avec promoteurs, courtiers et prestataires pour transformer les signaux du marche en croissance.",
      },
      investor: {
        title: "Anan pour les investisseurs | Infrastructure pour la nouvelle pile immobiliere",
        description:
          "Pourquoi Anan voit l'IA immobiliere, la distribution via courtiers et les operations unifiees comme une opportunite d'infrastructure regionale.",
      },
      team: {
        title: "Equipe Anan | Batisseurs commerciaux et techniques",
        description:
          "Rencontrez l'equipe qui construit Anan sur le produit, le design operationnel et les systemes techniques derriere l'execution immobiliere.",
      },
      careers: {
        title: "Carrieres chez Anan | Construire le futur des operations immobilieres",
        description:
          "Rejoignez une equipe qui transforme la complexite commerciale et technique en systemes clairs pour les entreprises immobilieres.",
      },
      faq: {
        title: "FAQ Anan | Comment fonctionnent l'entreprise et la plateforme",
        description:
          "Reponses rapides sur l'assistant, l'espace de travail, les integrations et le role d'Anan dans les operations immobilieres.",
      },
      blog: {
        title: "Blog Anan | IA immobiliere, operations et distribution",
        description:
          "Analyses sur les systemes d'exploitation immobiliers, la qualification pilotee par l'IA et les infrastructures de croissance.",
      },
      docs: {
        title: "Docs developpeur | APIs publiques et integrations Anan",
        description:
          "Commencez avec OAuth, les APIs publiques et les modeles d'acces d'Anan pour partenaires et equipes techniques.",
      },
      policy: {
        title: "Politique de confidentialite | Anan",
        description: "La maniere dont Anan gere la confidentialite et les donnees sur ses surfaces publiques et operationnelles.",
      },
      terms: {
        title: "Conditions d'utilisation | Anan",
        description: "Conditions generales couvrant l'utilisation des pages publiques et des services associes a Anan.",
      },
    },
    about: {
      badge: "Entreprise",
      title: "Nous construisons la",
      titleAccent: "couche operatoire immobiliere",
      description:
        "Anan n'est pas seulement un workspace et n'est pas seulement un assistant. Nous construisons l'infrastructure qui relie demande, projets, equipes et intelligence commerciale.",
      missionTitle: "Mission",
      missionDescription:
        "Transformer l'activite immobiliere fragmentee en un systeme unifie pour la qualification, la distribution et l'execution.",
      valuesTitle: "Valeurs",
      valuesDescription:
        "La clarte avant le bruit. Une infrastructure extensible avant les outils temporaires. Des signaux de demande reels avant les suppositions.",
      workStyleTitle: "Notre methode",
      workStyleDescription:
        "Nous concevons pour promoteurs, courtiers et acheteurs en meme temps parce que le marche reel ne bouge jamais par une seule equipe.",
      whyTitle: "Pourquoi le marche a besoin d'un",
      whyAccent: "systeme unifie",
      whyDescriptionPrimary:
        "Les canaux se multiplient, la demande evolue vite, et les equipes ont besoin d'une vue commerciale commune. C'est pourquoi Anan est construit comme une infrastructure.",
      whyDescriptionSecondary:
        "Quand les conversations se connectent aux donnees et les donnees a l'execution, les decisions commerciales deviennent plus rapides et plus solides.",
      metricsUnified: "Couche unifiee",
      metricsAudience: "Publics cles",
      metricsAvailability: "Qualification continue",
      metricsClarity: "Clarte",
      identityTitle: "Anan aujourd'hui",
      identityAccent: "et sa prochaine etape",
      identityDescriptionPrimary:
        "Aujourd'hui, Anan commence par l'assistant, le workspace et l'orchestration de la distribution. Demain, la plateforme s'etendra vers des agents marques, des integrations plus profondes et des operations plus autonomes.",
      identityDescriptionSecondary:
        "Nous mesurons le succes par la facilite avec laquelle un acheteur passe de l'intention a l'opportunite et une equipe des donnees a l'execution.",
      talkToTeam: "Parler a l'equipe",
      developerSpace: "Explorer la solution promoteur",
      contact: "Nous contacter",
    },
    faq: {
      eyebrow: "Questions frequentes",
      title: "Comment nous pensons Anan comme entreprise et produit",
      description:
        "Des reponses courtes sur la plateforme, les canaux, et le role de l'assistant et du workspace dans les operations commerciales immobilieres.",
      groups: [
        {
          category: "Plateforme",
          items: [
            {
              q: "Qu'est-ce qu'Anan, simplement ?",
              a: "Anan est un systeme d'exploitation immobilier reliant qualification IA, workflows d'equipe, donnees projet et distribution via courtiers.",
            },
            {
              q: "Anan est-il seulement un chatbot ?",
              a: "Non. L'assistant est une couche d'acquisition et de qualification. La vraie valeur vient de son lien avec les donnees et l'execution commerciale.",
            },
          ],
        },
        {
          category: "Promoteurs et courtiers",
          items: [
            {
              q: "Pourquoi les promoteurs utilisent-ils Anan ?",
              a: "Pour voir la demande plus clairement, gerer projets et offres, et coordonner la distribution via courtiers depuis une seule surface operatoire.",
            },
            {
              q: "Comment les courtiers en beneficient-ils ?",
              a: "Ils obtiennent un acces plus propre aux projets, un meilleur contexte et une meilleure structure pour le suivi client.",
            },
          ],
        },
        {
          category: "Operations et integrations",
          items: [
            {
              q: "Anan peut-il s'integrer avec d'autres systemes ?",
              a: "Oui. Les docs developpeur couvrent OAuth et les APIs publiques parce qu'Anan est pense comme une infrastructure connectable.",
            },
            {
              q: "Comment commencer ?",
              a: "Utilisez l'assistant pour tester la couche conversationnelle, ou entrez dans le workspace si votre equipe travaille deja sur Anan.",
            },
          ],
        },
      ],
    },
    blog: {
      eyebrow: "Analyses et mises a jour",
      title: "Ecrire sur l'IA, la clarte commerciale et les operations immobilieres",
      description:
        "Nous partageons la maniere dont Anan pense la qualification de la demande, le design workspace, les integrations et les systemes utiles aux equipes immobilieres.",
      readMore: "Lire la suite",
      backToBlog: "Retour au blog",
      shareArticle: "Partager cet article",
      posts: [
        {
          slug: "assistant-demand-qualification",
          category: "Assistant",
          date: "3 avril 2026",
          title: "Comment un assistant IA transforme une conversation immobiliere en demande qualifiee",
          excerpt:
            "Les equipes immobilieres n'ont pas besoin de plus de messages. Elles ont besoin d'une couche qui comprend l'intention et la route avec contexte.",
          content:
            "L'assistant Anan n'est pas construit pour prolonger une conversation sans but. L'objectif est de transformer l'interet en structure exploitable: budget, zone, type d'actif, horizon et intention d'achat.\n\nUne fois cette structure en place, la valeur commerciale devient concrete. L'acheteur peut etre relie au bon projet, au bon courtier ou a la bonne equipe. C'est la difference entre un chatbot qui repond et un canal qui ameliore la qualite des opportunites.",
        },
        {
          slug: "workspace-commercial-clarity",
          category: "Workspace",
          date: "28 mars 2026",
          title: "Pourquoi les entreprises immobilieres ont besoin d'un workspace qui comprend le contexte commercial",
          excerpt:
            "Les outils fragmentes creent une friction invisible. Un meilleur workspace aide les equipes a voir la meme image et a bouger plus vite.",
          content:
            "Quand projets, offres, conversations et clients vivent dans des outils separes, le cout apparait en retards, erreurs de coordination et efforts repetes.\n\nAnan Workspace construit une couche operatoire plus claire. Les promoteurs voient la demande, les courtiers voient l'opportunite, et la direction voit ce qui se passe vraiment. C'est cette clarte qui rend l'execution commerciale scalable.",
        },
        {
          slug: "developer-apis-for-real-estate-growth",
          category: "Developpeurs",
          date: "20 mars 2026",
          title: "Pourquoi les APIs developpeur comptent dans la nouvelle pile immobiliere",
          excerpt:
            "Quand les integrations font partie de la strategie produit, etendre les canaux et les equipes devient plus rapide et moins couteux.",
          content:
            "Une partie de la vision d'Anan est de rester connectable. Cela signifie que OAuth et les APIs publiques ne sont pas des extras techniques separes.\n\nIls font partie du systeme commercial. Les integrations permettent de relier l'assistant, les donnees projet et les operations workspace a des outils partenaires ou internes, ce qui rend la distribution plus intelligente et la croissance plus facile a etendre.",
        },
      ],
    },
  },
};

/**
 * WHY:   Public marketing pages need one canonical content source across locales.
 * WHAT:  Returns the current locale's content dictionary for marketing pages and SEO.
 * HOW:   Falls back to Arabic only when callers pass an unsupported locale.
 */
export function getMarketingContent(locale: AppLocale) {
  return marketingContent[locale] ?? marketingContent.ar;
}

export function getBlogPost(locale: AppLocale, slug: string) {
  return getMarketingContent(locale).blog.posts.find((post) => post.slug === slug) ?? null;
}
