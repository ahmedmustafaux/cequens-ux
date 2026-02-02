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
import LoginPage from '@/pages/LoginPage'
import SignupPage from '@/pages/SignupPage'
import EmailConfirmationPage from '@/pages/EmailConfirmationPage'
import PhoneVerificationPage from '@/pages/PhoneVerificationPage'
import NewUserOnboardingPage from '@/pages/NewUserOnboardingPage'
import DashboardPage from '@/pages/DashboardPage'
import AnalyticsPage from '@/pages/AnalyticsPage'
import CampaignsPage from '@/pages/CampaignsPage'
import CampaignsCreatePage from '@/pages/CampaignsCreatePage'
import CampaignsSettingsPage from '@/pages/CampaignsSettingsPage'
import CampaignsTemplatesPage from '@/pages/CampaignsTemplatesPage'
import CampaignsAiBotsPage from '@/pages/CampaignsAiBotsPage'
import CampaignsAutomationPage from '@/pages/CampaignsAutomationPage'
import ContactsPage from '@/pages/ContactsPage'
import ContactsEditPage from '@/pages/ContactsEditPage'
import ContactDetailPage from '@/pages/ContactDetailPage'
import ContactsSegmentsPage from '@/pages/ContactsSegmentsPage'
import ContactsTagsPage from '@/pages/ContactsTagsPage'
import MessagesPage from '@/pages/MessagesPage'
import InboxPage from '@/pages/InboxPage'
import InboxRequestsPage from '@/pages/InboxRequestsPage'
import InboxSettingsPage from '@/pages/InboxSettingsPage'
import AutomationPage from '@/pages/AutomationPage'
import AutomationJourneyPage from '@/pages/AutomationJourneyPage'
import AutomationTemplatesPage from '@/pages/AutomationTemplatesPage'
import AutomationBotsPage from '@/pages/AutomationBotsPage'
import ChannelsPage from '@/pages/ChannelsPage'
import ChannelsSmsPage from '@/pages/ChannelsSmsPage'
import ChannelsWhatsAppPage from '@/pages/ChannelsWhatsAppPage'
import ChannelsMessengerPage from '@/pages/ChannelsMessengerPage'
import ChannelsInstagramPage from '@/pages/ChannelsInstagramPage'
import ChannelsApplePage from '@/pages/ChannelsApplePage'
import ChannelsEmailPage from '@/pages/ChannelsEmailPage'
import ChannelsCallPage from '@/pages/ChannelsCallPage'
import ChannelsPushPage from '@/pages/ChannelsPushPage'
import ChannelsRcsPage from '@/pages/ChannelsRcsPage'
import NotificationsPage from '@/pages/NotificationsPage'
import SettingsPage from '@/pages/SettingsPage'
import DeveloperApisPage from '@/pages/DeveloperApisPage'
import DeveloperApisListingPage from '@/pages/DeveloperApisListingPage'
import DeveloperApisDocsPage from '@/pages/DeveloperApisDocsPage'
import DeveloperApisSmsPage from '@/pages/DeveloperApisSmsPage'
import DeveloperApisVoicePage from '@/pages/DeveloperApisVoicePage'
import DeveloperApisWhatsappPage from '@/pages/DeveloperApisWhatsappPage'
import DeveloperApisPushPage from '@/pages/DeveloperApisPushPage'
import DeveloperApisOtpPage from '@/pages/DeveloperApisOtpPage'
import DeveloperApisBotsPage from '@/pages/DeveloperApisBotsPage'
import SettingsProfilePage from '@/pages/SettingsProfilePage'
import SettingsOrganizationPage from '@/pages/SettingsOrganizationPage'
import SettingsContactsExportPage from '@/pages/SettingsContactsExportPage'
import SettingsPluginsPage from '@/pages/SettingsPluginsPage'
import SettingsPreferencesPage from '@/pages/SettingsPreferencesPage'
import SettingsSupportPage from '@/pages/SettingsSupportPage'
import BillingPage from '@/pages/BillingPage'
import ProfilePage from '@/pages/ProfilePage'
import AutomationKbPage from '@/pages/AutomationKbPage'
import AutomationBotTemplatesPage from '@/pages/AutomationBotTemplatesPage'
import ContactsAttributesPage from '@/pages/ContactsAttributesPage'
import UseCasesPage from '@/pages/UseCasesPage'
import LibraryPage from '@/pages/LibraryPage'
import VerifyPage from '@/pages/VerifyPage'
import AnalyticsPerformancePage from '@/pages/AnalyticsPerformancePage'
import AnalyticsCampaignsPage from '@/pages/AnalyticsCampaignsPage'
import AnalyticsConversationsPage from '@/pages/AnalyticsConversationsPage'
import AnalyticsChannelsPage from '@/pages/AnalyticsChannelsPage'
import AnalyticsAgentPage from '@/pages/AnalyticsAgentPage'
import AnalyticsCustomPage from '@/pages/AnalyticsCustomPage'
import DeveloperApisKeysPage from '@/pages/DeveloperApisKeysPage'
import DeveloperApisWebhooksPage from '@/pages/DeveloperApisWebhooksPage'
import DeveloperApisLogsPage from '@/pages/DeveloperApisLogsPage'
import SettingsCompanyPage from '@/pages/SettingsCompanyPage'
import SettingsSecurityPage from '@/pages/SettingsSecurityPage'
import BillingPlansPage from '@/pages/BillingPlansPage'
import BillingUsagePage from '@/pages/BillingUsagePage'
import BillingPaymentsPage from '@/pages/BillingPaymentsPage'
import BillingInvoicesPage from '@/pages/BillingInvoicesPage'
import SupportHelpPage from '@/pages/SupportHelpPage'
import SupportBestPracticesPage from '@/pages/SupportBestPracticesPage'
import SupportFaqsPage from '@/pages/SupportFaqsPage'


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
          <Route path="/analytics/performance" element={
            <ProtectedRoute>
              <RootLayout>
                <DashboardLayout>
                  <AnalyticsPerformancePage />
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
          <Route path="/analytics/channels" element={
            <ProtectedRoute>
              <RootLayout>
                <DashboardLayout>
                  <AnalyticsChannelsPage />
                </DashboardLayout>
              </RootLayout>
            </ProtectedRoute>
          } />
          <Route path="/analytics/agent" element={
            <ProtectedRoute>
              <RootLayout>
                <DashboardLayout>
                  <AnalyticsAgentPage />
                </DashboardLayout>
              </RootLayout>
            </ProtectedRoute>
          } />
          <Route path="/analytics/custom" element={
            <ProtectedRoute>
              <RootLayout>
                <DashboardLayout>
                  <AnalyticsCustomPage />
                </DashboardLayout>
              </RootLayout>
            </ProtectedRoute>
          } />
          <Route path="/campaigns" element={
            <ProtectedRoute>
              <RootLayout>
                <DashboardLayout>
                  <CampaignsPage />
                </DashboardLayout>
              </RootLayout>
            </ProtectedRoute>
          } />
          <Route path="/campaigns/create" element={
            <ProtectedRoute>
              <RootLayout>
                <DashboardLayout>
                  <CampaignsCreatePage />
                </DashboardLayout>
              </RootLayout>
            </ProtectedRoute>
          } />
          <Route path="/campaigns/settings" element={
            <ProtectedRoute>
              <RootLayout>
                <DashboardLayout>
                  <CampaignsSettingsPage />
                </DashboardLayout>
              </RootLayout>
            </ProtectedRoute>
          } />
          <Route path="/campaigns/templates" element={
            <ProtectedRoute>
              <RootLayout>
                <DashboardLayout>
                  <CampaignsTemplatesPage />
                </DashboardLayout>
              </RootLayout>
            </ProtectedRoute>
          } />
          <Route path="/campaigns/ai-bots" element={
            <ProtectedRoute>
              <RootLayout>
                <DashboardLayout>
                  <CampaignsAiBotsPage />
                </DashboardLayout>
              </RootLayout>
            </ProtectedRoute>
          } />
          <Route path="/campaigns/automation" element={
            <ProtectedRoute>
              <RootLayout>
                <DashboardLayout>
                  <CampaignsAutomationPage />
                </DashboardLayout>
              </RootLayout>
            </ProtectedRoute>
          } />
          <Route path="/contacts" element={
            <ProtectedRoute>
              <RootLayout>
                <DashboardLayout>
                  <ContactsPage />
                </DashboardLayout>
              </RootLayout>
            </ProtectedRoute>
          } />
          <Route path="/contacts/segments" element={
            <ProtectedRoute>
              <RootLayout>
                <DashboardLayout>
                  <ContactsSegmentsPage />
                </DashboardLayout>
              </RootLayout>
            </ProtectedRoute>
          } />
          <Route path="/contacts/tags" element={
            <ProtectedRoute>
              <RootLayout>
                <DashboardLayout>
                  <ContactsTagsPage />
                </DashboardLayout>
              </RootLayout>
            </ProtectedRoute>
          } />
          <Route path="/contacts/attributes" element={
            <ProtectedRoute>
              <RootLayout>
                <DashboardLayout>
                  <ContactsAttributesPage />
                </DashboardLayout>
              </RootLayout>
            </ProtectedRoute>
          } />
          <Route path="/contacts/:id/edit" element={
            <ProtectedRoute>
              <RootLayout>
                <DashboardLayout>
                  <ContactsEditPage />
                </DashboardLayout>
              </RootLayout>
            </ProtectedRoute>
          } />
          <Route path="/contacts/:id" element={
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
          <Route path="/automation/journey" element={
            <ProtectedRoute>
              <RootLayout>
                <DashboardLayout>
                  <AutomationJourneyPage />
                </DashboardLayout>
              </RootLayout>
            </ProtectedRoute>
          } />
          <Route path="/automation/templates" element={
            <ProtectedRoute>
              <RootLayout>
                <DashboardLayout>
                  <AutomationTemplatesPage />
                </DashboardLayout>
              </RootLayout>
            </ProtectedRoute>
          } />
          <Route path="/use-cases" element={
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
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
        <Toaster />
      </OnboardingProvider>
    </AuthProvider>
  )
}

export default App
