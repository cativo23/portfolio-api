import { Injectable } from '@nestjs/common';
import { CARLOS_GROUNDING, GroundingProfile } from './profile-grounding';

@Injectable()
export class ProfileService {
  /**
   * Canonical, prose-oriented profile used to ground the AI chatbot.
   * This is the single source of truth for what the bot knows about Carlos.
   */
  getGroundingProfile(): GroundingProfile {
    return CARLOS_GROUNDING;
  }
}
