// @ts-check
import antfu from '@antfu/eslint-config'

export default antfu({
  stylistic: {
    overrides: {
      'style/comma-dangle': ['error', 'never']
    }
  }
})
