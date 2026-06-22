CREATE PROCEDURE [dbo].[sp_EnrollStudent]
    @StudentID INT, 
    @CourseID INT, 
    @FacultyID INT,
    @AcademicYear VARCHAR(10), 
    @Semester VARCHAR(10)
AS
BEGIN
    SET NOCOUNT ON;
BEGIN TRY
BEGIN TRANSACTION;

        IF EXISTS (SELECT 1 FROM Enrollment
                   WHERE StudentID = @StudentID
                     AND CourseID = @CourseID
                     AND AcademicYear = @AcademicYear)
BEGIN
            RAISERROR('Student already enrolled in this course for the year.', 16, 1);
ROLLBACK;
RETURN;
END

INSERT INTO Enrollment (StudentID, CourseID, FacultyID, AcademicYear, Semester, Status)
VALUES (@StudentID, @CourseID, @FacultyID, @AcademicYear, @Semester, 'Active');

COMMIT;
END TRY
BEGIN CATCH
IF @@TRANCOUNT > 0 ROLLBACK;
        THROW;
END CATCH
END;