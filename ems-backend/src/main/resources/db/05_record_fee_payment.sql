CREATE PROCEDURE [dbo].[sp_RecordFeePayment]
    @StudentID INT, 
    @Amount DECIMAL(10,2), 
    @Method VARCHAR(20)
AS
BEGIN
    SET NOCOUNT ON;

    IF @Amount <= 0
BEGIN
        RAISERROR('Payment amount must be greater than zero.', 16, 1);
        RETURN;
END

INSERT INTO FeePayment (StudentID, Amount, PaymentMethod, Status)
VALUES (@StudentID, @Amount, @Method, 'Paid');

-- Logs the payment automatically
INSERT INTO AuditLog (TableName, RecordID, ActionType, PerformedBy)
VALUES ('FeePayment', SCOPE_IDENTITY(), 'INSERT', SUSER_SNAME());
END;