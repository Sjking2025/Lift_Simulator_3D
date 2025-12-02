# 🏢 3D Smart Lift Simulator

> **Experience the "Brain" of an Elevator in High-Fidelity 3D.**

![React](https://img.shields.io/badge/React-18-blue)
![Three.js](https://img.shields.io/badge/Three.js-Fiber-black)


## 🌐 Live Demo
Experience the simulation directly in your browser before cloning:
👉 **[Live Preview (Vercel)](https://liftsimulator3dreal.vercel.app/)**

## 💡 The Idea
Elevators are the unsung heroes of modern architecture, transporting millions of people daily with invisible efficiency. But how do they actually decide where to go?

This project is a **High-Fidelity 3D Simulation** designed to demystify the logic behind elevator dispatching. It visualizes the complex decision-making process in real-time, wrapped in a stunning, cinematic 3D environment. We don't just show you a box moving up and down; we show you **why** it's moving.

## ✨ Key Features

-   **🎮 Cinematic 3D Visuals**: Built with `Three.js` and PBR (Physically Based Rendering) materials. Features polished marble floors, refractive glass shafts, and dynamic lighting.
-   **🧠 Smart Door Logic**: The elevator "sees" passengers. Doors hold open for boarding/exiting users and automatically re-open if a passenger tries to enter while they are closing.
-   **📝 Live Activity Log**: A real-time feed on the left panel broadcasts the elevator's internal state—decisions, arrivals, and passenger interactions—as they happen.
-   **👥 Intelligent Passenger System**: Autonomous passengers spawn, wait, call the lift, board, and travel to their destinations with distinct states (`Waiting`, `Boarding`, `Traveling`, `Exiting`).

## 🚀 The SCAN Algorithm (The "Brain")

At the heart of this simulator lies the **SCAN Algorithm** (also known as the **Elevator Algorithm**). This is the industry-standard logic that prevents your elevator from wasting time.

### How it Works:
1.  **Directional Preference**: The elevator continues moving in its current direction (e.g., UP) as long as there are remaining requests (calls) in that direction.
2.  **Service on the Way**: It stops at any floor that has a request matching its current direction.
3.  **Reversal**: Only when there are **no more requests** ahead of it does it reverse direction.

### Why it's a Big Deal:
Without SCAN, an elevator might behave like FCFS (First-Come, First-Served), zig-zagging wildly between floor 1 and floor 8, wasting energy and time.
**SCAN optimizes for throughput**, ensuring that everyone gets picked up in a smooth, continuous flow, minimizing wear and tear and maximizing passenger satisfaction.

## 🛠️ Tech Stack

-   **Frontend**: React (Vite)
-   **3D Engine**: `@react-three/fiber` (Three.js)
-   **State Management**: `zustand` (Global simulation state)
-   **Post-Processing**: `@react-three/postprocessing` (Bloom, SSAO, Vignette)
-   **Styling**: TailwindCSS / Styled Components

## 🏁 Getting Started

1.  **Clone the repository**
    ```bash
    git clone https://github.com/your-username/lift-simulator-3d.git
    ```
2.  **Install dependencies**
    ```bash
    npm install
    ```
3.  **Run the simulation**
    ```bash
    npm run dev
    ```
4.  Open `http://localhost:5173` and start spawning passengers!

---

*Built with ❤️ by the Antigravity Team*
