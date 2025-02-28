import { configWebApp, cspellWords, tseslint } from 'eslint-config-cityssm'

export const config = tseslint.config(...configWebApp, {
  rules: {
    '@cspell/spellchecker': [
      'warn',
      {
        cspell: {
          words: [
            ...cspellWords,
            'wsib'
          ]
        }
      }
    ],
    '@typescript-eslint/no-unsafe-type-assertion': 'off'
  }
})

export default config