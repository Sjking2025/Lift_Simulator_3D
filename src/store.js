import { create } from 'zustand';

export const useStore = create((set, get) => ({
    // Configuration
    floors: 8,
    floorHeight: 1.5,

    // Elevator State
    elevatorY: 0,
    targetFloor: null,
    direction: 'idle', // 'up', 'down', 'idle'
    doorState: 'closed', // 'closed', 'opening', 'open', 'closing'
    doorOpenProgress: 0, // 0 to 1

    // Requests
    hallCalls: [], // { floor, direction }
    carCalls: [], // [floor, floor...]

    // Passengers
    passengers: [], // { id, source, target, state: 'waiting'|'boarding'|'in_car'|'exiting'|'done', x, z }

    // Logs
    logs: [], // { id, time, message }

    // Actions
    setElevatorY: (y) => set({ elevatorY: y }),

    setDoorState: (state) => set({ doorState: state }),
    setDoorProgress: (progress) => set({ doorOpenProgress: progress }),

    addPassenger: (p) => set((state) => ({ passengers: [...state.passengers, p] })),
    updatePassenger: (id, updates) => set((state) => ({
        passengers: state.passengers.map(p => p.id === id ? { ...p, ...updates } : p)
    })),
    removePassenger: (id) => set((state) => ({
        passengers: state.passengers.filter(p => p.id !== id)
    })),

    addLog: (message) => set((state) => {
        const newLog = {
            id: Math.random().toString(36).substr(2, 9),
            time: new Date().toLocaleTimeString([], { hour12: false, hour: "2-digit", minute: "2-digit", second: "2-digit" }),
            message
        };
        return { logs: [newLog, ...state.logs].slice(0, 50) };
    }),

    requestFloor: (floor, type = 'car') => set((state) => {
        if (type === 'car') {
            if (state.carCalls.includes(floor)) return {};
            return { carCalls: [...state.carCalls, floor].sort((a, b) => a - b) };
        } else {
            // Hall call logic (simplified for now)
            if (state.hallCalls.some(c => c.floor === floor)) return {};
            return { hallCalls: [...state.hallCalls, { floor, direction: 'up' }] };
        }
    }),

    clearCall: (floor) => set((state) => ({
        carCalls: state.carCalls.filter(f => f !== floor),
        hallCalls: state.hallCalls.filter(c => c.floor !== floor)
    })),
}));
