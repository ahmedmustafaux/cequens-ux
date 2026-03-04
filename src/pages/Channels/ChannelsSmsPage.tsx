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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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
  Globe,
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
  const [showRequestDialog, setShowRequestDialog] = React.useState(false)
  const [selectedCountry, setSelectedCountry] = React.useState<string>("")
  const [isSubmittingRequest, setIsSubmittingRequest] = React.useState(false)

  // Pre-fill mock data to keep the channel active when saved
  const [formData, setFormData] = React.useState({
    businessName: "Default Business",
    apiKey: "dummy-api-key",
    apiSecret: "dummy-api-secret",
    webhookUrl: "https://example.com/webhook",
  })

  const defaultSenderIds: SMSConfig["senderIds"] = [
    {
      id: "pre-reg-1",
      name: "Vodafone",
      senderId: "+1234567890",
      status: "active",
      throughput: 100,
      type: "transactional"
    }
  ]

  const [senderIds, setSenderIds] = React.useState<SMSConfig["senderIds"]>(defaultSenderIds)

  const isInitialLoad = React.useRef(true)

  React.useEffect(() => {
    const timer = setTimeout(() => {
      const savedConfig = loadSMSConfig()
      if (savedConfig && savedConfig.formData && savedConfig.formData.apiKey) {
        setFormData(savedConfig.formData)
      }
      if (savedConfig && savedConfig.senderIds && savedConfig.senderIds.length > 0) {
        setSenderIds(savedConfig.senderIds)
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

  const handleRequestSubmit = () => {
    if (!selectedCountry) {
      toast.error("Please select a country")
      return
    }
    setIsSubmittingRequest(true)
    setTimeout(() => {
      setIsSubmittingRequest(false)
      setShowRequestDialog(false)
      setSelectedCountry("")
      toast.success(`Request for a new number in ${selectedCountry} submitted to the support team`)
    }, 1000)
  }

  const countries = [
    { code: "US", name: "United States (+1)" },
    { code: "EG", name: "Egypt (+20)" },
    { code: "AE", name: "United Arab Emirates (+971)" },
    { code: "SA", name: "Saudi Arabia (+966)" },
    { code: "GB", name: "United Kingdom (+44)" },
    { code: "FR", name: "France (+33)" },
    { code: "DE", name: "Germany (+49)" },
  ]

  return (
    <PageWrapper isLoading={isLoading}>
      <PageHeader
        title="SMS Channel Configuration"
        description="Manage your SMS sender IDs"
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
            {/* Section 1: Sender IDs */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Phone className="w-5 h-5" />
                    <CardTitle>Sender IDs</CardTitle>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => setShowRequestDialog(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Request New ID
                  </Button>
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
                            <p className="font-bold">{sid.name}</p>
                            <p className="text-sm text-muted-foreground font-mono">{sid.senderId}</p>
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

      {/* Request New ID Dialog */}
      <Dialog open={showRequestDialog} onOpenChange={setShowRequestDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request New Sender ID</DialogTitle>
            <DialogDescription>
              Select the destination country for which you want to request a new alphanumeric sender ID or shortcode.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Country</Label>
              <Select value={selectedCountry} onValueChange={setSelectedCountry}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a country" />
                </SelectTrigger>
                <SelectContent>
                  {countries.map((country) => (
                    <SelectItem key={country.code} value={country.name}>
                      <div className="flex items-center gap-2">
                        <Globe className="w-4 h-4 text-muted-foreground" />
                        <span>{country.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Support Request</AlertTitle>
              <AlertDescription>
                Submitting this request will open a ticket with our support team to provision a new sender ID for the selected country. They may contact you for additional documentation.
              </AlertDescription>
            </Alert>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRequestDialog(false)}>Cancel</Button>
            <Button
              disabled={isSubmittingRequest || !selectedCountry}
              onClick={handleRequestSubmit}
            >
              {isSubmittingRequest ? "Submitting..." : "Submit Request"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageWrapper>
  )
}