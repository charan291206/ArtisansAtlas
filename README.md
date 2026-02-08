# ArtisansAtlas

ArtisansAtlas is a web-based mapping application designed to visualize the locations of artisans and buyers on an interactive map. It allows users to view geospatial data, calculate distances (e.g., 5 km or 10 km), and display details about nearby points of interest. The app uses GeoJSON data to plot markers for artisans and buyers, differentiating them potentially with custom icons (green for artisans, red for buyers).

## Live Demo
View the active deployment on GitHub Pages: [https://charan291206.github.io/ArtisansAtlas/](https://charan291206.github.io/ArtisansAtlas/). Note: The deployed version shows a basic static structure with text elements like "Artisans Buyers Distance 5 KM 10 KM" and a "Details" section. Full interactive map functionality may require local setup or further configuration.

## Features
- Interactive map powered by Leaflet.js for displaying locations.
- Loading and rendering GeoJSON data for artisans and buyers (approximately 110 points each).
- Distance filtering options (5 km and 10 km) to show nearby artisans relative to buyers or vice versa.
- Details section to display filtered results or additional information.
- Simple UI with a logo linking to [SpaceInf](https://spaceinf.com).
- Local server for development using Node.js and Express.

## Technologies Used
- **Frontend**: HTML, CSS, JavaScript, Leaflet.js (for mapping).
- **Backend**: Node.js with Express (for serving static files locally).
- **Data**: GeoJSON files (`Artisans1.geojson` for artisans, `Buyers.geojson` for buyers).
- **Dependencies**: Express (^4.21.2).
- **Other Assets**: Custom marker icons (green.png, red.png, marker-shadow.png), logo (space inf logo.png).

## Installation
1. Clone the repository:
   ```
   git clone https://github.com/charan291206/ArtisansAtlas.git
   ```
2. Navigate to the project directory:
   ```
   cd ArtisansAtlas
   ```
3. Install dependencies:
   ```
   npm install
   ```

## Usage
### Local Development
1. Start the server:
   ```
   npm start
   ```
2. Open your browser and visit `http://localhost:8000`.
3. The app will load the map (if configured in JS), display distance options (5 km / 10 km), and show details based on GeoJSON data.

### Deployment
- For static deployment (e.g., GitHub Pages), use the client-side files (`demo.html` or `index.html`, JS, CSS, GeoJSON). Ensure GeoJSON files and assets are accessible client-side.

## Data Overview
- **Artisans1.geojson**: Contains 110 features with properties like Id, Gender, Lat, Lng. Points are located around coordinates like [80.79, 16.57] (near Vijayawada, India).
- **Buyers.geojson**: Similar structure with 110 features, properties like Id, Gender, Lng, Lat.
