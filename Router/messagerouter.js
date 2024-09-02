const express = require("express");
const Conversation = require("../Model/conversationModel");
const isauthenticate = require("../Middleware/isauthenticate");
const Message = require("../Model/MessageModel");

const router = express.Router();

router.post("/send/:id", isauthenticate, async (req, res) => {
  try {
    const senderId = req.id;
    const receiverId = req.params.id;
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({
        message: "Message is Required",
      });
    }

    let gotConversation = await Conversation.findOne({
      participants: { $all: [senderId, receiverId] },
    });

    if (!gotConversation) {
      gotConversation = await Conversation.create({
        participants: [senderId, receiverId],
      });
    }

    const newMessage = await Message.create({
      senderId,
      receiverId,
      message
    })

    if(newMessage){
      gotConversation.messages.push(newMessage._id)
    }
    await gotConversation.save()

    // Socket Io

    return res.status(200).json({
      newMessage
    })
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/:id", isauthenticate, async (req, res) => {
  try {
    const receiverId = req.params.id;
    const senderId = req.id;
    const conversation = await Conversation.findOne({
      participants: { $all: [senderId, receiverId] },
    }).populate("messages");
    return res.status(200).json(conversation?.messages);
  } catch (error) {
    console.log(error);
  }
});

module.exports = router;
