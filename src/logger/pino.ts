import Pino, { Logger } from 'pino'
import childProcess from 'child_process'
import { PassThrough } from 'stream'

// Environment variables
const cwd = process.cwd()
const { env } = process
const logPath = `${cwd}/logs`

// Create a stream where the logs will be written
const logThrough: PassThrough = new PassThrough()
const PinoLog: Logger = Pino({ name: 'project' }, logThrough)

// Log to multiple files using a separate process
const child = childProcess.spawn(process.execPath, [
  require.resolve('pino-tee'),
  'warn', `${logPath}/warn.log`,
  'error', `${logPath}/error.log`,
  'fatal', `${logPath}/fatal.log`,
  'info', `${logPath}/info.log`,
], { cwd, env, stdio: ['pipe', 'inherit', 'inherit'] })

logThrough.pipe(child.stdin)

export default PinoLog
// Writing some test logs
// log.warn('WARNING 1')
// log.error('ERROR 1')
// log.fatal('FATAL 1')