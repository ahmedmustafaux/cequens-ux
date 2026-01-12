import * as React from "react"
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Check, ChevronRight, ChevronLeft, MessageSquare, TrendingUp, Users, Clock, Info } from "lucide-react"
import { EnvelopeSimple, ChatText, Phone as PhoneIcon, Bell } from "phosphor-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { smoothTransition } from "@/lib/transitions"
import { IndustryTemplate } from "./onboarding-template-selection"
import { PageHeader } from "@/components/page-header"

// Case studies data per industry
interface CaseStudy {
  id: string;
  title: string;
  company: string;
  industry: string;
  challenge: string;
  solution: string;
  channels: string[];
  results: {
    metric: string;
    value: string;
    icon: React.ReactNode;
  }[];
}

const caseStudiesByIndustry: Record<string, CaseStudy[]> = {
  ecommerce: [
    {
      id: "ecommerce-1",
      title: "Abandoned Cart Recovery Success",
      company: "Fashion Retailer",
      industry: "E-commerce",
      challenge: "High cart abandonment rate of 78% leading to significant revenue loss",
      solution: "Implemented automated WhatsApp and SMS reminders with personalized product recommendations",
      channels: ["channel-2", "channel-1"],
      results: [
        { metric: "Cart Recovery", value: "+45%", icon: <TrendingUp className="w-4 h-4" /> },
        { metric: "Revenue Increase", value: "$2.3M", icon: <TrendingUp className="w-4 h-4" /> },
        { metric: "Response Time", value: "< 2min", icon: <Clock className="w-4 h-4" /> }
      ]
    },
    {
      id: "ecommerce-2",
      title: "Order Tracking Automation",
      company: "Electronics Marketplace",
      industry: "E-commerce",
      challenge: "Customer support overwhelmed with order status inquiries",
      solution: "Automated order tracking notifications via SMS and email with real-time updates",
      channels: ["channel-1", "channel-3"],
      results: [
        { metric: "Support Tickets", value: "-60%", icon: <TrendingUp className="w-4 h-4" /> },
        { metric: "Customer Satisfaction", value: "4.8/5", icon: <Users className="w-4 h-4" /> },
        { metric: "Delivery Updates", value: "100K/day", icon: <Clock className="w-4 h-4" /> }
      ]
    },
    {
      id: "ecommerce-3",
      title: "Personalized Product Recommendations",
      company: "Beauty & Cosmetics Store",
      industry: "E-commerce",
      challenge: "Low repeat purchase rate and customer engagement",
      solution: "AI-powered personalized product recommendations via WhatsApp and email campaigns",
      channels: ["channel-2", "channel-3"],
      results: [
        { metric: "Repeat Purchases", value: "+38%", icon: <TrendingUp className="w-4 h-4" /> },
        { metric: "Engagement Rate", value: "67%", icon: <Users className="w-4 h-4" /> },
        { metric: "Average Order Value", value: "+25%", icon: <TrendingUp className="w-4 h-4" /> }
      ]
    }
  ],
  healthcare: [
    {
      id: "healthcare-1",
      title: "Appointment Reminder System",
      company: "Multi-Specialty Clinic",
      industry: "Healthcare",
      challenge: "30% no-show rate causing scheduling inefficiencies and revenue loss",
      solution: "Automated appointment reminders via SMS and voice calls 24 hours before scheduled time",
      channels: ["channel-1", "channel-4"],
      results: [
        { metric: "No-Show Rate", value: "-75%", icon: <TrendingUp className="w-4 h-4" /> },
        { metric: "Patient Satisfaction", value: "4.9/5", icon: <Users className="w-4 h-4" /> },
        { metric: "Revenue Recovery", value: "$450K", icon: <TrendingUp className="w-4 h-4" /> }
      ]
    },
    {
      id: "healthcare-2",
      title: "Test Results Notification",
      company: "Diagnostic Laboratory",
      industry: "Healthcare",
      challenge: "Delayed test result communication affecting patient care",
      solution: "Instant test result notifications via SMS and secure email with follow-up instructions",
      channels: ["channel-1", "channel-3"],
      results: [
        { metric: "Notification Speed", value: "< 1hr", icon: <Clock className="w-4 h-4" /> },
        { metric: "Patient Engagement", value: "+82%", icon: <Users className="w-4 h-4" /> },
        { metric: "Follow-up Rate", value: "+55%", icon: <TrendingUp className="w-4 h-4" /> }
      ]
    },
    {
      id: "healthcare-3",
      title: "Wellness Program Engagement",
      company: "Health Insurance Provider",
      industry: "Healthcare",
      challenge: "Low participation in preventive health programs",
      solution: "Personalized health tips and program reminders via WhatsApp and email",
      channels: ["channel-2", "channel-3"],
      results: [
        { metric: "Program Enrollment", value: "+120%", icon: <TrendingUp className="w-4 h-4" /> },
        { metric: "Health Outcomes", value: "+40%", icon: <Users className="w-4 h-4" /> },
        { metric: "Cost Savings", value: "$1.2M", icon: <TrendingUp className="w-4 h-4" /> }
      ]
    }
  ],
  finance: [
    {
      id: "finance-1",
      title: "Fraud Prevention System",
      company: "Digital Bank",
      industry: "Finance & Banking",
      challenge: "Rising fraud incidents and delayed customer notifications",
      solution: "Real-time transaction alerts via SMS and voice calls for suspicious activities",
      channels: ["channel-1", "channel-4"],
      results: [
        { metric: "Fraud Detection", value: "+95%", icon: <TrendingUp className="w-4 h-4" /> },
        { metric: "Response Time", value: "< 30sec", icon: <Clock className="w-4 h-4" /> },
        { metric: "Prevented Losses", value: "$8.5M", icon: <TrendingUp className="w-4 h-4" /> }
      ]
    },
    {
      id: "finance-2",
      title: "Payment Reminder Automation",
      company: "Fintech Lending Platform",
      industry: "Finance & Banking",
      challenge: "High default rate due to missed payment deadlines",
      solution: "Multi-channel payment reminders via SMS, WhatsApp, and email with easy payment links",
      channels: ["channel-1", "channel-2", "channel-3"],
      results: [
        { metric: "On-time Payments", value: "+68%", icon: <TrendingUp className="w-4 h-4" /> },
        { metric: "Default Rate", value: "-52%", icon: <TrendingUp className="w-4 h-4" /> },
        { metric: "Collection Efficiency", value: "+85%", icon: <Clock className="w-4 h-4" /> }
      ]
    },
    {
      id: "finance-3",
      title: "Customer Onboarding Enhancement",
      company: "Investment Platform",
      industry: "Finance & Banking",
      challenge: "Complex onboarding process leading to 45% drop-off rate",
      solution: "Guided onboarding journey via WhatsApp with document verification and support",
      channels: ["channel-2", "channel-3"],
      results: [
        { metric: "Completion Rate", value: "+73%", icon: <TrendingUp className="w-4 h-4" /> },
        { metric: "Onboarding Time", value: "-60%", icon: <Clock className="w-4 h-4" /> },
        { metric: "New Accounts", value: "+12K/mo", icon: <Users className="w-4 h-4" /> }
      ]
    }
  ],
  education: [
    {
      id: "education-1",
      title: "Parent-Teacher Communication",
      company: "International School",
      industry: "Education",
      challenge: "Inefficient communication between parents and teachers",
      solution: "Automated updates via WhatsApp and SMS for grades, attendance, and events",
      channels: ["channel-2", "channel-1"],
      results: [
        { metric: "Parent Engagement", value: "+88%", icon: <Users className="w-4 h-4" /> },
        { metric: "Response Rate", value: "92%", icon: <TrendingUp className="w-4 h-4" /> },
        { metric: "Admin Time Saved", value: "15hrs/wk", icon: <Clock className="w-4 h-4" /> }
      ]
    },
    {
      id: "education-2",
      title: "Assignment Reminder System",
      company: "Online Learning Platform",
      industry: "Education",
      challenge: "Low assignment completion rate affecting student performance",
      solution: "Smart reminders via email and Messenger with deadline tracking and resources",
      channels: ["channel-3", "channel-5"],
      results: [
        { metric: "Completion Rate", value: "+65%", icon: <TrendingUp className="w-4 h-4" /> },
        { metric: "Student Performance", value: "+42%", icon: <Users className="w-4 h-4" /> },
        { metric: "Engagement", value: "85%", icon: <TrendingUp className="w-4 h-4" /> }
      ]
    },
    {
      id: "education-3",
      title: "Event Attendance Boost",
      company: "University Campus",
      industry: "Education",
      challenge: "Poor attendance at campus events and activities",
      solution: "Targeted event notifications via SMS and WhatsApp with RSVP tracking",
      channels: ["channel-1", "channel-2"],
      results: [
        { metric: "Event Attendance", value: "+156%", icon: <TrendingUp className="w-4 h-4" /> },
        { metric: "RSVP Rate", value: "78%", icon: <Users className="w-4 h-4" /> },
        { metric: "Student Satisfaction", value: "4.7/5", icon: <Users className="w-4 h-4" /> }
      ]
    }
  ],
  retail: [
    {
      id: "retail-1",
      title: "Loyalty Program Success",
      company: "Grocery Chain",
      industry: "Retail",
      challenge: "Low loyalty program enrollment and engagement",
      solution: "Personalized offers and points updates via SMS and email campaigns",
      channels: ["channel-1", "channel-3"],
      results: [
        { metric: "Program Members", value: "+145%", icon: <Users className="w-4 h-4" /> },
        { metric: "Repeat Visits", value: "+58%", icon: <TrendingUp className="w-4 h-4" /> },
        { metric: "Revenue per Member", value: "+32%", icon: <TrendingUp className="w-4 h-4" /> }
      ]
    },
    {
      id: "retail-2",
      title: "In-Store Pickup Optimization",
      company: "Department Store",
      industry: "Retail",
      challenge: "Confusion and delays in buy-online-pickup-in-store orders",
      solution: "Real-time pickup notifications via SMS with location guidance and QR codes",
      channels: ["channel-1"],
      results: [
        { metric: "Pickup Time", value: "-70%", icon: <Clock className="w-4 h-4" /> },
        { metric: "Customer Satisfaction", value: "4.8/5", icon: <Users className="w-4 h-4" /> },
        { metric: "BOPIS Orders", value: "+95%", icon: <TrendingUp className="w-4 h-4" /> }
      ]
    },
    {
      id: "retail-3",
      title: "Seasonal Campaign Excellence",
      company: "Fashion Boutique",
      industry: "Retail",
      challenge: "Ineffective seasonal promotions with low conversion rates",
      solution: "Targeted WhatsApp and SMS campaigns with personalized product recommendations",
      channels: ["channel-2", "channel-1"],
      results: [
        { metric: "Campaign ROI", value: "420%", icon: <TrendingUp className="w-4 h-4" /> },
        { metric: "Conversion Rate", value: "+78%", icon: <TrendingUp className="w-4 h-4" /> },
        { metric: "Customer Reach", value: "50K+", icon: <Users className="w-4 h-4" /> }
      ]
    }
  ],
  technology: [
    {
      id: "technology-1",
      title: "User Onboarding Optimization",
      company: "SaaS Platform",
      industry: "Technology & SaaS",
      challenge: "High user drop-off during onboarding process",
      solution: "Interactive onboarding sequences via email and Messenger with progress tracking",
      channels: ["channel-3", "channel-5"],
      results: [
        { metric: "Activation Rate", value: "+92%", icon: <TrendingUp className="w-4 h-4" /> },
        { metric: "Time to Value", value: "-65%", icon: <Clock className="w-4 h-4" /> },
        { metric: "User Retention", value: "+48%", icon: <Users className="w-4 h-4" /> }
      ]
    },
    {
      id: "technology-2",
      title: "Feature Adoption Campaign",
      company: "Project Management Tool",
      industry: "Technology & SaaS",
      challenge: "New features going unnoticed by existing users",
      solution: "Targeted feature announcements via email and WhatsApp with video tutorials",
      channels: ["channel-3", "channel-2"],
      results: [
        { metric: "Feature Adoption", value: "+215%", icon: <TrendingUp className="w-4 h-4" /> },
        { metric: "User Engagement", value: "+83%", icon: <Users className="w-4 h-4" /> },
        { metric: "Support Tickets", value: "-45%", icon: <TrendingUp className="w-4 h-4" /> }
      ]
    },
    {
      id: "technology-3",
      title: "Technical Support Automation",
      company: "Cloud Services Provider",
      industry: "Technology & SaaS",
      challenge: "Overwhelming support ticket volume and slow response times",
      solution: "AI-powered support via WhatsApp and Messenger with automated troubleshooting",
      channels: ["channel-2", "channel-5"],
      results: [
        { metric: "Resolution Time", value: "-78%", icon: <Clock className="w-4 h-4" /> },
        { metric: "Ticket Volume", value: "-55%", icon: <TrendingUp className="w-4 h-4" /> },
        { metric: "CSAT Score", value: "4.9/5", icon: <Users className="w-4 h-4" /> }
      ]
    }
  ]
};

// Channel icon mapping
const channelIcons: Record<string, { icon: React.ReactNode; label: string; description: string }> = {
  "channel-1": { 
    icon: <ChatText weight="fill" className="w-5 h-5" />, 
    label: "SMS",
    description: "Reach customers instantly with text messages"
  },
  "channel-2": { 
    icon: <img src="/icons/WhatsApp.svg" alt="WhatsApp" className="w-5 h-5" />, 
    label: "WhatsApp",
    description: "Connect via the world's most popular messaging app"
  },
  "channel-3": { 
    icon: <EnvelopeSimple weight="fill" className="w-5 h-5" />, 
    label: "Email",
    description: "Send professional email communications"
  },
  "channel-4": { 
    icon: <PhoneIcon weight="fill" className="w-5 h-5" />, 
    label: "Voice",
    description: "Make automated voice calls and announcements"
  },
  "channel-5": { 
    icon: <img src="/icons/Messenger.png" alt="Messenger" className="w-5 h-5" />, 
    label: "Messenger",
    description: "Engage customers on Facebook Messenger"
  },
  "channel-6": { 
    icon: <img src="/icons/Instagram.svg" alt="Instagram" className="w-5 h-5" />, 
    label: "Instagram",
    description: "Connect via Instagram Direct Messages"
  },
  "channel-7": { 
    icon: <Bell weight="fill" className="w-5 h-5" />, 
    label: "Push Notifications",
    description: "Send mobile and web push notifications"
  },
}

interface OnboardingIndustryOverviewProps {
  template: IndustryTemplate;
  onContinue: () => void;
  onBack: () => void;
}

export function OnboardingIndustryOverview({ 
  template, 
  onContinue,
  onBack 
}: OnboardingIndustryOverviewProps) {
  const [activeCaseStudy, setActiveCaseStudy] = useState(0);
  const caseStudies = caseStudiesByIndustry[template.id] || [];

  const goToCaseStudy = (index: number) => {
    setActiveCaseStudy(Math.max(0, Math.min(index, caseStudies.length - 1)));
  };

  return (
    <div className="bg-layout min-h-screen flex items-start justify-center p-4 pt-24">
      <Card className="w-full max-w-4xl shadow-lg bg-card rounded-2xl overflow-hidden fixed top-16 z-10">
        <CardContent className="p-6">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={smoothTransition}
            className="space-y-6"
          >
            {/* Header */}
            <div className="space-y-3">
              <PageHeader
                title={`${template.icon} ${template.name}`}
                description={template.description}
                showBreadcrumbs={false}
              />
              <div className="flex items-start gap-2">
                <Badge variant="secondary" className="text-xs bg-muted text-muted-foreground hover:bg-muted">
                  Industry Template
                </Badge>
              </div>
              
              {/* Info Note */}
              <div className="flex items-center gap-2 p-3 rounded-lg bg-primary/10">
                <Info className="w-4 h-4 text-primary flex-shrink-0" />
                <p className="text-xs text-primary">
                  We'll personalize your experience based on this industry template, but you'll have full access to all our products and features.
                </p>
              </div>
            </div>

            {/* Use Cases Section */}
            <div className="space-y-3">
              <h2 className="text-lg font-semibold">Most common use cases</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {template.useCases.map((useCase, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 border border-border"
                  >
                    <div>
                      <div className="w-5 h-5 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                        <Check className="w-3.5 h-3.5 text-muted-foreground" />
                      </div>
                    </div>
                    <p className="text-sm font-medium text-foreground">{useCase.text}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Case Studies Section */}
            {caseStudies.length > 0 && (
              <div className="space-y-3">
                <h2 className="text-lg font-semibold">Case Studies</h2>
                
                {/* Carousel Container */}
                <div className="relative">
                  {/* Case Study Cards */}
                  <div className="relative overflow-hidden rounded-lg border border-border bg-card">
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={activeCaseStudy}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                        className="p-5"
                      >
                        <div className="space-y-4">
                          {/* Header */}
                          <div>
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex-1">
                                <h3 className="font-semibold text-base mb-1">
                                  {caseStudies[activeCaseStudy].title}
                                </h3>
                                <p className="text-xs text-muted-foreground">
                                  {caseStudies[activeCaseStudy].company}
                                </p>
                              </div>
                              {/* Channel Icons */}
                              <div className="flex gap-1.5 ml-3">
                                {caseStudies[activeCaseStudy].channels.map((channelId) => {
                                  const channel = channelIcons[channelId];
                                  return channel ? (
                                    <div
                                      key={channelId}
                                      className="p-1.5 rounded-md bg-muted"
                                      title={channel.label}
                                    >
                                      {channel.icon}
                                    </div>
                                  ) : null;
                                })}
                              </div>
                            </div>
                          </div>

                          {/* Challenge & Solution */}
                          <div className="space-y-3">
                            <div>
                              <p className="text-xs font-medium text-foreground mb-1">Challenge</p>
                              <p className="text-sm text-muted-foreground">
                                {caseStudies[activeCaseStudy].challenge}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs font-medium text-foreground mb-1">Solution</p>
                              <p className="text-sm text-muted-foreground">
                                {caseStudies[activeCaseStudy].solution}
                              </p>
                            </div>
                          </div>

                          {/* Results */}
                          <div>
                            <p className="text-xs font-medium text-foreground mb-2">Results</p>
                            <div className="grid grid-cols-3 gap-3">
                              {caseStudies[activeCaseStudy].results.map((result, idx) => (
                                <div
                                  key={idx}
                                  className="flex flex-col items-center justify-center p-3 rounded-lg bg-muted/50 border border-border"
                                >
                                  <div className="text-muted-foreground mb-1">
                                  {result.icon}
                                  </div>
                                  <p className="text-lg font-bold text-foreground">
                                  {result.value}
                                  </p>
                                  <p className="text-xs text-muted-foreground text-center mt-0.5">
                                    {result.metric}
                                  </p>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    </AnimatePresence>
                  </div>

                  {/* Navigation Controls */}
                  <div className="flex justify-center items-center space-x-3 mt-3">
                    <button
                      type="button"
                      className="bg-card rounded-full p-1.5 shadow-sm border border-border hover:bg-accent cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                      onClick={() => goToCaseStudy(activeCaseStudy - 1)}
                      disabled={activeCaseStudy === 0}
                    >
                      <ChevronLeft className="h-4 w-4 text-foreground" />
                    </button>

                    {/* Dot Indicators */}
                    <div className="flex space-x-2">
                      {caseStudies.map((_, idx) => (
                        <button
                          key={idx}
                          type="button"
                          className={`h-2 w-2 rounded-full transition-all ${
                            idx === activeCaseStudy
                              ? 'bg-primary w-6'
                              : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'
                          }`}
                          onClick={() => goToCaseStudy(idx)}
                          aria-label={`Go to case study ${idx + 1}`}
                        />
                      ))}
                    </div>

                    <button
                      type="button"
                      className="bg-card rounded-full p-1.5 shadow-sm border border-border hover:bg-accent cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                      onClick={() => goToCaseStudy(activeCaseStudy + 1)}
                      disabled={activeCaseStudy === caseStudies.length - 1}
                    >
                      <ChevronRight className="h-4 w-4 text-foreground" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation buttons */}
            <div className="flex justify-between pt-2">
              <Button
                variant="outline"
                onClick={onBack}
              >
                Back
              </Button>
              <Button
                onClick={onContinue}
                className="flex items-center"
              >
                Continue
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
          </motion.div>
        </CardContent>
      </Card>
    </div>
  )
}