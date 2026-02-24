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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
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
  Mail,
  BookOpen,
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

  const [formData, setFormData] = React.useState<{
    domain: string;
    apiKey: string;
    webhookUrl: string;
    type: "domain" | "email";
  }>({
    domain: "",
    apiKey: "",
    webhookUrl: "",
    type: "domain",
  })

  const [domains, setDomains] = React.useState<EmailConfig["domains"]>([])

  React.useEffect(() => {
    const timer = setTimeout(() => {
      const savedConfig = loadEmailConfig()
      if (savedConfig && savedConfig.formData.domain) {
        setFormData({ ...savedConfig.formData, type: savedConfig.formData.type || "domain" })
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
    if (domains && domains.length > 0) {
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
  }, [domains, user?.id])

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
                {!domains || domains.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 space-y-4">
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                      <Mail className="w-8 h-8 text-primary" />
                    </div>
                    <div className="text-center space-y-2">
                      <h3 className="font-semibold text-lg">Setup Sending {formData.type === 'email' ? 'Email' : 'Domain'}</h3>
                      <p className="text-sm text-muted-foreground max-w-md">
                        Enter your {formData.type === 'email' ? 'email' : 'domain'} to generate DNS verification records.
                      </p>
                    </div>

                    <RadioGroup
                      value={formData.type}
                      onValueChange={(val: "domain" | "email") => setFormData(prev => ({ ...prev, type: val, domain: "" }))}
                      className="flex items-center gap-6 mb-2 mt-2"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="domain" id="type-domain" />
                        <Label htmlFor="type-domain" className="cursor-pointer">Domain</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="email" id="type-email" />
                        <Label htmlFor="type-email" className="cursor-pointer">Email</Label>
                      </div>
                    </RadioGroup>

                    <div className="flex w-full max-w-sm items-center space-x-2">
                      <Input
                        placeholder={formData.type === 'email' ? "e.g. notifications@vodafone.com.eg" : "e.g. mail.vodafone.com.eg"}
                        value={formData.domain}
                        onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
                      />
                      <Button
                        onClick={() => {
                          if (!formData.domain) {
                            toast.error(`Please enter a ${formData.type === 'email' ? 'valid email' : 'domain'}`)
                            return
                          }
                          setIsVerifying(true)
                          setTimeout(() => {
                            setDomains(prev => [
                              ...prev,
                              {
                                id: `dom-${Date.now()}`,
                                domain: formData.domain,
                                status: "pending",
                                spf: false,
                                dkim: false,
                                dmarc: false,
                              }
                            ])
                            setFormData(prev => ({ ...prev, domain: "", apiKey: prev.apiKey || `em_live_${Math.random().toString(36).substring(7)}` }))
                            setIsVerifying(false)
                            toast.success(`${formData.type === 'email' ? 'Email' : 'Domain'} records generated`)
                          }, 1000)
                        }}
                        disabled={isVerifying}
                      >
                        {isVerifying ? "Processing..." : "Add"}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex w-full items-center space-x-2 bg-muted/30 p-4 rounded-lg border border-border">
                      <div className="flex-1 space-y-3">
                        <RadioGroup
                          value={formData.type}
                          onValueChange={(val: "domain" | "email") => setFormData(prev => ({ ...prev, type: val, domain: "" }))}
                          className="flex items-center gap-6"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="domain" id="type-domain-add" />
                            <Label htmlFor="type-domain-add" className="cursor-pointer">Domain</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="email" id="type-email-add" />
                            <Label htmlFor="type-email-add" className="cursor-pointer">Email</Label>
                          </div>
                        </RadioGroup>
                        <div className="flex items-center space-x-2">
                          <Input
                            placeholder={formData.type === 'email' ? "e.g. notifications@vodafone.com.eg" : "e.g. mail.vodafone.com.eg"}
                            value={formData.domain}
                            onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
                          />
                          <Button
                            onClick={() => {
                              if (!formData.domain) {
                                toast.error(`Please enter a ${formData.type === 'email' ? 'valid email' : 'domain'}`)
                                return
                              }
                              setIsVerifying(true)
                              setTimeout(() => {
                                setDomains(prev => [
                                  ...prev,
                                  {
                                    id: `dom-${Date.now()}`,
                                    domain: formData.domain,
                                    status: "pending",
                                    spf: false,
                                    dkim: false,
                                    dmarc: false,
                                  }
                                ])
                                setFormData(prev => ({ ...prev, domain: "", apiKey: prev.apiKey || `em_live_${Math.random().toString(36).substring(7)}` }))
                                setIsVerifying(false)
                                toast.success(`${formData.type === 'email' ? 'Email' : 'Domain'} added successfully`)
                              }, 1000)
                            }}
                            disabled={isVerifying}
                          >
                            {isVerifying ? "Processing..." : "Add New"}
                          </Button>
                        </div>
                      </div>
                    </div>

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
                                toast.success(`${formData.type === 'email' ? 'Email' : 'Domain'} verified successfully!`)
                              }, 1500)
                            }}
                          >
                            <RefreshCw className="w-4 h-4 mr-2" />
                            Verify Records
                          </Button>
                        </div>

                        {formData.type === 'domain' && (
                          <div className="space-y-3">
                            <h5 className="text-sm font-semibold">DNS Records</h5>
                            <div className="space-y-2">
                              {dom.status === "pending" && (
                                <Alert variant="default" className="bg-primary/5 border-primary/20 mb-4">
                                  <AlertCircle className="h-4 w-4" />
                                  <AlertTitle className="text-sm">Action Required</AlertTitle>
                                  <AlertDescription className="text-xs">
                                    Add the DNS records below to your domain registrar's control panel.
                                  </AlertDescription>
                                </Alert>
                              )}

                              {[
                                { type: "TXT", host: `@`, value: `v=spf1 include:_spf.cequens.com ~all`, ref: "spf" },
                                { type: "TXT", host: `_dmarc`, value: `v=DMARC1; p=none; rua=mailto:dmarc@cequens.com`, ref: "dmarc" },
                                { type: "TXT", host: `cequens._domainkey`, value: `v=DKIM1; k=rsa; p=MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCg...`, ref: "dkim" },
                              ].map((record, i) => {
                                const isVerified = dom[record.ref as "spf" | "dkim" | "dmarc"];
                                return (
                                  <div key={i} className={`p-3 rounded-md border ${isVerified ? 'bg-success/5 border-success/20' : 'bg-muted/50 border-border'} space-y-2`}>
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center gap-2">
                                        <Badge variant="outline" className="font-mono text-[10px]">{record.type}</Badge>
                                        <span className="text-xs font-semibold">{record.host}</span>
                                      </div>
                                      {isVerified ? (
                                        <div className="flex items-center gap-1 text-success text-xs font-medium">
                                          <CheckCircle2 className="w-3 h-3" />
                                          Verified
                                        </div>
                                      ) : (
                                        <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">Pending Verify</span>
                                      )}
                                    </div>
                                    <div className="flex bg-background rounded border border-border mt-1">
                                      <code className="flex-1 p-2 text-xs font-mono text-muted-foreground overflow-x-auto whitespace-nowrap">
                                        {record.value}
                                      </code>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="rounded-l-none border-l h-auto py-1 px-3"
                                        onClick={() => handleCopy(record.value, `${record.type} Record`, `copy-rec-${i}`)}
                                      >
                                        {copiedButtonId === `copy-rec-${i}` ? <CheckCircle2 className="w-3 h-3 text-success" /> : <Copy className="w-3 h-3" />}
                                      </Button>
                                    </div>
                                  </div>
                                )
                              })}
                            </div>
                          </div>
                        )}
                        <Separator />
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" onClick={() => {
                            setDomains(prev => prev.filter(d => d.id !== dom.id))
                            toast.info(`Config removed`)
                          }}>
                            Remove Configuration
                          </Button>
                        </div>
                      </div>
                    ))}
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
      <Dialog open={showDisconnectDialog} onOpenChange={(open) => {
        setShowDisconnectDialog(open)
        if (!open) {
          setTimeout(() => setDisconnectConfirmation(""), 200)
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove {formData.type === 'email' ? 'Email' : 'Domain'}</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove this {formData.type === 'email' ? 'email' : 'domain'}? You will no longer be able to send emails from it.
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
                setFormData({ domain: "", apiKey: "", webhookUrl: "", type: "domain" })
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