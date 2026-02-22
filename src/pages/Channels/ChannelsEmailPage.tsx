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
  Mail,
  ArrowRight,
  BookOpen,
  Code,
  Plus,
  Trash2,
  AlertTriangle,
  Globe,
  ShieldCheck,
  RefreshCw,
} from "lucide-react"
import { toast } from "sonner"
import {
  addActiveChannel,
  addActiveChannelWithSync,
  removeActiveChannel,
  removeActiveChannelWithSync,
  saveEmailConfig,
  loadEmailConfig,
  clearEmailConfig,
  type EmailConfig
} from "@/lib/channel-utils"
import { useAuth } from "@/hooks/use-auth"

export default function ChannelsEmailPage() {
  const { user } = useAuth()
  const [isLoading, setIsLoading] = React.useState(true)
  const [isVerifying, setIsVerifying] = React.useState(false)
  const [showDisconnectDialog, setShowDisconnectDialog] = React.useState(false)
  const [disconnectConfirmation, setDisconnectConfirmation] = React.useState("")
  const [copiedButtonId, setCopiedButtonId] = React.useState<string | null>(null)

  const isInitialLoad = React.useRef(true)

  const [formData, setFormData] = React.useState({
    domain: "",
    apiKey: "",
    webhookUrl: "",
  })

  const [domains, setDomains] = React.useState<EmailConfig["domains"]>([])

  React.useEffect(() => {
    const timer = setTimeout(() => {
      const savedConfig = loadEmailConfig()
      if (savedConfig && savedConfig.formData.domain) {
        setFormData(savedConfig.formData)
        setDomains(savedConfig.domains || [])
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
    if (formData.domain) {
      saveEmailConfig({ formData, domains })
    }
  }, [formData, domains])

  React.useEffect(() => {
    if (formData.domain && domains.some(d => d.status === "verified")) {
      if (user?.id) {
        addActiveChannelWithSync("email", user.id)
      } else {
        addActiveChannel("email")
      }
    } else {
      if (user?.id) {
        removeActiveChannelWithSync("email", user.id)
      } else {
        removeActiveChannel("email")
      }
    }
  }, [formData.domain, domains, user?.id])

  const handleCopy = (text: string, label: string, buttonId: string) => {
    navigator.clipboard.writeText(text)
    setCopiedButtonId(buttonId)
    setTimeout(() => setCopiedButtonId(null), 2000)
    toast.success(`${label} copied to clipboard`)
  }

  return (
    <PageWrapper isLoading={isLoading}>
      <PageHeader
        title="Email Channel Configuration"
        description="Verify your sending domains and configure transactional email"
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
            {/* Section 1: Domain Setup */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Globe className="w-5 h-5 text-primary" />
                  <CardTitle>Domain Verification</CardTitle>
                </div>
                <CardDescription>
                  Connect and verify your sender domain to enable email delivery
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {!formData.domain ? (
                  <div className="flex flex-col items-center justify-center py-8 space-y-4">
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                      <Mail className="w-8 h-8 text-primary" />
                    </div>
                    <div className="text-center space-y-2">
                      <h3 className="font-semibold text-lg">Setup Sending Domain</h3>
                      <p className="text-sm text-muted-foreground max-w-md">
                        Enter your domain to generate DNS verification records.
                      </p>
                    </div>
                    <div className="flex w-full max-w-sm items-center space-x-2">
                      <Input
                        placeholder="e.g. mail.vodafone.com.eg"
                        value={formData.domain}
                        onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
                      />
                      <Button
                        onClick={() => {
                          if (!formData.domain) {
                            toast.error("Please enter a domain")
                            return
                          }
                          setIsVerifying(true)
                          setTimeout(() => {
                            setDomains([
                              {
                                id: "dom-1",
                                domain: formData.domain,
                                status: "pending",
                                spf: false,
                                dkim: false,
                                dmarc: false,
                              }
                            ])
                            setFormData(prev => ({ ...prev, apiKey: `em_live_${Math.random().toString(36).substring(7)}` }))
                            setIsVerifying(false)
                            toast.success("Domain records generated")
                          }, 1000)
                        }}
                        disabled={isVerifying}
                      >
                        {isVerifying ? "Processing..." : "Continue"}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {domains.map((dom) => (
                      <div key={dom.id} className="p-4 rounded-lg border border-border bg-card space-y-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold">{dom.domain}</h4>
                            <Badge variant={dom.status === "verified" ? "default" : "secondary"}>
                              {dom.status.charAt(0).toUpperCase() + dom.status.slice(1)}
                            </Badge>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              toast.info("Verifying DNS records...")
                              setTimeout(() => {
                                setDomains(prev => prev.map(d => d.id === dom.id ? { ...d, status: "verified", spf: true, dkim: true, dmarc: true } : d))
                                toast.success("Domain verified successfully!")
                              }, 1500)
                            }}
                          >
                            <RefreshCw className="w-4 h-4 mr-2" />
                            Verify Records
                          </Button>
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                          {[
                            { label: "SPF", status: dom.spf },
                            { label: "DKIM", status: dom.dkim },
                            { label: "DMARC", status: dom.dmarc },
                          ].map((rec) => (
                            <div key={rec.label} className="flex items-center gap-2 bg-muted/50 p-2 rounded border border-border">
                              <ShieldCheck className={`w-4 h-4 ${rec.status ? "text-success" : "text-muted-foreground"}`} />
                              <span className="text-xs font-medium">{rec.label}</span>
                            </div>
                          ))}
                        </div>

                        {dom.status === "pending" && (
                          <Alert variant="default" className="bg-primary/5 border-primary/20">
                            <AlertCircle className="h-4 w-4" />
                            <AlertTitle className="text-sm">Action Required</AlertTitle>
                            <AlertDescription className="text-xs">
                              Add the DNS records below to your domain registrar's control panel.
                            </AlertDescription>
                          </Alert>
                        )}

                        <Separator />
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" onClick={() => setShowDisconnectDialog(true)}>
                            Remove Domain
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Section 2: API */}
            <Card>
              <CardHeader>
                <CardTitle>Email API</CardTitle>
                <CardDescription>Send transactional emails via API or SMTP</CardDescription>
              </CardHeader>
              <CardContent>
                {!formData.apiKey || !domains.some(d => d.status === "verified") ? (
                  <div className="text-center py-6 text-muted-foreground text-sm">
                    Complete domain verification to access API credentials.
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground">API Key</Label>
                      <div className="flex gap-2">
                        <Input readOnly value={formData.apiKey} className="font-mono text-xs" />
                        <Button variant="outline" size="sm" onClick={() => handleCopy(formData.apiKey, "API Key", "copy-api")}>
                          <Copy className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    <Separator />

                    <Tabs defaultValue="curl">
                      <TabsList>
                        <TabsTrigger value="curl">cURL</TabsTrigger>
                        <TabsTrigger value="smtp">SMTP</TabsTrigger>
                      </TabsList>
                      <TabsContent value="curl" className="mt-4">
                        <div className="relative rounded-lg bg-muted p-4 font-mono text-xs overflow-x-auto">
                          <pre>
                            {`curl -X POST "https://apis.cequens.com/email/v1/send" \\
  -H "Authorization: Bearer ${formData.apiKey}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "from": "notifications@${domains.find(d => d.status === "verified")?.domain || 'yourdomain.com'}",
    "to": "customer@example.com",
    "subject": "Order Confirmation",
    "html": "<h1>Thank you for your order!</h1>"
  }'`}
                          </pre>
                        </div>
                      </TabsContent>
                      <TabsContent value="smtp" className="mt-4">
                        <div className="rounded-lg bg-muted p-4 space-y-2 text-xs font-mono">
                          <p><span className="text-muted-foreground">Host:</span> smtp.cequens.com</p>
                          <p><span className="text-muted-foreground">Port:</span> 587 (TLS)</p>
                          <p><span className="text-muted-foreground">Username:</span> {formData.apiKey}</p>
                          <p><span className="text-muted-foreground">Password:</span> (Your API Secret)</p>
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
                <CardTitle>Email Hygiene</CardTitle>
                <CardDescription>Monitor your sender reputation</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-3 bg-muted/50 rounded-lg border border-border">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium">Reputation Score</span>
                    <span className="text-xs font-bold text-success">Excellent (98/100)</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-1.5">
                    <div className="bg-success h-1.5 rounded-full" style={{ width: "98%" }}></div>
                  </div>
                </div>
                <div className="space-y-2">
                  <h5 className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">Resources</h5>
                  {[
                    { title: "DKIM Setup Guide", icon: <BookOpen className="w-4 h-4" /> },
                    { title: "Email Best Practices", icon: <CheckCircle2 className="w-4 h-4" /> },
                  ].map((res, i) => (
                    <div key={i} className="flex items-center justify-between p-2 hover:bg-muted/50 rounded cursor-pointer">
                      <div className="flex items-center gap-2">
                        {res.icon}
                        <span className="text-xs font-medium">{res.title}</span>
                      </div>
                      <ExternalLink className="w-3 h-3 text-muted-foreground" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </motion.div>
      )}

      {/* Disconnect Dialog */}
      <Dialog open={showDisconnectDialog} onOpenChange={setShowDisconnectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove Domain</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove this domain? You will no longer be able to send emails from it.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Type 'remove' to confirm</Label>
              <Input
                value={disconnectConfirmation}
                onChange={(e) => setDisconnectConfirmation(e.target.value)}
                placeholder="remove"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDisconnectDialog(false)}>Cancel</Button>
            <Button
              variant="destructive"
              disabled={disconnectConfirmation !== "remove"}
              onClick={() => {
                setFormData({ domain: "", apiKey: "", webhookUrl: "" })
                setDomains([])
                clearEmailConfig()
                setShowDisconnectDialog(false)
                toast.info("Domain configuration removed")
              }}
            >
              Remove
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageWrapper>
  )
}