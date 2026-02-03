'use client'

import { useActionState, useRef, useEffect } from 'react'
import { addGoal, deleteGoal, type GoalFormState } from './actions'
import type { Goal } from '@/types/database'

const PAST_DATE_MESSAGE = "Un objectif ne peut pas être défini dans le passé."

type ObjectifsTableProps = {
  goals: Goal[]
}

export function ObjectifsTable({ goals: initialGoals }: ObjectifsTableProps) {
  const [state, action] = useActionState<GoalFormState, FormData>(addGoal, {})
  const dateInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const input = dateInputRef.current
    if (!input) return
    const today = new Date().toISOString().slice(0, 10)
    const check = () => {
      input.setCustomValidity(input.value && input.value < today ? PAST_DATE_MESSAGE : '')
    }
    check()
    input.addEventListener('change', check)
    input.addEventListener('input', check)
    return () => {
      input.removeEventListener('change', check)
      input.removeEventListener('input', check)
    }
  }, [])

  return (
    <div className="mt-8 space-y-6">
      <form
        action={action}
        className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-6 shadow-sm"
      >
        <h2 className="text-lg font-medium text-slate-900 dark:text-white mb-4">
          Ajouter un objectif
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div lang="fr">
            <label htmlFor="date" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Date de l&apos;objectif
            </label>
            <input
              ref={dateInputRef}
              id="date"
              name="date"
              type="date"
              required
              min={new Date().toISOString().slice(0, 10)}
              className="w-full rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-4 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-500"
            />
          </div>
          <div>
            <label htmlFor="race_name" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Nom de la course
            </label>
            <input
              id="race_name"
              name="race_name"
              type="text"
              required
              placeholder="Ex. Marathon de Paris"
              className="w-full rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-4 py-2.5 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-500"
            />
          </div>
          <div>
            <label htmlFor="distance" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Distance
            </label>
            <input
              id="distance"
              name="distance"
              type="text"
              required
              placeholder="Ex. 42 km"
              className="w-full rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-4 py-2.5 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Type d&apos;objectif
            </label>
            <select
              name="is_primary"
              className="w-full rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-4 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-500"
            >
              <option value="primary">Objectif principal</option>
              <option value="secondary">Objectif secondaire</option>
            </select>
          </div>
        </div>
        {(state?.error || state?.success) && (
          <p
            className={`mt-3 text-sm ${state.error ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'}`}
            role="alert"
          >
            {state.error || state.success}
          </p>
        )}
        <button
          type="submit"
          className="mt-4 rounded-xl bg-slate-900 dark:bg-white px-4 py-2.5 text-sm font-medium text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 transition"
        >
          Ajouter
        </button>
      </form>

      <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm">
        <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
          <thead>
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500 dark:text-slate-400">
                Date
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500 dark:text-slate-400">
                Nom de la course
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500 dark:text-slate-400">
                Distance
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500 dark:text-slate-400">
                Objectif
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium uppercase text-slate-500 dark:text-slate-400">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
            {initialGoals.map((g) => (
              <tr key={g.id} className="bg-white dark:bg-slate-900">
                <td className="px-4 py-3 text-sm text-slate-900 dark:text-white">
                  {new Date(g.date).toLocaleDateString('fr-FR')}
                </td>
                <td className="px-4 py-3 text-sm text-slate-900 dark:text-white">
                  {g.race_name}
                </td>
                <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-300">
                  {g.distance}
                </td>
                <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-300">
                  {g.is_primary ? 'Principal' : 'Secondaire'}
                </td>
                <td className="px-4 py-3 text-right">
                  <DeleteGoalButton goalId={g.id} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {initialGoals.length === 0 && (
          <p className="px-4 py-8 text-center text-sm text-slate-500 dark:text-slate-400">
            Aucun objectif pour le moment.
          </p>
        )}
      </div>
    </div>
  )
}

function DeleteGoalButton({ goalId }: { goalId: string }) {
  return (
    <form
      action={async () => {
        await deleteGoal(goalId)
      }}
    >
      <button
        type="submit"
        className="text-sm text-red-600 dark:text-red-400 hover:underline"
      >
        Supprimer
      </button>
    </form>
  )
}
