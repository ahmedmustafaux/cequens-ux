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
  MessageCircle,
  BookOpen,
  Code,
  Facebook,
  ShieldCheck,
  Zap,
} from "lucide-react"
import { toast } from "sonner"
import {
  addActiveChannel,
  addActiveChannelWithSync,
  removeActiveChannel,
  removeActiveChannelWithSync,
  saveMessengerConfig,
  loadMessengerConfig,
  clearMessengerConfig,
  type MessengerConfig
} from "@/lib/channel-utils"
import { useAuth } from "@/hooks/use-auth"

export default function ChannelsMessengerPage() {
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

  const [pages, setPages] = React.useState<MessengerConfig["pages"]>([])

  React.useEffect(() => {
    const timer = setTimeout(() => {
      const savedConfig = loadMessengerConfig()
      if (savedConfig && savedConfig.formData.pageId) {
        setFormData(savedConfig.formData)
        // Auto-patch logo for Vodafone simulation if missing
        const patchedPages = (savedConfig.pages || []).map(p =>
          p.name === "Vodafone Egypt Support"
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
      saveMessengerConfig({ formData, pages })
    }
  }, [formData, pages])

  React.useEffect(() => {
    if (formData.pageId && pages.length > 0) {
      if (user?.id) {
        addActiveChannelWithSync("messenger", user.id)
      } else {
        addActiveChannel("messenger")
      }
    } else {
      if (user?.id) {
        removeActiveChannelWithSync("messenger", user.id)
      } else {
        removeActiveChannel("messenger")
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
        title="Messenger Channel"
        description="Connect your Facebook Pages to enable Messenger communication"
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
                  <div className="p-1.5 rounded-lg bg-blue-600/10 text-blue-600">
                    <Facebook className="w-5 h-5" />
                  </div>
                  <CardTitle>Meta Authentication</CardTitle>
                </div>
                <CardDescription>
                  Connect your Facebook account to manage Messenger for your pages
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {!formData.pageId ? (
                  <div className="flex flex-col items-center justify-center py-8 space-y-4">
                    <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                      <MessageCircle className="w-8 h-8 text-blue-600" />
                    </div>
                    <div className="text-center space-y-2">
                      <h3 className="font-semibold text-lg">Connect to Facebook</h3>
                      <p className="text-sm text-muted-foreground max-w-md">
                        Login with Facebook to enable Messenger integration for your business pages.
                      </p>
                    </div>
                    <Button
                      size="lg"
                      className="bg-[#1877F2] hover:bg-[#1877F2]/90 text-white"
                      disabled={isAuthenticating}
                      onClick={() => {
                        setIsAuthenticating(true)
                        setTimeout(() => {
                          const newPageId = "fb_page_112233"
                          setFormData({
                            pageId: newPageId,
                            accessToken: "eaab_mock_token_456",
                            apiToken: `ceq_mess_${Math.random().toString(36).substring(7)}`,
                            about: "Official Messenger channel for Vodafone Egypt Support",
                          })
                          setPages([
                            {
                              id: newPageId,
                              name: "Vodafone Egypt Support",
                              status: "active",
                              logo: "/logos/vodafone-circle.png"
                            }
                          ])
                          setIsAuthenticating(false)
                          toast.success("Messenger channel connected successfully")
                        }, 2000)
                      }}
                    >
                      <Facebook className="w-4 h-4 mr-2 fill-current" />
                      {isAuthenticating ? "Connecting..." : "Continue with Facebook"}
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
                            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white">
                              <MessageCircle className="w-6 h-6" />
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-bold">{pages[0]?.name}</p>
                          <p className="text-xs text-muted-foreground">Connected Page</p>
                        </div>
                      </div>
                      <Badge className="bg-success">Active</Badge>
                    </div>
                    <Separator />
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground mb-1">Page ID</p>
                        <p className="font-mono text-xs">{formData.pageId}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground mb-1">Status</p>
                        <p className="font-medium">Messaging Enabled</p>
                      </div>
                    </div>
                    <Separator />
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => setShowDisconnectDialog(true)}>
                        Disconnect Page
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            {formData.pageId && (
              <Card>
                <CardHeader>
                  <CardTitle>Channel Settings</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg border border-border flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Zap className="w-5 h-5 text-primary" />
                      <span className="text-sm font-medium">Auto-Response</span>
                    </div>
                    <Badge variant="outline">Enabled</Badge>
                  </div>
                  <div className="p-4 rounded-lg border border-border flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <ShieldCheck className="w-5 h-5 text-success" />
                      <span className="text-sm font-medium">Verify Webhook</span>
                    </div>
                    <Button variant="ghost" size="sm">Check</Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* API Section */}
            <Card>
              <CardHeader>
                <CardTitle>Messenger API</CardTitle>
                <CardDescription>Send and receive messages via the Cequens Messenger API</CardDescription>
              </CardHeader>
              <CardContent>
                {!formData.pageId ? (
                  <div className="text-center py-6 text-muted-foreground text-sm">
                    Connect a page to view API integration details.
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground">Messenger API Token</Label>
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
                            {`curl -X POST "https://apis.cequens.com/messenger/v1/messages" \\
  -H "Authorization: Bearer ${formData.apiToken}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "recipient_id": "PSID_USER_ID",
    "message": {
      "text": "Hello, how can we help you today?"
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
                <CardTitle>Messenger Resources</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { title: "Messenger Platform Docs", icon: <BookOpen className="w-4 h-4" /> },
                  { title: "Webhooks Integration", icon: <Code className="w-4 h-4" /> },
                  { title: "App Review Guidelines", icon: <ShieldCheck className="w-4 h-4" /> }
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
            <DialogTitle>Disconnect Messenger Page</DialogTitle>
            <DialogDescription>
              This will disable messaging capabilities for the selected Facebook Page.
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
                clearMessengerConfig()
                setShowDisconnectDialog(false)
                toast.info("Messenger page disconnected")
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