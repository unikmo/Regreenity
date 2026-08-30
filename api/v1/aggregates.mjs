import { z } from 'zod'
import { authenticateConnector } from '../_lib/connector-auth.mjs'
import { allowPost, readJson, sendJson } from '../_lib/http.mjs'

const metricKeys = [
  'eligible_guests','activated_guests','positive_action_guests','passenger_vibes','unique_vibe_recipients','top_five_qualifiers',
  'crew_recognitions','recognizing_guests','recognized_crew','event_feedback_responses','event_rating_1','event_rating_2',
  'event_rating_3','event_rating_4','event_rating_5','service_issues','issues_acknowledged','issues_resolved',
  'commerce_handoffs','commerce_confirmed','commerce_cancelled','commerce_refunded','attributed_net_value','social_shares',
]
const dimensions = ['overall','department','prepared_reason','prepared_response','product_category','event_type']
const forbiddenDimension = /(name|email|photo|image|face|biometric|passenger|crew_id|device|booking|cabin|message|free.?text|timestamp)/i

const metricSchema = z.object({
  metric: z.enum(metricKeys),
  dimension: z.enum(dimensions).default('overall'),
  dimensionValue: z.string().trim().min(1).max(100).default('all'),
  countValue: z.number().int().nonnegative().optional(),
  numericValue: z.number().nonnegative().max(999_999_999_999.99).optional(),
  currency: z.string().regex(/^[A-Z]{3}$/).optional(),
}).strict().superRefine((value, context) => {
  if ((value.countValue === undefined) === (value.numericValue === undefined)) context.addIssue({ code: 'custom', message: 'exactly_one_value_required' })
  if ((value.metric === 'attributed_net_value') !== (value.numericValue !== undefined)) context.addIssue({ code: 'custom', message: 'invalid_value_type' })
  if (value.currency && value.numericValue === undefined) context.addIssue({ code: 'custom', message: 'currency_requires_numeric_value' })
})

export const reportSchema = z.object({
  schemaVersion: z.literal(1),
  externalReportId: z.string().trim().min(8).max(120),
  sailingRef: z.string().trim().min(1).max(100).optional(),
  periodStart: z.string().date(),
  periodEnd: z.string().date(),
  generatedAt: z.string().datetime({ offset: true }),
  minimumGroupApplied: z.number().int().min(20).max(10000),
  privacyGatewayVersion: z.string().trim().min(1).max(40),
  metrics: z.array(metricSchema).min(1).max(300),
}).strict().superRefine((report, context) => {
  if (report.periodEnd < report.periodStart) context.addIssue({ code: 'custom', message: 'invalid_period' })
  const seen = new Set()
  report.metrics.forEach((metric, index) => {
    const key = `${metric.metric}:${metric.dimension}:${metric.dimensionValue}`
    if (seen.has(key)) context.addIssue({ code: 'custom', path: ['metrics', index], message: 'duplicate_metric' })
    seen.add(key)
    if (forbiddenDimension.test(metric.dimensionValue)) context.addIssue({ code: 'custom', path: ['metrics', index, 'dimensionValue'], message: 'forbidden_dimension' })
    if (metric.countValue !== undefined && metric.countValue !== 0 && metric.countValue < report.minimumGroupApplied) {
      context.addIssue({ code: 'custom', path: ['metrics', index, 'countValue'], message: 'cell_below_reporting_threshold' })
    }
  })
})

export default async function handler(request, response) {
  if (!allowPost(request, response)) return
  try {
    const auth = await authenticateConnector(request)
    if (!auth) return sendJson(response, 401, { error: 'invalid_connector_credentials' })
    const parsed = reportSchema.safeParse(await readJson(request, 128_000))
    if (!parsed.success) return sendJson(response, 422, { error: 'aggregate_contract_rejected', issues: parsed.error.issues.map(({ path, message }) => ({ path, message })) })
    const report = parsed.data

    let sailingId = null
    if (report.sailingRef) {
      const { data: sailing, error } = await auth.database.from('sailings').select('id').eq('tenant_id', auth.connector.tenant_id).eq('operator_sailing_ref', report.sailingRef).maybeSingle()
      if (error) throw error
      if (!sailing) return sendJson(response, 422, { error: 'unknown_sailing' })
      sailingId = sailing.id
    }

    const { data: existing } = await auth.database.from('aggregate_reports').select('id').eq('tenant_id', auth.connector.tenant_id).eq('external_report_id', report.externalReportId).maybeSingle()
    if (existing) return sendJson(response, 200, { accepted: true, idempotent: true, reportId: existing.id })

    const { data: created, error: reportError } = await auth.database.from('aggregate_reports').insert({
      tenant_id: auth.connector.tenant_id,
      sailing_id: sailingId,
      external_report_id: report.externalReportId,
      period_start: report.periodStart,
      period_end: report.periodEnd,
      generated_at: report.generatedAt,
      minimum_group_applied: report.minimumGroupApplied,
      privacy_gateway_version: report.privacyGatewayVersion,
      schema_version: report.schemaVersion,
    }).select('id').single()
    if (reportError) throw reportError

    const metricRows = report.metrics.map(metric => ({
      report_id: created.id,
      metric: metric.metric,
      dimension: metric.dimension,
      dimension_value: metric.dimensionValue,
      count_value: metric.countValue ?? null,
      numeric_value: metric.numericValue ?? null,
      currency: metric.currency ?? null,
    }))
    const { error: metricError } = await auth.database.from('aggregate_metrics').insert(metricRows)
    if (metricError) {
      await auth.database.from('aggregate_reports').delete().eq('id', created.id)
      throw metricError
    }
    await auth.database.from('connector_installations').update({ status: 'healthy', last_seen_at: new Date().toISOString() }).eq('id', auth.connector.id)
    return sendJson(response, 201, { accepted: true, reportId: created.id })
  } catch (error) {
    if (error instanceof SyntaxError) return sendJson(response, 400, { error: 'invalid_json' })
    if (error?.message === 'PAYLOAD_TOO_LARGE') return sendJson(response, 413, { error: 'payload_too_large' })
    console.error('aggregate-ingest-failed', error?.message || error)
    return sendJson(response, 503, { error: 'ingest_temporarily_unavailable' })
  }
}
