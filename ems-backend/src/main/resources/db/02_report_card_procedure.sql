CREATE PROCEDURE sp_GetStudentReportCard
    @StudentID INT
AS
BEGIN
    SET NOCOUNT ON;

    -- Joins Enrollments, Courses, and Grades into one clean view
SELECT
    c.CourseCode,
    c.CourseName,
    c.Credits,
    ISNULL(g.MidtermMarks, 0) AS MidtermMarks,
    ISNULL(g.FinalMarks, 0) AS FinalMarks,
    ISNULL(g.LetterGrade, 'Pending') AS LetterGrade,
    ISNULL(g.GPAPoints, 0.0) AS GPAPoints
FROM Enrollment e
         INNER JOIN Course c ON e.CourseID = c.CourseID
         LEFT JOIN Grade g ON e.EnrollmentID = g.EnrollmentID
WHERE e.StudentID = @StudentID;
END;