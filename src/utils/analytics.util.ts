import ReactGA from 'react-ga4';

type AnalyticsEvent =
  // Funnel
  | 'bill_step_items_completed'
  | 'bill_step_mapping_completed'
  | 'bill_result_viewed'
  | 'bill_reset'
  | 'navigate_back'
  // Bill editing
  | 'item_added'
  | 'item_edited'
  | 'item_deleted'
  | 'items_bulk_deleted'
  | 'payer_added'
  | 'payer_edited'
  | 'payer_deleted'
  | 'payers_bulk_deleted'
  | 'bill_title_edited'
  | 'home_tab_switched'
  // Mapping
  | 'mapping_select_all'
  // Currency
  | 'currency_settings_opened'
  | 'main_currency_changed'
  | 'exchange_rate_added'
  | 'exchange_rate_removed'
  | 'display_currency_changed'
  // Payment & sharing
  | 'payment_method_selected'
  | 'payment_method_changed'
  | 'promptpay_qr_generated'
  | 'promptpay_qr_changed'
  | 'share'
  | 'bill_image_downloaded'
  | 'share_failed'
  // App
  | 'language_changed'
  | 'language_detected'
  | 'update_prompt_shown'
  | 'update_accepted'
  | 'app_installed_pwa'
  | 'app_launched'
  // Errors
  | 'app_error'
  | 'form_validation_failed';

type AnalyticsParams = Record<string, string | number | boolean>;

const PAGE_TITLES: Record<string, string> = {
  '/': 'Home',
  '/mapping': 'Mapping',
  '/result': 'Result',
  '/tos': 'Terms of Service',
  '/privacy': 'Privacy',
};

let isInitialized = false;

// Lazily initialize so events fired before App mounts are not lost.
// Never pass personal data (bill title, item/payer names, PromptPay ID) here.
const ensureInitialized = (): boolean => {
  if (isInitialized) return true;
  const gaMeasurementId = process.env.VITE_APP_GA_MEASUREMENT_ID;
  if (!gaMeasurementId) return false;
  ReactGA.initialize(gaMeasurementId, {
    // Only set debug_mode in dev: GA treats any value, even false, as debug.
    // Debug events are excluded by the GA4 "Developer traffic" data filter.
    gtagOptions: import.meta.env.DEV ? { debug_mode: true } : undefined,
  });
  isInitialized = true;
  return true;
};

export const trackEvent = (name: AnalyticsEvent, params?: AnalyticsParams) => {
  if (!ensureInitialized()) return;
  ReactGA.event(name, params);
};

export const trackPageView = (path: string) => {
  if (!ensureInitialized()) return;
  ReactGA.send({
    hitType: 'page_view',
    page: path,
    title: PAGE_TITLES[path] ?? path,
  });
};

// GA4 truncates event parameter values longer than 100 characters.
const MAX_PARAM_LENGTH = 100;

export const trackError = (source: string, error: unknown, fatal = false) => {
  const message = error instanceof Error ? error.message : String(error);
  trackEvent('app_error', {
    error_source: source,
    error_message: message.slice(0, MAX_PARAM_LENGTH),
    fatal,
  });
};

export const getTotalBucket = (total: number): string => {
  if (total < 500) return '<500';
  if (total < 2000) return '500-2k';
  if (total < 10000) return '2k-10k';
  return '>10k';
};
