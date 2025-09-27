import { useCallback } from 'react';
import { useSecurityStore, SecurityLog } from '@/store/security-store';
import { useAuthStore } from '@/store/auth-store';

type LogAction = 
  | 'login_attempt' 
  | 'login_success' 
  | 'login_failed' 
  | 'logout'
  | 'document_create' 
  | 'document_save' 
  | 'document_load' 
  | 'document_delete'
  | 'file_upload' 
  | 'file_download'
  | 'search_performed'
  | 'format_applied'
  | 'spell_check'
  | 'system_error'
  | 'unauthorized_access'
  | 'data_integrity_check';

export function useSecurityLogger() {
  const { addLog } = useSecurityStore();
  const { user } = useAuthStore();

  const logAction = useCallback((
    action: LogAction,
    details: string,
    category: SecurityLog['category'] = 'system',
    severity: SecurityLog['severity'] = 'info'
  ) => {
    const userAgent = navigator.userAgent;
    const userId = user?.uid || 'anonymous';

    addLog({
      userId,
      action,
      details,
      category,
      severity,
      userAgent,
    });

    // В production логи также можно отправлять на сервер
    if (severity === 'error' || severity === 'critical') {
      console.error(`[SECURITY] ${action}: ${details}`, {
        userId,
        category,
        severity,
        timestamp: new Date().toISOString(),
      });
    }
  }, [addLog, user]);

  // Специализированные методы логирования
  const logAuth = useCallback((action: LogAction, details: string, success: boolean = true) => {
    logAction(action, details, 'auth', success ? 'info' : 'warning');
  }, [logAction]);

  const logDocument = useCallback((action: LogAction, details: string) => {
    logAction(action, details, 'document', 'info');
  }, [logAction]);

  const logSecurity = useCallback((action: LogAction, details: string, severity: SecurityLog['severity'] = 'warning') => {
    logAction(action, details, 'security', severity);
  }, [logAction]);

  const logError = useCallback((action: LogAction, details: string, error?: Error) => {
    const errorDetails = error ? `${details} - ${error.message}` : details;
    logAction(action, errorDetails, 'system', 'error');
  }, [logAction]);

  return {
    logAction,
    logAuth,
    logDocument,
    logSecurity,
    logError,
  };
}