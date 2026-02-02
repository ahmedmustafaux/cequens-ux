import { FileQuestion } from "lucide-react"
import { PageHeader } from "@/components/page-header"
import { PageWrapper } from "@/components/page-wrapper"
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"

export default function VerifyPage() {
    return (
        <PageWrapper>
            <PageHeader
                title="Verify"
                description="Verification services"
            />
            <Empty>
                <EmptyHeader>
                    <EmptyMedia variant="icon">
                        <FileQuestion />
                    </EmptyMedia>
                    <EmptyTitle>Coming Soon</EmptyTitle>
                    <EmptyDescription>
                        This feature is currently under development and will be available soon.
                    </EmptyDescription>
                </EmptyHeader>
            </Empty>
        </PageWrapper>
    )
}
