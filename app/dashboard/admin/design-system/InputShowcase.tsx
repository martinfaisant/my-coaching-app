'use client'

import { Input } from '@/components/Input'

export function InputShowcase() {
  return (
    <div className="space-y-10">
      <div>
        <h3 className="text-base font-semibold text-stone-800 mb-4">
          Variantes
        </h3>
        <div className="grid gap-6 max-w-md">
          <div>
            <code className="text-xs font-mono text-stone-500">Sans label</code>
            <p className="text-xs text-stone-400 mb-2">Champ autonome</p>
            <Input placeholder="Placeholder texte" />
          </div>
          <div>
            <code className="text-xs font-mono text-stone-500">Avec label</code>
            <p className="text-xs text-stone-400 mb-2">LoginForm, ProfileForm</p>
            <Input label="Email" type="email" placeholder="vous@exemple.com" />
          </div>
          <div>
            <code className="text-xs font-mono text-stone-500">Type password</code>
            <Input label="Mot de passe" type="password" placeholder="••••••••" />
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-base font-semibold text-stone-800 mb-4">
          État erreur
        </h3>
        <div className="grid gap-6 max-w-md">
          <Input
            label="Email"
            type="email"
            placeholder="vous@exemple.com"
            error="Email invalide ou déjà utilisé"
          />
          <Input
            label="Code postal"
            placeholder="75001"
            error="Code postal invalide"
            defaultValue="12"
          />
        </div>
      </div>

      <div>
        <h3 className="text-base font-semibold text-stone-800 mb-4">
          État désactivé / lecture seule
        </h3>
        <p className="text-sm text-stone-600 mb-4">
          Fond gris (stone-100), texte et bordure atténués — visuellement distinct des champs actifs.
        </p>
        <div className="grid gap-6 max-w-md">
          <Input label="Email (lecture seule)" defaultValue="user@example.com" readOnly />
          <Input label="Prénom" placeholder="Désactivé" disabled />
        </div>
      </div>

      <div>
        <h3 className="text-base font-semibold text-stone-800 mb-4">
          Types HTML
        </h3>
        <div className="grid gap-6 sm:grid-cols-2 max-w-2xl">
          <Input label="text" type="text" placeholder="Texte" />
          <Input label="email" type="email" placeholder="email@exemple.com" />
          <Input label="password" type="password" placeholder="••••••••" />
          <Input label="number" type="number" placeholder="42" />
          <Input label="tel" type="tel" placeholder="06 12 34 56 78" />
          <Input label="url" type="url" placeholder="https://" />
        </div>
      </div>

      <div className="p-4 rounded-lg bg-stone-50 border border-stone-200 text-sm text-stone-700">
        <p className="font-medium mb-2">Usage :</p>
        <pre className="overflow-x-auto text-xs">{`<Input
  label="Email"
  type="email"
  placeholder="vous@exemple.com"
  error={errors?.email}
  disabled={isSubmitting}
  required
/>
<Input
  label="Mot de passe"
  type="password"
  placeholder="••••••••"
  error="Mot de passe incorrect"
/>`}</pre>
      </div>
    </div>
  )
}
