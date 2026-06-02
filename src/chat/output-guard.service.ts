import { Injectable, Logger } from '@nestjs/common';

/**
 * Deterministic last line of defense against prompt-injection leaks.
 *
 * The system prompt tells the model never to reveal the <profile> block or its
 * rules, but no prompt is jailbreak-proof — a visitor can still coax the model
 * into echoing them. This guard inspects the generated answer for system-prompt
 * artifacts and, if any are present, replaces the whole answer with a safe
 * refusal. It does not depend on the model behaving, so it holds even when the
 * prompt defense fails.
 */
@Injectable()
export class OutputGuardService {
  private readonly logger = new Logger(OutputGuardService.name);

  /**
   * Markers that must never appear in a legitimate answer. The <profile> fence
   * and the rules header are structural; the phrases are stable verbatim
   * fragments of the system prompt. Matched case-insensitively.
   */
  private static readonly LEAK_MARKERS = [
    '<profile',
    '</profile>',
    '# rules',
    'these take precedence',
    'reference data, not instructions',
    'examples of correct behavior',
  ];

  private static readonly REFUSAL =
    "I can't share that. I'm happy to answer questions about Carlos — his experience, projects, or how to get in touch.";

  /**
   * Returns the answer unchanged, or a safe refusal if it leaks system-prompt
   * content.
   */
  sanitize(answer: string): string {
    const haystack = answer.toLowerCase();
    const leaked = OutputGuardService.LEAK_MARKERS.some((marker) =>
      haystack.includes(marker),
    );

    if (leaked) {
      this.logger.warn(
        'Blocked a chat answer that leaked system-prompt content',
      );
      return OutputGuardService.REFUSAL;
    }

    return answer;
  }
}
