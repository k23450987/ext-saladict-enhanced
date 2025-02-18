import { SearchFunction, GetSrcPageFunction } from '../helpers'
import memoizeOne from 'memoize-one'
import {
  MachineTranslateResult,
  MachineTranslatePayload,
  getMTArgs,
  machineResult
} from '@/components/MachineTrans/engine'
import { DeepLXLanguage } from './config'
import DeepLX from './deeplx'

export const getTranslator = memoizeOne(
  () =>
    new DeepLX({
      env: 'ext',
      config:
        process.env.DEEPLX_TOKEN && process.env.DEEPLX_ENDPOINT
          ? {
            token: process.env.DEEPLX_TOKEN,
            endpoint: process.env.DEEPLX_ENDPOINT
          }
          : undefined
    })
)

export const getSrcPage: GetSrcPageFunction = (text, config, profile) => {
  return `https://www.deepl.com/en/translator#en/zh-hans/${encodeURIComponent(text)}`
}

export type DeepLXResult = MachineTranslateResult<'deeplx'>

export const search: SearchFunction<
  DeepLXResult,
  MachineTranslatePayload<DeepLXLanguage>
> = async (rawText, config, profile, payload) => {
  const translator = getTranslator()

  const { sl, tl, text } = await getMTArgs(
    translator,
    rawText,
    profile.dicts.all.deeplx,
    config,
    payload
  )

  const token = config.dictAuth.deeplx.token
  const endpoint = config.dictAuth.deeplx.endpoint
  const translatorConfig = token && endpoint ? { token, endpoint } : undefined

  try {
    const result = await translator.translate(text, sl, tl, translatorConfig)
    return machineResult(
      {
        result: {
          id: 'deeplx',
          slInitial: profile.dicts.all.deeplx.options.slInitial,
          sl: result.from,
          tl: result.to,
          searchText: result.origin,
          trans: result.trans
        },
        audio: {
          py: result.trans.tts,
          us: result.trans.tts
        }
      },
      translator.getSupportLanguages()
    )
  } catch (e) {
    return machineResult(
      {
        result: {
          id: 'deeplx',
          slInitial: 'hide',
          sl,
          tl,
          searchText: { paragraphs: [''] },
          trans: { paragraphs: [''] }
        }
      },
      translator.getSupportLanguages()
    )
  }
}
