import pyodbc
import pandas as pd
import json
from sklearn.cluster import KMeans
from sklearn.linear_model import LinearRegression

# 1. Connect & extract
conn = pyodbc.connect("DRIVER={ODBC Driver 17 for SQL Server};"
                      "SERVER=localhost;DATABASE=EducationManagementDB;"
                      "Trusted_Connection=yes;")

df = pd.read_sql("SELECT * FROM vw_StudentAcademicDashboard", conn)

# 2. K-Means: cluster students into 3 risk bands (low/medium/high)
X = df[['AverageGPA', 'FailedCount']].fillna(0)
df['RiskCluster'] = KMeans(n_clusters=3, random_state=42, n_init=10).fit_predict(X)

# 3. Linear Regression: forecast next-year enrollment counts
yearly = pd.read_sql("""
                     SELECT EnrollmentYear AS Year, COUNT(*) AS Total
                     FROM Student GROUP BY EnrollmentYear ORDER BY EnrollmentYear""", conn)

model = LinearRegression().fit(yearly[['Year']], yearly['Total'])
forecast = model.predict([[2027]])[0]

# --- NEW: FORMAT OUTPUT AS JSON FOR SPRING BOOT ---
risk_counts = df.groupby('RiskCluster').size().to_dict()

# Convert int64 to standard Python ints for JSON serialization
risk_counts = {int(k): int(v) for k, v in risk_counts.items()}

output = {
    "forecast2027": int(forecast),
    "riskClusters": risk_counts
}

# This single print statement is what Spring Boot will capture!
print(json.dumps(output))