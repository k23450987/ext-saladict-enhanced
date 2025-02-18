import { auth as baidu } from '@/components/dictionaries/baidu/auth'
import { auth as caiyun } from '@/components/dictionaries/caiyun/auth'
import { auth as sogou } from '@/components/dictionaries/sogou/auth'
import { auth as tencent } from '@/components/dictionaries/tencent/auth'
import { auth as youdaotrans } from '@/components/dictionaries/youdaotrans/auth'
import { auth as deeplx } from '@/components/dictionaries/deeplx/auth'

export const defaultDictAuths = {
  baidu,
  caiyun,
  sogou,
  tencent,
  youdaotrans,
  deeplx
}

export type DictAuths = typeof defaultDictAuths

export const getDefaultDictAuths = (): DictAuths =>
  JSON.parse(JSON.stringify(defaultDictAuths))
