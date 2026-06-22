package com.example.emsbackend.service.impl;

import com.example.emsbackend.dto.AuditLogDTO;
import com.example.emsbackend.service.AuditLogService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AuditLogServiceImpl implements AuditLogService {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Override
    public List<AuditLogDTO> getAuditLogs(String tableName, String actionType) {
        String sql = "EXEC sp_GetAuditLogs ?, ?";

        return jdbcTemplate.query(sql, (rs, rowNum) -> {
            AuditLogDTO dto = new AuditLogDTO();
            dto.setId(rs.getInt("LogID"));
            dto.setTimestamp(rs.getString("Timestamp"));
            dto.setUser(rs.getString("User"));
            dto.setAction(rs.getString("Action"));
            dto.setTable(rs.getString("Table"));
            dto.setRecordId(rs.getString("RecordID"));
            dto.setDesc(rs.getString("Description"));
            return dto;
        }, tableName, actionType);
    }
}