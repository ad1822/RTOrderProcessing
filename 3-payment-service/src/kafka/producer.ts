import { Kafka, Producer } from 'kafkajs';

const kafka: Kafka = new Kafka({
  clientId: 'payment-service-payment-created-producer',
  brokers: ['kafka:9092'],
});

export const producer: Producer = kafka.producer();

export async function sendMessage(
  topic: string,
  messages: { value: string; key: string }[],
): Promise<void> {
  await producer.send({
    topic,
    messages: messages.map((msg) => ({
      value: msg.value,
      key: msg.key,
    })),
  });
}
