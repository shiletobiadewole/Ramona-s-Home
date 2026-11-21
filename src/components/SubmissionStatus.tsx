import { CheckCircle2, AlertTriangle, RotateCcw } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { ErrorResponse, SuccessResponse } from '../types/viewing';

interface SubmissionStatusProps {
  success?: SuccessResponse | null;
  error?: ErrorResponse | null;
  onResetSuccess?: () => void;
}

export function SubmissionStatus({
  success,
  error,
  onResetSuccess,
}: SubmissionStatusProps) {
  if (success) {
    return (
      <section
        aria-live="polite"
        aria-label="Viewing request confirmed"
        className="border border-[#57482D] bg-white p-6 sm:p-10 space-y-6"
      >
        <div className="flex items-start gap-4">
          <CheckCircle2
            className="w-6 h-6 text-[#57482D] shrink-0 mt-0.5"
            aria-hidden="true"
          />
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-[#57482D]">
              Viewing Request Confirmed
            </p>
            <h2 className="text-2xl font-medium tracking-tight text-[#151513]">
              {success.message}
            </h2>
          </div>
        </div>

        {(success.reference || success.confirmation) && (
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-6 border-t border-[#B6AF9D]/50">
            {success.reference && (
              <div>
                <dt className="text-xs font-medium uppercase tracking-wider text-[#534F46]">
                  Reference
                </dt>
                <dd className="mt-1.5 text-base font-semibold text-[#151513] tabular-nums">
                  {success.reference}
                </dd>
              </div>
            )}
            {success.confirmation && (
              <div>
                <dt className="text-xs font-medium uppercase tracking-wider text-[#534F46]">
                  Confirmation Details
                </dt>
                <dd className="mt-1.5 text-sm leading-relaxed text-[#151513]">
                  {success.confirmation}
                </dd>
              </div>
            )}
          </dl>
        )}

        <div className="pt-4 flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-4 border-t border-[#B6AF9D]/40">
          <Link
            to="/properties"
            className="inline-flex items-center justify-center min-h-[46px] px-6 py-3 text-sm font-medium text-[#FDFAF0] bg-[#57482D] hover:bg-[#423620] transition-colors rounded-sm"
          >
            Explore Properties
          </Link>
          {onResetSuccess && (
            <button
              type="button"
              onClick={onResetSuccess}
              className="inline-flex items-center justify-center gap-2 min-h-[46px] px-5 py-3 text-sm font-medium text-[#151513] border border-[#B6AF9D] hover:border-[#151513] transition-colors rounded-sm"
            >
              <RotateCcw className="w-4 h-4" aria-hidden="true" />
              Submit Another Request
            </button>
          )}
        </div>
      </section>
    );
  }

  if (error) {
    const errorTitleMap: Record<ErrorResponse['code'], string> = {
      CONFIG_MISSING: 'Webhook Configuration Required',
      NETWORK_ERROR: 'Connection Interrupted',
      TIMEOUT: 'Request Timed Out',
      HTTP_ERROR: 'Service Error',
      INVALID_JSON: 'Invalid Service Response',
      SCHEMA_MISMATCH: 'Unexpected Response Format',
      WORKFLOW_ERROR: 'Unable to Complete Request',
    };

    return (
      <section
        role="alert"
        aria-live="assertive"
        className="border border-[#9B1C1C] bg-[#FEF2F2] p-5 sm:p-7 space-y-2"
      >
        <div className="flex items-start gap-3">
          <AlertTriangle
            className="w-5 h-5 text-[#9B1C1C] shrink-0 mt-0.5"
            aria-hidden="true"
          />
          <div className="space-y-1.5 min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wider text-[#9B1C1C]">
              {errorTitleMap[error.code]}
            </p>
            <p className="text-sm sm:text-base text-[#151513] leading-relaxed">
              {error.message}
            </p>
            {error.details && (
              <p className="text-xs text-[#534F46] pt-1 break-words">
                Technical detail: {error.details}
              </p>
            )}
          </div>
        </div>
      </section>
    );
  }

  return null;
}
