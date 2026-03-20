'use client'

import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { Modal } from '@/components/Modal'
import { Button } from '@/components/Button'
import { Input } from '@/components/Input'
import { Textarea } from '@/components/Textarea'
import { FORM_ERROR_BOX_CLASSES } from '@/lib/formStyles'
import type { CoachAthleteNote } from '@/types/database'
import {
  createCoachAthleteNote,
  deleteCoachAthleteNote,
  updateCoachAthleteNote,
} from '@/app/[locale]/dashboard/athletes/[athleteId]/coachNotesActions'
import { isError } from '@/lib/errors'

type CoachAthleteNoteModalProps = {
  isOpen: boolean
  onClose: () => void
  athleteId: string
  /** null = création */
  note: CoachAthleteNote | null
  onSaved: () => void
}

export function CoachAthleteNoteModal ({
  isOpen,
  onClose,
  athleteId,
  note,
  onSaved,
}: CoachAthleteNoteModalProps) {
  const t = useTranslations('coachAthleteNotes')
  const tVal = useTranslations('coachAthleteNotes.validation')
  const tCommon = useTranslations('common')

  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [titleError, setTitleError] = useState<string | undefined>()
  const [bodyError, setBodyError] = useState<string | undefined>()
  const [formError, setFormError] = useState<string | undefined>()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    if (!isOpen) return
    setFormError(undefined)
    setTitleError(undefined)
    setBodyError(undefined)
    if (note) {
      setTitle(note.title)
      setBody(note.body)
    } else {
      setTitle('')
      setBody('')
    }
  }, [isOpen, note])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(undefined)
    setTitleError(undefined)
    setBodyError(undefined)

    const titleTrim = title.trim()
    const bodyTrim = body.trim()
    if (!titleTrim) {
      setTitleError(tVal('titleRequired'))
      return
    }
    if (!bodyTrim) {
      setBodyError(tVal('bodyRequired'))
      return
    }

    setIsSubmitting(true)
    try {
      if (note) {
        const result = await updateCoachAthleteNote({
          athleteId,
          noteId: note.id,
          title: titleTrim,
          body: bodyTrim,
        })
        if (isError(result)) {
          setFormError(result.error)
          return
        }
      } else {
        const result = await createCoachAthleteNote({
          athleteId,
          title: titleTrim,
          body: bodyTrim,
        })
        if (isError(result)) {
          setFormError(result.error)
          return
        }
      }
      onSaved()
      onClose()
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!note) return
    if (!window.confirm(t('deleteConfirm'))) return

    setIsDeleting(true)
    setFormError(undefined)
    try {
      const result = await deleteCoachAthleteNote({
        athleteId,
        noteId: note.id,
      })
      if (isError(result)) {
        setFormError(result.error)
        return
      }
      onSaved()
      onClose()
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={note ? t('modalEditTitle') : t('modalCreateTitle')}
      size="lg"
      contentClassName="px-6 py-4"
    >
      <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
        {formError && (
          <div className={FORM_ERROR_BOX_CLASSES} role="alert">
            {formError}
          </div>
        )}
        <Input
          label={`${t('fieldTitle')} *`}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          error={titleError}
          disabled={isSubmitting || isDeleting}
          autoComplete="off"
        />
        <Textarea
          label={`${t('fieldBody')} *`}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          error={bodyError}
          disabled={isSubmitting || isDeleting}
          rows={10}
          className="min-h-[160px]"
        />
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-between sm:items-center pt-2 border-t border-stone-100">
          {note ? (
            <Button
              type="button"
              variant="danger"
              onClick={() => void handleDelete()}
              loading={isDeleting}
              loadingText={tCommon('deleting')}
              disabled={isSubmitting}
            >
              {t('deleteNote')}
            </Button>
          ) : (
            <span />
          )}
          <div className="flex flex-col-reverse sm:flex-row gap-2 sm:justify-end">
            <Button type="button" variant="muted" onClick={onClose} disabled={isSubmitting || isDeleting}>
              {t('cancel')}
            </Button>
            <Button
              type="submit"
              variant="primaryDark"
              loading={isSubmitting}
              loadingText={t('saving')}
              disabled={isDeleting}
            >
              {t('save')}
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  )
}
