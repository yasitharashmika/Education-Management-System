package com.example.emsbackend.dto;

import lombok.Data;

@Data
public class AuditLogDTO {
    private Integer id;
    private String timestamp;
    private String user;
    private String action;
    private String table;
    private String recordId;
    private String desc;
}