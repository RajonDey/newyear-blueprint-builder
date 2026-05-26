import { useEffect, useMemo, useState } from "react"
import { toast } from "sonner"
import {
  parseProjectIntentions,
  parseTopIntentions,
} from "@/types/monthly"

export type CadencePlanRow = {
  projectIntentions: unknown
  topIntentions: unknown
}

export function buildCadencePlanState<
  TRow extends CadencePlanRow,
  TKey extends string | number,
>(
  plans: TRow[],
  getKey: (row: TRow) => TKey,
  getFocus: (row: TRow) => string | null | undefined,
) {
  const focus: Partial<Record<TKey, string>> = {}
  const intentions: Partial<Record<TKey, Record<string, string>>> = {}
  const top: Partial<Record<TKey, string[]>> = {}

  for (const row of plans) {
    const key = getKey(row)
    focus[key] = getFocus(row) ?? ""
    const parsed = parseProjectIntentions(row.projectIntentions)
    intentions[key] = Object.fromEntries(
      parsed.map((p) => [p.projectId, p.text]),
    )
    const tops = parseTopIntentions(row.topIntentions)
    top[key] = tops.length > 0 ? tops : [""]
  }

  return {
    focus: focus as Record<TKey, string>,
    intentions: intentions as Record<TKey, Record<string, string>>,
    top: top as Record<TKey, string[]>,
  }
}

function mergeTopWithEmptyDefaults<TKey extends string | number>(
  next: Record<TKey, string[]>,
  prev: Record<TKey, string[]>,
  allKeys: TKey[],
): Record<TKey, string[]> {
  const merged = { ...next }
  for (const key of allKeys) {
    if (!merged[key]?.length) {
      merged[key] = prev[key]?.length ? prev[key] : [""]
    }
  }
  return merged
}

/**
 * Shared monthly/quarterly plan form state — focus, project intentions, top-3.
 */
export function useCadencePlanFormState<
  TRow extends CadencePlanRow,
  TKey extends string | number,
>(args: {
  plans: TRow[]
  getKey: (row: TRow) => TKey
  getFocus: (row: TRow) => string | null | undefined
  emptyKeys: TKey[]
  topIntentionCapLabel: "month" | "quarter"
}) {
  const { plans, getKey, getFocus, emptyKeys, topIntentionCapLabel } = args

  const initial = useMemo(
    () => buildCadencePlanState(plans, getKey, getFocus),
    [plans, getKey, getFocus],
  )

  const [focusByPeriod, setFocusByPeriod] = useState<
    Record<TKey, string>
  >(() => initial.focus)

  const [projectIntentionsByPeriod, setProjectIntentionsByPeriod] = useState<
    Record<TKey, Record<string, string>>
  >(() => initial.intentions)

  const [topIntentionsByPeriod, setTopIntentionsByPeriod] = useState<
    Record<TKey, string[]>
  >(() => initial.top)

  useEffect(() => {
    const next = buildCadencePlanState(plans, getKey, getFocus)
    setFocusByPeriod(next.focus)
    setProjectIntentionsByPeriod(next.intentions)
    setTopIntentionsByPeriod((prev) =>
      mergeTopWithEmptyDefaults(next.top, prev, emptyKeys),
    )
    // getKey/getFocus are stable per cadence form module
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [plans])

  function setFocus(activeKey: TKey, value: string) {
    setFocusByPeriod((prev) => ({ ...prev, [activeKey]: value }))
  }

  function setProjectIntention(
    activeKey: TKey,
    projectId: string,
    text: string,
  ) {
    setProjectIntentionsByPeriod((prev) => ({
      ...prev,
      [activeKey]: { ...prev[activeKey], [projectId]: text },
    }))
  }

  function setTopIntention(activeKey: TKey, index: number, text: string) {
    setTopIntentionsByPeriod((prev) => {
      const rows = [...(prev[activeKey] ?? [""])]
      rows[index] = text
      return { ...prev, [activeKey]: rows }
    })
  }

  function addTopIntention(activeKey: TKey) {
    setTopIntentionsByPeriod((prev) => {
      const rows = [...(prev[activeKey] ?? [""])]
      if (rows.length >= 3) {
        toast.info(`Up to three top intentions for the ${topIntentionCapLabel}.`)
        return prev
      }
      return { ...prev, [activeKey]: [...rows, ""] }
    })
  }

  function removeTopIntention(activeKey: TKey, index: number) {
    setTopIntentionsByPeriod((prev) => {
      const rows = (prev[activeKey] ?? [""]).filter((_, i) => i !== index)
      return { ...prev, [activeKey]: rows.length ? rows : [""] }
    })
  }

  return {
    focusFor: (key: TKey) => focusByPeriod[key] ?? "",
    setFocus,
    projectIntentionsFor: (key: TKey) => projectIntentionsByPeriod[key] ?? {},
    setProjectIntention,
    topIntentionsFor: (key: TKey) => topIntentionsByPeriod[key] ?? [""],
    setTopIntention,
    addTopIntention,
    removeTopIntention,
  }
}
