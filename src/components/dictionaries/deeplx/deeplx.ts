import {
  Language,
  Translator,
  TranslateError,
  TranslateQueryResult
} from "@opentranslate/translator";
import qs from "qs";

const langMap: [Language, string][] = [
  ["auto", "auto"],
  ["zh-CN", "ZH"],
  ["en", "EN"],
  ["ja", "JA"],
  ["ko", "KO"],
  ["fr", "FR"],
  ["es", "ES"],
  ["th", "TH"],
  ["ar", "AR"],
  ["ru", "RU"],
  ["pt", "PT"],
  ["de", "DE"],
  ["it", "IT"],
  ["el", "EL"],
  ["nl", "NL"],
  ["pl", "PL"],
  ["bg", "BG"],
  ["et", "ET"],
  ["da", "DA"],
  ["fi", "FI"],
  ["cs", "CS"],
  ["ro", "RO"],
  ["sl", "SL"],
  ["sv", "SV"],
  ["hu", "HU"],
  ["zh-TW", "ZH"],
];

export interface DeepLXConfig {
  endpoint: string;
  token: string;
}

export class DeepLX extends Translator<DeepLXConfig> {
  readonly name = "deeplx";

  protected async query(
    text: string,
    from: Language,
    to: Language,
    config: DeepLXConfig
  ): Promise<TranslateQueryResult> {

    type DeepLXTranslateResult = {
      alternatives: string[];
      code: number;
      data: string;
      id: number;
      method: string;
      source_lang: string;
      target_lang: string;
    };

    const { endpoint, token } = config;

    const res = await this.request<DeepLXTranslateResult>(
      endpoint,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        data: {
          source_lang: DeepLX.langMap.get(from),
          target_lang: DeepLX.langMap.get(to),
          text: text,
        }
      }
    ).catch(() => {
      throw new TranslateError("NETWORK_ERROR");
    });

    const { data } = res;

    const transParagraphs = data.data;
    const detectedFrom = DeepLX.langMapReverse.get(data.source_lang) as Language;

    return {
      text,
      from: detectedFrom,
      to,
      origin: {
        paragraphs: [text],
        tts: await this.textToSpeech(text, detectedFrom)
      },
      trans: {
        paragraphs: [transParagraphs],
        tts: await this.textToSpeech(transParagraphs, to)
      }
    };
  }

  /** Translator lang to custom lang */
  private static readonly langMap = new Map(langMap);

  /** Custom lang to translator lang */
  private static readonly langMapReverse = new Map(
    langMap.map(([translatorLang, lang]) => [lang, translatorLang])
  );

  getSupportLanguages(): Language[] {
    return [...DeepLX.langMap.keys()];
  }

  async textToSpeech(text: string, lang: Language): Promise<string> {
    return `http://tts.baidu.com/text2audio?${qs.stringify({
      lan: DeepLX.langMap.get(lang !== "auto" ? lang : "zh-CN") || "zh",
      ie: "UTF-8",
      spd: 5,
      text
    })}`;
  }
}

export default DeepLX;
