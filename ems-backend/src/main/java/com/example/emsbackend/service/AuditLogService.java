package com.example.emsbackend.service;

import com.example.emsbackend.dto.AuditLogDTO;
import java.util.List;

public interface AuditLogService {
    List<AuditLogDTO> getAuditLogs(String tableName, String actionType);
}