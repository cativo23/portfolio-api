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

  it('rejects a question shorter than 3 chars', async () => {
    expect((await errorsFor({ question: 'a' })).length).toBeGreaterThan(0);
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
});
