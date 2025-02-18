import { SearchFunction, GetSrcPageFunction } from '../helpers'
import memoizeOne from 'memoize-one'
import {
  MachineTranslateResult,
  MachineTranslatePayload,
  getMTArgs,
  machineResult
} from '@/components/MachineTrans/engine'
import { GeminiLanguage } from './config'
import Gemini from './gemini'

const defaultPrompt = 'Translate it into {{to}}, Output only the result: {{text}}'
const defaultSystemPrompt = 'You are a professional, authentic machine translation engine.'
export const getTranslator = memoizeOne(
  () =>
    new Gemini({
      env: 'ext',
      config:
        process.env.GEMINI_KEY && process.env.GEMINI_ENDPOINT
          ? {
            key: process.env.GEMINI_KEY,
            endpoint: process.env.GEMINI_ENDPOINT,
            prompt: process.env.GEMINI_PROMPT || defaultPrompt,
            systemPrompt: process.env.GEMINI_SYSTEM_PROMPT || defaultSystemPrompt
          }
          : undefined
    })
)

export const getSrcPage: GetSrcPageFunction = (text, config, profile) => {
  const domain = 'com'
  const lang =
    profile.dicts.all.google.options.tl === 'default'
      ? config.langCode
      : profile.dicts.all.google.options.tl

  return `https://translate.google.${domain}/#auto/${lang}/${text}`
}

export type GeminiResult = MachineTranslateResult<'gemini'>

export const search: SearchFunction<
  GeminiResult,
  MachineTranslatePayload<GeminiLanguage>
> = async (rawText, config, profile, payload) => {
  const translator = getTranslator()

  const { sl, tl, text } = await getMTArgs(
    translator,
    rawText,
    profile.dicts.all.gemini,
    config,
    payload
  )

  const key = config.dictAuth.gemini.key
  const endpoint = config.dictAuth.gemini.endpoint
  const prompt = config.dictAuth.gemini.prompt
  const systemPrompt = config.dictAuth.gemini.systemPrompt
  const translatorConfig = key && endpoint ? {
    key,
    endpoint,
    prompt: prompt || defaultSystemPrompt,
    systemPrompt: systemPrompt || defaultSystemPrompt
  } : undefined

  try {
    const result = await translator.translate(text, sl, tl, translatorConfig)
    return machineResult(
      {
        result: {
          id: 'gemini',
          slInitial: profile.dicts.all.gemini.options.slInitial,
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
          id: 'gemini',
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
