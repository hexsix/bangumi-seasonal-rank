export default defineNuxtPlugin(() => {
  const timestamp = useState('renderingTimestamp', () => Date.now())
}) 