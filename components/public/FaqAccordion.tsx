'use client'

import { useId, useState, type ReactNode } from 'react'

export type FaqAccordionItem = {
  id: string
  question: string
  content: ReactNode
}

type FaqAccordionProps = {
  items: FaqAccordionItem[]
  /** Index du panneau ouvert par défaut (aucun si omis). */
  defaultOpenIndex?: number
}

export function FaqAccordion({ items, defaultOpenIndex }: FaqAccordionProps) {
  const baseId = useId()
  const [openIndex, setOpenIndex] = useState<number | null>(
    defaultOpenIndex !== undefined ? defaultOpenIndex : null
  )

  return (
    <div className="space-y-3">
      {items.map((item, index) => {
        const isOpen = openIndex === index
        const panelId = `${baseId}-panel-${item.id}`
        const buttonId = `${baseId}-button-${item.id}`

        return (
          <div key={item.id} className="rounded-xl border border-stone-200 bg-white">
            <h3>
              <button
                type="button"
                id={buttonId}
                className="flex w-full items-center justify-between gap-3 p-4 text-left text-sm font-semibold text-stone-900"
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => setOpenIndex(isOpen ? null : index)}
              >
                <span>{item.question}</span>
                <svg
                  className={`h-5 w-5 shrink-0 text-stone-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden
                >
                  <path d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </h3>
            <div
              id={panelId}
              role="region"
              aria-labelledby={buttonId}
              hidden={!isOpen}
              className="border-t border-stone-100 px-4 pb-4 pt-3 text-sm leading-relaxed text-stone-600"
            >
              {item.content}
            </div>
          </div>
        )
      })}
    </div>
  )
}
