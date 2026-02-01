# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

### Added
- **Rich Targeting UI**: Implemented a new 2-column "Master-Detail" interface for campaign trigger selection in the wizard.
- **Trigger Inputs**: Added support for dynamic configuration inputs (e.g., "Minimum Order Amount", "Event Name") for specific triggers.
- **Shopify Integration**: Added "Shopify" as a dedicated trigger category with the official logo and specific events (Abandoned Cart, Order Placed, etc.).
- **Assets**: Added `shopify.png` to local assets.

### Changed
- **Campaign Wizard**: Moved trigger selection from the initial dialog to the "Targeting" step (Step 1) of the wizard.
- **Validation**: Updated validation logic to support both audience-based (Broadcast) and trigger-based (Condition) campaigns.
- **Styles**: Unified hover and selected states for list items to improve UX.
- **Contacts Import**: Updated the import dialog to use the local Shopify asset instead of an external URL.

### Fixed
- **Lint Errors**: Resolved variable declaration issues in `CampaignsCreatePage.tsx` and `CampaignsPage.tsx`.
