# Construction Material Tracking System - User Guide

## Table of Contents

1. [Introduction](#introduction)
2. [Getting Started](#getting-started)
3. [Dashboard Overview](#dashboard-overview)
4. [Managing Jobs](#managing-jobs)
5. [Tracking Materials](#tracking-materials)
6. [Scanning QR Codes](#scanning-qr-codes)
7. [Importing Data](#importing-data)
8. [Role-specific Guides](#role-specific-guides)
   - [Administrator](#administrator)
   - [Estimator](#estimator)
   - [Detailer](#detailer)
   - [Purchaser](#purchaser)
   - [Warehouse Staff](#warehouse-staff)
   - [Field Installer](#field-installer)
9. [Offline Usage](#offline-usage)
10. [Troubleshooting](#troubleshooting)

## Introduction

The Construction Material Tracking System is designed to provide end-to-end tracking of construction materials throughout their lifecycle. From initial estimation to final installation, the system helps construction teams manage materials efficiently and maintain accurate records of all material movements and status changes.

### Key Features

- **Material Tracking**: Follow materials from estimation through installation
- **QR Code Scanning**: Use mobile devices to scan and update material status
- **Historical Audit Trail**: View complete history of all material changes
- **Excel Import/Export**: Bulk import and export material data
- **Offline Support**: Use the system even without internet connectivity
- **Role-based Access**: Different permissions for different team members

## Getting Started

### System Requirements

- **Desktop**: Modern web browser (Chrome, Firefox, Safari, Edge)
- **Mobile**: iOS 11+ or Android 8+
- **Internet**: Required for initial loading and sync (offline mode available afterward)

### Logging In

1. Navigate to the application URL provided by your administrator
2. Enter your username and password
3. If prompted, complete multi-factor authentication
4. You will be directed to the dashboard

### Navigation

The application has a responsive design that adapts to your device:

- **Desktop**: Side navigation menu is always visible
- **Mobile**: Navigation is accessible via the menu icon (≡) in the top-left corner

## Dashboard Overview

The dashboard provides at-a-glance information about your projects and materials:

### Key Metrics

- **Active Jobs**: Count of jobs in progress
- **Materials by Status**: Distribution of materials across different statuses
- **Recent Updates**: Latest material status changes
- **Critical Items**: Materials marked as damaged or missing

### Personalized Views

The dashboard adapts to your role in the system:

- **Estimators**: Focus on jobs in planning and estimation phases
- **Detailers**: Emphasis on detailed materials ready for release
- **Warehouse Staff**: Materials in fabrication and shipping
- **Field Installers**: On-site materials and installation progress

## Managing Jobs

Jobs represent construction projects and contain all associated materials.

### Viewing Jobs

1. Navigate to **Jobs** in the main menu
2. Use filters to find specific jobs by:
   - Status
   - Date range
   - Client
   - Location
3. Click on a job to view details

### Creating a New Job

> Note: This feature is available to Administrators and Estimators only.

1. Navigate to **Jobs** in the main menu
2. Click the **Add Job** button
3. Fill in the required fields:
   - Job Number
   - Job Name
   - Status
4. Add optional information:
   - Client
   - Location
   - Description
   - Start/End Dates
5. Click **Save** to create the job

### Editing Job Details

1. Navigate to the job details page
2. Click the **Edit** button
3. Update the necessary fields
4. Click **Save** to apply changes

## Tracking Materials

Materials are individual items tracked throughout the construction process.

### Material List View

1. Navigate to **Materials** in the main menu, or
2. Open a specific job and click the **Materials** tab
3. Use filters to find specific materials by:
   - Status
   - Material Type
   - System Type
   - Location

### Material Details

1. Click on any material in the list to view its details
2. The details page shows:
   - Basic information
   - Current status
   - Project information
   - Tracking information

### Material History

1. On the material details page, click the **History** tab
2. View the complete audit trail of the material, including:
   - Status changes
   - Field updates
   - User information
   - Timestamps
   - Notes

### Updating Material Status

1. Open the material details page
2. Click the **Update Status** button
3. Select the new status from the available options
4. Add notes if needed
5. Click **Update** to save the changes

### Viewing QR Codes

1. Open the material details page
2. Click the **QR Code** button
3. The QR code appears in a popup dialog
4. Use the **Print** button to print the QR code
5. Use the **Download** button to save the QR code as an image

## Scanning QR Codes

The system provides mobile-friendly QR code scanning to quickly access and update materials in the field.

### Scanning a QR Code

1. Navigate to **Scan** in the main menu
2. Grant camera permission if prompted
3. Point your device camera at the material's QR code
4. The system will automatically detect and scan the code
5. Once scanned, the material details will appear

### Quick Status Update

1. After scanning a QR code, the material details are displayed
2. Click the **Update Status** button
3. Select the new status from the available options
4. Add notes if needed
5. Click **Update** to save the changes

### Offline Scanning

1. Scan QR codes even without internet connectivity
2. Status updates are stored locally
3. Changes automatically sync when connectivity is restored
4. An indicator shows when you're working in offline mode

## Importing Data

The system supports bulk import of material data from Excel files.

### Preparing the Excel File

1. Your Excel file must include these required columns:
   - `materialIdentifier` (unique identifier within a job)
   - `description` (material description)
   - `materialType` (type of material)
   - `systemType` (system the material belongs to)
   - `quantityEstimated` (number value)
   - `unitOfMeasure` (e.g., EA, FT, M2)

2. Optional columns include:
   - `locationLevel` (building level)
   - `locationZone` (zone within level)
   - `detailDrawingId` (reference to detailed drawing)
   - `costEstimated` (estimated cost)

### Importing Materials

1. Navigate to **Import** in the main menu
2. Select a job from the dropdown list
3. Click **Choose File** and select your Excel file
4. Click **Upload** to begin the import process
5. The system validates the file format and displays progress
6. Once complete, review the import results:
   - Number of materials created
   - Number of materials updated
   - Any errors encountered

## Role-specific Guides

### Administrator

As an Administrator, you have full access to all system features.

#### Key Responsibilities

- User management
- System configuration
- Job creation and management
- Data monitoring and reporting

#### Unique Features

- **User Management**:
  1. Navigate to **Admin > Users**
  2. Add, edit, or deactivate users
  3. Assign users to appropriate roles

- **System Settings**:
  1. Navigate to **Admin > Settings**
  2. Configure system parameters
  3. Customize material statuses and transitions

### Estimator

As an Estimator, you focus on creating jobs and initial material estimates.

#### Key Responsibilities

- Creating new jobs
- Estimating initial materials
- Importing material lists
- Tracking estimation progress

#### Workflow

1. Create a new job
2. Import initial material estimates from Excel
3. Review and adjust material details
4. Monitor estimation progress
5. Update materials to "DETAILED" status when ready

### Detailer

As a Detailer, you refine material specifications before fabrication.

#### Key Responsibilities

- Reviewing estimated materials
- Adding detailed specifications
- Updating material status to "RELEASED_TO_FAB"

#### Workflow

1. Review materials in "DETAILED" status
2. Add or update detailed specifications
3. Attach relevant documentation
4. Update material status to "RELEASED_TO_FAB" when ready for fabrication

### Purchaser

As a Purchaser, you manage the procurement of materials.

#### Key Responsibilities

- Reviewing materials released for fabrication
- Managing procurement process
- Updating material status during procurement

#### Workflow

1. View materials in "RELEASED_TO_FAB" status
2. Manage procurement process
3. Update material status to "IN_FABRICATION" when production begins

### Warehouse Staff

As Warehouse Staff, you manage material fabrication, inventory, and shipping.

#### Key Responsibilities

- Tracking fabrication progress
- Managing inventory
- Preparing materials for shipping
- Updating material status

#### Workflow

1. Track materials in "IN_FABRICATION" status
2. Update to "FABRICATED" when complete
3. Prepare materials for shipping
4. Update to "SHIPPED_TO_FIELD" when sent to site

### Field Installer

As a Field Installer, you manage materials on-site and record installations.

#### Key Responsibilities

- Receiving materials on-site
- Tracking material locations
- Recording installations
- Reporting damaged or missing materials

#### Workflow

1. Scan QR codes to quickly access material details
2. Update received materials to "RECEIVED_ON_SITE"
3. Track material location on-site
4. Update to "INSTALLED" when installed
5. Report damaged or missing materials by updating status

## Offline Usage

The system supports offline usage for field operations.

### Enabling Offline Mode

1. Visit the application while online
2. The system automatically caches necessary data
3. When offline, the application will continue to function
4. An indicator shows when you're working offline

### Working Offline

1. View cached material data
2. Scan QR codes to access material details
3. Update material status
4. Changes are stored locally

### Synchronization

1. When internet connectivity is restored, the system automatically syncs
2. A notification confirms successful synchronization
3. Any conflicts are highlighted for resolution

## Troubleshooting

### Common Issues

#### Unable to Log In

- Verify your username and password
- Check internet connectivity
- Ensure your account is active
- Contact your administrator if problems persist

#### QR Code Not Scanning

- Ensure adequate lighting
- Hold the device steady
- Make sure the QR code is fully visible
- Clean the camera lens
- Try scanning from a different angle

#### Excel Import Errors

- Verify the file format is .xlsx or .xls
- Check that all required columns are present
- Ensure data types are correct
- Review the error message for specific issues

#### Offline Sync Issues

- Ensure you have internet connectivity
- Try manually refreshing the page
- Check for error notifications
- Contact support if sync repeatedly fails

### Getting Help

For additional assistance:

- Click the **Help** icon in the application
- Refer to this documentation
- Contact your system administrator
- Email support at support@construction-tracker.com 