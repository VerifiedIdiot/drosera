// Keep native TestsStream events. Do not parse display reporters.
export default async function* report(events) {
  for await (const event of events) {
    yield JSON.stringify(event, (key, value) => value instanceof Error
      ? { ...value, message: value.message, stack: value.stack }
      : value) + '\n';
  }
}
