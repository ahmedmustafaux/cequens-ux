import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from '@/hooks/use-auth'
import { OnboardingProvider } from '@/contexts/onboarding-context'
import { Toaster } from '@/components/ui/sonner'
import { ProtectedRoute, PublicRoute } from '@/components/ProtectedRoute'

// appConfig removed as it's not used in Vite version

// Layout components
import RootLayout from '@/layouts/RootLayout'
import LoginLayout from '@/layouts/LoginLayout'
import DashboardLayout from '@/layouts/DashboardLayout'

// Pages
// Pages
// Auth
import LoginPage from '@/pages/Auth/LoginPage'
import SignupPage from '@/pages/Auth/SignupPage'
import EmailConfirmationPage from '@/pages/Auth/EmailConfirmationPage'
import PhoneVerificationPage from '@/pages/Auth/PhoneVerificationPage'
import NewUserOnboardingPage from '@/pages/Auth/NewUserOnboardingPage'

// General
import DashboardPage from '@/pages/General/DashboardPage'
import NotFoundPage from '@/pages/General/NotFoundPage'
import NotificationsPage from '@/pages/General/NotificationsPage'
import ProfilePage from '@/pages/General/ProfilePage'
import VerifyPage from '@/pages/General/VerifyPage'

// Analytics
import AnalyticsPage from '@/pages/Analytics/AnalyticsPage'
import AnalyticsPerformancePage from '@/pages/Analytics/AnalyticsPerformancePage'
import AnalyticsCampaignsPage from '@/pages/Analytics/AnalyticsCampaignsPage'
import AnalyticsConversationsPage from '@/pages/Analytics/AnalyticsConversationsPage'
import AnalyticsApisPage from '@/pages/Analytics/AnalyticsApisPage'

// Engage
import CampaignsPage from '@/pages/Engage/CampaignsPage'
import CampaignsCreatePage from '@/pages/Engage/CampaignsCreatePage'
import CampaignsSettingsPage from '@/pages/Engage/CampaignsSettingsPage'
import CampaignsAiBotsPage from '@/pages/Engage/CampaignsAiBotsPage'
import CampaignsAutomationPage from '@/pages/Engage/CampaignsAutomationPage'
import AutomationJourneyPage from '@/pages/Engage/AutomationJourneyPage'

// Audience
import ContactsPage from '@/pages/Audience/ContactsPage'
import ContactsEditPage from '@/pages/Audience/ContactsEditPage'
import ContactDetailPage from '@/pages/Audience/ContactDetailPage'
import ContactsSegmentsPage from '@/pages/Audience/ContactsSegmentsPage'
import ContactsTagsPage from '@/pages/Audience/ContactsTagsPage'
import ContactsAttributesPage from '@/pages/Audience/ContactsAttributesPage'

// Inbox
import MessagesPage from '@/pages/Inbox/MessagesPage'
import InboxPage from '@/pages/Inbox/InboxPage'
import InboxRequestsPage from '@/pages/Inbox/InboxRequestsPage'
import InboxSettingsPage from '@/pages/Inbox/InboxSettingsPage'

// Automation
import AutomationPage from '@/pages/Automation/AutomationPage'
import AutomationBotsPage from '@/pages/Automation/AutomationBotsPage'
import AutomationKbPage from '@/pages/Automation/AutomationKbPage'

// Library
import LibraryPage from '@/pages/Library/LibraryPage'
import UseCasesPage from '@/pages/Library/UseCasesPage'
import CampaignsTemplatesPage from '@/pages/Library/CampaignsTemplatesPage'
import AutomationTemplatesPage from '@/pages/Library/AutomationTemplatesPage'
import AutomationBotTemplatesPage from '@/pages/Library/AutomationBotTemplatesPage'

// Channels
import ChannelsPage from '@/pages/Channels/ChannelsPage'
import ChannelsSmsPage from '@/pages/Channels/ChannelsSmsPage'
import ChannelsWhatsAppPage from '@/pages/Channels/ChannelsWhatsAppPage'
import ChannelsMessengerPage from '@/pages/Channels/ChannelsMessengerPage'
import ChannelsInstagramPage from '@/pages/Channels/ChannelsInstagramPage'
import ChannelsApplePage from '@/pages/Channels/ChannelsApplePage'
import ChannelsEmailPage from '@/pages/Channels/ChannelsEmailPage'
import ChannelsCallPage from '@/pages/Channels/ChannelsCallPage'
import ChannelsPushPage from '@/pages/Channels/ChannelsPushPage'
import ChannelsRcsPage from '@/pages/Channels/ChannelsRcsPage'

// Settings
import SettingsPage from '@/pages/Settings/SettingsPage'
import SettingsProfilePage from '@/pages/Settings/SettingsProfilePage'
import SettingsOrganizationPage from '@/pages/Settings/SettingsOrganizationPage'
import SettingsContactsExportPage from '@/pages/Settings/SettingsContactsExportPage'
import SettingsPluginsPage from '@/pages/Settings/SettingsPluginsPage'
import SettingsPreferencesPage from '@/pages/Settings/SettingsPreferencesPage'
import SettingsSupportPage from '@/pages/Settings/SettingsSupportPage'
import SettingsCompanyPage from '@/pages/Settings/SettingsCompanyPage'
import SettingsSecurityPage from '@/pages/Settings/SettingsSecurityPage'

// Developer APIs
import DeveloperApisPage from '@/pages/Developer/DeveloperApisPage'
import DeveloperApisListingPage from '@/pages/Developer/DeveloperApisListingPage'
import DeveloperApisDocsPage from '@/pages/Developer/DeveloperApisDocsPage'
import DeveloperApisSmsPage from '@/pages/Developer/DeveloperApisSmsPage'
import DeveloperApisVoicePage from '@/pages/Developer/DeveloperApisVoicePage'
import DeveloperApisWhatsappPage from '@/pages/Developer/DeveloperApisWhatsappPage'
import DeveloperApisPushPage from '@/pages/Developer/DeveloperApisPushPage'
import DeveloperApisOtpPage from '@/pages/Developer/DeveloperApisOtpPage'
import DeveloperApisBotsPage from '@/pages/Developer/DeveloperApisBotsPage'
import DeveloperApisKeysPage from '@/pages/Developer/DeveloperApisKeysPage'
import DeveloperApisWebhooksPage from '@/pages/Developer/DeveloperApisWebhooksPage'
import DeveloperApisLogsPage from '@/pages/Developer/DeveloperApisLogsPage'

// Billing
import BillingPage from '@/pages/Billing/BillingPage'
import BillingPlansPage from '@/pages/Billing/BillingPlansPage'
import BillingUsagePage from '@/pages/Billing/BillingUsagePage'
import BillingPaymentsPage from '@/pages/Billing/BillingPaymentsPage'
import BillingInvoicesPage from '@/pages/Billing/BillingInvoicesPage'

// Support
import SupportHelpPage from '@/pages/Support/SupportHelpPage'
import SupportBestPracticesPage from '@/pages/Support/SupportBestPracticesPage'
import SupportFaqsPage from '@/pages/Support/SupportFaqsPage'


function App() {
  return (
    <AuthProvider>

      <OnboardingProvider>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={
            <PublicRoute>
              <LoginLayout>
                <LoginPage />
              </LoginLayout>
            </PublicRoute>
          } />
          <Route path="/signup" element={
            <PublicRoute>
              <LoginLayout>
                <SignupPage />
              </LoginLayout>
            </PublicRoute>
          } />
          <Route path="/email-confirmation" element={
            <PublicRoute>
              <LoginLayout>
                <EmailConfirmationPage />
              </LoginLayout>
            </PublicRoute>
          } />
          <Route path="/phone-verification" element={
            <PublicRoute>
              <LoginLayout>
                <PhoneVerificationPage />
              </LoginLayout>
            </PublicRoute>
          } />

          {/* New User Onboarding */}
          <Route path="/onboarding" element={
            <ProtectedRoute>
              <NewUserOnboardingPage />
            </ProtectedRoute>
          } />

          {/* Verify Route */}
          <Route path="/verify" element={
            <ProtectedRoute>
              <RootLayout>
                <DashboardLayout>
                  <VerifyPage />
                </DashboardLayout>
              </RootLayout>
            </ProtectedRoute>
          } />

          {/* Protected routes */}
          <Route path="/" element={
            <ProtectedRoute>
              <RootLayout>
                <DashboardLayout>
                  <DashboardPage />
                </DashboardLayout>
              </RootLayout>
            </ProtectedRoute>
          } />
          <Route path="/analytics" element={
            <ProtectedRoute>
              <RootLayout>
                <DashboardLayout>
                  <AnalyticsPage />
                </DashboardLayout>
              </RootLayout>
            </ProtectedRoute>
          } />
          <Route path="/analytics/overview" element={
            <ProtectedRoute>
              <RootLayout>
                <DashboardLayout>
                  <AnalyticsPerformancePage />
                </DashboardLayout>
              </RootLayout>
            </ProtectedRoute>
          } />
          <Route path="/analytics/apis" element={
            <ProtectedRoute>
              <RootLayout>
                <DashboardLayout>
                  <AnalyticsApisPage />
                </DashboardLayout>
              </RootLayout>
            </ProtectedRoute>
          } />
          <Route path="/analytics/campaigns" element={
            <ProtectedRoute>
              <RootLayout>
                <DashboardLayout>
                  <AnalyticsCampaignsPage />
                </DashboardLayout>
              </RootLayout>
            </ProtectedRoute>
          } />
          <Route path="/analytics/conversations" element={
            <ProtectedRoute>
              <RootLayout>
                <DashboardLayout>
                  <AnalyticsConversationsPage />
                </DashboardLayout>
              </RootLayout>
            </ProtectedRoute>
          } />

          <Route path="/engage/campaigns" element={
            <ProtectedRoute>
              <RootLayout>
                <DashboardLayout>
                  <CampaignsPage />
                </DashboardLayout>
              </RootLayout>
            </ProtectedRoute>
          } />
          <Route path="/engage/campaigns/create" element={
            <ProtectedRoute>
              <RootLayout>
                <DashboardLayout>
                  <CampaignsCreatePage />
                </DashboardLayout>
              </RootLayout>
            </ProtectedRoute>
          } />
          <Route path="/engage/campaigns/settings" element={
            <ProtectedRoute>
              <RootLayout>
                <DashboardLayout>
                  <CampaignsSettingsPage />
                </DashboardLayout>
              </RootLayout>
            </ProtectedRoute>
          } />
          <Route path="/engage/campaigns/templates" element={
            <ProtectedRoute>
              <RootLayout>
                <DashboardLayout>
                  <CampaignsTemplatesPage />
                </DashboardLayout>
              </RootLayout>
            </ProtectedRoute>
          } />
          <Route path="/engage/campaigns/ai-bots" element={
            <ProtectedRoute>
              <RootLayout>
                <DashboardLayout>
                  <CampaignsAiBotsPage />
                </DashboardLayout>
              </RootLayout>
            </ProtectedRoute>
          } />
          <Route path="/engage/campaigns/automation" element={
            <ProtectedRoute>
              <RootLayout>
                <DashboardLayout>
                  <CampaignsAutomationPage />
                </DashboardLayout>
              </RootLayout>
            </ProtectedRoute>
          } />
          <Route path="/audience/contacts" element={
            <ProtectedRoute>
              <RootLayout>
                <DashboardLayout>
                  <ContactsPage />
                </DashboardLayout>
              </RootLayout>
            </ProtectedRoute>
          } />
          <Route path="/audience/segments" element={
            <ProtectedRoute>
              <RootLayout>
                <DashboardLayout>
                  <ContactsSegmentsPage />
                </DashboardLayout>
              </RootLayout>
            </ProtectedRoute>
          } />
          <Route path="/audience/tags" element={
            <ProtectedRoute>
              <RootLayout>
                <DashboardLayout>
                  <ContactsTagsPage />
                </DashboardLayout>
              </RootLayout>
            </ProtectedRoute>
          } />
          <Route path="/audience/attributes" element={
            <ProtectedRoute>
              <RootLayout>
                <DashboardLayout>
                  <ContactsAttributesPage />
                </DashboardLayout>
              </RootLayout>
            </ProtectedRoute>
          } />
          <Route path="/audience/contacts/:id/edit" element={
            <ProtectedRoute>
              <RootLayout>
                <DashboardLayout>
                  <ContactsEditPage />
                </DashboardLayout>
              </RootLayout>
            </ProtectedRoute>
          } />
          <Route path="/audience/contacts/:id" element={
            <ProtectedRoute>
              <RootLayout>
                <DashboardLayout>
                  <ContactDetailPage />
                </DashboardLayout>
              </RootLayout>
            </ProtectedRoute>
          } />
          <Route path="/messages" element={
            <ProtectedRoute>
              <RootLayout>
                <DashboardLayout>
                  <MessagesPage />
                </DashboardLayout>
              </RootLayout>
            </ProtectedRoute>
          } />
          <Route path="/inbox" element={
            <ProtectedRoute>
              <RootLayout>
                <DashboardLayout>
                  <InboxPage />
                </DashboardLayout>
              </RootLayout>
            </ProtectedRoute>
          } />
          <Route path="/inbox/requests" element={
            <ProtectedRoute>
              <RootLayout>
                <DashboardLayout>
                  <InboxRequestsPage />
                </DashboardLayout>
              </RootLayout>
            </ProtectedRoute>
          } />
          <Route path="/inbox/settings" element={
            <ProtectedRoute>
              <RootLayout>
                <DashboardLayout>
                  <InboxSettingsPage />
                </DashboardLayout>
              </RootLayout>
            </ProtectedRoute>
          } />
          <Route path="/automation" element={
            <ProtectedRoute>
              <RootLayout>
                <DashboardLayout>
                  <AutomationPage />
                </DashboardLayout>
              </RootLayout>
            </ProtectedRoute>
          } />
          <Route path="/engage/journey" element={
            <ProtectedRoute>
              <RootLayout>
                <DashboardLayout>
                  <AutomationJourneyPage />
                </DashboardLayout>
              </RootLayout>
            </ProtectedRoute>
          } />
          <Route path="/library/templates" element={
            <ProtectedRoute>
              <RootLayout>
                <DashboardLayout>
                  <AutomationTemplatesPage />
                </DashboardLayout>
              </RootLayout>
            </ProtectedRoute>
          } />
          <Route path="/library/use-cases" element={
            <ProtectedRoute>
              <RootLayout>
                <DashboardLayout>
                  <UseCasesPage />
                </DashboardLayout>
              </RootLayout>
            </ProtectedRoute>
          } />
          <Route path="/library" element={
            <ProtectedRoute>
              <RootLayout>
                <DashboardLayout>
                  <LibraryPage />
                </DashboardLayout>
              </RootLayout>
            </ProtectedRoute>
          } />
          <Route path="/automation/kb" element={
            <ProtectedRoute>
              <RootLayout>
                <DashboardLayout>
                  <AutomationKbPage />
                </DashboardLayout>
              </RootLayout>
            </ProtectedRoute>
          } />
          <Route path="/automation/bot-templates" element={
            <ProtectedRoute>
              <RootLayout>
                <DashboardLayout>
                  <AutomationBotTemplatesPage />
                </DashboardLayout>
              </RootLayout>
            </ProtectedRoute>
          } />
          <Route path="/automation/bots" element={
            <ProtectedRoute>
              <RootLayout>
                <DashboardLayout>
                  <AutomationBotsPage />
                </DashboardLayout>
              </RootLayout>
            </ProtectedRoute>
          } />
          <Route path="/channels" element={
            <ProtectedRoute>
              <RootLayout>
                <DashboardLayout>
                  <ChannelsPage />
                </DashboardLayout>
              </RootLayout>
            </ProtectedRoute>
          } />
          <Route path="/channels/sms" element={
            <ProtectedRoute>
              <RootLayout>
                <DashboardLayout>
                  <ChannelsSmsPage />
                </DashboardLayout>
              </RootLayout>
            </ProtectedRoute>
          } />
          <Route path="/channels/whatsapp" element={
            <ProtectedRoute>
              <RootLayout>
                <DashboardLayout>
                  <ChannelsWhatsAppPage />
                </DashboardLayout>
              </RootLayout>
            </ProtectedRoute>
          } />
          <Route path="/channels/messenger" element={
            <ProtectedRoute>
              <RootLayout>
                <DashboardLayout>
                  <ChannelsMessengerPage />
                </DashboardLayout>
              </RootLayout>
            </ProtectedRoute>
          } />
          <Route path="/channels/instagram" element={
            <ProtectedRoute>
              <RootLayout>
                <DashboardLayout>
                  <ChannelsInstagramPage />
                </DashboardLayout>
              </RootLayout>
            </ProtectedRoute>
          } />
          <Route path="/channels/apple" element={
            <ProtectedRoute>
              <RootLayout>
                <DashboardLayout>
                  <ChannelsApplePage />
                </DashboardLayout>
              </RootLayout>
            </ProtectedRoute>
          } />
          <Route path="/channels/email" element={
            <ProtectedRoute>
              <RootLayout>
                <DashboardLayout>
                  <ChannelsEmailPage />
                </DashboardLayout>
              </RootLayout>
            </ProtectedRoute>
          } />
          <Route path="/channels/call" element={
            <ProtectedRoute>
              <RootLayout>
                <DashboardLayout>
                  <ChannelsCallPage />
                </DashboardLayout>
              </RootLayout>
            </ProtectedRoute>
          } />
          <Route path="/channels/push" element={
            <ProtectedRoute>
              <RootLayout>
                <DashboardLayout>
                  <ChannelsPushPage />
                </DashboardLayout>
              </RootLayout>
            </ProtectedRoute>
          } />
          <Route path="/channels/rcs" element={
            <ProtectedRoute>
              <RootLayout>
                <DashboardLayout>
                  <ChannelsRcsPage />
                </DashboardLayout>
              </RootLayout>
            </ProtectedRoute>
          } />
          <Route path="/notifications" element={
            <ProtectedRoute>
              <RootLayout>
                <DashboardLayout>
                  <NotificationsPage />
                </DashboardLayout>
              </RootLayout>
            </ProtectedRoute>
          } />
          {/* Developer APIs Routes */}
          <Route path="/developer-apis" element={
            <ProtectedRoute>
              <RootLayout>
                <DashboardLayout>
                  <DeveloperApisPage />
                </DashboardLayout>
              </RootLayout>
            </ProtectedRoute>
          } />
          <Route path="/developer-apis/listing" element={
            <ProtectedRoute>
              <RootLayout>
                <DashboardLayout>
                  <DeveloperApisListingPage />
                </DashboardLayout>
              </RootLayout>
            </ProtectedRoute>
          } />
          <Route path="/developer-apis/docs" element={
            <ProtectedRoute>
              <RootLayout>
                <DashboardLayout>
                  <DeveloperApisDocsPage />
                </DashboardLayout>
              </RootLayout>
            </ProtectedRoute>
          } />
          <Route path="/developer-apis/keys" element={
            <ProtectedRoute>
              <RootLayout>
                <DashboardLayout>
                  <DeveloperApisKeysPage />
                </DashboardLayout>
              </RootLayout>
            </ProtectedRoute>
          } />
          <Route path="/developer-apis/webhooks" element={
            <ProtectedRoute>
              <RootLayout>
                <DashboardLayout>
                  <DeveloperApisWebhooksPage />
                </DashboardLayout>
              </RootLayout>
            </ProtectedRoute>
          } />
          <Route path="/developer-apis/logs" element={
            <ProtectedRoute>
              <RootLayout>
                <DashboardLayout>
                  <DeveloperApisLogsPage />
                </DashboardLayout>
              </RootLayout>
            </ProtectedRoute>
          } />
          <Route path="/developer-apis/sms" element={
            <ProtectedRoute>
              <RootLayout>
                <DashboardLayout>
                  <DeveloperApisSmsPage />
                </DashboardLayout>
              </RootLayout>
            </ProtectedRoute>
          } />
          <Route path="/developer-apis/voice" element={
            <ProtectedRoute>
              <RootLayout>
                <DashboardLayout>
                  <DeveloperApisVoicePage />
                </DashboardLayout>
              </RootLayout>
            </ProtectedRoute>
          } />
          <Route path="/developer-apis/whatsapp" element={
            <ProtectedRoute>
              <RootLayout>
                <DashboardLayout>
                  <DeveloperApisWhatsappPage />
                </DashboardLayout>
              </RootLayout>
            </ProtectedRoute>
          } />
          <Route path="/developer-apis/push" element={
            <ProtectedRoute>
              <RootLayout>
                <DashboardLayout>
                  <DeveloperApisPushPage />
                </DashboardLayout>
              </RootLayout>
            </ProtectedRoute>
          } />
          <Route path="/developer-apis/otp" element={
            <ProtectedRoute>
              <RootLayout>
                <DashboardLayout>
                  <DeveloperApisOtpPage />
                </DashboardLayout>
              </RootLayout>
            </ProtectedRoute>
          } />
          <Route path="/developer-apis/bots" element={
            <ProtectedRoute>
              <RootLayout>
                <DashboardLayout>
                  <DeveloperApisBotsPage />
                </DashboardLayout>
              </RootLayout>
            </ProtectedRoute>
          } />

          {/* Settings Routes */}
          <Route path="/settings" element={
            <ProtectedRoute>
              <RootLayout>
                <DashboardLayout>
                  <SettingsPage />
                </DashboardLayout>
              </RootLayout>
            </ProtectedRoute>
          } />
          <Route path="/settings/profile" element={
            <ProtectedRoute>
              <RootLayout>
                <DashboardLayout>
                  <SettingsProfilePage />
                </DashboardLayout>
              </RootLayout>
            </ProtectedRoute>
          } />
          <Route path="/settings/company" element={
            <ProtectedRoute>
              <RootLayout>
                <DashboardLayout>
                  <SettingsCompanyPage />
                </DashboardLayout>
              </RootLayout>
            </ProtectedRoute>
          } />
          <Route path="/settings/security" element={
            <ProtectedRoute>
              <RootLayout>
                <DashboardLayout>
                  <SettingsSecurityPage />
                </DashboardLayout>
              </RootLayout>
            </ProtectedRoute>
          } />
          <Route path="/settings/organization" element={
            <ProtectedRoute>
              <RootLayout>
                <DashboardLayout>
                  <SettingsOrganizationPage />
                </DashboardLayout>
              </RootLayout>
            </ProtectedRoute>
          } />
          <Route path="/settings/contacts-export" element={
            <ProtectedRoute>
              <RootLayout>
                <DashboardLayout>
                  <SettingsContactsExportPage />
                </DashboardLayout>
              </RootLayout>
            </ProtectedRoute>
          } />
          <Route path="/settings/plugins" element={
            <ProtectedRoute>
              <RootLayout>
                <DashboardLayout>
                  <SettingsPluginsPage />
                </DashboardLayout>
              </RootLayout>
            </ProtectedRoute>
          } />
          <Route path="/settings/preferences" element={
            <ProtectedRoute>
              <RootLayout>
                <DashboardLayout>
                  <SettingsPreferencesPage />
                </DashboardLayout>
              </RootLayout>
            </ProtectedRoute>
          } />
          <Route path="/settings/support" element={
            <ProtectedRoute>
              <RootLayout>
                <DashboardLayout>
                  <SettingsSupportPage />
                </DashboardLayout>
              </RootLayout>
            </ProtectedRoute>
          } />
          <Route path="/support/help" element={
            <ProtectedRoute>
              <RootLayout>
                <DashboardLayout>
                  <SupportHelpPage />
                </DashboardLayout>
              </RootLayout>
            </ProtectedRoute>
          } />
          <Route path="/support/best-practices" element={
            <ProtectedRoute>
              <RootLayout>
                <DashboardLayout>
                  <SupportBestPracticesPage />
                </DashboardLayout>
              </RootLayout>
            </ProtectedRoute>
          } />
          <Route path="/support/faqs" element={
            <ProtectedRoute>
              <RootLayout>
                <DashboardLayout>
                  <SupportFaqsPage />
                </DashboardLayout>
              </RootLayout>
            </ProtectedRoute>
          } />

          {/* Billing & Profile Routes */}
          <Route path="/billing" element={
            <ProtectedRoute>
              <RootLayout>
                <DashboardLayout>
                  <BillingPage />
                </DashboardLayout>
              </RootLayout>
            </ProtectedRoute>
          } />
          <Route path="/billing/plans" element={
            <ProtectedRoute>
              <RootLayout>
                <DashboardLayout>
                  <BillingPlansPage />
                </DashboardLayout>
              </RootLayout>
            </ProtectedRoute>
          } />
          <Route path="/billing/usage" element={
            <ProtectedRoute>
              <RootLayout>
                <DashboardLayout>
                  <BillingUsagePage />
                </DashboardLayout>
              </RootLayout>
            </ProtectedRoute>
          } />
          <Route path="/billing/payments" element={
            <ProtectedRoute>
              <RootLayout>
                <DashboardLayout>
                  <BillingPaymentsPage />
                </DashboardLayout>
              </RootLayout>
            </ProtectedRoute>
          } />
          <Route path="/billing/invoices" element={
            <ProtectedRoute>
              <RootLayout>
                <DashboardLayout>
                  <BillingInvoicesPage />
                </DashboardLayout>
              </RootLayout>
            </ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute>
              <RootLayout>
                <DashboardLayout>
                  <ProfilePage />
                </DashboardLayout>
              </RootLayout>
            </ProtectedRoute>
          } />

          {/* Redirect unmatched routes to login */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
        <Toaster />
      </OnboardingProvider>
    </AuthProvider>
  )
}

export default App
