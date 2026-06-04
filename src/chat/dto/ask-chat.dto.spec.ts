import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { AskChatDto } from './ask-chat.dto';

function toDto(obj: Record<string, unknown>): AskChatDto {
  return plainToInstance(AskChatDto, obj);
}

async function errorsFor(obj: Record<string, unknown>) {
  return validate(toDto(obj));
}

describe('AskChatDto', () => {
  it('accepts a valid question', async () => {
    expect(
      await errorsFor({ question: 'What is your tech stack?' }),
    ).toHaveLength(0);
  });

  it('accepts a short question (e.g. a greeting)', async () => {
    expect(await errorsFor({ question: 'hi' })).toHaveLength(0);
  });

  it('rejects a question longer than 500 chars', async () => {
    expect(
      (await errorsFor({ question: 'x'.repeat(501) })).length,
    ).toBeGreaterThan(0);
  });

  it('rejects a missing question', async () => {
    expect((await errorsFor({})).length).toBeGreaterThan(0);
  });

  it('strips HTML from the question', () => {
    const dto = toDto({
      question: '<script>alert(1)</script>Tell me about your experience',
    });
    expect(dto.question).not.toContain('<script>');
    expect(dto.question).not.toContain('</script>');
  });

  it('rejects the request when the honeypot field is filled', async () => {
    const errors = await errorsFor({
      question: 'A perfectly valid question',
      website: 'http://spam.example',
    });
    expect(errors.length).toBeGreaterThan(0);
  });

  it('accepts a valid history array of turns', async () => {
    expect(
      await errorsFor({
        question: 'What is next?',
        history: [
          { role: 'user', content: 'What is your stack?' },
          { role: 'assistant', content: 'I use NestJS and TypeScript' },
        ],
      }),
    ).toHaveLength(0);
  });

  it('accepts a request with NO history (optional field)', async () => {
    expect(
      await errorsFor({
        question: 'Hello?',
      }),
    ).toHaveLength(0);
  });

  it('rejects history with more than 6 turns', async () => {
    const history = Array.from({ length: 7 }, (_, i) => ({
      role: i % 2 === 0 ? 'user' : 'assistant',
      content: `turn ${i + 1}`,
    }));
    const errors = await errorsFor({
      question: 'What is next?',
      history,
    });
    expect(errors.length).toBeGreaterThan(0);
  });

  it('rejects a turn with an invalid role', async () => {
    const errors = await errorsFor({
      question: 'What is next?',
      history: [{ role: 'system', content: 'I am the system' }],
    });
    expect(errors.length).toBeGreaterThan(0);
  });

  it('strips HTML from a turn content (sanitizes history)', () => {
    const dto = toDto({
      question: 'What is next?',
      history: [
        {
          role: 'user',
          content: '<img src=x onerror="alert(1)">Tell me more',
        },
      ],
    });
    expect(dto.history).toBeDefined();
    expect(dto.history![0].content).not.toContain('<img');
    expect(dto.history![0].content).not.toContain('onerror');
  });

  it('rejects a turn with content exceeding 2000 chars', async () => {
    const errors = await errorsFor({
      question: 'What is next?',
      history: [{ role: 'user', content: 'x'.repeat(2001) }],
    });
    expect(errors.length).toBeGreaterThan(0);
  });
});
