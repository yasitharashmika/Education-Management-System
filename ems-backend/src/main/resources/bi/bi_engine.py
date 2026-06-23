import sys
import json
import warnings
import re

warnings.filterwarnings("ignore")

def term_to_numeric(term_label):
    """Converts a term like '2024 Semester 1' to a float like 2024.0, and Sem 2 to 2024.5 for math"""
    nums = [int(s) for s in re.findall(r'\d+', str(term_label))]
    if len(nums) >= 2:
        year = nums[0]
        sem = nums[1]
        return year + (0.5 if sem == 2 else 0.0)
    elif len(nums) == 1:
        return float(nums[0])
    return 0.0

def run_analytics():
    try:
        import pandas as pd
        from sklearn.cluster import KMeans
        from sklearn.linear_model import LinearRegression

        input_data = sys.stdin.read()
        if not input_data:
            print(json.dumps({"error": "No data received"}))
            return

        data = json.loads(input_data)

        # 🌟 VIVA PROOF: Loading the data that Java extracted from the SQL Views!
        df_students = pd.DataFrame(data.get('students', []))
        df_courses = pd.DataFrame(data.get('courses', []))
        df_history = pd.DataFrame(data.get('history', []))

        # --- MODEL 1: K-MEANS RISK CLUSTERING ---
        if not df_students.empty and len(df_students) >= 3:
            # We use 'AverageGPA' and 'FailedCount' which come directly from vw_StudentAcademicDashboard
            X = df_students[['AverageGPA', 'FailedCount']].fillna(0)
            df_students['RiskCluster'] = KMeans(n_clusters=3, random_state=42, n_init=10).fit_predict(X)
            risk_counts = df_students.groupby('RiskCluster').size().to_dict()
            total = sum(risk_counts.values())

            riskData = {
                "lowRiskCount": int(risk_counts.get(0, 0)),
                "lowRiskPct": int(round((risk_counts.get(0, 0) / total) * 100)) if total > 0 else 0,
                "medRiskCount": int(risk_counts.get(1, 0)),
                "medRiskPct": int(round((risk_counts.get(1, 0) / total) * 100)) if total > 0 else 0,
                "highRiskCount": int(risk_counts.get(2, 0)),
                "highRiskPct": int(round((risk_counts.get(2, 0) / total) * 100)) if total > 0 else 0
            }
        else:
            riskData = {"lowRiskCount": 0, "lowRiskPct": 0, "medRiskCount": 0, "medRiskPct": 0, "highRiskCount": 0, "highRiskPct": 0}

        # --- MODEL 2: REAL LINEAR REGRESSION FORECASTING ---
        forecastData = []

        if len(df_history) >= 2:
            df_history['TimeIndex'] = df_history['TermLabel'].apply(term_to_numeric)

            for index, row in df_history.iterrows():
                nums = [int(s) for s in re.findall(r'\d+', str(row.get("TermLabel")))]
                ui_label = f"S{nums[1]} {nums[0]}" if len(nums) >= 2 else str(row.get("TermLabel"))

                forecastData.append({
                    "label": ui_label,
                    "value": str(row.get("EnrollmentCount", 0)),
                    "type": "historical"
                })

            X_train = df_history[['TimeIndex']]
            y_train = df_history['EnrollmentCount']

            model = LinearRegression()
            model.fit(X_train, y_train)

            max_time = df_history['TimeIndex'].max()
            future_times = [max_time + 0.5, max_time + 1.0, max_time + 1.5]

            for ft in future_times:
                prediction = model.predict([[ft]])[0]
                year = int(ft)
                sem = 2 if ft % 1 != 0 else 1
                safe_pred = max(0, int(round(prediction)))

                forecastData.append({
                    "label": f"S{sem} {year}",
                    "value": str(safe_pred),
                    "type": "forecast"
                })

        else:
            forecastData = [{"label": "No Data", "value": "0", "type": "historical"}]

        output = {
            "forecastData": forecastData,
            "riskData": riskData
        }
        print(json.dumps(output))

    except Exception as e:
        print(json.dumps({"error": str(e)}))

if __name__ == "__main__":
    run_analytics()