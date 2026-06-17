-- Creates the Dashboard Metrics Procedure
CREATE PROCEDURE sp_GetDashboardMetrics
    AS
BEGIN
    SET NOCOUNT ON;

SELECT
    (SELECT COUNT(*) FROM Student) AS TotalStudents,
    (SELECT COUNT(*) FROM Course) AS TotalCourses,
    (SELECT ISNULL(SUM(Amount), 0) FROM FeePayment) AS TotalRevenue;
END;