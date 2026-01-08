# My Bike Mechanic

A web application for tracking bicycle component usage by syncing activities from Strava. Track mileage and time on your bike components (chains, tires, brake pads, etc.) to know when maintenance is needed.

## Features

- 🔗 **Strava Integration**: Connect your Strava account and sync cycling activities
- 📊 **Activity Tracking**: View all your cycling activities with distance and time
- 🚴 **Bike Management**: Add multiple bikes to track
- 🔧 **Component Tracking**: Track individual components on each bike (chains, tires, brake pads, etc.)
- 📈 **Usage Statistics**: See total distance and time for each component

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

### 3. Initialize Database

The database will be automatically created when you start the server. If you need to reinitialize it manually:

```bash
npm run init-db
```

### 4. Start the Server

```bash
npm start
```

For development with auto-reload:

```bash
npm run dev
```

### 5. Access the Application

Open your browser and navigate to: http://localhost:3000

## Usage

1. **Connect to Strava**: Click "Connect to Strava" on the Strava Sync tab to authenticate
2. **Sync Activities**: After connecting, click "Sync Activities" to import your cycling activities from Strava
3. **Add Bikes**: Go to the "Bikes & Components" tab and add your bicycles
4. **Add Components**: For each bike, add components (chains, tires, etc.) with installation dates and service intervals
5. **View Statistics**: Check the Activities tab to see your total distance and time

## Technology Stack

- **Backend**: Node.js with Express
- **Database**: SQLite
- **Frontend**: Vanilla JavaScript, HTML, CSS
- **API**: Strava API v3

## Database Schema

- **activities**: Stores synced Strava activities
- **bikes**: Stores user's bicycles
- **components**: Stores components on each bike
- **component_usage**: Links activities to components (for future expansion)
- **strava_tokens**: Stores OAuth tokens for Strava API

## Future Enhancements

- Link activities to specific components automatically
- Set service reminders based on mileage/time intervals
- Multiple user support
- Export data to CSV/PDF
- More detailed component tracking and maintenance logs

## License

MIT