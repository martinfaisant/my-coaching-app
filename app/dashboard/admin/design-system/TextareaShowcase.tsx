'use client'

import { Textarea } from '@/components/Textarea'

export function TextareaShowcase() {
  return (
    <div className="space-y-10">
      <div>
        <h3 className="text-base font-semibold text-stone-800 mb-4">
          Variantes
        </h3>
        <div className="grid gap-6 max-w-md">
          <div>
            <code className="text-xs font-mono text-stone-500">Sans label</code>
            <p className="text-xs text-stone-400 mb-2">Zone de texte autonome</p>
            <Textarea placeholder="Décrivez votre parcours…" />
          </div>
          <div>
            <code className="text-xs font-mono text-stone-500">Avec label</code>
            <p className="text-xs text-stone-400 mb-2">ProfileForm (présentation), WorkoutModal</p>
            <Textarea
              label="Présentation"
              placeholder="Parlez-nous de votre expérience et de votre approche…"
            />
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-base font-semibold text-stone-800 mb-4">
          État erreur
        </h3>
        <div className="max-w-md">
          <Textarea
            label="Description"
            placeholder="Saisissez la description de l'entraînement"
            error="La description doit contenir au moins 10 caractères"
            defaultValue="Court"
          />
        </div>
      </div>

      <div>
        <h3 className="text-base font-semibold text-stone-800 mb-4">
          État désactivé
        </h3>
        <div className="max-w-md">
          <Textarea
            label="Notes (lecture seule)"
            defaultValue="Ce champ est désactivé."
            disabled
          />
        </div>
      </div>

      <div>
        <h3 className="text-base font-semibold text-stone-800 mb-4">
          Hauteur personnalisée
        </h3>
        <p className="text-sm text-stone-600 mb-4">
          <code className="text-xs bg-stone-100 px-1 rounded">className=&quot;min-h-[200px]&quot;</code> pour une zone plus haute
        </p>
        <div className="max-w-md">
          <Textarea
            label="Long texte"
            placeholder="Zone plus grande pour les descriptions longues…"
            className="min-h-[200px]"
          />
        </div>
      </div>

      <div className="p-4 rounded-lg bg-stone-50 border border-stone-200 text-sm text-stone-700">
        <p className="font-medium mb-2">Usage :</p>
        <pre className="overflow-x-auto text-xs">{`<Textarea
  label="Présentation"
  placeholder="Parlez-nous de vous…"
  error={errors?.presentation}
  disabled={isSubmitting}
  rows={4}
/>
<Textarea
  label="Notes entraînement"
  placeholder="Indications pour l'athlète…"
  className="min-h-[120px]"
/>`}</pre>
      </div>
    </div>
  )
}
