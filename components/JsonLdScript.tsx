type JsonLdScriptProps = {
  json: string
}

/** Schéma JSON-LD inline (SEO). */
export function JsonLdScript({ json }: JsonLdScriptProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: json }}
    />
  )
}
