export const basicProps = {
  disabled: {
    type: Boolean,
    default: false
  },
  baseCol: {
    type: Object,
    default: () => ({
      span: 6
    })
  },
  actionCol: {
    type: Object,
    default: () => ({
      span: 6
    })
  },
  showOpenBtn: {
    type: Boolean,
    default: true,
  },
  open: {
    type: Boolean,
    default: false
  }
}
