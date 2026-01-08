# VeloHub

Making bike maintenance easy - Your one app solution to bike maintenance.

## Features

- 🔗 **Strava Integration**: Connect your Strava account and sync cycling activities (Ride activities only)
- 📅 **Calendar View**: View all your cycling activities in a calendar format
- 🚴 **Component Tracking**: Track maintenance for Chain, Power Meter Battery, Di2 System Battery, Di2 Shifter Battery, and Tubeless Sealant
- 📈 **Progress Bars**: Visual progress tracking with mileage, time, and days for each component
- 🔧 **Replacement History**: Track when components were replaced, rewaxed, or recharged
- 🕯️ **Wax Pot Usage**: Track chain wax usage with a progress bar (30 wax cycles)

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Strava API

1. Go to https://www.strava.com/settings/api
2. Create a new application
3. Set the Authorization Callback Domain to: `localhost`
4. Copy your Client ID and Client Secret
5. Create a `.env` file in the root directory:

```env
STRAVA_CLIENT_ID=your_client_id_here
STRAVA_CLIENT_SECRET=your_client_secret_here
STRAVA_REDIRECT_URI=http://localhost:3000/api/strava/callback
PORT=3000
```

### 3. Start the Server

```bash
npm start
```

For development with auto-reload:

```bash
npm run dev
```

### 4. Access the Application

Open your browser and navigate to: http://localhost:3000

## Usage

1. **Connect to Strava**: Go to the Components tab, scroll to "Strava Integration", and click "Connect to Strava" to authenticate
2. **Sync Activities**: After connecting, click "Sync Activities" to import your Ride activities from Strava
3. **Track Components**: 
   - View progress bars in the "My Bike" tab
   - Record replacements in the "Components" tab using "Rewaxed Today", "Recharged Today", or "Replaced Today" buttons
   - Use "Choose manual date" to record past replacements
   - View replacement history for each component
4. **View Calendar**: Check the Calendar tab to see all activities and component replacements

## Technology Stack

- **Backend**: Node.js with Express
- **Database**: SQLite
- **Frontend**: Vanilla JavaScript, HTML, CSS
- **API**: Strava API v3

## Component Categories

- **Chain**: Track mileage (max 375 miles) and time (max 22 hours). Wax pot usage tracker (max 30 cycles).
- **Power Meter Battery**: Track time only (max 300 hours)
- **Di2 System Battery**: Track mileage only (max 750 miles)
- **Di2 Shifter Battery**: Track days only (max 700 days)
- **Tubeless Sealant**: Track days only (max 90 days)

## License

MIT
