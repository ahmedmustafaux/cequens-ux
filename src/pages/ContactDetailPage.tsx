import * as React from "react"
import { useParams, useNavigate } from "react-router-dom"
import { usePageTitle } from "@/hooks/use-dynamic-title"
import { PageWrapper } from "@/components/page-wrapper"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { CardSkeleton } from "@/components/ui/card"
import { PageHeaderProfile } from "@/components/page-header"
import { motion } from "framer-motion"
import { smoothTransition } from "@/lib/transitions"
import { CircleFlag } from "react-circle-flags"
import { 
  User, 
  MessageSquare,
  Globe,
  Edit,
  MoreHorizontal,
  CheckCircle,
  AlertCircle,
  XCircle,
  Plus
} from "lucide-react"
import { EnvelopeSimple, ChatText, Phone as PhoneIcon, Bell } from "phosphor-react"
import { toast } from "sonner"
import { useContact, useUpdateContact } from "@/hooks/use-contacts"
import { getActiveChannels } from "@/lib/channel-utils"
import { formatPhoneWithCountryCode } from "@/lib/phone-utils"

export default function ContactDetailPage() {
  const params = useParams()
  const navigate = useNavigate()
  const contactId = params.id as string
  
  // Fetch contact from database
  const { data: contact, isLoading, error } = useContact(contactId)
  const updateContactMutation = useUpdateContact()
  
  // All state declarations must be at the top before any early returns
  const [newTag, setNewTag] = React.useState("")
  const [activeChannels, setActiveChannels] = React.useState<string[]>([])
  
  // Function to add a new tag
  const addTag = async () => {
    if (newTag.trim() && contact && !contact.tags.includes(newTag.trim())) {
      try {
        await updateContactMutation.mutateAsync({
          id: contact.id,
          contact: {
            tags: [...contact.tags, newTag.trim()]
          }
        })
        toast.success(`Tag "${newTag.trim()}" added successfully`)
        setNewTag("")
      } catch (error) {
        toast.error("Failed to add tag. Please try again.")
      }
    } else if (contact && contact.tags.includes(newTag.trim())) {
      toast.error("Tag already exists")
    }
  }
  
  // Dynamic page title - must be called before any early returns
  const displayName = contact 
    ? `${contact.firstName || ''} ${contact.lastName || ''}`.trim() || 'Contact'
    : 'Contact'
  usePageTitle(displayName)
  
  // Load active channels
  React.useEffect(() => {
    setActiveChannels(getActiveChannels())
  }, [])

  // If contact not found or error, redirect to contacts page
  React.useEffect(() => {
    if (!isLoading && (error || !contact)) {
      toast.error("Contact not found")
      navigate("/contacts")
    }
  }, [contact, error, isLoading, navigate])
  
  // Show loading state while fetching contact
  if (isLoading || !contact) {
    return (
      <PageWrapper isLoading={true}>
        <PageHeaderProfile
          title="Contact Not Found"
          description="The requested contact could not be found"
          avatar={{
            src: "",
            fallback: "??",
            alt: "Loading"
          }}
          onBack={() => navigate("/contacts")}
          actions={
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" disabled>
                Edit
              </Button>
              <Button variant="outline" size="sm" disabled>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </div>
          }
          isLoading={true}
        />
        <div className="grid grid-cols-1 lg:grid-cols-3 items-start">
          <div className="lg:col-span-2 grid grid-cols-1 items-start">
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </div>
          <div className="grid grid-cols-1 items-start">
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </div>
        </div>
      </PageWrapper>
    )
  }
  
  // Tab order for direction calculation
  const tabOrder = ["overview", "contact", "attributes"]

  const handleEdit = () => {
    navigate(`/contacts/${contactId}/edit`)
  }


  const handleBack = () => {
    navigate("/contacts")
  }

  const getStatusLabel = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "assigned":
        return <CheckCircle className="w-3 h-3 mr-1 flex-shrink-0" />;
      case "closed":
        return <XCircle className="w-3 h-3 mr-1 flex-shrink-0" />;
      case "unassigned":
      default:
        return <AlertCircle className="w-3 h-3 mr-1 flex-shrink-0" />;
    }
  };

  const getStatusVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case "assigned":
        return "default";
      case "closed":
        return "secondary";
      case "unassigned":
      default:
        return "outline";
    }
  };

  const getChannelStatusIcon = (status: string) => {
    switch (status) {
      case "Active":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "Inactive":
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return <AlertCircle className="h-4 w-4 text-yellow-500" />
    }
  }

  return (
    <PageWrapper>
      <PageHeaderProfile
        title={displayName}
        description={`Contact from ${contact.countryISO}`}
        avatar={{
          src: "", // No image source available
          fallback: contact.avatar,
          alt: displayName
        }}
        onBack={handleBack}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleEdit}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
            <Button variant="outline" size="sm">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>
        }
      />

        {/* Profile Content */}
        <div className="flex flex-col">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={smoothTransition}
            className="w-full"
          >
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">
                        {/* Main Content */}
                        <div className="lg:col-span-2 grid grid-cols-1 gap-4 items-start">
                          {/* Basic Information */}
                          <Card className="py-5 gap-5">
                            <CardHeader>
                              <CardTitle>Basic Information</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <label className="text-sm font-medium text-muted-foreground">First Name</label>
                                  <p className="text-sm">{contact.firstName || '—'}</p>
                                </div>
                                <div>
                                  <label className="text-sm font-medium text-muted-foreground">Last Name</label>
                                  <p className="text-sm">{contact.lastName || '—'}</p>
                                </div>
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <label className="text-sm font-medium text-muted-foreground">Email Address</label>
                                  <p className="text-sm">{contact.emailAddress || '—'}</p>
                                </div>
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <label className="text-sm font-medium text-muted-foreground">Phone</label>
                                  <p className="text-sm">{formatPhoneWithCountryCode(contact.phone, contact.countryISO)}</p>
                                </div>
                                <div>
                                  <label className="text-sm font-medium text-muted-foreground">Language</label>
                                  <p className="text-sm">{contact.language || '—'}</p>
                                </div>
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <label className="text-sm font-medium text-muted-foreground">Bot Status</label>
                                  <p className="text-sm">{contact.botStatus || '—'}</p>
                                </div>
                                <div>
                                  <label className="text-sm font-medium text-muted-foreground">Last Conversation</label>
                                  <div className="flex items-center gap-2 mt-1">
                                    <Badge variant={getStatusVariant(contact.conversationStatus)} className="text-xs whitespace-nowrap flex-shrink-0">
                                      {getStatusIcon(contact.conversationStatus)}
                                      {getStatusLabel(contact.conversationStatus)}
                                    </Badge>
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>

                          {/* System Fields */}
                          <Card className="py-5 gap-5">
                            <CardHeader>
                              <CardTitle>System Fields</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <label className="text-sm font-medium text-muted-foreground">Country</label>
                                  <div className="flex items-center gap-2 mt-1">
                                    <div className="w-4 h-4 flex-shrink-0 overflow-hidden rounded-full">
                                      <CircleFlag countryCode={contact.countryISO.toLowerCase()} className="w-full h-full" />
                                    </div>
                                    <p className="text-sm">{contact.countryISO}</p>
                                  </div>
                                </div>
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <label className="text-sm font-medium text-muted-foreground">Assignee</label>
                                  <p className="text-sm">{contact.assignee || 'Unassigned'}</p>
                                </div>
                                <div>
                                  <label className="text-sm font-medium text-muted-foreground">Last Message</label>
                                  <p className="text-sm">{contact.lastMessage}</p>
                                </div>
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <label className="text-sm font-medium text-muted-foreground">Created At</label>
                                  <p className="text-sm">{contact.createdAt ? new Date(contact.createdAt).toLocaleString() : '—'}</p>
                                </div>
                                <div>
                                  <label className="text-sm font-medium text-muted-foreground">Last Interaction Time</label>
                                  <p className="text-sm">{contact.lastInteractionTime ? new Date(contact.lastInteractionTime).toLocaleString() : '—'}</p>
                                </div>
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <label className="text-sm font-medium text-muted-foreground">Conversation Opened Time</label>
                                  <p className="text-sm">{contact.conversationOpenedTime ? new Date(contact.conversationOpenedTime).toLocaleString() : '—'}</p>
                                </div>
                              </div>
                            </CardContent>
                          </Card>

                          {/* Activity Feed */}
                          <Card className="py-5 gap-5">
                            <CardHeader>
                              <CardTitle>Activity Feed</CardTitle>
                              <CardDescription>Recent profile changes and activity updates</CardDescription>
                            </CardHeader>
                            <CardContent>
                              <div className="space-y-4">
                                <div className="flex items-start gap-3">
                                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium">Contact Created</p>
                                    <p className="text-sm text-muted-foreground">Contact profile was created</p>
                                    <p className="text-xs text-muted-foreground mt-1">Recently</p>
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>


                          {/* All Events */}
                          <Card className="py-5 gap-5">
                            <CardHeader>
                              <CardTitle>All Events</CardTitle>
                              <CardDescription>Complete activity history</CardDescription>
                            </CardHeader>
                            <CardContent>
                              <div className="space-y-4 max-h-96 overflow-y-auto">
                                <div className="flex items-start gap-3">
                                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium">Contact Created</p>
                                    <p className="text-sm text-muted-foreground">Contact profile was created</p>
                                    <p className="text-xs text-muted-foreground mt-1">Recently</p>
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </div>

                        {/* Sidebar */}
                        <div className="grid grid-cols-1 gap-4 items-start">
                          {/* Tags */}
                          <Card className="py-5 gap-5">
                            <CardHeader>
                              <CardTitle>Tags</CardTitle>
                              <CardDescription>Add tags to categorize this contact</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                              <div className="flex gap-2">
                                <Input
                                  value={newTag}
                                  onChange={(e) => setNewTag(e.target.value)}
                                  placeholder="Add a tag"
                                  onKeyPress={(e: React.KeyboardEvent) => {
                                    if (e.key === "Enter") {
                                      e.preventDefault()
                                      addTag()
                                    }
                                  }}
                                />
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={addTag}
                                  disabled={!newTag.trim()}
                                >
                                  <Plus className="h-4 w-4" />
                                </Button>
                              </div>
                              
                              <div className="flex flex-wrap gap-2">
                                {contact.tags.map((tag) => (
                                  <Badge key={tag} variant="secondary">
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                            </CardContent>
                          </Card>

                          {/* Channels */}
                          <Card className="py-5 gap-5">
                            <CardHeader>
                              <CardTitle>Channels</CardTitle>
                              <CardDescription>Communication channels for this contact</CardDescription>
                            </CardHeader>
                            <CardContent>
                              <div className="space-y-3">
                                {(() => {
                                  const getChannelIcon = (channelId: string) => {
                                    switch (channelId.toLowerCase()) {
                                      case "whatsapp":
                                        return <img src="/icons/WhatsApp.svg" alt="WhatsApp" className="w-4 h-4 flex-shrink-0" onError={(e) => { e.currentTarget.style.display = "none" }} />
                                      case "instagram":
                                        return <img src="/icons/Instagram.svg" alt="Instagram" className="w-4 h-4 flex-shrink-0" onError={(e) => { e.currentTarget.style.display = "none" }} />
                                      case "messenger":
                                        return <img src="/icons/Messenger.png" alt="Messenger" className="w-4 h-4 flex-shrink-0" onError={(e) => { e.currentTarget.style.display = "none" }} />
                                      case "sms":
                                        return <ChatText weight="fill" className="w-4 h-4 flex-shrink-0 text-muted-foreground" />
                                      case "email":
                                        return <EnvelopeSimple weight="fill" className="w-4 h-4 flex-shrink-0 text-muted-foreground" />
                                      case "phone":
                                        return <PhoneIcon weight="fill" className="w-4 h-4 flex-shrink-0 text-muted-foreground" />
                                      case "push":
                                        return <Bell weight="fill" className="w-4 h-4 flex-shrink-0 text-muted-foreground" />
                                      default:
                                        return <MessageSquare className="w-4 h-4 flex-shrink-0 text-muted-foreground" />
                                    }
                                  }
                                  const getChannelName = (channelId: string) => {
                                    return channelId.charAt(0).toUpperCase() + channelId.slice(1)
                                  }
                                  
                                  // Collect unique channels
                                  const channels = new Set<string>()
                                  if (contact.channel) channels.add(contact.channel)
                                  if (contact.lastInteractedChannel) channels.add(contact.lastInteractedChannel)
                                  
                                  if (channels.size === 0) {
                                    return <p className="text-sm text-muted-foreground">No channels assigned</p>
                                  }
                                  
                                  return Array.from(channels).map((channelId) => (
                                    <div key={channelId} className="flex items-center gap-2">
                                      {getChannelIcon(channelId)}
                                      <span className="text-sm">{getChannelName(channelId)}</span>
                                    </div>
                                  ))
                                })()}
                              </div>
                            </CardContent>
                          </Card>

                          {/* Segments */}
                          <Card className="py-5 gap-5">
                            <CardHeader>
                              <CardTitle>Audience Segments</CardTitle>
                              <CardDescription>Segments this contact belongs to</CardDescription>
                            </CardHeader>
                            <CardContent>
                              <p className="text-sm text-muted-foreground">This contact is not in any segments yet.</p>
                            </CardContent>
                          </Card>

                          {/* Notes */}
                          <Card className="py-5 gap-5">
                            <CardHeader>
                              <CardTitle>Notes</CardTitle>
                            </CardHeader>
                            <CardContent>
                              <p className="text-sm text-muted-foreground">
                                Contact information and communication preferences.
                              </p>
                            </CardContent>
                          </Card>
                        </div>
                      </div>
                    </motion.div>
        </div>
      </PageWrapper>
  )
}