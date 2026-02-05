export type IconKey =
  | "accessibleEntrance"
  | "accessibleElevator"
  | "metro"
  | "connectedBuildings"
  | "entry"
  | "printer"
  | "shuttle";

export type IconItem = {
  icon: IconKey;
  title: string;
  description: string;
};

export const BUILDING_DETAILS: Record<
  string,
  {
    accessibility: IconItem[];
    metro: { title: string; description: string };
    connectivity: { title: string; description: string };
    entries: { title: string; description: string }[];
    otherServices: IconItem[];
    overview: string[];
    venues: string[];
    departments: string[];
    services: string[];
  }
> = {
  H: {
    accessibility: [
      {
        icon: "accessibleEntrance",
        title: "Accessible Entrance",
        description: "This building has an automated accessible entrance door.",
      },
      {
        icon: "accessibleElevator",
        title: "Accessible Building Elevator",
        description:
          "This building entrance is equipped with an accessible elevator.",
      },
    ],

    metro: {
      title: "Guy–Concordia Station",
      description:
        "This campus is directly accessible via the Guy–Concordia metro station, providing convenient underground access to Concordia’s downtown buildings.",
    },

    connectivity: {
      title: "Connected Buildings",
      description:
        "This building is internally connected to the EV, JMSB, LB, and GM buildings, allowing indoor access between facilities without exiting the complex.",
    },

    entries: [
      { title: "3 entries on the main floor", description: "" },
      {
        title: "2 entries in the basement from the tunnel",
        description: "connecting the metro and other buildings.",
      },
      {
        title: "An entry from the student bar called Reggies,",
        description: "but it is not accessible 24/7.",
      },
    ],

    otherServices: [
      {
        icon: "printer",
        title: "Printer Access",
        description: "This building has printer access.",
      },
      {
        icon: "shuttle",
        title: "Shuttle Services Terminal",
        description: "It is close to the shuttle services terminal.",
      },
    ],

    overview: [
      "Completed in 1966, the Henry F. Hall Building is a prominent academic and social hub on the Sir George Williams Campus. Its cube-like form and exterior of pre-fabricated, stressed concrete reflect the Brutalist architectural style, a movement often associated with French architect Le Corbusier.",
      "Inside, the building brings together many academic departments — along with classrooms and engineering teaching and research labs.",
      "Beyond academics, it is a lively centre of student life, home to the Student Success Centre, Concordia Theatre and student spaces like the Hive Café, Reggies Pub, the People’s Potato and student association offices.",
    ],

    venues: [
      "Concordia Theatre",
      "Reggies",
      "Sir George Williams University Alumni Auditorium",
    ],

    departments: [
      "Economics",
      "Geography, Planning and Environment",
      "Political Science",
      "School of Irish Studies",
      "Sociology and Anthropology",
    ],

    services: [
      "Campus Safety and Prevention Services",
      "Concordia Student Union (CSU)",
      "First Stop",
      "Espace Franco",
      "IT Service Desk",
      "NouLa Black Student Centre",
      "Office of Student Life and Engagement",
      "Otsenhákta Student Centre",
      "Student Success Centre",
      "Welcome Crew Office",
      "Zen Den",
    ],
  },
};
