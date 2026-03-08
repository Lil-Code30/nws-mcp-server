import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { NWS_API_BASE } from "./data.js";
import { helpers } from "./helpers.js";
// Importing packages and setting up the instance
// create server instance
const server = new McpServer({
    name: "weather",
    version: "1.0.0",
});
// Register weather tools
server.registerTool("get_alerts", {
    description: "Get weather alerts for a state",
    inputSchema: {
        state: z
            .string()
            .length(2)
            .describe("Two-letter state code (e.g CA, NY)"),
    },
}, async ({ state }) => {
    const stateCode = state.toUpperCase();
    const alertUrl = `${NWS_API_BASE}/alerts?area=${stateCode}`;
    const alertData = await helpers.makeNWSRequest(alertUrl);
    if (!alertData) {
        return {
            content: [
                {
                    type: "text",
                    text: "Failed to retrieve alerts data",
                },
            ],
        };
    }
    const features = alertData.features || [];
    if (features.length == 0) {
        return {
            content: [{ type: "text", text: `No active alerts for ${stateCode}` }],
        };
    }
    const formattedAlerts = features.map(helpers.formatAlert);
    const alertsText = `Active alerts for ${stateCode}:\n\n${formattedAlerts.join("\n")}`;
    return {
        content: [
            {
                type: "text",
                text: alertsText,
            },
        ],
    };
});
server.registerTool("get-forecast", {
    title: "Get Weather Forecast",
    description: "Get weather forcast for a location",
    inputSchema: {
        latitude: z
            .number()
            .min(-90)
            .max(90)
            .describe("Latitude of the location"),
        longitude: z
            .number()
            .min(-180)
            .max(180)
            .describe("Longitude of the location"),
    },
}, async ({ latitude, longitude }) => {
    // Get grid point data
    const pointsUrl = `${NWS_API_BASE}/points/${latitude.toFixed(4)},${longitude.toFixed(4)}`;
    const pointsData = await helpers.makeNWSRequest(pointsUrl);
    if (!pointsData) {
        return {
            content: [
                {
                    type: "text",
                    text: `Failed to retrieve grid point data for coordinates: ${latitude}, ${longitude}. This location may not be supported by the NWS API (only US locations are supported).`,
                },
            ],
        };
    }
    const forecastUrl = pointsData.properties?.forecast;
    if (!forecastUrl) {
        return {
            content: [
                {
                    type: "text",
                    text: "Failed to get forecast URL from grid point data",
                },
            ],
        };
    }
    // Get forecast data
    const forecastData = await helpers.makeNWSRequest(forecastUrl);
    if (!forecastData) {
        return {
            content: [
                {
                    type: "text",
                    text: "Failed to retrieve forecast data",
                },
            ],
        };
    }
    const periods = forecastData.properties?.periods || [];
    if (periods.length === 0) {
        return {
            content: [
                {
                    type: "text",
                    text: "No forecast periods available",
                },
            ],
        };
    }
    // Format forecast periods
    const formattedForecast = periods.map((period) => [
        `${period.name || "Unknown"}:`,
        `Temperature: ${period.temperature || "Unknown"}°${period.temperatureUnit || "F"}`,
        `Wind: ${period.windSpeed || "Unknown"} ${period.windDirection || ""}`,
        `${period.shortForecast || "No forecast available"}`,
        "---",
    ].join("\n"));
    const forecastText = `Forecast for ${latitude}, ${longitude}:\n\n${formattedForecast.join("\n")}`;
    return {
        content: [
            {
                type: "text",
                text: forecastText,
            },
        ],
    };
});
// Running the server
// implement the main function to run the server:
async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("Weather MCP Server running on stdio");
}
main().catch((error) => {
    console.error("Fatal error in main():", error);
    process.exit(1);
});
