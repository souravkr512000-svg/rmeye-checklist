# RMEYE Digital Checklist

A web-based digital checklist application for RMEYE project tracking. Share a single link with your team so everyone can use the same checklist for different projects.

## Features

- **Create Multiple Projects** - Each project gets its own checklist instance
- **Shareable Links** - Share project links with team members
- **Real-time Updates** - Changes are saved automatically
- **Progress Tracking** - Visual progress bars for each phase
- **7-Phase Workflow** - All phases from your Excel checklist:
  - Phase 1: Project Initiation
  - Phase 2: Environment Validation
  - Phase 3: Installation
  - Phase 4: Configuration
  - Phase 5: Analytics, Alarms & Admin
  - Phase 6: Quebec Deployment (Conditional)
  - Phase 7: Project Closure

## Quick Start

### Option 1: Run Locally

1. Install Node.js from https://nodejs.org/
2. Open terminal in this folder
3. Run:
   ```bash
   npm install
   npm start
   ```
4. Open http://localhost:3000 in your browser

### Option 2: Share with Team (Network)

To share with team members on the same network:

1. Start the server: `npm start`
2. Find your IP address: `ipconfig` (Windows) or `ifconfig` (Mac/Linux)
3. Share the link: `http://YOUR_IP:3000`

### Option 3: Deploy Online (Recommended for Team Use)

For permanent online access, deploy to a cloud service:

#### Deploy to Render.com (Free)
1. Create account at https://render.com
2. Connect your GitHub repository
3. Create a new Web Service
4. Use the following settings:
   - Build Command: `npm install`
   - Start Command: `npm start`
5. Get your permanent URL like: `https://rmeye-checklist.onrender.com`

#### Deploy to Railway.app (Free tier)
1. Visit https://railway.app
2. Click "Start a New Project"
3. Select "Deploy from GitHub"
4. Your app will be live with a permanent URL

## Usage

1. **Create a Project**: Click "New Project" and enter project details
2. **Share the Link**: Copy the project link and share with team members
3. **Update Checklist**: Team members can update status, owners, dates, and remarks
4. **Track Progress**: View overall progress and phase-by-phase completion

## Data Storage

- Data is stored in a local SQLite database (`checklist.db`)
- For cloud deployments, consider using a persistent database service

## Support

For questions or issues, contact the development team.
