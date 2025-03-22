import type * as wikibase from 'wikibase-sdk';
import {
  AIFunctionsProvider,
  assert,
  getEnv,
  throttleKy,
} from '@microfox/core';
import defaultKy, { type KyInstance } from 'ky';
import pThrottle from 'p-throttle';
import wdk from 'wikibase-sdk/wikidata.org';
import { z } from 'zod';

export namespace wikidata {
  // Allow up to 200 requests per second by default.
  export const throttle = pThrottle({
    limit: 200,
    interval: 1000,
  });

  export const descriptionsSchema = z
    .record(z.string())
    .describe('Map of language codes to descriptions');
  export type Descriptions = z.infer<typeof descriptionsSchema>;

  export const sitelinksSchema = z
    .record(z.string())
    .describe('Map of site codes to page titles');
  export type Sitelinks = z.infer<typeof sitelinksSchema>;

  export const claimSchema = z.object({
    value: z.string().describe('The value of the claim'),
    qualifiers: z
      .record(z.union([z.array(z.string()), z.array(z.number())]))
      .describe('Qualifiers for the claim'),
    references: z
      .array(z.record(z.array(z.string())))
      .describe('References supporting the claim'),
  });
  export type Claim = z.infer<typeof claimSchema>;

  export const claimsSchema = z
    .record(z.array(claimSchema))
    .describe('Map of property IDs to claim values');
  export type Claims = z.infer<typeof claimsSchema>;

  export const simplifiedEntitySchema = z.object({
    id: z.string().describe('Entity identifier (e.g., Q42 for Douglas Adams)'),
    type: z.string().describe('Entity type (e.g., "item" or "property")'),
    claims: claimsSchema.describe('Property claims for this entity'),
    modified: z.string().describe('Last modification timestamp'),
    labels: descriptionsSchema
      .optional()
      .describe('Map of language codes to entity labels'),
    descriptions: descriptionsSchema
      .optional()
      .describe('Map of language codes to entity descriptions'),
    aliases: z
      .any()
      .optional()
      .describe('Entity aliases in different languages'),
    sitelinks: sitelinksSchema
      .optional()
      .describe(
        'Links to pages about this entity on different Wikimedia sites',
      ),
  });
  export type SimplifiedEntity = z.infer<typeof simplifiedEntitySchema>;

  export const simplifiedEntityMapSchema = z
    .record(simplifiedEntitySchema)
    .describe('Map of entity IDs to simplified entities');
  export type SimplifiedEntityMap = z.infer<typeof simplifiedEntityMapSchema>;
}

/**
 * Basic Wikidata client.
 *
 * @see https://github.com/maxlath/wikibase-sdk
 *
 * TODO: support any wikibase instance
 */
export class WikidataClient extends AIFunctionsProvider {
  protected readonly ky: KyInstance;
  protected readonly apiUserAgent: string;

  constructor({
    apiUserAgent = getEnv('WIKIDATA_API_USER_AGENT') ??
      'Microfox (https://github.com/microfox-ai/microfox)',
    throttle = true,
    ky = defaultKy,
  }: {
    apiBaseUrl?: string;
    apiUserAgent?: string;
    throttle?: boolean;
    ky?: KyInstance;
  } = {}) {
    assert(apiUserAgent, 'WikidataClient missing required "apiUserAgent"');
    super();

    this.apiUserAgent = apiUserAgent;

    const throttledKy = throttle ? throttleKy(ky, wikidata.throttle) : ky;

    this.ky = throttledKy.extend({
      headers: {
        'user-agent': apiUserAgent,
      },
    });
  }

  async getEntityById(
    idOrOpts: string | { id: string; languages?: string[] },
  ): Promise<wikidata.SimplifiedEntity> {
    const { id, languages = ['en'] } =
      typeof idOrOpts === 'string' ? { id: idOrOpts } : idOrOpts;

    const url = wdk.getEntities({
      ids: id as wikibase.EntityId,
      languages,
    });

    const res = await this.ky.get(url).json<any>();
    const entities = wdk.simplify.entities(res.entities, {
      // TODO: Make this configurable and double-check defaults.
      keepQualifiers: true,
      keepReferences: true,
    });

    const entity = entities[id];
    return entity as wikidata.SimplifiedEntity;
  }

  async getEntitiesByIds(
    idsOrOpts: string[] | { ids: string; languages?: string[] },
  ): Promise<wikidata.SimplifiedEntityMap> {
    const { ids, languages = ['en'] } = Array.isArray(idsOrOpts)
      ? { ids: idsOrOpts }
      : idsOrOpts;

    // TODO: Separate between wdk.getEntities and wdk.getManyEntities depending
    // on how many `ids` there are.
    const url = wdk.getEntities({
      ids: ids as wikibase.EntityId[],
      languages,
    });

    const res = await this.ky.get(url).json<any>();
    const entities = wdk.simplify.entities(res.entities, {
      keepQualifiers: true,
      keepReferences: true,
    });

    return entities as wikidata.SimplifiedEntityMap;
  }
}
