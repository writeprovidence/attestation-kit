import * as dotenv from 'dotenv'
import {BigNumber as bn} from 'bignumber.js'
import {toBuffer} from 'ethereumjs-util'
import {AttestationTypeID} from '@bloomprotocol/attestations-lib'

dotenv.config()

interface IEnvironmentConfig {
  apiKey: string
  appId: string
  appPort: number
  approved_attesters?: IAttestationTypesToArrAnyAll
  approved_requesters?: IAttestationTypesToArrAnyAll
  attester_rewards?: IAttestationTypesToStrAll
  bltAddress: string
  dbUrl: string
  nodeEnv: string
  rinkebyWeb3Provider: string
  sentryDSN: string
  skipValidations: boolean
  web3Provider: string
  webhook_host: string
  webhook_key: string
  whisperPollInterval?: number
  attestationContracts: {
    logicAddress: string
  }
  tokenEscrowMarketplace: {
    address: string
  }
  owner: {
    ethAddress: string
    ethPrivKey: string
  }
  whisper: {
    provider: string
    password: string
    topicPrefix: string
    ping: {
      enabled: boolean
      interval: number
      alertInterval: string
      password: string
    }
  }
  logs: {
    whisper: {
      pings: boolean
      sql: boolean
    }
    level?: string
  }
  log_level?: string
  txService?: {
    address: string
    key: string
    webhookKeySha: string
  }
}

export type TAtTypeAll = keyof typeof AttestationTypeID | 'all'

export type TAttestationTypesToArr = {
  [P in keyof typeof AttestationTypeID]?: Array<string>
}

export interface IAttestationTypesToArrAnyAll extends TAttestationTypesToArr {
  any?: boolean
  all?: string[]
}

export type TAttestationTypesToStr = {[P in keyof typeof AttestationTypeID]?: string}

export interface IAttestationTypesToStrAll {
  all?: string
}

type TEnvType = 'string' | 'json' | 'int' | 'float' | 'bool' | 'buffer' | 'bn'

const testBool = (value: string) =>
  (['true', 't', 'yes', 'y'] as any).includes(value.toLowerCase())

// Throw an error if the specified environment variable is not defined
const envVar = (
  name: string,
  type: TEnvType = 'string',
  required: boolean = true,
  defaultVal?: any,
  opts?: {
    baseToParseInto?: number
  }
): any => {
  const value = process.env[name]
  if (required) {
    if (!value) {
      throw new Error(`Expected environment variable ${name}`)
    }
    switch (type) {
      case 'string':
        return value
      case 'json':
        return JSON.parse(value)
      case 'int':
        return parseInt(value, opts && opts.baseToParseInto)
      case 'float':
        return parseFloat(value)
      case 'bool':
        return testBool(value)
      case 'buffer':
        return toBuffer(value)
      case 'bn':
        return new bn(value)
      default:
        throw new Error(`Unhandled type ${type}`)
    }
  } else {
    if (!value && typeof defaultVal !== 'undefined') return defaultVal
    switch (type) {
      case 'string':
        return value
      case 'json':
        return value && JSON.parse(value)
      case 'int':
        return value && parseInt(value)
      case 'bool':
        return value ? testBool(value) : false
      case 'buffer':
        return value && toBuffer(value)
      case 'bn':
        return value && new bn(value)
      default:
        throw new Error(`Unhandled type ${type}`)
    }
  }
}

// Topics shouldn't be number but string
/* 
 * const topics: any = envVar('WHISPER_TOPICS', 'json')
;(Object as any).keys(topics).forEach((k: string) => {
  topics[k] = topics[k].toString()
})
*/

export const env: IEnvironmentConfig = {
  apiKey: envVar('API_KEY_SHA256'),
  appId: envVar('APP_ID', 'string', true), // e.g., attestation-kit_dev_bob
  appPort: envVar('PORT', 'int', false, 3000),
  approved_attesters: envVar('APPROVED_ATTESTERS', 'json', false),
  approved_requesters: envVar('APPROVED_REQUESTERS', 'json', false),
  attester_rewards: envVar('ATTESTER_MIN_REWARDS', 'json'),
  bltAddress: envVar('BLT_ADDRESS'),
  dbUrl: envVar('PG_URL'),
  nodeEnv: envVar('NODE_ENV'),
  rinkebyWeb3Provider: envVar('RINKEBY_WEB3_PROVIDER'),
  sentryDSN: envVar('SENTRY_DSN'),
  web3Provider: envVar('WEB3_PROVIDER'),
  webhook_host: envVar('WEBHOOK_HOST'),
  webhook_key: envVar('WEBHOOK_KEY'),
  attestationContracts: {
    logicAddress: envVar('ATTESTATION_LOGIC_ADDRESS'),
  },
  logs: {
    whisper: {
      sql: envVar('LOG_WHISPER_SQL', 'bool', false),
      pings: envVar('LOG_WHISPER_PINGS', 'bool', false),
    },
    level: envVar('LOG_LEVEL', 'string', false),
  },
  owner: {
    ethAddress: envVar('PRIMARY_ETH_ADDRESS'),
    ethPrivKey: envVar('PRIMARY_ETH_PRIVKEY'),
  },
  skipValidations: envVar('SKIP_VALIDATIONS', 'bool', false),
  tokenEscrowMarketplace: {
    address: envVar('TOKEN_ESCROW_MARKETPLACE_ADDRESS'),
  },
  whisper: {
    provider: envVar('WHISPER_PROVIDER'),
    password: envVar('WHISPER_PASSWORD'),
    topicPrefix: envVar('WHISPER_TOPIC_PREFIX'),
    ping: {
      enabled: envVar('WHISPER_PING_ENABLED', 'bool', false), // Defaults to false if not specified
      interval: envVar('WHISPER_PING_INTERVAL', 'string', false, '1 minute'), // PostgreSQL interval - Defaults to 1 min if not specified
      alertInterval: envVar(
        'WHISPER_PING_ALERT_INTERVAL',
        'string',
        false,
        '5 minutes'
      ), // PostgreSQL interval - Defaults to 1 min if not specified
      password: envVar(
        'WHISPER_PING_PASSWORD',
        'string',
        envVar('WHISPER_PING_ENABLED', 'bool', false) // Whether or not it's required dependent on whether or not whisper ping is enabled
      ),
    },
  },
  whisperPollInterval: envVar('WHISPER_POLL_INTERVAL', 'int', false, 5000),
  txService: process.env['TX_SERVICE_ADDRESS']
    ? {
        address: envVar('TX_SERVICE_ADDRESS'),
        key: envVar('TX_SERVICE_KEY'),
        webhookKeySha: envVar('TX_SERVICE_KEY_SHA256'),
      }
    : undefined,
}
