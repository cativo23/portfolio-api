import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import type { InfraConfig } from '@config/configuration.types';

/** Live infrastructure counts surfaced on the public SIGNAL panel. */
export interface InfraStats {
  /** Running containers, or null when the docker proxy is unreachable. */
  containers: number | null;
  /** Distinct docker-compose projects (stacks), or null on failure. */
  stacks: number | null;
}

/** Shape of a single entry from the docker `/containers/json` list endpoint. */
interface DockerContainerSummary {
  Labels?: Record<string, string>;
}

const COMPOSE_PROJECT_LABEL = 'com.docker.compose.project';
const REQUEST_TIMEOUT_MS = 5000;

/**
 * Derives live container/stack counts from the read-only docker-socket-proxy.
 *
 * Only the `/containers/json` LIST endpoint is called — never `/containers/{id}/json`
 * (inspect) — so no container env/mount detail is ever read (see ADR-0004).
 */
@Injectable()
export class InfraService {
  private readonly logger = new Logger(InfraService.name);
  private readonly dockerProxyUrl: string;

  constructor(
    private readonly httpService: HttpService,
    configService: ConfigService,
  ) {
    this.dockerProxyUrl =
      configService.getOrThrow<InfraConfig>('infra').dockerProxyUrl;
  }

  async getStats(): Promise<InfraStats> {
    try {
      const { data } = await firstValueFrom(
        this.httpService.get<DockerContainerSummary[]>(
          `${this.dockerProxyUrl}/containers/json`,
          { timeout: REQUEST_TIMEOUT_MS },
        ),
      );

      const containers = data.length;
      const stacks = new Set(
        data
          .map((c) => c.Labels?.[COMPOSE_PROJECT_LABEL])
          .filter((project): project is string => Boolean(project)),
      ).size;

      return { containers, stacks };
    } catch (error) {
      // Decorative data: never let a proxy outage break the caller — degrade to nulls.
      const message = error instanceof Error ? error.message : String(error);
      this.logger.warn(`Failed to fetch docker stats: ${message}`);
      return { containers: null, stacks: null };
    }
  }
}
