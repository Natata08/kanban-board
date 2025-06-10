import { ref } from 'vue'

const show = ref(false)
const title = ref('')
const message = ref('')
const onConfirmCallback = ref<(() => void) | null>(null)

export function useConfirmationDialog() {
  const open = (dialogTitle: string, dialogMessage: string, onConfirm: () => void) => {
    title.value = dialogTitle
    message.value = dialogMessage
    onConfirmCallback.value = onConfirm
    show.value = true
  }

  const close = () => {
    show.value = false
    title.value = ''
    message.value = ''
    onConfirmCallback.value = null
  }

  const confirm = () => {
    if (onConfirmCallback.value) {
      onConfirmCallback.value()
    }
    close()
  }

  return {
    show,
    title,
    message,
    open,
    close,
    confirm,
  }
}
