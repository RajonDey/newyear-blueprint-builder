import type { Metadata } from "next"
import { requireAuth } from "@/lib/auth-guard"
import { planLimits } from "@/lib/config"
import { hasProProductAccess } from "@/lib/plan-access"
import { getVisionForUser } from "@/lib/queries/vision"
import { getLinkedProjectsByVisionItemIds } from "@/lib/queries/vision-projects"
import { getNotesForParent } from "@/lib/queries/notes"
import { getResourcesForParent } from "@/lib/queries/resources"
import { knowledgeNotesHref, knowledgeResourcesHref } from "@/lib/knowledge/index-links"
import { PageContainer } from "@/components/shared/page-container"
import { PageHeader } from "@/components/shared/page-header"
import { VisionBoard } from "@/components/vision/vision-board"
import { VisionVisitTracker } from "@/components/vision/vision-visit-tracker"
import { NotesBlock } from "@/components/knowledge/notes-block"
import { ResourcesBlock } from "@/components/knowledge/resources-block"

export const metadata: Metadata = { title: "Life Vision" }

export default async function VisionPage() {
  const session = await requireAuth()
  const isPro = hasProProductAccess(session.user.planTier, session.user.role)
  const cap = planLimits[session.user.planTier].maxVisionItems
  const vision = await getVisionForUser(session.user.id)
  const linkedProjectsByItemId = await getLinkedProjectsByVisionItemIds(
    session.user.id,
    vision.items.map((item) => item.id),
  )
  const linkedProjectsRecord = Object.fromEntries(linkedProjectsByItemId)
  const notes = await getNotesForParent(session.user.id, "VISION", vision.id)
  const resources = await getResourcesForParent(session.user.id, "VISION", vision.id)
  const limits = planLimits[session.user.planTier]

  return (
    <PageContainer>
      <PageHeader
        eyebrow="Foundation · Life vision"
        title="The life you're walking toward"
        description="Not a yearly plan. A north-star you can return to across years — values you protect, milestones that matter, quotes you keep close."
      />

      <VisionVisitTracker />

      <VisionBoard
        northStar={vision.northStar}
        items={vision.items}
        linkedProjectsByItemId={linkedProjectsRecord}
        cap={cap}
        isPro={isPro}
      />

      <NotesBlock
        parentType="VISION"
        parentId={vision.id}
        initial={notes}
        title="Notes from the journey"
        description="Reflections on what's emerged, what's shifted, what still pulls."
        viewAllHref={knowledgeNotesHref({ parentType: "VISION" })}
      />

      <ResourcesBlock
        parentType="VISION"
        parentId={vision.id}
        initial={resources}
        canUploadFiles={limits.canUploadResourceFiles}
        maxFileBytes={limits.maxResourceFileBytes}
        title="Resources for the vision"
        description="Quotes, articles, and references that anchor your north star."
        viewAllHref={knowledgeResourcesHref({ parentType: "VISION" })}
      />
    </PageContainer>
  )
}
