export default defineNuxtPlugin(() => {
  const timestampState = useState('renderingTimestamp', () => Date.now())
  if (process.server) {
    timestampState.value = Date.now()
  }
})
