import { Course } from './types';

export const fallbackCourses: Course[] = [
  {
    id: "70daa8a9-20c7-4993-b292-54566ef12303",
    title: "OutSystems Associate Reactive Developer (O11)",
    price: 29.99,
    tags: [{ text: "O11", color: "purple" }, { text: "POPULAR", color: "green" }],
    description: "Complete verified practice tests and 102 exam dump questions for OutSystems Associate Reactive Developer (O11).",
    imageUrl: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&auto=format&fit=crop&q=80",
    previewQuestions: [
      {
        id: "prev_react_1",
        question: "In OutSystems Reactive Web Apps, which lifecycle event is triggered before the screen is rendered?",
        answer: "On Initialize executes before rendering and before data aggregates start fetching.",
        isFree: true
      }
    ],
    mockExam: [
      {
        id: "q_react_1",
        question: "In OutSystems Reactive Web Apps, which lifecycle event is triggered before the screen is rendered?",
        choices: [
          { key: "A", text: "On Render" },
          { key: "B", text: "On Initialize" },
          { key: "C", text: "On Ready" },
          { key: "D", text: "On Destroy" }
        ],
        correctAnswer: "B",
        explanation: "On Initialize is the first screen lifecycle event, executing before screen rendering and before data aggregates start fetching."
      }
    ]
  },
  {
    id: "56c652a7-7d07-41ea-bfe7-c19acd320420",
    title: "OutSystems Architecture Specialist (ODC)",
    price: 34.99,
    tags: [{ text: "ODC", color: "orange" }, { text: "SPECIALIST", color: "blue" }],
    description: "Complete verified practice tests and 50 exam dump questions for OutSystems Architecture Specialist (ODC).",
    imageUrl: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&auto=format&fit=crop&q=80",
    previewQuestions: [],
    mockExam: []
  },
  {
    id: "48ad6d82-3994-490a-a4f4-c07f0a7a38db",
    title: "OutSystems Agentic AI Specialist (ODC)",
    price: 39.99,
    tags: [{ text: "ODC", color: "orange" }, { text: "NEW", color: "green" }],
    description: "Complete verified practice tests and 40 exam dump questions for OutSystems Agentic AI Specialist (ODC).",
    imageUrl: "https://images.unsplash.com/photo-1677442136019-21780efad99a?w=600&auto=format&fit=crop&q=80",
    previewQuestions: [],
    mockExam: []
  },
  {
    id: "2867b931-1550-424a-939e-99083bc56c12",
    title: "OutSystems Architecture Specialist (O11)",
    price: 34.99,
    tags: [{ text: "O11", color: "purple" }],
    description: "Complete verified practice tests and 55 exam dump questions for OutSystems Architecture Specialist (O11).",
    imageUrl: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&auto=format&fit=crop&q=80",
    previewQuestions: [],
    mockExam: []
  },
  {
    id: "a57fa873-1082-4ef9-81fb-8b173bf23901",
    title: "OutSystems Security Specialist (O11)",
    price: 34.99,
    tags: [{ text: "O11", color: "purple" }, { text: "SECURITY", color: "blue" }],
    description: "Complete verified practice tests and 120 exam dump questions for OutSystems Security Specialist (O11).",
    imageUrl: "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=600&auto=format&fit=crop&q=80",
    previewQuestions: [],
    mockExam: []
  },
  {
    id: "91bc8604-58a2-4a0b-bf11-48229a103211",
    title: "OutSystems Tech Lead Specialist (O11)",
    price: 39.99,
    tags: [{ text: "O11", color: "purple" }, { text: "LEADERSHIP", color: "green" }],
    description: "Complete verified practice tests and 180 exam dump questions for OutSystems Tech Lead Specialist (O11).",
    imageUrl: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600&auto=format&fit=crop&q=80",
    previewQuestions: [],
    mockExam: []
  },
  {
    id: "fe771120-410a-4859-994c-120019283401",
    title: "OutSystems Mobile Developer Specialist (O11)",
    price: 29.99,
    tags: [{ text: "O11", color: "purple" }, { text: "MOBILE", color: "blue" }],
    description: "Complete verified practice tests and 85 exam dump questions for OutSystems Mobile Developer Specialist (O11).",
    imageUrl: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=600&auto=format&fit=crop&q=80",
    previewQuestions: [],
    mockExam: []
  },
  {
    id: "c9019208-1192-421b-8711-540192837101",
    title: "OutSystems Web Developer Specialist (O11)",
    price: 29.99,
    tags: [{ text: "O11", color: "purple" }],
    description: "Complete verified practice tests and 90 exam dump questions for OutSystems Web Developer Specialist (O11).",
    imageUrl: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=600&auto=format&fit=crop&q=80",
    previewQuestions: [],
    mockExam: []
  },
  {
    id: "89102931-1029-4102-8812-109283019201",
    title: "OutSystems Front-End Developer Specialist (O11)",
    price: 29.99,
    tags: [{ text: "O11", color: "purple" }],
    description: "Complete verified practice tests and 60 exam dump questions for OutSystems Front-End Developer Specialist (O11).",
    imageUrl: "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=600&auto=format&fit=crop&q=80",
    previewQuestions: [],
    mockExam: []
  },
  {
    id: "e1029381-1920-4819-9182-109283019201",
    title: "OutSystems Delivery Specialist (O11)",
    price: 29.99,
    tags: [{ text: "O11", color: "purple" }],
    description: "Complete verified practice tests and 165 exam dump questions for OutSystems Delivery Specialist (O11).",
    imageUrl: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&auto=format&fit=crop&q=80",
    previewQuestions: [],
    mockExam: []
  },
  {
    id: "d0192831-1092-4192-8812-109283019201",
    title: "OutSystems Platform Ops Specialist (O11)",
    price: 34.99,
    tags: [{ text: "O11", color: "purple" }, { text: "DEVOPS", color: "blue" }],
    description: "Complete verified practice tests and 232 exam dump questions for OutSystems Platform Ops Specialist (O11).",
    imageUrl: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=600&auto=format&fit=crop&q=80",
    previewQuestions: [],
    mockExam: []
  }
];
