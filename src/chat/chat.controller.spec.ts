import 'reflect-metadata';
import { Test, TestingModule } from '@nestjs/testing';
import { vi } from 'vitest';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { AskChatDto } from './dto';

describe('ChatController', () => {
  let controller: ChatController;
  const mockChatService = { ask: vi.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ChatController],
      providers: [{ provide: ChatService, useValue: mockChatService }],
    }).compile();

    controller = module.get<ChatController>(ChatController);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('delegates the question to ChatService and maps the result to ChatResponseDto', async () => {
    mockChatService.ask.mockResolvedValue({ answer: 'Hello!', cached: true });
    const dto: AskChatDto = { question: 'Who are you?' };

    const result = await controller.ask(dto);

    expect(mockChatService.ask).toHaveBeenCalledWith('Who are you?', []);
    expect(result).toEqual({ answer: 'Hello!', cached: true });
  });

  it('passes history from the DTO to ChatService when present', async () => {
    mockChatService.ask.mockResolvedValue({
      answer: 'Continuing...',
      cached: false,
    });
    const dto: AskChatDto = {
      question: 'What is next?',
      history: [
        { role: 'user', content: 'What is your stack?' },
        { role: 'assistant', content: 'NestJS and TypeScript' },
      ],
    };

    const result = await controller.ask(dto);

    expect(mockChatService.ask).toHaveBeenCalledWith(
      'What is next?',
      dto.history,
    );
    expect(result).toEqual({ answer: 'Continuing...', cached: false });
  });

  it('marks the route as public', () => {
    expect(Reflect.getMetadata('isPublic', controller.ask)).toBe(true);
  });
});
