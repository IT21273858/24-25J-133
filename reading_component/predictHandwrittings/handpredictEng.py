import torch
from PIL import Image
from torchvision import models
import torchvision.transforms as transforms
import torchvision.transforms.functional as TF
from huggingface_hub import hf_hub_download






def pedictEngHand(imgpath=""):
    device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
    model_path = hf_hub_download("sanjeevan7/emnist-letters-eng-resnet18-v2", filename="pytorch_model.bin")



    model = models.resnet18()
    model.fc = torch.nn.Linear(model.fc.in_features, 26)
    model.load_state_dict(torch.load(model_path, map_location=device))
    model.to(device)
    model.eval()




    transform = transforms.Compose([
        transforms.Resize((224, 224)),
        transforms.Grayscale(3),
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
    ])





    # Load and preprocess image
    image = Image.open(imgpath).convert('L')  # Grayscale
    input_tensor = transform(image).unsqueeze(0).to(device) 

    # Predict
    with torch.no_grad():
        outputs = model(input_tensor)
        _, predicted = torch.max(outputs, 1)

    predicted_class = predicted.item()
    predicted_char = chr(predicted_class + 97)  # 0->a, 1->b, ...

    print(f"Predicted Character: {predicted_char}")
    return {
        "predictedChar":predicted_char,
        "predictedClass":predicted_class
    }
