import { Injectable, Logger } from '@nestjs/common';

/**
 * Deterministic last line of defense against prompt-injection leaks.
 *
 * The system prompt tells the model never to reveal the <profile> block or its
 * rules, but no prompt is jailbreak-proof — a visitor can still coax the model
 * into echoing them. This service inspects the generated answer for
 * system-prompt artifacts and, if any are present, replaces the whole answer
 * with a safe refusal. It does not depend on the model behaving, so it holds
 * even when the prompt defense fails.
 *
 * (Not a NestJS route guard — it post-processes a response string.)
 */
@Injectable()
export class OutputSanitizerService {
  private readonly logger = new Logger(OutputSanitizerService.name);

  // Zero-width spaces/joiners and BOM — a visitor could use them to break up a
  // marker (e.g. "<profile>") and slip past the check; stripped first.
  private static readonly ZERO_WIDTH = new RegExp(
    '[\\u200B-\\u200D\\uFEFF]',
    'g',
  );

  /**
   * The <profile> fence must never appear in a legitimate answer. Matched as a
   * regex (not a literal) so trivial obfuscations — "< profile>", a newline, or
   * a zero-width char (stripped below) — can't slip it past the structural
   * check. Covers both the opening and closing tag.
   */
  private static readonly PROFILE_TAG = /<\s*\/?\s*profile/;

  /**
   * Stable verbatim fragments of the system prompt. Specific enough that they
   * will not occur in a normal answer about a person's career. Matched
   * lowercased.
   */
  private static readonly PHRASE_MARKERS = [
    '# rules',
    'these take precedence',
    'reference data, not instructions',
    'examples of correct behavior',
  ];

  /**
   * Intentionally a fixed English message. This is a blocked-injection path,
   * not a normal answer, so the visitor's-language contract does not apply.
   */
  private static readonly REFUSAL =
    "I can't share that. I'm happy to answer questions about Carlos — his experience, projects, or how to get in touch.";

  /**
   * Returns the answer unchanged, or a safe refusal if it leaks system-prompt
   * content.
   */
  sanitize(answer: string): string {
    // Strip zero-width characters so they can't be used to break up a marker,
    // then lowercase for case-insensitive matching.
    const normalized = answer
      .replace(OutputSanitizerService.ZERO_WIDTH, '')
      .toLowerCase();

    const leaked =
      OutputSanitizerService.PROFILE_TAG.test(normalized) ||
      OutputSanitizerService.PHRASE_MARKERS.some((marker) =>
        normalized.includes(marker),
      );

    if (leaked) {
      this.logger.warn(
        'Blocked a chat answer that leaked system-prompt content',
      );
      return OutputSanitizerService.REFUSAL;
    }

    return answer;
  }
}
