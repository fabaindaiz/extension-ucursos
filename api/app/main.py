"""
Create an API with two text classifiers. The API receives a text and return the target and the probability from 2 models. 

The 2 classifiers are in:
- "jorgeortizfuentes/spanish-bert-incivility1"
- "jorgeortizfuentes/spanish-bert-hatespeech1"

"""

from transformers import AutoConfig, AutoModelForSequenceClassification, AutoTokenizer
from fastapi import FastAPI
from pydantic import BaseModel
import uvicorn

app = FastAPI()

@app.on_event("startup")
def load_models():
    global model1, model2, tokenizer
    model1 = AutoModelForSequenceClassification.from_pretrained("jorgeortizfuentes/spanish-bert-incivility1")
    model2 = AutoModelForSequenceClassification.from_pretrained("jorgeortizfuentes/spanish-bert-hatespeech1")
    tokenizer = AutoTokenizer.from_pretrained("jorgeortizfuentes/spanish-bert-incivility1")

class Text(BaseModel):
    text: str

@app.post("/predict")
def predict(text: Text):    
    inputs = tokenizer(text.text.lower().strip(), return_tensors='pt', padding=True, truncation=True, max_length=512)
    outputs1 = model1(**inputs)
    logits1 = outputs1.logits
    probs1 = logits1.softmax(dim=1).tolist()[0]
    probs1 = max(probs1)
    label1 = logits1.argmax(dim=1).tolist()[0]    
    
    outputs2 = model2(**inputs)
    logits2 = outputs2.logits
    probs2 = logits2.softmax(dim=1).tolist()[0]
    probs2 = max(probs2)
    label2 = logits2.argmax(dim=1).tolist()[0]    

    dict_return = {"incivility": label1, "incivility_prob": probs1, "hatespeech": label2, "hatespeech_prob": probs2}
    return dict_return

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8282)