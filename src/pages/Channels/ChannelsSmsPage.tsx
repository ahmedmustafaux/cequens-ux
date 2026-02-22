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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  CheckCircle2,
  ExternalLink,
  AlertCircle,
  Copy,
  Eye,
  EyeOff,
  Phone,
  MessageSquare,
  ArrowRight,
  BookOpen,
  Code,
  PlayCircle,
  ChevronDown,
  Plus,
  Trash2,
  AlertTriangle,
  Zap,
} from "lucide-react"
import { toast } from "sonner"
import {
  addActiveChannel,
  addActiveChannelWithSync,
  removeActiveChannel,
  removeActiveChannelWithSync,
  saveSMSConfig,
  loadSMSConfig,
  clearSMSConfig,
  type SMSConfig
} from "@/lib/channel-utils"
import { useAuth } from "@/hooks/use-auth"

export default function ChannelsSmsPage() {
  const { user } = useAuth()
  const [isLoading, setIsLoading] = React.useState(true)
  const [showApiSecret, setShowApiSecret] = React.useState(false)
  const [isConnecting, setIsConnecting] = React.useState(false)
  const [showDisconnectDialog, setShowDisconnectDialog] = React.useState(false)
  const [disconnectConfirmation, setDisconnectConfirmation] = React.useState("")
  const [copiedButtonId, setCopiedButtonId] = React.useState<string | null>(null)

  const isInitialLoad = React.useRef(true)

  const [formData, setFormData] = React.useState({
    businessName: "",
    apiKey: "",
    apiSecret: "",
    webhookUrl: "",
  })

  const [senderIds, setSenderIds] = React.useState<SMSConfig["senderIds"]>([])

  React.useEffect(() => {
    const timer = setTimeout(() => {
      const savedConfig = loadSMSConfig()
      if (savedConfig && savedConfig.formData.apiKey) {
        setFormData(savedConfig.formData)
        setSenderIds(savedConfig.senderIds || [])
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
    if (formData.apiKey) {
      saveSMSConfig({ formData, senderIds })
    }
  }, [formData, senderIds])

  React.useEffect(() => {
    if (formData.apiKey && senderIds.length > 0) {
      if (user?.id) {
        addActiveChannelWithSync("sms", user.id)
      } else {
        addActiveChannel("sms")
      }
    } else {
      if (user?.id) {
        removeActiveChannelWithSync("sms", user.id)
      } else {
        removeActiveChannel("sms")
      }
    }
  }, [formData.apiKey, senderIds.length, user?.id])

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleCopy = (text: string, label: string, buttonId: string) => {
    navigator.clipboard.writeText(text)
    setCopiedButtonId(buttonId)
    setTimeout(() => setCopiedButtonId(null), 2000)
    toast.success(`${label} copied to clipboard`)
  }

  return (
    <PageWrapper isLoading={isLoading}>
      <PageHeader
        title="SMS Channel Configuration"
        description="Connect your SMS gateway and manage your sender IDs"
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
            {/* Section 1: Connection */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-primary" />
                  <CardTitle>SMS Gateway Connection</CardTitle>
                </div>
                <CardDescription>
                  Connect your business to the Cequens SMS Gateway
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {!formData.apiKey ? (
                  <div className="flex flex-col items-center justify-center py-8 space-y-4">
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                      <MessageSquare className="w-8 h-8 text-primary" />
                    </div>
                    <div className="text-center space-y-2">
                      <h3 className="font-semibold text-lg">Connect SMS Gateway</h3>
                      <p className="text-sm text-muted-foreground max-w-md">
                        Enable high-throughput SMS messaging for your business.
                      </p>
                    </div>
                    <Button
                      size="lg"
                      disabled={isConnecting}
                      onClick={() => {
                        setIsConnecting(true)
                        setTimeout(() => {
                          const newApiKey = `sms_live_${Math.random().toString(36).substring(7)}`
                          const newApiSecret = `sec_${Math.random().toString(36).substring(7)}`
                          setFormData({
                            businessName: "Vodafone Egypt",
                            apiKey: newApiKey,
                            apiSecret: newApiSecret,
                            webhookUrl: "https://api.vodafone.com.eg/sms/webhook",
                          })
                          setSenderIds([
                            {
                              id: "sid-1",
                              senderId: "Vodafone",
                              status: "active",
                              throughput: 100,
                              type: "transactional"
                            }
                          ])
                          setIsConnecting(false)
                          toast.success("SMS Gateway connected successfully")
                        }, 1500)
                      }}
                    >
                      {isConnecting ? "Connecting..." : "Connect Gateway"}
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4 p-4 rounded-lg border border-border bg-card">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <p className="text-sm font-medium">Business Name</p>
                        <p className="text-sm font-bold">{formData.businessName}</p>
                      </div>
                      <Badge className="bg-success">Active</Badge>
                    </div>
                    <Separator />
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground mb-1">API Key</p>
                        <p className="font-mono text-xs">{formData.apiKey}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground mb-1">Status</p>
                        <p className="font-medium">Production Ready</p>
                      </div>
                    </div>
                    <Separator />
                    <div className="flex gap-2">
                      <Button variant="outline" onClick={() => setShowDisconnectDialog(true)}>
                        Disconnect
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Section 2: Sender IDs */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Phone className="w-5 h-5" />
                    <CardTitle>Sender IDs</CardTitle>
                  </div>
                  {formData.apiKey && (
                    <Button variant="outline" size="sm" onClick={() => toast.info("Sender ID request submitted")}>
                      <Plus className="w-4 h-4 mr-2" />
                      Request New ID
                    </Button>
                  )}
                </div>
                <CardDescription>
                  Registered alphabetic or numeric identities for your messages
                </CardDescription>
              </CardHeader>
              <CardContent>
                {senderIds.length === 0 ? (
                  <div className="text-center py-6 text-muted-foreground text-sm">
                    No sender IDs configured. Connect gateway to see default IDs.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {senderIds.map((sid) => (
                      <div key={sid.id} className="p-4 rounded-lg border border-border flex items-center justify-between hover:bg-muted/30 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded bg-muted flex items-center justify-center font-bold text-primary">
                            {sid.senderId.substring(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold">{sid.senderId}</p>
                            <p className="text-xs text-muted-foreground">{sid.type.charAt(0).toUpperCase() + sid.type.slice(1)} • {sid.throughput} MPS</p>
                          </div>
                        </div>
                        <Badge variant={sid.status === "active" ? "default" : "secondary"}>
                          {sid.status.charAt(0).toUpperCase() + sid.status.slice(1)}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Section 3: API */}
            <Card>
              <CardHeader>
                <CardTitle>API Configuration</CardTitle>
                <CardDescription>Integrate SMS into your applications</CardDescription>
              </CardHeader>
              <CardContent>
                {!formData.apiKey ? (
                  <div className="text-center py-6 text-muted-foreground text-sm">
                    Connect gateway to view API credentials and samples.
                  </div>
                ) : (
                  <Tabs defaultValue="curl">
                    <TabsList>
                      <TabsTrigger value="curl">cURL</TabsTrigger>
                      <TabsTrigger value="node">Node.js</TabsTrigger>
                    </TabsList>
                    <TabsContent value="curl" className="mt-4">
                      <div className="relative rounded-lg bg-muted p-4 font-mono text-xs overflow-x-auto">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="absolute right-2 top-2 h-7 w-7 p-0"
                          onClick={() => handleCopy(`curl -X POST "https://apis.cequens.com/sms/v1/messages" \\
  -H "Authorization: Bearer ${formData.apiKey}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "to": "+201XXXXXXXXX",
    "message": "Hello from Cequens!",
    "senderName": "${senderIds[0]?.senderId || 'SENDER_ID'}"
  }'`, "cURL", "copy-curl")}
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                        <pre>
                          {`curl -X POST "https://apis.cequens.com/sms/v1/messages" \\
  -H "Authorization: Bearer ${formData.apiKey}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "to": "+201XXXXXXXXX",
    "message": "Hello from Cequens!",
    "senderName": "${senderIds[0]?.senderId || 'SENDER_ID'}"
  }'`}
                        </pre>
                      </div>
                    </TabsContent>
                    <TabsContent value="node" className="mt-4">
                      {/* Similar structure for Node.js */}
                      <div className="relative rounded-lg bg-muted p-4 font-mono text-xs">
                        <pre>
                          {`const axios = require('axios');
axios.post('https://apis.cequens.com/sms/v1/messages', {
  to: '+201XXXXXXXXX',
  message: 'Hello from Cequens!',
  senderName: '${senderIds[0]?.senderId || 'SENDER_ID'}'
}, {
  headers: { 'Authorization': 'Bearer ${formData.apiKey}' }
});`}
                        </pre>
                      </div>
                    </TabsContent>
                  </Tabs>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Panel */}
          <div className="w-1/3 min-w-[320px] max-w-[400px] space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>SMS Resources</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { title: "SMS API Reference", icon: <BookOpen className="w-4 h-4" /> },
                  { title: "Bulk Messaging Guide", icon: <PlayCircle className="w-4 h-4" /> },
                  { title: "Compliance Rules", icon: <AlertCircle className="w-4 h-4" /> }
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
            <DialogTitle>Disconnect SMS Gateway</DialogTitle>
            <DialogDescription>
              Are you sure? This will stop all SMS traffic and revoke API keys.
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
                setFormData({ businessName: "", apiKey: "", apiSecret: "", webhookUrl: "" })
                setSenderIds([])
                clearSMSConfig()
                setShowDisconnectDialog(false)
                toast.info("SMS Gateway disconnected")
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