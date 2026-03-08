# National Weather Service MCP Server

This project is an MCP (Model Context Protocol) server that provides weather data using the National Weather Service (NWS) API.

> This is not an official NWS product. It is a custom implementation designed to integrate with MCP clients like Claude or OpenAI.

## Features

- Get weather alerts for a US state
- Get weather forecast for a specific location (latitude/longitude)

## Requirements

- Node.js (v18+ recommended)
- npm

## Installation

1. Clone the repository:

```sh
git clone https://github.com/Lil-Code30/nws-mcp-server.git
cd nws-mcp-server
```

2. Install dependencies:

```sh
npm install
```

## Build

Compile the TypeScript code:

```sh
npm run build
```

## Usage

Run the MCP server:

```sh
npm start
```

The server runs via stdio and exposes two tools:

### 1. `get_alerts`

- **Description:** Get weather alerts for a US state.
- **Input:**
  - `state`: Two-letter state code (e.g., CA, NY)
- **How it works:**
  - Uses the NWS Alerts endpoint: [`/alerts?area={STATE}`](https://www.weather.gov/documentation/services-web-api#/default/get_alerts_area__area_)
  - Example: `https://api.weather.gov/alerts?area=CA`
  - Returns active alerts or a message if none are found.

### 2. `get-forecast`

- **Description:** Get weather forecast for a location.
- **Input:**
  - `latitude`: Latitude of the location (US only)
  - `longitude`: Longitude of the location (US only)
- **How it works:**
  - Uses the NWS Points endpoint: [`/points/{lat},{lon}`](https://www.weather.gov/documentation/services-web-api#/default/get_points_lat_lon)
  - Example: `https://api.weather.gov/points/37.7749,-122.4194`
  - Retrieves the forecast URL from the points response, then fetches forecast data from that URL.
  - Returns a formatted forecast for the location.

## NWS API Reference

- Full documentation: [National Weather Service API](https://www.weather.gov/documentation/services-web-api)

## Notes

- Only US locations are supported by the NWS API.
- The server is designed for integration with MCP clients.

## Integrating with Claude or Other MCP Clients

You can connect this MCP server to any MCP-compatible client (like Claude, OpenAI, or custom apps) using the Model Context Protocol. The server communicates via stdio, so you can run it locally and connect via a tool or agent interface.
