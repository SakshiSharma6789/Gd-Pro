# AI-Powered Group Discussion (GD) Coach

An intelligent platform designed to help individuals master communication and group discussion skills through real-time feedback and AI-driven analysis.

## 🌍 The Real-World Problem
Communication is one of the most critical skills in the modern job market, yet practicing for **Group Discussions (GD)** remains a major challenge for students and professionals alike:
*   **Lack of Practice Groups:** It is difficult to find a consistently available group of peers to practice with.
*   **Subjective Feedback:** Human feedback can be biased, inconsistent, or non-actionable.
*   **High Coaching Costs:** Professional soft-skills coaching is expensive and geographically limited.
*   **Performance Anxiety:** Many individuals feel intimidated practicing in front of others before they have gained basic confidence.

**AI GD Coach** solves this by providing a private, objective, and data-driven environment to practice anytime, anywhere.

## 🛠️ Tech Stack & Justification

### Frontend
*   **React (Vite):** Chosen for its component-based architecture and fast development cycle, ensuring a smooth Single Page Application (SPA) experience.
*   **TypeScript:** Used throughout the project to ensure type safety, reduce runtime bugs, and make the codebase more maintainable.
*   **Tailwind CSS:** Enabled rapid UI development with a "utility-first" approach, providing a clean, professional, and responsive design.
*   **Motion (Framer Motion):** Integrated to provide fluid transitions and micro-interactions, which are essential for keeping users engaged during focus-heavy practice sessions.
*   **Lucide React:** A consistent icon library that enhances visual cues without adding significant bloat.

### Backend & Infrastructure
*   **Node.js & Express:** Provides a lightweight but powerful server environment to manage environment variables and serve as a secure gateway for API calls.
*   **Firebase Authentication:** Implemented to provide secure, seamless Google sign-in and user identity management with minimal overhead.
*   **Cloud Firestore:** A NoSQL database used for its real-time capabilities and flexible schema, allowing us to store user history, topics, and AI feedback efficiently.

### Intelligence & Processing
*   **Google Gemini 1.5 Flash:** The core "brain" of the app. It analyzes transcripts to provide high-level qualitative feedback that traditional algorithms cannot, such as detecting relevance, structure, and providing model answers.
*   **Web Speech API:** Leverages browser-native speech-to-text capabilities, allowing the app to process high-fidelity audio input without the latency or cost of external cloud-based STT services.

## 🚀 Key Features
*   **Real-time Transcription:** See your words as you speak them.
*   **Intelligent Scoring:** Get objective scores on Relevance, Clarity, Structure, and Confidence.
*   **Mistake Detection:** AI identifies specific weak points in your argument.
*   **Improvement Roadmap:** Receive actionable tips and a "Model Answer" for every topic.
*   **Growth Tracking:** Monitor your progress over time via a personalized history dashboard.

---

Designed and Developed by **Sakshi**.
