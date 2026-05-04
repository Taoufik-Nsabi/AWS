import pandas as pd
from sklearn.ensemble import RandomForestClassifier
import joblib

# ✅ chemin ABSOLU (ton cas)
df = pd.read_csv("D:\Projects\Sirmaroc_python\transport_dataset.csv")

# ✅ Features / Target
X = df.drop(columns=["transport_mode"])
y = df["transport_mode"]

# ✅ Model
model = RandomForestClassifier(n_estimators=300, random_state=42)
model.fit(X, y)

# ✅ Save
joblib.dump(model, "app/ml/model.pkl")

print("Model trained with REAL data ✔")