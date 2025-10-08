import path from "node:path";
import winston from "winston";

const { combine, timestamp, printf, colorize, errors, json } = winston.format;

// Custom format for console output with colors and pretty printing
const consoleFormat = combine(
	colorize({ all: true }),
	timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
	errors({ stack: true }),
	printf(({ message }) => `${message}`)
);

// JSON format for file output with timestamps
const fileFormat = combine(
	timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
	errors({ stack: true }),
	json({ space: 2 })
);

// Create logs directory path
const logsDir = path.join(process.cwd(), ".logs");

// Create the logger
export const logger = winston.createLogger({
	level: process.env.LOG_LEVEL || "info",
	transports: [
		// Console transport with colors and pretty printing
		new winston.transports.Console({
			format: consoleFormat,
		}),
		// File transport for all logs (JSON format)
		new winston.transports.File({
			filename: path.join(logsDir, "combined.log"),
			format: fileFormat,
			maxsize: 5_242_880, // 5MB
			maxFiles: 5,
		}),
		// File transport for error logs only
		new winston.transports.File({
			filename: path.join(logsDir, "error.log"),
			level: "error",
			format: fileFormat,
			maxsize: 5_242_880, // 5MB
			maxFiles: 5,
		}),
	],
	// Handle uncaught exceptions and rejections
	exceptionHandlers: [
		new winston.transports.File({
			filename: path.join(logsDir, "exceptions.log"),
			format: fileFormat,
		}),
	],
	rejectionHandlers: [
		new winston.transports.File({
			filename: path.join(logsDir, "rejections.log"),
			format: fileFormat,
		}),
	],
});

// If we're not in production, log more verbose
if (process.env.NODE_ENV !== "production") {
	logger.level = "debug";
}
