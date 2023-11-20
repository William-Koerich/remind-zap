require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

//App config
const app = express();
app.use(express.json());
app.use(express.urlencoded());
app.use(cors());

  // Conectando ao banco de dados
  mongoose.connect("mongodb://mongo:GeHbDH25A3h5ga33BfcdCGdgceHFBCeF@monorail.proxy.rlwy.net:26896", { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
      console.log('Conexão com o MongoDB estabelecida com sucesso!');
      // Resto do seu código aqui
    })
    .catch(err => {
      console.error('Erro ao conectar ao MongoDB:', err);
    });
const reminderSchema = new mongoose.Schema({
  reminderMsg: String,
  remindAt: String,
  isReminded: Boolean,
});

const Reminder = new mongoose.model("reminder", reminderSchema);

setInterval(() => {
  Reminder.find({}, (err, reminderList) => {
    if (err) {
      console.log(err);
    }
    if (reminderList) {
      reminderList.forEach((reminder) => {
          if (!reminder.isReminded) {
            const now = new Date();
            if ((new Date(reminder.remindAt) - now) < 0) {
              Reminder.findByIdAndUpdate(
                reminder.id,
                { isReminded: true },
                (err, remindObj) => {
                  if (err) {
                    console.log(err);
                  }
                  // Whatsapp reminding functionality by Twilio
                  const accountSid = "AC6a9119e90f53a3143b514df3df7b4abf";
                  const authToken = "894f1028ea540d5bf183d3e5a9ff0a75";
                  const client = require("twilio")(accountSid, authToken);

                  client.messages
                    .create({
                      body: "Ai papai macetei, foi num tal de vuco vuco ta maluco quer replay",
                      from: "whatsapp:+14155238886",
                      to: "whatsapp:+5547996348990",
                    })
                    .then((message) => console.log(message))
                    .done();
                }
              );
            }
          }
        });
    }
  });
}, 1000);

//API routes
app.get("/getAllReminder", (req, res) => {
  Reminder.find({}, (err, reminderList) => {
    if (err) {
      console.log(err);
    }
    if (reminderList) {
      res.send(reminderList);
    }
  });
});

app.post("/addReminder", (req, res) => {
  const { reminderMsg, remindAt } = req.body;
  const reminder = new Reminder({
    reminderMsg,
    remindAt,
    isReminded: false,
  });
  reminder.save((err) => {
    if (err) {
      console.log(err);
    }
    Reminder.find({}, (err, reminderList) => {
      if (err) {
        console.log(err);
      }
      if (reminderList) {
        res.send(reminderList);
      }
    });
  });
});

app.post("/deleteReminder", (req, res) => {
  Reminder.deleteOne({ _id: req.body.id }, () => {
    Reminder.find({}, (err, reminderList) => {
      if (err) {
        console.log(err);
      }
      if (reminderList) {
        res.send(reminderList);
      }
    });
  });
});

app.listen(9000, () => console.log("Be started"));
