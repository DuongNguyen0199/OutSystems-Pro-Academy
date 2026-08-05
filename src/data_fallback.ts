import { Course } from './types';

// Pure connector schema fallback - real questions & courses are loaded dynamically from Supabase database!
export const fallbackCourses: Course[] = [
  {
    id: "70daa8a9-20c7-4993-b292-54566ef12303",
    title: "OutSystems Associate Reactive Developer (O11)",
    price: 29.99,
    tags: [{ text: "O11", color: "purple" }, { text: "POPULAR", color: "green" }],
    description: "Complete verified practice tests and exam dump questions. Synced live from Supabase database.",
    imageUrl: "/src/assets/images/web_developer_1783426831823.jpg",
    previewQuestions: [
      {
        id: "prev_1",
        question: "In OutSystems Reactive Web Apps, which lifecycle event triggers before screen render?",
        answer: "On Initialize executes before rendering and before aggregate data fetching.",
        isFree: true
      }
    ],
    mockExam: [
      {
        id: "mock_1",
        question: "In OutSystems Reactive Web Apps, which lifecycle event is triggered before the screen is rendered?",
        choices: [
          { key: "A", text: "On Render" },
          { key: "B", text: "On Initialize" },
          { key: "C", text: "On Ready" },
          { key: "D", text: "On Destroy" }
        ],
        correctAnswer: "B",
        explanation: "On Initialize executes before rendering and data aggregates."
      }
    ]
  }
];
