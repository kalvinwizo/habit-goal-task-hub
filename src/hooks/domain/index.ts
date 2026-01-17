/**
 * Domain Hooks - Modular Business Logic Layer
 * 
 * This directory contains UI-agnostic hooks that encapsulate all business logic
 * for the application. These hooks:
 * 
 * 1. Contain NO JSX, DOM manipulation, or rendering logic
 * 2. Are pure functions that operate on data
 * 3. Handle calculations, filtering, sorting, and validation
 * 4. Delegate all data mutations to the data layer (AppContext/useCloudSync)
 * 
 * Architecture:
 * 
 *   UI Components (presentation-only)
 *         ↓
 *   Domain Hooks (business logic)
 *         ↓
 *   Data Layer (useCloudSync - persistence)
 *         ↓
 *   Supabase (cloud storage)
 * 
 * Usage Example:
 * ```tsx
 * function MyComponent() {
 *   const { habits } = useApp(); // Data layer
 *   const { todayHabits, getFrequencyLabel } = useHabits({ habits }); // Domain logic
 *   
 *   return (
 *     <div>
 *       {todayHabits.map(habit => (
 *         <div key={habit.id}>{habit.name} - {getFrequencyLabel(habit)}</div>
 *       ))}
 *     </div>
 *   );
 * }
 * ```
 */

export { useHabits } from './useHabits';
export { useHabitLogs } from './useHabitLogs';
export { useGoals } from './useGoals';
export { useGoalProgress } from './useGoalProgress';
export { useTasks } from './useTasks';
export { useSettings } from './useSettings';
