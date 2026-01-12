import { PageHeader } from "@/components/page-header"
import { PageWrapper } from "@/components/page-wrapper"
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
  EmptyAction,
} from "@/components/ui/empty"
import { Button } from "@/components/ui/button"
import { Tag, Plus } from "lucide-react"

export default function ContactsTagsPage() {
  return (
    <PageWrapper>
      <PageHeader
        title="Tags & Attributes"
        description="Manage your audience tags and attributes"
        customActions={
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create Tag
          </Button>
        }
      />
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Tag />
          </EmptyMedia>
          <EmptyTitle>No tags yet</EmptyTitle>
          <EmptyDescription>
            Create tags to organize and segment your audience. Tags help you
            categorize contacts and create targeted campaigns.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <EmptyAction>
            <Plus />
            Create Tag
          </EmptyAction>
        </EmptyContent>
      </Empty>
    </PageWrapper>
  )
}