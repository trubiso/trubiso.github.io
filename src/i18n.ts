export const translations = {
  en: {
    nav: {
      home: "home",
      blog: "blog",
      experiments: "experiments",
      about: "about",
    },
    missingLocale: "You are reading the original version of this post.",
    about: {
      title: "About me",
      interestsTitle:
        "Here are some of my interests. Make sure not to drop them!",
      interests: [
        {
          name: "Spanish",
          category: "Languages",
          description: "Native language",
        },
        { name: "English", category: "Languages", description: "Level: C2" },
        { name: "Russian", category: "Languages", description: "Level: ~B2" },
        { name: "Czech", category: "Languages", description: "Level: ~B1" },
        { name: "German", category: "Languages", description: "Learning" },
        { name: "Japanese", category: "Languages", description: "Learning" },
        {
          name: "toki pona",
          category: "Languages",
          description: "Level: Fluent",
        },
        {
          name: "Languages",
          category: "Languages",
          description: "Linguistics and conlangs",
        },
        {
          name: "C++",
          category: "Programming",
          description: "Level: proficient enough",
        },
        {
          name: "Rust",
          category: "Programming",
          description: "Level: proficient enough",
        },
        {
          name: "C",
          category: "Programming",
          description: "Level: proficient enough",
        },
        {
          name: "TypeScript",
          category: "Programming",
          description: "Level: proficient enough",
        },
        {
          name: "Python",
          category: "Programming",
          description: "Level: proficient enough",
        },
        {
          name: "Programming languages",
          category: "Programming",
          description: "Language design and compiler development",
        },
        {
          name: "Game development",
          category: "Programming",
          description: "Graphics programming and game engine design",
        },
        {
          name: "Geometry Dash",
          category: "Games",
          description: "Hardest: Nhelv",
        },
        {
          name: "Minecraft",
          category: "Games",
          description: "Specialty: Computational redstone, piston doors",
        },
        { name: "TrackMania", category: "Games", description: "Casual player" },
        {
          name: "Jazz Fusion",
          category: "Music",
          description: "Bands: Snarky Puppy, Sungazer, Varra",
        },
        {
          name: "Symphonic Metal",
          category: "Music",
          description: "Bands: Epica, Nightwish",
        },
        {
          name: "Artists in rotation",
          category: "Music",
          description: "Tame Impala, Silentroom, Crackazat",
        },
        { name: "Music production", category: "Music" },
        { name: "Linear Programming", category: "Math" },
        { name: "Abstract Algebra", category: "Math" },
        { name: "Real Analysis", category: "Math" },
      ],
      projectsTitle: "Here are some of my projects.",
      projects: [
        {
          name: "Chestnut",
          description:
            "Compiler for a personal compiled low-level, statically-typed programming language with support for traits, generics, and type inference, as well as strict mutability and labeled arguments. Written purely in C++, using a custom CFG-based A-normal IR and an LLVM IR backend.",
          image: "/chestnut.png",
          startTime: "Dec 2025",
          endTime: "Mar 2026",
          technologies: ["C++", "LLVM"],
          url: "https://github.com/trubiso/chestnut",
        },
        {
          name: "Jumping World",
          description:
            "2D platformer made in GameMaker with a campaign, minigames, a level editor, and an online level-sharing platform, released for Windows and Android with Spanish and English language support.",
          image: "/jw.png",
          startTime: "May 2020",
          endTime: "Dec 2021",
          technologies: ["GameMaker"],
          url: "https://trubiso.itch.io/jumping-world",
        },
      ],
      socialsTitle: "Finally, here are some of my socials:",
      signoff: ":)",
    },
    projectCard: {
      present: "Present",
      viewProject: "View project",
    },
  },

  es: {
    nav: {
      home: "inicio",
      blog: "blog",
      experiments: "experimentos",
      about: "sobre mí",
    },
    missingLocale: "Estás leyendo la versión original de este artículo.",
    about: {
      title: "Sobre mí",
      interestsTitle:
        "He aquí algunas de las cosas que me interesan. ¡Que no se te caigan!",
      interests: [
        { name: "Español", category: "Idiomas", description: "Nativo" },
        { name: "Inglés", category: "Idiomas", description: "Nivel: C2" },
        { name: "Ruso", category: "Idiomas", description: "Nivel: ~B2" },
        { name: "Checo", category: "Idiomas", description: "Nivel: ~B1" },
        { name: "Alemán", category: "Idiomas", description: "Aprendiendo" },
        { name: "Japonés", category: "Idiomas", description: "Aprendiendo" },
        { name: "toki pona", category: "Idiomas", description: "Nivel alto" },
        {
          name: "Idiomas",
          category: "Idiomas",
          description: "Lingüística y lenguas construidas",
        },
        {
          name: "C++",
          category: "Programación",
          description: "Nivel: suficiente",
        },
        {
          name: "Rust",
          category: "Programación",
          description: "Nivel: suficiente",
        },
        {
          name: "C",
          category: "Programación",
          description: "Nivel: suficiente",
        },
        {
          name: "TypeScript",
          category: "Programación",
          description: "Nivel: suficiente",
        },
        {
          name: "Python",
          category: "Programación",
          description: "Nivel: suficiente",
        },
        {
          name: "Lenguajes de programación",
          category: "Programación",
          description: "Diseño de lenguajes y desarrollo de compiladores",
        },
        {
          name: "Desarrollo de videojuegos",
          category: "Programación",
          description:
            "Programación gráfica y diseño de motores de videojuegos",
        },
        {
          name: "Geometry Dash",
          category: "Juegos",
          description: "Hardest: Nhelv",
        },
        {
          name: "Minecraft",
          category: "Juegos",
          description:
            "Especialidad: Redstone computacional, puertas con pistones",
        },
        {
          name: "TrackMania",
          category: "Juegos",
          description: "Jugador casual",
        },
        {
          name: "Jazz fusión",
          category: "Música",
          description: "Bandas: Snarky Puppy, Sungazer, Varra",
        },
        {
          name: "Metal sinfónico",
          category: "Música",
          description: "Bandas: Epica, Nightwish",
        },
        {
          name: "Artistas en rotación",
          category: "Música",
          description: "Tame Impala, Silentroom, Crackazat",
        },
        { name: "Producción musical", category: "Música" },
        { name: "Programación lineal", category: "Matemáticas" },
        { name: "Álgebra abstracta", category: "Matemáticas" },
        { name: "Análisis real", category: "Matemáticas" },
      ],
      projectsTitle: "He aquí algunos de mis projectos.",
      projects: [
        {
          name: "Chestnut",
          description:
            "Compilador para un lenguaje de programación personal compilado, con un sistema de tipos estáticos y soporte para traits, tipos genéricos e inferencia automática de tipos, además de mutabilidad estricta y argumentos nombrados. Escrito puramente en C++, usando una representación intermedia A-normal basada en un grafo de flujo de control y usando el backend de LLVM.",
          image: "/chestnut.png",
          startTime: "Dec 2025",
          endTime: "Mar 2026",
          technologies: ["C++", "LLVM"],
          url: "https://github.com/trubiso/chestnut",
        },
        {
          name: "Jumping World",
          description:
            "Juego de plataformas 2D hecho en GameMaker con una campaña, minijuegos, un editor de niveles, y una plataforma online para compartir niveles, disponible para Windows y Android con traducciones al español y al inglés.",
          image: "/jw.png",
          startTime: "May 2020",
          endTime: "Dec 2021",
          technologies: ["GameMaker"],
          url: "https://trubiso.itch.io/jumping-world",
        },
      ],
      socialsTitle: "Finalmente, he aquí algunas de mis redes sociales:",
      signoff: ":)",
    },
    projectCard: {
      present: "Presente",
      viewProject: "Ver proyecto",
    },
  },
} as const;
