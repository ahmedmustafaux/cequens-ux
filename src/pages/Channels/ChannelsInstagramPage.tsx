import * as React from "react"
import { motion } from "framer-motion"
import { PageHeader } from "@/components/page-header"
import { PageWrapper } from "@/components/page-wrapper"
import { pageVariants } from "@/lib/transitions"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  ExternalLink,
  AlertCircle,
  Copy,
  Eye,
  EyeOff,
  MessageSquare,
  BookOpen,
  Code,
  Trash2,
  AlertTriangle,
  Instagram,
  Users,
  BarChart3,
  RefreshCw,
} from "lucide-react"
import { toast } from "sonner"
import {
  addActiveChannel,
  addActiveChannelWithSync,
  removeActiveChannel,
  removeActiveChannelWithSync,
  saveInstagramConfig,
  loadInstagramConfig,
  clearInstagramConfig,
  type InstagramConfig
} from "@/lib/channel-utils"
import { useAuth } from "@/hooks/use-auth"

export default function ChannelsInstagramPage() {
  const { user } = useAuth()
  const [isLoading, setIsLoading] = React.useState(true)
  const [isAuthenticating, setIsAuthenticating] = React.useState(false)
  const [showDisconnectDialog, setShowDisconnectDialog] = React.useState(false)
  const [disconnectConfirmation, setDisconnectConfirmation] = React.useState("")
  const [copiedButtonId, setCopiedButtonId] = React.useState<string | null>(null)

  const isInitialLoad = React.useRef(true)

  const [formData, setFormData] = React.useState({
    pageId: "",
    accessToken: "",
    apiToken: "",
    about: "",
  })

  const [pages, setPages] = React.useState<InstagramConfig["pages"]>([])

  React.useEffect(() => {
    const timer = setTimeout(() => {
      const savedConfig = loadInstagramConfig()
      if (savedConfig && savedConfig.formData.pageId) {
        setFormData(savedConfig.formData)
        // Auto-patch logo for Vodafone simulation if missing
        const patchedPages = (savedConfig.pages || []).map(p =>
          p.name === "Vodafone Egypt"
            ? { ...p, logo: "/logos/vodafone-circle.png" }
            : p
        )
        setPages(patchedPages)
      }
      setIsLoading(false)
      setTimeout(() => {
        isInitialLoad.current = false
      }, 100)
    }, 400)
    return () => clearTimeout(timer)
  }, [])

  React.useEffect(() => {
    if (isInitialLoad.current) return
    if (formData.pageId) {
      saveInstagramConfig({ formData, pages })
    }
  }, [formData, pages])

  React.useEffect(() => {
    if (formData.pageId && pages.length > 0) {
      if (user?.id) {
        addActiveChannelWithSync("instagram", user.id)
      } else {
        addActiveChannel("instagram")
      }
    } else {
      if (user?.id) {
        removeActiveChannelWithSync("instagram", user.id)
      } else {
        removeActiveChannel("instagram")
      }
    }
  }, [formData.pageId, pages.length, user?.id])

  const handleCopy = (text: string, label: string, buttonId: string) => {
    navigator.clipboard.writeText(text)
    setCopiedButtonId(buttonId)
    setTimeout(() => setCopiedButtonId(null), 2000)
    toast.success(`${label} copied to clipboard`)
  }

  return (
    <PageWrapper isLoading={isLoading}>
      <PageHeader
        title="Instagram Channel"
        description="Connect your Instagram Business Account to manage messages and comments"
        isLoading={isLoading}
      />

      {!isLoading && (
        <motion.div
          variants={pageVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          className="flex gap-4"
        >
          <div className="flex-1 min-w-0 space-y-4">
            {/* Meta OAuth Section */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-pink-500/10 text-pink-500">
                    <Instagram className="w-5 h-5" />
                  </div>
                  <CardTitle>Meta Authentication</CardTitle>
                </div>
                <CardDescription>
                  Authorize Cequens to access your Instagram Business Accounts
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {!formData.pageId ? (
                  <div className="flex flex-col items-center justify-center py-8 space-y-4">
                    <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                      <Instagram className="w-8 h-8 text-pink-500" />
                    </div>
                    <div className="text-center space-y-2">
                      <h3 className="font-semibold text-lg">Connect to Meta</h3>
                      <p className="text-sm text-muted-foreground max-w-md">
                        Login with Facebook to select the Instagram Business Account you want to connect.
                      </p>
                    </div>
                    <Button
                      size="lg"
                      disabled={isAuthenticating}
                      onClick={() => {
                        setIsAuthenticating(true)
                        setTimeout(() => {
                          const newPageId = "insta_page_998877"
                          setFormData({
                            pageId: newPageId,
                            accessToken: "eaax_mock_token_123",
                            apiToken: `ceq_insta_${Math.random().toString(36).substring(7)}`,
                            about: "Official Instagram account for Vodafone Egypt",
                          })
                          setPages([
                            {
                              id: newPageId,
                              name: "Vodafone Egypt",
                              username: "vodafoneegypt",
                              followers: 2450000,
                              status: "active",
                              logo: "/logos/vodafone-circle.png"
                            }
                          ])
                          setIsAuthenticating(false)
                          toast.success("Successfully connected to Instagram")
                        }, 2000)
                      }}
                    >
                      {isAuthenticating ? "Redirecting to Meta..." : "Continue with Facebook"}
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4 p-4 rounded-lg border border-border bg-card">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full border border-border bg-muted overflow-hidden flex items-center justify-center">
                          {pages[0]?.logo ? (
                            <img src={pages[0].logo} alt={pages[0].name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500 flex items-center justify-center text-white">
                              <Instagram className="w-6 h-6" />
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-bold">{pages[0]?.name}</p>
                          <p className="text-xs text-muted-foreground">@{pages[0]?.username}</p>
                        </div>
                      </div>
                      <Badge className="bg-success">Connected</Badge>
                    </div>
                    <Separator />
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground mb-1">Page ID</p>
                        <p className="font-mono text-xs">{formData.pageId}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground mb-1">Account Type</p>
                        <p className="font-medium">Business Account</p>
                      </div>
                    </div>
                    <Separator />
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => setShowDisconnectDialog(true)}>
                        Disconnect Account
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Page Stats/Insights */}
            {formData.pageId && (
              <Card>
                <CardHeader>
                  <CardTitle>Channel Insights</CardTitle>
                  <CardDescription>Recent performance for your Instagram channel</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="p-4 rounded-lg border border-border space-y-1">
                      <div className="flex items-center gap-2 text-muted-foreground mb-1">
                        <Users className="w-4 h-4" />
                        <span className="text-xs font-medium">Followers</span>
                      </div>
                      <p className="text-lg font-bold">2.45M</p>
                    </div>
                    <div className="p-4 rounded-lg border border-border space-y-1">
                      <div className="flex items-center gap-2 text-muted-foreground mb-1">
                        <MessageSquare className="w-4 h-4" />
                        <span className="text-xs font-medium">New Messages</span>
                      </div>
                      <p className="text-lg font-bold">142</p>
                    </div>
                    <div className="p-4 rounded-lg border border-border space-y-1">
                      <div className="flex items-center gap-2 text-muted-foreground mb-1">
                        <BarChart3 className="w-4 h-4" />
                        <span className="text-xs font-medium">Reach (30d)</span>
                      </div>
                      <p className="text-lg font-bold">+12.4%</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* API Section */}
            <Card>
              <CardHeader>
                <CardTitle>Developer Configuration</CardTitle>
                <CardDescription>Integrate Instagram messaging into your custom apps</CardDescription>
              </CardHeader>
              <CardContent>
                {!formData.pageId ? (
                  <div className="text-center py-6 text-muted-foreground text-sm">
                    Connect your Instagram account to view API credentials.
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground">Instagram API Token</Label>
                      <div className="flex gap-2">
                        <Input readOnly value={formData.apiToken} className="font-mono text-xs" />
                        <Button variant="outline" size="sm" onClick={() => handleCopy(formData.apiToken, "API Token", "copy-api")}>
                          <Copy className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    <Separator />
                    <Tabs defaultValue="curl">
                      <TabsList>
                        <TabsTrigger value="curl">cURL</TabsTrigger>
                        <TabsTrigger value="node">Node.js</TabsTrigger>
                      </TabsList>
                      <TabsContent value="curl" className="mt-4">
                        <div className="relative rounded-lg bg-muted p-4 font-mono text-xs overflow-x-auto">
                          <pre>
                            {`curl -X POST "https://apis.cequens.com/instagram/v1/messages" \\
  -H "Authorization: Bearer ${formData.apiToken}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "recipient_id": "IG_USER_ID",
    "message": {
      "text": "Hello from Cequens!"
    }
  }'`}
                          </pre>
                        </div>
                      </TabsContent>
                    </Tabs>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Panel */}
          <div className="w-1/3 min-w-[320px] max-w-[400px] space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Instagram Resources</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { title: "Messenger API for Instagram", icon: <BookOpen className="w-4 h-4" /> },
                  { title: "Instagram Messaging Guide", icon: <Code className="w-4 h-4" /> },
                  { title: "Policy & Best Practices", icon: <AlertCircle className="w-4 h-4" /> }
                ].map((res, i) => (
                  <div key={i} className="flex items-center justify-between p-3 border border-border rounded-lg hover:bg-muted/50 cursor-pointer">
                    <div className="flex items-center gap-3">
                      {res.icon}
                      <span className="text-sm font-medium">{res.title}</span>
                    </div>
                    <ExternalLink className="w-3.5 h-3.5 text-muted-foreground" />
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </motion.div>
      )}

      {/* Disconnect Dialog */}
      <Dialog open={showDisconnectDialog} onOpenChange={setShowDisconnectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Disconnect Instagram Account</DialogTitle>
            <DialogDescription>
              This will remove the connection between Cequens and your Instagram Business Account.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Type 'disconnect' to confirm</Label>
              <Input
                value={disconnectConfirmation}
                onChange={(e) => setDisconnectConfirmation(e.target.value)}
                placeholder="disconnect"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDisconnectDialog(false)}>Cancel</Button>
            <Button
              variant="destructive"
              disabled={disconnectConfirmation !== "disconnect"}
              onClick={() => {
                setFormData({ pageId: "", accessToken: "", apiToken: "", about: "" })
                setPages([])
                clearInstagramConfig()
                setShowDisconnectDialog(false)
                toast.info("Instagram account disconnected")
              }}
            >
              Disconnect
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageWrapper>
  )
}
