CREATE PROCEDURE [dbo].[sp_RefreshAllGPAs]
AS
BEGIN
    DECLARE @SID INT;
    
    DECLARE gpa_cursor CURSOR FOR
SELECT StudentID FROM Student;

OPEN gpa_cursor;
FETCH NEXT FROM gpa_cursor INTO @SID;

WHILE @@FETCH_STATUS = 0
BEGIN
        -- Updates the CurrentGPA column using your custom function
UPDATE Student
SET CurrentGPA = dbo.fn_GetStudentGPA(@SID)
WHERE StudentID = @SID;

FETCH NEXT FROM gpa_cursor INTO @SID;
END

CLOSE gpa_cursor;
DEALLOCATE gpa_cursor;
END;