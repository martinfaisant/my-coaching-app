'use client'

import { useActionState, useRef, useEffect } from 'react'
import { PrimaryButton } from '@/components/PrimaryButton'
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
        className="rounded-xl border-2 border-palette-forest-dark bg-white p-6"
      >
        <h2 className="text-base font-semibold text-stone-900 mb-5">
          Ajouter un objectif
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div lang="fr">
            <label htmlFor="date" className="block text-sm font-medium text-stone-700text-stone-300 mb-2">
              Date de l&apos;objectif
            </label>
            <input
              ref={dateInputRef}
              id="date"
              name="date"
              type="date"
              required
              min={new Date().toISOString().slice(0, 10)}
              className="objectifs-date-input w-full rounded-lg border border-2 border-palette-forest-dark bg-white px-4 py-2.5 text-stone-900 focus:outline-none focus:ring-2 focus:ring-palette-olive focus:border-transparent transition"
            />
          </div>
          <div>
            <label htmlFor="race_name" className="block text-sm font-medium text-stone-700text-stone-300 mb-2">
              Nom de la course
            </label>
            <input
              id="race_name"
              name="race_name"
              type="text"
              required
              placeholder="Ex. Marathon de Paris"
              className="w-full rounded-lg border border-2 border-palette-forest-dark bg-white px-4 py-2.5 text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-palette-olive focus:border-transparent transition"
            />
          </div>
          <div>
            <label htmlFor="distance" className="block text-sm font-medium text-stone-700text-stone-300 mb-2">
              Distance
            </label>
            <input
              id="distance"
              name="distance"
              type="text"
              required
              placeholder="Ex. 42 km"
              className="w-full rounded-lg border border-2 border-palette-forest-dark bg-white px-4 py-2.5 text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-palette-olive focus:border-transparent transition"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700text-stone-300 mb-2">
              Type d&apos;objectif
            </label>
            <select
              name="is_primary"
              className="w-full rounded-lg border border-2 border-palette-forest-dark bg-white px-4 py-2.5 text-stone-900 focus:outline-none focus:ring-2 focus:ring-palette-olive focus:border-transparent transition"
            >
              <option value="primary">Objectif principal</option>
              <option value="secondary">Objectif secondaire</option>
            </select>
          </div>
        </div>
        {(state?.error || state?.success) && (
          <p
            className={`mt-4 text-sm ${state.error ? 'text-red-600' : 'text-palette-forest-dark600text-palette-forest-dark400'}`}
            role="alert"
          >
            {state.error || state.success}
          </p>
        )}
        <PrimaryButton type="submit" className="mt-5">
          Ajouter
        </PrimaryButton>
      </form>

      <div className="overflow-hidden rounded-xl border-2 border-palette-forest-dark bg-white">
        <table className="min-w-full divide-y divide-stone-200divide-stone-700">
          <thead>
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-white0text-stone-400">
                Date
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-white0text-stone-400">
                Nom de la course
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-white0text-stone-400">
                Distance
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-white0text-stone-400">
                Objectif
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium uppercase text-white0text-stone-400">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-200divide-stone-700">
            {initialGoals.map((g) => (
              <tr key={g.id} className="bg-white">
                <td className="px-4 py-3 text-sm text-stone-900">
                  {new Date(g.date).toLocaleDateString('fr-FR')}
                </td>
                <td className="px-4 py-3 text-sm text-stone-900">
                  {g.race_name}
                </td>
                <td className="px-4 py-3 text-sm text-stone-600text-stone-300">
                  {g.distance}
                </td>
                <td className="px-4 py-3 text-sm text-stone-600text-stone-300">
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
          <p className="px-4 py-8 text-center text-sm text-white0text-stone-400">
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
        className="text-sm text-red-600 hover:underline"
      >
        Supprimer
      </button>
    </form>
  )
}
