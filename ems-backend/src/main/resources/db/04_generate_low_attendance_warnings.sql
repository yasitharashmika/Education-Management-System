CREATE PROCEDURE [dbo].[sp_GenerateLowAttendanceWarnings]
AS
BEGIN
    DECLARE @EID INT, @Pct DECIMAL(5,2);
    
    DECLARE att_cursor CURSOR FOR
SELECT EnrollmentID FROM Enrollment WHERE Status = 'Active';

OPEN att_cursor;
FETCH NEXT FROM att_cursor INTO @EID;

WHILE @@FETCH_STATUS = 0
BEGIN
        -- Calls your custom function to calculate attendance
        SET @Pct = dbo.fn_GetAttendancePercentage(@EID);
        
        IF @Pct < 75
BEGIN
INSERT INTO AuditLog (TableName, RecordID, ActionType, PerformedBy)
VALUES ('Enrollment', @EID,
        'LOW_ATTENDANCE_WARNING (' + CAST(@Pct AS VARCHAR(10)) + '%)',
        SUSER_SNAME());
END

FETCH NEXT FROM att_cursor INTO @EID;
END

CLOSE att_cursor;
DEALLOCATE att_cursor;
END;