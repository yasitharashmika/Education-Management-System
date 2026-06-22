package com.example.emsbackend.controller;

import com.example.emsbackend.dto.AuditLogDTO;
import com.example.emsbackend.service.AuditLogService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/audit-logs")
@CrossOrigin(origins = "*")
public class AuditLogController {

    @Autowired
    private AuditLogService auditLogService;

    @GetMapping
    public ResponseEntity<List<AuditLogDTO>> getAuditLogs(
            @RequestParam(required = false) String table,
            @RequestParam(required = false) String action) {

        // If the frontend sends the default "All" strings, convert them to null for the SQL query
        if ("All Tables".equals(table)) table = null;
        if ("All Actions".equals(action)) action = null;

        return ResponseEntity.ok(auditLogService.getAuditLogs(table, action));
    }
}