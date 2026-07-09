import { Course } from './types';
import agenticAiImg from './assets/images/agentic_ai_1783426796399.jpg';
import architectureImg from './assets/images/architecture_specialist_1783426813087.jpg';
import webDevImg from './assets/images/web_developer_1783426831823.jpg';

export const courses: Course[] = [
  {
    id: 'agentic-ai-specialist',
    title: 'OutSystems Agentic AI Specialist (ODC) — NEW',
    price: 15,
    tags: [
      { text: 'ODC', color: 'blue' },
      { text: 'NEW', color: 'green' },
      { text: 'BEST SELLER', color: 'orange' }
    ],
    description: 'Master AI integration and automation in OutSystems Developer Cloud with advanced agent-based solutions.',
    imageUrl: agenticAiImg,
    previewQuestions: [
      {
        id: 'ai-q1',
        question: 'What is an agentic AI system in the context of OutSystems?',
        answer: 'An agentic AI system is an autonomous agent that can perceive its environment, make decisions, and take actions to achieve specific goals with minimal human intervention. In ODC, this is achieved by orchestrating LLMs with secure app integrations.',
        isFree: true
      },
      {
        id: 'ai-q2',
        question: 'How do you integrate AI models into OutSystems applications?',
        answer: 'AI model integration in ODC is accomplished via native AI connectors (such as OpenAI, Azure, or Google Vertex AI) configured in the OutSystems Integration Manager, or via standard secure REST integrations passing OAuth/bearer tokens to LLM gateways.',
        isFree: true
      }
    ],
    mockExam: [
      {
        id: 'ai-m1',
        question: 'Which of the following is the recommended method to secure API credentials when building an AI chatbot agent in ODC?',
        choices: [
          { key: 'A', text: 'Store the key directly as a hardcoded text literal in the client action.' },
          { key: 'B', text: 'Use an ODC Application Secret configured in the ODC Portal.' },
          { key: 'C', text: 'Save it inside a standard Local Storage variable on the user\'s mobile app.' },
          { key: 'D', text: 'Define it inside a Site Property marked with No Encryption.' }
        ],
        correctAnswer: 'B',
        explanation: 'In OutSystems Developer Cloud (ODC), highly sensitive credentials and API keys must always be stored securely using "Secrets" within the ODC Portal, rather than being hardcoded in actions or client variables which can be reverse engineered.'
      },
      {
        id: 'ai-m2',
        question: 'In agentic workflows, what is the role of a "Tool" in a Retrieval-Augmented Generation (RAG) setup?',
        choices: [
          { key: 'A', text: 'To translate the natural language user query into SQL statements manually.' },
          { key: 'B', text: 'To compress and convert PDF training files into image files.' },
          { key: 'C', text: 'To allow the LLM to access external APIs or databases to fetch real-time and domain-specific knowledge.' },
          { key: 'D', text: 'To handle visual animations of loading dots inside the user interface.' }
        ],
        correctAnswer: 'C',
        explanation: 'Tools represent the capabilities provided to an LLM agent, such as REST APIs, databases, or specialized services, allowing the agent to retrieve accurate, updated, and private domain-specific data to solve a user\'s query.'
      },
      {
        id: 'ai-m3',
        question: 'When designing a prompt template in an ODC server action, why should you implement input sanitization before forwarding the prompt to the LLM?',
        choices: [
          { key: 'A', text: 'To ensure the prompt meets HTML5 styling compliance.' },
          { key: 'B', text: 'To prevent prompt injection attacks where users attempt to override the system instructions.' },
          { key: 'C', text: 'To speed up the network latency of the REST call.' },
          { key: 'D', text: 'To decrease the file size of the OutSystems application package.' }
        ],
        correctAnswer: 'B',
        explanation: 'Just like SQL injection, prompt injection happens when malicious input tricks the LLM into disregarding its system guidelines. Sanitizing user input prevents users from manipulating the instructions embedded in the prompt template.'
      },
      {
        id: 'ai-m4',
        question: 'What is the function of the "Temperature" parameter when interacting with a foundation model in an OutSystems action?',
        choices: [
          { key: 'A', text: 'It measures the server CPU temperature during prompt evaluation.' },
          { key: 'B', text: 'It controls the randomness and creativity of the generated completions.' },
          { key: 'C', text: 'It determines the timeout duration for the HTTP socket connection.' },
          { key: 'D', text: 'It specifies the visual theme mode of the AI rendering component.' }
        ],
        correctAnswer: 'B',
        explanation: 'The Temperature parameter controls the probability distribution of tokens. A lower temperature (near 0) makes the model more deterministic and analytical, while a higher temperature makes the output more creative and diverse.'
      }
    ]
  },
  {
    id: 'architecture-specialist',
    title: 'OutSystems Architecture Specialist (ODC)',
    price: 14,
    tags: [
      { text: 'ODC', color: 'blue' },
      { text: 'NEW', color: 'green' },
      { text: 'BEST SELLER', color: 'orange' }
    ],
    description: 'Design scalable and maintainable applications in OutSystems Developer Cloud.',
    imageUrl: architectureImg,
    previewQuestions: [
      {
        id: 'arch-q1',
        question: 'What is the main purpose of Domain Driven Design (DDD) in OutSystems Architecture?',
        answer: 'Domain-Driven Design (DDD) organizes modules and services into clear, logical boundaries reflecting real business domains. This minimizes cross-domain tight coupling, promotes clear APIs, and allows scaling components independently.',
        isFree: true
      },
      {
        id: 'arch-q2',
        question: 'How do you prevent circular dependencies in OutSystems Cloud architecture?',
        answer: 'Circular dependencies are avoided by establishing a strict layered hierarchy (End-User, Core, Foundation) where elements only refer downward. If cross-communication is needed between side-by-side core modules, we utilize loose coupling via public events or decoupled service actions.',
        isFree: true
      }
    ],
    mockExam: [
      {
        id: 'arch-m1',
        question: 'In OutSystems architecture guidelines, what is the core difference between a Server Action and a Service Action?',
        choices: [
          { key: 'A', text: 'Server Actions run on the server, while Service Actions run directly inside the browser.' },
          { key: 'B', text: 'Service Actions run in a separate transaction and are called via secure REST, allowing independent deployments; Server Actions run in the same transaction.' },
          { key: 'C', text: 'Service Actions can only connect to external databases, while Server Actions only connect to the local OutSystems DB.' },
          { key: 'D', text: 'Server Actions are deprecated in ODC and completely replaced by Service Actions.' }
        ],
        correctAnswer: 'B',
        explanation: 'Service Actions in OutSystems have separate database transactions and act as REST services under the hood, making them loosely coupled and independently deployable. Server Actions are direct library references that run in the same transaction.'
      },
      {
        id: 'arch-m2',
        question: 'You have two core business modules: "Customer_CS" and "Invoice_CS". The Invoice_CS module needs to fetch customer information. How should this dependency be designed?',
        choices: [
          { key: 'A', text: 'Create a circular dependency where each module references entities of the other directly.' },
          { key: 'B', text: 'Invoice_CS should reference public entities or public read-only views exposed by Customer_CS to retrieve data.' },
          { key: 'C', text: 'Merge both Customer_CS and Invoice_CS into a single massive monolithic module.' },
          { key: 'D', text: 'Duplicate all customer database tables directly inside the Invoice_CS schema.' }
        ],
        correctAnswer: 'B',
        explanation: 'To keep a clean architectural flow, Invoice_CS (core service) should consume customer data by referencing public, read-only entities or API actions exposed by Customer_CS. This maintains single ownership of customer data inside Customer_CS.'
      },
      {
        id: 'arch-m3',
        question: 'What is the fundamental benefit of splitting your application into "Foundation" modules?',
        choices: [
          { key: 'A', text: 'To group highly volatile business workflows that change daily.' },
          { key: 'B', text: 'To create reusable, non-business specific components (e.g., helpers, external integrations, wrappers, theme modules) that can be consumed by any core module without side-effects.' },
          { key: 'C', text: 'To store the master screens and final navigation UI layers.' },
          { key: 'D', text: 'To bypass the need for securing API endpoints.' }
        ],
        correctAnswer: 'B',
        explanation: 'The Foundation layer represents the bottom of the architecture stack. It contains highly reusable, agnostic modules (such as custom extensions, utility wrappers, and CSS themes) that do not contain core business logic, preventing dependencies from creeping into core domains.'
      }
    ]
  },
  {
    id: 'web-developer-specialist',
    title: 'OutSystems Web Developer Specialist (O11)',
    price: 15,
    tags: [
      { text: 'O11', color: 'purple' }
    ],
    description: 'Prepared and recreated right after the OutSystems exam (~80% similar to the real exam)',
    imageUrl: webDevImg,
    previewQuestions: [
      {
        id: 'web-q1',
        question: 'What is the difference between a Client Variable and a Site Property in OutSystems?',
        answer: 'Client Variables are saved directly on the client browser/device (persisting across sessions but vulnerable to modification), while Site Properties are global variables evaluated on the server. Site Properties are shared across all users and should never store user-specific sensitive data.',
        isFree: true
      },
      {
        id: 'web-q2',
        question: 'How does OutSystems handle Database Transactions for server actions?',
        answer: 'OutSystems automatically initiates a transaction at the start of a request. All server database operations (such as Create, Update, Delete) share this transaction. It is automatically committed when the request completes successfully, or rolled back if an unhandled exception occurs.',
        isFree: true
      }
    ],
    mockExam: [
      {
        id: 'web-m1',
        question: 'In a Reactive Web Screen, which Lifecycle Event is the most appropriate to initialize local screen variables that do NOT depend on external database aggregates?',
        choices: [
          { key: 'A', text: 'On Render' },
          { key: 'B', text: 'On Destroy' },
          { key: 'C', text: 'On Initialize' },
          { key: 'D', text: 'On After Fetch' }
        ],
        correctAnswer: 'C',
        explanation: 'On Initialize runs before the screen is rendered and before any data fetching begins. This is the optimal lifecycle hook to set initial states or read local inputs quickly without causing layout flickering.'
      },
      {
        id: 'web-m2',
        question: 'To display a list of customer orders with the customer\'s name in a Reactive Web page, what join condition should you use in your Aggregate?',
        choices: [
          { key: 'A', text: 'Order Only with Customer (Inner Join)' },
          { key: 'B', text: 'Order With or Without Customer (Left Join)' },
          { key: 'C', text: 'Order Ignore Customer' },
          { key: 'D', text: 'Cross Join with all systems entities' }
        ],
        correctAnswer: 'B',
        explanation: 'Using a "With or Without" (Left Outer Join) ensures that all Order records are fetched even if some do not have an assigned Customer. This prevents losing records from the list due to missing associations.'
      },
      {
        id: 'web-m3',
        question: 'If a database aggregate fails during a screen render because of database connectivity issues, how does the OutSystems exception handler intercept this?',
        choices: [
          { key: 'A', text: 'By crashing the user\'s local browser immediately.' },
          { key: 'B', text: 'By triggering the nearest Global Exception Handler node or screen-specific Database Exception Handler.' },
          { key: 'C', text: 'By automatically generating random replacement records to show the user.' },
          { key: 'D', text: 'By executing the On Destroy event of the screen.' }
        ],
        correctAnswer: 'B',
        explanation: 'OutSystems utilizes an Exception Handling flow. Database exceptions trigger the database-specific exception handler if defined locally, otherwise bubble up to the All Exceptions handler or the Global Exception Handler node.'
      }
    ]
  }
];
