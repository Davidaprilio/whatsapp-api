import winston, { format, Logger, transports } from "winston";
import { basename } from "path";

function createWinstonLogger(transports: any[]): Logger {
  return winston.createLogger({
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
    format: format.combine(
      format.label({ label: basename(__filename) }),
      format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
      // Format the metadata object
      format.metadata({ fillExcept: ['message', 'level', 'timestamp', 'label'] })
    ),
    transports,
    exitOnError: false
  })
}
const logFormat = format.printf(info => `${info.timestamp} ${info.level} [${info.label}]: ${info.message}`)


export const logwa = createWinstonLogger([
  new transports.Console({
    format: format.combine(
      format.colorize(),
      logFormat
    )
  }),
  new transports.File({
    filename: 'logs/whatsapp.log',
    format: format.combine(
      // Render in one line in your log file.
      // If you use prettyPrint() here it will be really
      // difficult to exploit your logs files afterwards.
      format.json()
    )
  })
])
