import { useNavigate, Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Home } from "lucide-react"

export default function NotFoundPage() {
    const navigate = useNavigate()

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4 text-center">
            <div className="space-y-4">
                <h1 className="text-9xl font-bold text-primary">404</h1>
                <h2 className="text-2xl font-bold tracking-tight text-foreground">Page not found</h2>
                <p className="text-muted-foreground">
                    Sorry, we couldn&apos;t find the page you&apos;re looking for.
                </p>
            </div>
            <div className="mt-8 flex gap-4">
                <Button variant="outline" onClick={() => navigate(-1)}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Go Back
                </Button>
                <Button asChild>
                    <Link to="/">
                        <Home className="mr-2 h-4 w-4" />
                        Go to Home
                    </Link>
                </Button>
            </div>
        </div>
    )
}
