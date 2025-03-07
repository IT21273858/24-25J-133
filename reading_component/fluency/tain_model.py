import pickle
import tensorflow as tf
from collections import Counter
from tensorflow.keras.optimizers import Adam
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Dense, Dropout
from sklearn.preprocessing import LabelEncoder
from sklearn.model_selection import train_test_split
import matplotlib.pyplot as plt
import numpy as np

# Step 1: Load Preprocessed Data
with open('./reading_component/fluency/preprocessed/processed_data2.pkl', 'rb') as f:
    X, y = pickle.load(f)

# Step 2: Encode Labels
encoder = LabelEncoder()
y_encoded = encoder.fit_transform(y)
print(Counter(y_encoded))
print("Feature variance:", np.var(X, axis=0))

# Step 3: Split Data
X_train, X_test, y_train, y_test = train_test_split(
    X, y_encoded, test_size=0.2, random_state=42)

# Step 4: Build Model
model = Sequential([
    Dense(256, input_shape=(X.shape[1],), activation='relu'),
    Dropout(0.4),
    Dense(128, activation='relu'),
    Dropout(0.3),
    Dense(len(np.unique(y_encoded)), activation='softmax')
])


model.compile(optimizer='adam',
              loss='sparse_categorical_crossentropy', metrics=['accuracy'])

# Step 5: Train Model
history = model.fit(X_train, y_train, epochs=20,
                    batch_size=32, validation_data=(X_test, y_test))
predictions = model.predict(X_test)
predicted_classes = np.argmax(predictions, axis=1)
print(predicted_classes[:10])  # First 10 predictions
print(y_test[:10])  # Corresponding true labels

# Save Model
model.save('./reading_component/fluency/model/fluency_model3.h5')

print("Model Trained and Saved!")

# Step 6: Plot Accuracy and Loss Graphs
# Plot training and validation accuracy
plt.figure(figsize=(12, 6))

plt.subplot(1, 2, 1)
plt.plot(history.history['accuracy'], label='Training Accuracy')
plt.plot(history.history['val_accuracy'], label='Validation Accuracy')
plt.title('Training and Validation Accuracy')
plt.xlabel('Epochs')
plt.ylabel('Accuracy')
plt.legend()

# Plot training and validation loss
plt.subplot(1, 2, 2)
plt.plot(history.history['loss'], label='Training Loss')
plt.plot(history.history['val_loss'], label='Validation Loss')
plt.title('Training and Validation Loss')
plt.xlabel('Epochs')
plt.ylabel('Loss')
plt.legend()

# Display the plots
plt.tight_layout()
plt.show()
