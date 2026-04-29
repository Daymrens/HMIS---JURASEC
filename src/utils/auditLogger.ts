interface AuditLog {
  id: number;
  user: string;
  action: 'create' | 'update' | 'delete' | 'view';
  entity: string;
  entity_id?: number;
  details: string;
  timestamp: string;
}

export const logAudit = (
  user: string,
  action: AuditLog['action'],
  entity: string,
  details: string,
  entity_id?: number
) => {
  try {
    const logs = JSON.parse(localStorage.getItem('audit_logs') || '[]');
    
    const newLog: AuditLog = {
      id: Date.now(),
      user,
      action,
      entity,
      entity_id,
      details,
      timestamp: new Date().toISOString(),
    };

    logs.unshift(newLog);
    
    // Keep only last 1000 logs
    const trimmedLogs = logs.slice(0, 1000);
    
    localStorage.setItem('audit_logs', JSON.stringify(trimmedLogs));
  } catch (error) {
    console.error('Failed to log audit:', error);
  }
};
