import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ProfileModule } from '@profile/profile.module';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { SystemPromptService } from './system-prompt.service';
import { OutputSanitizerService } from './output-sanitizer.service';
import { GroqChatProvider } from './providers/groq.provider';
import { CHAT_PROVIDER } from './providers/chat-provider.interface';

@Module({
  imports: [
    // Bounded timeout so a slow/hung Groq call fails fast as a ChatProviderError
    // rather than holding the request open.
    HttpModule.register({ timeout: 15000 }),
    ProfileModule,
  ],
  controllers: [ChatController],
  providers: [
    ChatService,
    SystemPromptService,
    OutputSanitizerService,
    { provide: CHAT_PROVIDER, useClass: GroqChatProvider },
  ],
})
export class ChatModule {}
