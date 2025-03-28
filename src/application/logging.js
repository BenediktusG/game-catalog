import winston from "winston";

export const logger = winston.createLogger({
    level: 'debug',
    format: winston.format.combine(
        winston.format.colorize(),
        winston.format.timestamp(),
        winston.format.printf(({ level, message, timestamp }) => {
            return `[${timestamp}] ${level}: ${typeof message === "object" ? JSON.stringify(message, null, 2) : message}`;
        })
    ),
    transports: [
        new winston.transports.Console({}),
    ],
});